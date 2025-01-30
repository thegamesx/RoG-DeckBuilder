from django.db import models
import re

# Pensar bien que va a pasar al borrar con las FK

class CardSet(models.Model):
    set_name = models.CharField(max_length=200)
    set_code = models.CharField(max_length=200, unique=True)
    set_type = models.CharField(max_length=200, default="")
    released_date = models.DateField()
    total_cards = models.IntegerField(default=0)

    class Meta:
        ordering = ['-released_date']

    def __str__(self):
        return self.set_name
    
    def get_list_of_sets():
        set_list = CardSet.objects.all().order_by('-released_date')
        return_list = []
        for card_set in set_list:
            return_list.append((card_set.set_code,card_set.set_name))
        return return_list


# Ver para crear una funcion que devuelva la ultima version de una carta
class Card(models.Model):
    card_name = models.CharField(max_length=200)
    faction = models.CharField(max_length=50)
    card_type = models.CharField(max_length=200)
    cost = models.CharField(default="", max_length=30)
    converted_cost = models.IntegerField(default=0)
    rarity = models.CharField(max_length=200) #Cambiar a un choice
    attack = models.IntegerField(blank=True, null=True)
    health = models.IntegerField(blank=True, null=True)
    text_box = models.TextField(blank=True, default="")
    rules_explanation = models.TextField(blank=True, default="")
    related_cards = models.ManyToManyField('self', blank=True)

    class Meta:
        ordering = ['card_name']

    def __str__(self):
        return self.card_name


class Format(models.Model):
    format_name = models.CharField(max_length=200)
    format_desc = models.TextField(default="")

    def __str__(self):
        return self.format_name


class FormatFollows (models.Model):

    LEGALITY = [
        ("L", "Legal"),
        ("B", "Prohibida"),
        ("N", "No legal"),
    ]

    card_id = models.ForeignKey(Card, on_delete=models.DO_NOTHING)
    format_id = models.ForeignKey(Format, on_delete=models.CASCADE)
    legality = models.CharField(max_length=3, choices=LEGALITY, default="L")

    def __str__(self):
        return self.format_id.format_name + " - " + self.get_legality_display()


class CardVersion(models.Model):
    card_id = models.ForeignKey(Card, on_delete=models.CASCADE)
    set_id = models.ForeignKey(CardSet, on_delete=models.RESTRICT)
    serial_number = models.IntegerField()
    card_art = models.ImageField(blank=True, upload_to="media/card_art")
    artist = models.CharField(max_length=200)
    flavor_text = models.TextField(blank=True, default="")
    label = models.CharField(blank=True, max_length=200, default="")
    legality = models.ManyToManyField(Format, blank=True)
    last_print = models.BooleanField(default=True)

    class Meta:
        get_latest_by = "-pk"

    # Esto revisa si la carta que se está subiendo es más actual que el resto.
    # De ser así, pone esa carta como la reprensentativa de la carta. En caso contrario deja la que estaba antes.
    def save(self, **kwargs):
        other_versions = CardVersion.objects.filter(card_id=self.card_id)
        for version in other_versions:
            if version.set_id.released_date > self.set_id.released_date:
                self.last_print = False
                break
            else:
                version.last_print = False
        super().save(**kwargs)

    def __str__(self):
        return self.set_id.set_code  + " - " + self.card_id.card_name
    
    # Hacer diferentes querys para la busqueda. Ver como pasar esos parametros.
    # Creo que deberia tener una funcion general que revise el string y va llamando lo que necesita

    def get_last_version(user_query):
        # Crear una funcion para reparar la db en caso de error
        try:
            return CardVersion.objects.get(card_id=user_query, last_print=True)
        except CardVersion.MultipleObjectsReturned:
            pass
    
    def get_all_cards_from_set_code(user_query):
        return CardVersion.objects.filter(set_id__set_code=user_query)
    
    def get_all_versions_of_a_card(user_query):
        return CardVersion.objects.filter(card_id=user_query)
    
    def get_card_by_name(user_query, get=True):
        if get:
            return CardVersion.objects.get(card_id__card_name__icontains=user_query, last_print=True)
        else:
            return CardVersion.objects.filter(card_id__card_name__icontains=user_query, last_print=True)

    
    def get_specific_card(user_query_card, user_query_set, get=True):
        return CardVersion.objects.get(serial_number=user_query_card, set_id_id__set_code=user_query_set)
    
    def get_all_cards():
        return CardVersion.objects.filter(last_print=True)
    
    def evaluate_string(user_query, only_last_print=True):

        splited_query = user_query.split()
        query_set = CardVersion.objects.all()
        for query in splited_query:
            splited_terms = re.split(":|!=|>=|<=|<|>|=", query)
            if len(splited_terms) > 1:
                for operator in [":","!=",">=","<=","=",">","<"]:
                    if operator in query:
                        used_operator = operator
                        break
                else:
                    used_operator = None
                search_query = {
                    'keyword': splited_terms[0].lower(),
                    'query': splited_terms[1].lower(),
                    'operator': used_operator
                }
                if search_query['operator']:
                    match search_query['keyword']:
                        case "type":
                            if search_query['operator'] == "!=":
                                query_set = query_set.exclude(card_id__card_type__iexact=search_query['query'])
                            elif search_query['operator'] in [":","="]:
                                query_set = query_set.filter(card_id__card_type__iexact=search_query['query'], last_print=only_last_print)
                            else:
                                query_set = query_set.filter(set_id__set_code__icontains=query, last_print=only_last_print)
                        case "set":
                            if search_query['operator'] in [":","="]:
                                query_set = query_set.filter(card_id__card_name__iexact=search_query['query'], last_print=only_last_print)
                            else:
                                query_set = query_set.filter(card_id__card_name__iexact=query, last_print=only_last_print)
                        case "artist":
                            if search_query['operator'] in [":","="]:
                                query_set = query_set.filter(artist__icontains=search_query['query'], last_print=only_last_print)
                            else:
                                query_set = query_set.filter(card_id__card_name__icontains=query, last_print=only_last_print)
                        case "t":
                            if search_query['operator'] in "!=":
                                query_set = query_set.exclude(card_id__text_box__iexact=search_query['query'])
                            elif search_query['operator'] in [":","="]:
                                query_set = query_set.filter(card_id__text_box__icontains=search_query['query'], last_print=only_last_print)
                            else:
                                query_set = query_set.filter(card_id__card_name__icontains=query, last_print=only_last_print)
                        case "legal":
                            if search_query['operator'] in [":","="]:
                                pass
                            else:
                                query_set = query_set.filter(card_id__card_name__icontains=query, last_print=only_last_print)
                        case "banned":
                            if search_query['operator'] in [":","="]:
                                pass
                            else:
                                query_set = query_set.filter(card_id__card_name__icontains=query, last_print=only_last_print)
                        case "rarity":
                            pass
                        case "faction" | "f":
                            pass
                        case "attack":
                            match search_query["operator"]:
                                case "="|":":
                                    query_set = query_set.filter(card_id__attack__exact=search_query['query'], last_print=only_last_print)
                                case ">":
                                    query_set = query_set.filter(card_id__attack__gt=search_query['query'], last_print=only_last_print)
                                case ">=":
                                    query_set = query_set.filter(card_id__attack__gte=search_query['query'], last_print=only_last_print)
                                case "<":
                                    query_set = query_set.filter(card_id__attack__lt=search_query['query'], last_print=only_last_print)
                                case "<=":
                                    query_set = query_set.filter(card_id__attack__lte=search_query['query'], last_print=only_last_print)
                                case "!=":
                                    query_set = query_set.exclude(card_id__attack__exact=search_query['query'])
                        case "health":
                            match search_query["operator"]:
                                case "="|":":
                                    query_set = query_set.filter(card_id__health__exact=search_query['query'], last_print=only_last_print)
                                case ">":
                                    query_set = query_set.filter(card_id__health__gt=search_query['query'], last_print=only_last_print)
                                case ">=":
                                    query_set = query_set.filter(card_id__health__gte=search_query['query'], last_print=only_last_print)
                                case "<":
                                    query_set = query_set.filter(card_id__health__lt=search_query['query'], last_print=only_last_print)
                                case "<=":
                                    query_set = query_set.filter(card_id__health__lte=search_query['query'], last_print=only_last_print)
                                case "!=":
                                    query_set = query_set.exclude(card_id__health__exact=search_query['query'])
                        case "cost":
                            pass
                        case "cc":
                            match search_query["operator"]:
                                case "="|":":
                                    query_set = query_set.filter(card_id__converted_cost__exact=search_query['query'], last_print=only_last_print)
                                case ">":
                                    query_set = query_set.filter(card_id__converted_cost__gt=search_query['query'], last_print=only_last_print)
                                case ">=":
                                    query_set = query_set.filter(card_id__converted_cost__gte=search_query['query'], last_print=only_last_print)
                                case "<":
                                    query_set = query_set.filter(card_id__converted_cost__lt=search_query['query'], last_print=only_last_print)
                                case "<=":
                                    query_set = query_set.filter(card_id__converted_cost__lte=search_query['query'], last_print=only_last_print)
                                case "!=":
                                    query_set = query_set.exclude(card_id__converted_cost__exact=search_query['query'])
                        case "flavor":
                            if search_query['operator'] in [":","="]:
                                query_set = query_set.filter(flavor_text__icontains=search_query['query'], last_print=only_last_print)
                            else:
                                query_set = query_set.filter(card_id__card_name__icontains=query, last_print=only_last_print)
                        case "label":
                            if search_query['operator'] in [":","="]:
                                pass
                            else:
                                query_set = query_set.filter(card_id__card_name__icontains=query, last_print=only_last_print)
                        case "date":
                            pass
                        case "year":
                            pass
                        case _:
                            query_set = query_set.filter(card_id__card_name__icontains=query, last_print=only_last_print)
            else:
                query_set = query_set.filter(card_id__card_name__icontains=query, last_print=only_last_print)
        return query_set



   

class OtherLanguageCard(models.Model):

    LANG = [
        ("es", "Español"),
        ("en", "Ingles"),
        ("zh", "Chino"),
        ("pt", "Portugues"),
    ]

    original_card_id = models.ForeignKey(CardVersion, on_delete=models.DO_NOTHING)
    language = models.CharField(max_length=3, choices=LANG, default="es")
    trans_name = models.CharField(max_length=200, default="")
    trans_text_box = models.TextField(blank=True, default="")
    trans_flavor = models.TextField(blank=True, default="")
    card_art = models.ImageField(blank=True, upload_to="media/card_art")

    def __str__(self):
        return self.original_card_id.set_id.set_code + "(" + self.get_language_display() + ") - " + self.trans_name 
    
