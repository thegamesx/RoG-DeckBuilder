from django.db import models
from multiselectfield import MultiSelectField
import re

# Pensar bien que va a pasar al borrar con las FK !!!

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
        return_list = [("","---")]
        for card_set in set_list:
            return_list.append((card_set.set_code,card_set.set_name))
        return return_list


class Format(models.Model):
    format_name = models.CharField(max_length=200)
    format_desc = models.TextField(default="")
    card_id = models.ManyToManyField("Card", through="FormatFollows" ,verbose_name="Card")

    def __str__(self):
        return self.format_name
    
    def get_list_of_formats():
        # Ver como ordenar la lista
        format_list = Format.objects.all()
        return_list = [("","---")]
        for format in format_list:
            return_list.append((format.format_name,format.format_name))
        return return_list
    
    def check_deck_legality(format, deck_list):
        
        # Devuelve si el deck es legal en el formato o no.
        # Este juego tiene una regla importante, la cantidad de cartas está determinada por su rareza. Entonces:
        # - Común: 4 copias
        # - Rara: 3 copias
        # - Épica: 2 copias
        # - Legendaria: 1 copia
        # Ademas de una lista de cartas prohibidas.

        for card in deck_list:
            full_info_card = Card.get_card_by_id(card["id"])
            match full_info_card["rarity"]:
                case 1:
                    if card["quantity"]>4:
                        return False
                case 2:
                    if card["quantity"]>3:
                        return False
                case 3:
                    if card["quantity"]>2:
                        return False
                case 4:
                    if card["quantity"]>1:
                        return False
            if Card.check_if_banned(format, card["id"]):
                return False
        return True


class Card(models.Model):

    RARITY=[
        (0, "Token"),
        (1, "Común"),
        (2, "Rara"),
        (3, "Épica"),
        (4, "Legendaria"),
    ]

    FACTIONS = [
        ("J", "Jupiter"),
        ("M", "Marte"),
        ("N", "Neptuno"),
        ("P", "Pluton"),
        ("S", "Saturno")
    ]

    card_name = models.CharField(max_length=200)
    faction = MultiSelectField(choices=FACTIONS, blank=True)
    card_type = models.CharField(max_length=200)
    cost = models.CharField(default="", max_length=30)
    converted_cost = models.IntegerField(default=0)
    rarity = models.IntegerField(choices=RARITY)
    attack = models.IntegerField(blank=True, null=True)
    health = models.IntegerField(blank=True, null=True)
    text_box = models.TextField(blank=True, default="")
    rules_explanation = models.TextField(blank=True, default="")
    related_cards = models.ManyToManyField('self', blank=True)
    card_legality = models.ManyToManyField(Format, through='FormatFollows', blank=True)

    class Meta:
        ordering = ['card_name']

    def __str__(self):
        return self.card_name
    
    def get_card_by_id(card_id):
        return Card.objects.get(pk=card_id)
    
    def check_if_banned(format,card):
        card_legality = FormatFollows.objects.get(card_id=card, format_id__format_name__iexact=format)
        if card_legality:
            if card_legality.legality == "B":
                return True
            else:
                return False
        else:
            return None # TODO: Ver si programar un código de error


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
        return self.format_id.format_name + " - " + self.get_legality_display() + " (" + self.card_id.card_name + ")"


class CardVersion(models.Model):
    card_id = models.ForeignKey(Card, on_delete=models.CASCADE)
    set_id = models.ForeignKey(CardSet, on_delete=models.RESTRICT)
    serial_number = models.IntegerField()
    is_skin = models.BooleanField(default=False)
    card_art = models.ImageField(blank=True, upload_to="media/card_art")
    artist = models.CharField(max_length=200)
    flavor_text = models.TextField(blank=True, default="")
    label = models.CharField(blank=True, max_length=200, default="")
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
    
    def get_group_of_cards(array_of_ids):
        queryset = CardVersion.objects.filter(pk__in=array_of_ids)
        return list(queryset.values(
                "id",
                "card_id__card_name", 
                "card_art",
                "card_id__faction",
                "card_id__card_type",
                "card_id__cost",
                "card_id__converted_cost",
                "card_id__rarity",
                "card_id__attack",
                "card_id__health",
                "card_id__text_box",
                "card_id", 
                "set_id",
                "serial_number",
                ))

    
    # Crea el string desde el formulario para luego ser evaluado
    # TODO: Ver los que falten aca
    def construct_string(form_fields):
        query_string = ""
        if form_fields["card_name"]:
            query_string += form_fields["card_name"] + " "
        if form_fields["text_box"]:
            text_box = form_fields["text_box"].split()
            for word in text_box:
                query_string += "t:" + word + " "
        if form_fields["card_type"]:
            query_string += "type:" + form_fields["card_type"] + " "
        if form_fields["faction"]:
            query_string += "f:" + form_fields["faction"] + " "
        if form_fields["cost"]:
            query_string += "cost:" + form_fields["cost"] + " "
        if form_fields["converted_cost"]:
            query_string += "cc" + form_fields["cc_operator"] + str(form_fields["converted_cost"]) + " "
        if form_fields["attack"]:
            query_string += "attack" + form_fields["a_operator"] + str(form_fields["attack"]) + " "
        if form_fields["health"]:
            query_string += "health" + form_fields["h_operator"] + str(form_fields["health"]) + " "
        if form_fields["rarity"]:
            query_string += "rarity:" + form_fields["rarity"] + " "
        if form_fields["set_dropdown"]:
            query_string += "set:" + form_fields["set_dropdown"] + " "
        if form_fields["format"]:
            query_string += form_fields["legality"] + "=" + form_fields["format"] + " "
        return query_string
        
    
    # Evalua el string, permitiendo multiples filtros al mismo tiempo
    def evaluate_string(user_query, only_last_print=True, include_tokens=False):
        splited_query = user_query.split()
        query_set = CardVersion.objects.all()
        if not include_tokens:
            query_set = query_set.exclude(card_id__rarity=0)
        specific_set = False
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
                                query_set = query_set.filter(card_id__card_type__iexact=search_query['query'])
                            else:
                                query_set = query_set.filter(set_id__set_code__icontains=query)
                        case "set":
                            if search_query['operator'] in [":","="]:
                                query_set = query_set.filter(set_id__set_code__iexact=search_query['query'])
                                specific_set = True
                            else:
                                query_set = query_set.filter(card_id__card_name__iexact=query)
                        case "artist":
                            if search_query['operator'] in [":","="]:
                                query_set = query_set.filter(artist__icontains=search_query['query'])
                            else:
                                query_set = query_set.filter(card_id__card_name__icontains=query)
                        case "t":
                            if search_query['operator'] in "!=":
                                query_set = query_set.exclude(card_id__text_box__iexact=search_query['query'])
                            elif search_query['operator'] in [":","="]:
                                query_set = query_set.filter(card_id__text_box__icontains=search_query['query'])
                            else:
                                query_set = query_set.filter(card_id__card_name__icontains=query)
                        case "legal":
                            if search_query['operator'] in [":","="]:
                                query_set = query_set.filter(card_id__card_legality__format_name__iexact=search_query["query"]).filter(card_id__formatfollows__legality="L")
                            else:
                                query_set = query_set.filter(card_id__card_name__icontains=query)
                        case "banned":
                            if search_query['operator'] in [":","="]:
                                query_set = query_set.filter(card_id__card_legality__format_name__iexact=search_query["query"]).filter(card_id__formatfollows__legality="B")
                            else:
                                query_set = query_set.filter(card_id__card_name__icontains=query)
                        case "rarity":
                            match search_query["query"]:
                                case "t" | "token":
                                    rarity_value = 0
                                case "c" | "comun" | "común":
                                    rarity_value = 1
                                case "r" | "rara":
                                    rarity_value = 2
                                case "e" | "epica" | "épica":
                                    rarity_value = 3
                                case "l" | "legendaria":
                                    rarity_value = 4
                                case _:
                                    rarity_value = 999
                            match search_query['operator']:
                                case "="|":":
                                    query_set = query_set.filter(card_id__rarity__exact=rarity_value)
                                case ">":
                                    query_set = query_set.filter(card_id__rarity__gt=rarity_value)
                                case ">=":
                                    query_set = query_set.filter(card_id__rarity__gte=rarity_value)
                                case "<":
                                    query_set = query_set.filter(card_id__rarity__lt=rarity_value)
                                case "<=":
                                    query_set = query_set.filter(card_id__rarity__lte=rarity_value)
                                case "!=":
                                    query_set = query_set.exclude(card_id__rarity__exact=rarity_value)
                        # TODO: Implementar luego soporte para multiples facciones
                        case "faction" | "f":
                            if len(search_query["query"])>1:
                                match search_query["query"]:
                                    case "jupiter":
                                        faction_letter = "J"
                                    case "marte":
                                        faction_letter = "M"
                                    case "neptuno":
                                        faction_letter = "N"
                                    case "pluton"|"plutón":
                                        faction_letter = "P"
                                    case "saturno":
                                        faction_letter = "S"
                                    case _:
                                        faction_letter = None
                            else:
                                faction_letter = search_query["query"]
                            if faction_letter:
                                if search_query['operator'] == "!=":
                                    query_set = query_set.exclude(card_id__faction__icontains=faction_letter)
                                elif search_query['operator'] in [":","="]:
                                    query_set = query_set.filter(card_id__faction__icontains=faction_letter)
                                else:
                                    query_set = query_set.filter(set_id__set_code__icontains=query)
                            else:
                                query_set = query_set.filter(set_id__set_code__icontains=query)
                        case "attack":
                            match search_query["operator"]:
                                case "="|":":
                                    query_set = query_set.filter(card_id__attack__exact=search_query['query'])
                                case ">":
                                    query_set = query_set.filter(card_id__attack__gt=search_query['query'])
                                case ">=":
                                    query_set = query_set.filter(card_id__attack__gte=search_query['query'])
                                case "<":
                                    query_set = query_set.filter(card_id__attack__lt=search_query['query'])
                                case "<=":
                                    query_set = query_set.filter(card_id__attack__lte=search_query['query'])
                                case "!=":
                                    query_set = query_set.exclude(card_id__attack__exact=None).exclude(card_id__attack__exact=search_query['query'])
                        case "health":
                            match search_query["operator"]:
                                case "="|":":
                                    query_set = query_set.filter(card_id__health__exact=search_query['query'])
                                case ">":
                                    query_set = query_set.filter(card_id__health__gt=search_query['query'])
                                case ">=":
                                    query_set = query_set.filter(card_id__health__gte=search_query['query'])
                                case "<":
                                    query_set = query_set.filter(card_id__health__lt=search_query['query'])
                                case "<=":
                                    query_set = query_set.filter(card_id__health__lte=search_query['query'])
                                case "!=":
                                    query_set = query_set.exclude(card_id__health__exact=None).exclude(card_id__health__exact=search_query['query'])
                        case "cost":
                            pass # TODO: Implementar esto !!!
                        case "cc":
                            match search_query["operator"]:
                                case "="|":":
                                    query_set = query_set.filter(card_id__converted_cost__exact=search_query['query'])
                                case ">":
                                    query_set = query_set.filter(card_id__converted_cost__gt=search_query['query'])
                                case ">=":
                                    query_set = query_set.filter(card_id__converted_cost__gte=search_query['query'])
                                case "<":
                                    query_set = query_set.filter(card_id__converted_cost__lt=search_query['query'])
                                case "<=":
                                    query_set = query_set.filter(card_id__converted_cost__lte=search_query['query'])
                                case "!=":
                                    query_set = query_set.exclude(card_id__converted_cost__exact=search_query['query'])
                        case "flavor":
                            if search_query['operator'] in [":","="]:
                                query_set = query_set.filter(flavor_text__icontains=search_query['query'])
                            else:
                                query_set = query_set.filter(card_id__card_name__icontains=query)
                        case "label":
                            if search_query['operator'] in [":","="]:
                                query_set = query_set.filter(label__icontains=search_query['query'])
                            else:
                                query_set = query_set.filter(card_id__card_name__icontains=query)
                        case "year":
                            match search_query["operator"]:
                                case "="|":":
                                    query_set = query_set.filter(set_id__released_date__year=search_query['query'])
                                case ">":
                                    query_set = query_set.filter(set_id__released_date__year__gt=search_query['query'])
                                case ">=":
                                    query_set = query_set.filter(set_id__released_date__year__gte=search_query['query'])
                                case "<":
                                    query_set = query_set.filter(set_id__released_date__year__lt=search_query['query'])
                                case "<=":
                                    query_set = query_set.filter(set_id__released_date__year__lte=search_query['query'])
                                case "!=":
                                    query_set = query_set.exclude(set_id__released_date__year__exact=search_query['query'])
                        case _:
                            query_set = query_set.filter(card_id__card_name__icontains=query)
            else:
                query_set = query_set.filter(card_id__card_name__icontains=query)
        if not specific_set:
            query_set = query_set.filter(last_print=only_last_print)
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
    
