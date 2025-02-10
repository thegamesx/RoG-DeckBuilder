from django.db import models
from django.contrib.auth.models import User
from django.http import HttpResponseForbidden
from multiselectfield import MultiSelectField


class DeckModel(models.Model):

    VISIBILITY = [
        ("P", "Público"),
        ("U", "No listado"),
        ("R", "Privado"),
    ]

    FACTIONS = [
        ("J", "Jupiter"),
        ("M", "Marte"),
        ("N", "Neptuno"),
        ("P", "Pluton"),
        ("S", "Saturno")
    ]

    deck_owner = models.ForeignKey(User, verbose_name=("Usuario"), on_delete=models.DO_NOTHING)
    deck_name = models.CharField(max_length=100)
    deck_desc = models.TextField(max_length=500)
    deck_factions = MultiSelectField(choices=FACTIONS, blank=True)
    visibility = models.CharField(max_length=2, choices=VISIBILITY, default="P")
    format = models.CharField(default="Sin formato", max_length=30) # Cambiar el default luego
    legal = models.BooleanField(default=True)
    card_list = models.JSONField(default=None, blank=True)
    published_date = models.DateField(auto_now=True, auto_now_add=False)
    last_modified = models.DateField(auto_now=True, auto_now_add=False)


    def __str__(self):
        return self.deck_name + " (" + self.deck_owner.get_username() + ")"
    
    def get_all_public_decks():
        return DeckModel.objects.filter(visibility="P")

    def get_deck_from_id(deck_id):
        return DeckModel.objects.get(pk=deck_id) 

    def save_deck(user_instance, deck_json):
        deck = DeckModel.objects.create(
            deck_owner = user_instance,
            deck_name = deck_json["deckname"],
            deck_desc = deck_json["description"],
            deck_factions = deck_json["faction"],
            visibility = deck_json["visibility"],
            format = "Eterno", # Cambiar luego
            card_list = deck_json["cards"],
        )
        return deck
    

    def update_deck(user_instance, deck_json):
        deck = DeckModel.get_deck_from_id(deck_json["deck_id"])
        if user_instance == deck.deck_owner:
            deck.deck_name = deck_json["deckname"]
            deck.deck_desc = deck_json["description"]
            deck.deck_factions = deck_json["faction"]
            deck.visibility = deck_json["visibility"]
            deck.format = deck_json["format"]
            deck.card_list = deck_json["cards"]
            deck.save()
            return deck
        else:
            raise HttpResponseForbidden("Solo el dueño puede modificar su mazo.")

    def update_legal_decks(format, card_id):
        # Cuando una carta es baneada, hay que revisar que todos los mazos
        # que la tengan cambien el estado a ilegal.
        # Esto debe efectuarse al modificar la base de datos.
        pass  