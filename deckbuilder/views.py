from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from RoGDB.models import CardVersion

def card_list_query(request, query):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'

    if is_ajax:
        if request.method == 'GET':
            queryset = CardVersion.evaluate_string(query)
            cardlist = list(queryset.values(
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

def deckbuilder_page(request):
    cardlist = CardVersion.get_all_cards()
    context = {
        'cardlist': cardlist
    }
    return render(request, "deckbuilder/deckbuilder.html", context)