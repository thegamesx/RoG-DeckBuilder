from django.db import models

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


# Ver para crear una funcion que devuelva la ultima version de una carta
class Card(models.Model):
    card_name = models.CharField(max_length=200)
    faction = models.CharField(max_length=50)
    card_type = models.CharField(max_length=200)
    cost = models.CharField(default="", max_length=30)
    converted_cost = models.IntegerField(default=0)
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
    rarity = models.CharField(max_length=200) #Cambiar a un choice
    card_art = models.ImageField(blank=True, upload_to="media/card_art")
    artist = models.CharField(max_length=200)
    flavor_text = models.TextField(blank=True, default="")
    label = models.CharField(blank=True, max_length=200, default="")
    legality = models.ManyToManyField(Format, blank=True)

    class Meta:
        get_latest_by = "-pk"

    def __str__(self):
        return self.set_id.set_code  + " - " + self.card_id.card_name
    
    def get_last_version(card_db_id):
        last_card = CardVersion.objects.filter(card_id=card_db_id).latest()
        return last_card

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
    
