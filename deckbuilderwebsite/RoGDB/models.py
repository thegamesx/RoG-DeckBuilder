from django.db import models

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

class Card(models.Model):
    card_name = models.CharField(max_length=200)
    faction = models.CharField(max_length=50)
    card_type = models.CharField(max_length=200)
    cost = models.CharField(default="", max_length=30)
    converted_cost = models.IntegerField(default=0)
    attack = models.IntegerField(blank=True, default=None)
    health = models.IntegerField(blank=True, default=None)
    text_box = models.TextField(blank=True, default="")
    rules_explanation = models.TextField(blank=True, default="")

    class Meta:
        ordering = ['card_name']

    def __str__(self):
        return self.card_name

class CardVersion(models.Model):
    card_id = models.ForeignKey(Card, on_delete=models.CASCADE)
    set_id = models.ForeignKey(CardSet, on_delete=models.CASCADE)
    serial_number = models.IntegerField()
    rarity = models.CharField(max_length=200)
    card_art = models.ImageField(blank=True, upload_to="media/card_art")
    artist = models.CharField(max_length=200)
    flavor_text = models.TextField(blank=True, default="")
    label = models.CharField(blank=True, max_length=200, default="")

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

    card_id = models.ForeignKey(Card, on_delete=models.RESTRICT)
    format_id = models.ForeignKey(Format, on_delete=models.CASCADE)
    legality = models.CharField(max_length=3, choices=LEGALITY, default="L")