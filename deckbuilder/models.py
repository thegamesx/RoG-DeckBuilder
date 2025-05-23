from django.db import models
from django.contrib.auth.models import User
from django.http import HttpResponseForbidden, JsonResponse
from multiselectfield import MultiSelectField
from RoGDB.models import Format
import re


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

    def save_deck(user_instance, deck_json, legal):
        deck = DeckModel.objects.create(
            deck_owner = user_instance,
            deck_name = deck_json["deckname"],
            deck_desc = deck_json["description"],
            deck_factions = deck_json["faction"],
            visibility = deck_json["visibility"],
            format = "Eterno", # Cambiar luego
            card_list = deck_json["cards"],
            legal = legal,
        )
        return deck
    

    def update_deck(user_instance, deck_json, legal):
        deck = DeckModel.get_deck_from_id(deck_json["deck_id"])
        if user_instance == deck.deck_owner:
            deck.deck_name = deck_json["deckname"]
            deck.deck_desc = deck_json["description"]
            deck.deck_factions = deck_json["faction"]
            deck.visibility = deck_json["visibility"]
            deck.format = deck_json["format"]
            deck.card_list = deck_json["cards"]
            deck.legal = legal
            deck.save()
            return deck
        else:
            raise HttpResponseForbidden("Solo el dueño puede modificar su mazo.")

    def change_deck_visibility(user_instance, deck_id, new_visibility):
        deck_to_update = DeckModel.get_deck_from_id(deck_id)
        if deck_to_update.deck_owner == user_instance:
            deck_to_update.visibility = new_visibility
            deck_to_update.save()
        else:
            raise HttpResponseForbidden("Solo el dueño puede modificar su mazo.")

    def update_legal_decks(format, card_id):
        # Cuando una carta es baneada, hay que revisar que todos los mazos
        # que la tengan cambien el estado a ilegal.
        # Esto debe efectuarse al modificar la base de datos.
        pass  

    def check_deck_list_legality(format, deck):
        # Ver si hacerlo asi
        return Format.check_deck_legality(format, deck)
    
    # Devuelve todos los mazos de un usuario, para mostrar en su perfil o en una busqueda.
    # Si user_instance tiene un valor, se asume que el dueño quiere ver sus mazos, y por lo tanto se muestran los mazos privados.
    # TODO: Ver si esta forma de verificar es segura
    def get_all_decks_from_user(target_user, user_instance=None):
        if user_instance.username == target_user:
            return DeckModel.objects.filter(deck_owner=user_instance) # Ver si usar id o algo por el estilo
        else:
            # TODO: Cambiar esto para que pueda usar el id. Capas haya que cambiar algo en el modelo
            return DeckModel.objects.filter(deck_owner__username=target_user).exclude(visibility="R")
        
    # Armo el string desde los forms, asi puedo filtrarlo adecuadamente luego
    def construct_string(form_fields):
        query_string = ""
        if form_fields["deck_name"]:
            query_string += form_fields["deck_name"] + " "
        if form_fields["format"]:
            query_string += "format:" + form_fields["format"] + " "
        if form_fields["user"]:
            query_string += "user:" + form_fields["user"] + " "
        if form_fields["faction"]:
            query_string += "faction:" + form_fields["faction"] + " "
        if form_fields["card_name"]:
            query_string += "card:" + form_fields["card_name"] + " "
        return query_string

    # Filtro mazos según un criterio de busqueda. Estos son mucho más simples que el de las cartas
    def filter_decks(user_query):
        splited_query = user_query.split()
        query_set = DeckModel.get_all_public_decks()
        for query in splited_query:
            splited_terms = re.split(":|=", query)
            if len(splited_terms) > 1:
                match splited_terms[0]:
                    case "format":
                        query_set = query_set.filter(format__iexact=splited_terms[1])
                    case "user":
                        query_set = query_set.filter(deck_owner__icontains=splited_terms[1])
                    case "faction":
                        query_set = query_set.filter(deck_factions__iexact=splited_terms[1])
                    case "card_name":
                        query_set = query_set.filter(card_list__icontains=splited_terms[1])
                    case _:
                        query_set = query_set.filter(deck_name__icontains=splited_terms[1])
            else:
                query_set = query_set.filter(deck_name__icontains=splited_terms[0])
        return query_set
    

    # Borra un mazo. Esto se puede realizar solo si lo hace el dueño.
    # TODO: Comprobar que no se puedan borrar mazos de otros usuarios.
    def delete_deck(user_instance, deck_id):
        deck_to_be_deleted = DeckModel.get_deck_from_id(deck_id)
        if user_instance == deck_to_be_deleted.deck_owner:
            deck_to_be_deleted.delete()
            return JsonResponse({"message": "Mazo borrado con éxito."}, status=200)
        else:
            raise JsonResponse({"forbidden:","Solo el dueño puede borrar su mazo."}, status=403)
        
    # Clona un mazo y lo guarda en los mazos del usuario. Revisamos que el mazo no sea privado o le pertenece al usuario antes de copiarlo,
    # porque sino alguien podría copiar mazos privados usando ids al azar.
    def clone_deck(user_instance, deck_id):
        deck_to_be_cloned = DeckModel.get_deck_from_id(deck_id)
        if deck_to_be_cloned.visibility != "R" or deck_to_be_cloned.deck_owner == user_instance:
            deck_to_be_cloned.deck_name = deck_to_be_cloned.deck_name + " (Duplicado)"
            deck_to_be_cloned.visibility = "R"
            cloned_deck = DeckModel.save_deck(user_instance, deck_to_be_cloned, deck_to_be_cloned.legal)
            return cloned_deck
        else:
            raise JsonResponse({"forbidden:","No se pueden clonar mazos privados si no le pertence."}, status=403)