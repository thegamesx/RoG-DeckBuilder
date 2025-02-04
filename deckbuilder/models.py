from django.db import models
from django.contrib.auth.models import User


class DeckModel(models.Model):

    VISIBILITY = [
        ("P", "Público"),
        ("U", "No listado"),
        ("R", "Privado"),
    ]

    deck_owner = models.ForeignKey(User, verbose_name=("Usuario"), on_delete=models.DO_NOTHING)
    deck_name = models.CharField(max_length=100)
    deck_desc = models.TextField(max_length=500)
    visibility = models.CharField(max_length=2, choices=VISIBILITY, default="P")
    format = models.CharField(default="Eterno", max_length=30) # Cambiar el default luego
    card_list = models.JSONField(default=None, blank=True)



