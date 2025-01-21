from django.shortcuts import render, get_list_or_404, get_object_or_404
from django.http import Http404
from django.core.paginator import Paginator
from django.views.generic import ListView
from django.db.models import Q
from RoGDB.models import Card,CardVersion


def specific_card_info(request, set_id, card_id):
    queryset = CardVersion.objects.filter(serial_number=card_id, set_id_id__set_code=set_id)
    card = get_object_or_404(queryset)
    context = { 'requestedcard': card }
    return render (request, "cardSearch/card.html", context)


def generic_card_info(request, db_card_id):
    try:
        card = CardVersion.get_last_version(db_card_id)
        context = { 'requestedcard': card }
        return render (request, "cardSearch/card.html", context)
    except CardVersion.DoesNotExist:
        raise Http404 ("Card not found")
    


class SearchResult(ListView):
    model = CardVersion
    paginate_by = 12
    template_name = "cardSearch/search.html"
    context_object_name = "card_list"
    ordering = ['card_id__card_name']

    # Evitar duplicados
    def get_queryset(self):
        try:
            user_query = self.kwargs['user_query']
        except:
            return CardVersion.objects.all()
        queryset = CardVersion.objects.filter(card_id__card_name__icontains=user_query)
        return get_list_or_404(queryset)
     
