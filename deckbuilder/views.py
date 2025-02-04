from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from RoGDB.models import CardVersion

def card_list_query(request, query):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'

    if is_ajax:
        if request.method == 'GET':
            cardlist = CardVersion.get_card_by_name("a") # Ver como pasar una variable
            return JsonResponse({'context': cardlist})
        return JsonResponse ({'status': 'Invalid request'}, status=400)
    else:
        return HttpResponseBadRequest('Invalid request')

def deckbuilder_page(request):
    cardlist = CardVersion.get_all_cards()
    context = {
        'cardlist': cardlist
    }
    return render(request, "deckbuilder/deckbuilder.html", context)