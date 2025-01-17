from django.shortcuts import render, get_list_or_404, get_object_or_404
from django.http import Http404
from django.core.paginator import Paginator
from django.views.generic import ListView
from django.db.models import Q
from RoGDB.models import Card,CardVersion


def card_list_test():
    cardlist = []
    for i in range(100):
        cardlist.append(Card.objects.create(card_name=f"Numero {i}", faction="Neptuno", card_type="Sello"))
    return cardlist


def index(request):
    card_list = card_list_test()
    context = {
        'card_list': card_list,
        'page_limit': 30,
        'first_card': 0, # cambiar esto luego
        'cards_found': len(card_list), # La API debería devolver esta info, porque la cant de cartas se devuelve por pagina, en vez del total
        'current_page': 1, # Cambiar por una variable
        'total_pages': 3,
    }
    return render(request, "cardSearch/search.html", context)


def specific_card_info(request, set_id, card_id):
    queryset = CardVersion.objects.filter(serial_number=card_id, set_id_id__set_code=set_id)
    card = get_object_or_404(queryset)
    context = { 'requestedcard': card }
    return render (request, "cardSearch/card.html", context)


def generic_card_info(request, db_card_id):
    """
    queryset = CardVersion.objects.filter(card_id=db_card_id)
    card = get_object_or_404(queryset)
    """
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

    """
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["query"] = Card.objects.filter(self.query)
        return context
    
    
    def get_queryset(self, *args, **kwargs):
        qs = super(CardVersion, self).get_queryset(*args, **kwargs)
        return qs

        self.query = list(CardVersion.objects.prefetch_related("card_id"))
        if self.kwargs["input"]:
            self.query = list(Card.objects.filter(card_name=self.kwargs["input"]))
            if not self.query:
                raise Http404("No se encontró la carta.") # Cambiar vista
        else:
            self.query = list(Card.objects.all())
    """
        
    

    


    