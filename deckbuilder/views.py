from django.shortcuts import render, get_list_or_404
from django.template import loader
from django.http import HttpResponseRedirect, HttpResponseBadRequest, JsonResponse, Http404
from RoGDB.models import CardVersion
from django.views.generic import ListView
from deckbuilder.models import DeckModel
from .forms import DeckSearchForm
import json

def get_cards_info(deck_json):
    card_list = []
    for card in deck_json:
        card_list.append(card["version"])
    
    updated_card_list = CardVersion.get_group_of_cards(card_list)

    # Despues de fetchear la data completa de las cartas, le agregamos la cantidad que habia en el mazo
    for card in updated_card_list:
        card_quantity = next((old_card.get('quantity') for old_card in deck_json if int(old_card["id"]) == card["card_id"]), 0)
        card["quantity"] = int(card_quantity)

    return updated_card_list

def card_list_query(request, query):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'

    if is_ajax:
        if request.method == 'GET':
            queryset = CardVersion.evaluate_string(query)
            cardlist = list(queryset.values(
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
            if cardlist:
                return JsonResponse(cardlist, safe=False)
            else:
                return JsonResponse({'context': None})
        return JsonResponse ({'status': 'Invalid request'}, status=400)
    else:
        return HttpResponseBadRequest('Invalid request')
    

def save_deck(request):
    if request.method == "POST":
        try:
            deck_data = json.loads(request.body)
            legal = DeckModel.check_deck_list_legality("Eterno", deck_data["cards"])
            if request.user.is_authenticated:
                if deck_data["deck_id"]:
                    DeckModel.update_deck(request.user, deck_data, legal)
                else:
                    DeckModel.save_deck(request.user, deck_data, legal)
                return JsonResponse({"message": "Mazo guardado con éxito."}, status=200)
            else:
                return JsonResponse({"error": "Debe iniciar sesión para guardar un mazo."}, status=403)
        except json.JSONDecodeError as error:
            return JsonResponse({"error": "JSON inválido.", "details": str(error)}, status=400)
    
    return JsonResponse({"error": "Método no permitido."}, status=405)

def deckbuilder_page(request, deck_id=None):
    if deck_id:
        try:
            updated_card_list = {}
            deck_info = DeckModel.get_deck_from_id(deck_id)
            updated_card_list["main"] = get_cards_info(deck_info.card_list["main"])
            updated_card_list["side"] = get_cards_info(deck_info.card_list["side"])
            updated_card_list["maybe"] = get_cards_info(deck_info.card_list["maybe"])

            loaded_deck = {
                "deckname": deck_info.deck_name,
                "deck_id": deck_id,
                "description": deck_info.deck_desc,
                "visibility": deck_info.visibility,
                "format": deck_info.format,
                "card_list": updated_card_list,
                "deck_owner": deck_info.deck_owner.get_username(),
            }
            context = { 'loadedDeck': loaded_deck }
        except DeckModel.DoesNotExist as error:
            return render(request, "deckbuilder/deck-403-404.html")
    else:
        context = { 'loadedDeck': None }
    return render(request, "deckbuilder/deckbuilder.html", context)

def view_deck(request,deck_id):
    try:
        deck_info = DeckModel.get_deck_from_id(deck_id)
        if deck_info.visibility == "R" and request.user != deck_info.deck_owner:
            return render(request, "deckbuilder/deck-403-404.html")
        else:
            updated_decklist = {
                'main': get_cards_info(deck_info.card_list["main"]),
                'side': get_cards_info(deck_info.card_list["side"]),
                'maybe': get_cards_info(deck_info.card_list["maybe"]),
            }

            loaded_deck = {
                        "deckname": deck_info.deck_name,
                        "deck_id": deck_id,
                        "description": deck_info.deck_desc,
                        "visibility": deck_info.visibility,
                        "format": deck_info.format,
                        "card_list": updated_decklist,
                        "deck_owner": deck_info.deck_owner.get_username(),
                    }
            return render(request, "deckbuilder/deck-view.html", { 'loadedDeck': loaded_deck })
    except DeckModel.DoesNotExist as error:
        return render(request, "deckbuilder/deck-403-404.html")
    
def delete_deck(request, profile_name, deck_id):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'

    if is_ajax:
        if request.method == "DELETE":
            try:
                DeckModel.delete_deck(request.user, deck_id)
                return JsonResponse({"message": "Mazo borrado con éxito."}, status=200)
            except DeckModel.DoesNotExist as error:
                return JsonResponse({"error": "Mazo no encontrado."}, status=404)
        else:
            return JsonResponse({"error": "Método no permitido."}, status=405)
    else:
        return JsonResponse({"error": "Petición invalida."}, status=400)
    
class DeckSearch(ListView):
    model = DeckModel
    paginate_by = 30
    template_name = "deckbuilder/deck-search.html"
    context_object_name = "deck_list"
    ordering = ['-published_date']

    def get_queryset(self):
        try:
            user_query = self.kwargs['user_query']
            queryset = DeckModel.filter_decks(user_query)
        except KeyError:
            # Mostrar un aviso de que no se encontró ningun mazo
            queryset = DeckModel.get_all_public_decks()
        # Como reemplazamos el get_queryset, hay que llamar a get_ordering manualmente
        ordering = self.get_ordering()
        return queryset.order_by(*ordering)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        query = self.request.GET.get('query', '')
        context['form'] = DeckSearchForm(initial={'query': query})
        return context
    
    def post(self, request, *args, **kwargs):
        form = DeckSearchForm(request.POST)
        if form.is_valid():
            # query_string = DeckModel.construct_string(form.cleaned_data)
            return HttpResponseRedirect(f'/decks/search/{form.cleaned_data["deck_name"]}')
        else:
            return self.get(request, *args, **kwargs)
    
class UserDecks(ListView):
    model = DeckModel
    paginate_by = 30
    template_name = "deckbuilder/user-decks.html"
    context_object_name = "deck_list"
    ordering = ['-published_date']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['profile_name'] = self.kwargs['profile_name']
        return context

    def get_queryset(self):
        profile_name = self.kwargs['profile_name']
        # Cambiar esto para que no de un 404
        return get_list_or_404(DeckModel.get_all_decks_from_user(profile_name, self.request.user))