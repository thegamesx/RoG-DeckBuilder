from django.shortcuts import render, get_list_or_404, get_object_or_404, redirect
from django.http import Http404, HttpResponseRedirect
from django.core.paginator import Paginator
from django.views.generic import ListView
from django.db.models import Q
from RoGDB.models import CardVersion, Card
from RoGDB.forms import AdvancerSearchForm


def advanced_search(request):
    if request.method == "POST":
        advanced_form = AdvancerSearchForm(request.POST)
        if advanced_form.is_valid():
            query_string = CardVersion.construct_string(advanced_form.cleaned_data)
            return HttpResponseRedirect(f'/cards/search/{query_string}')
    else:
        advanced_form = AdvancerSearchForm()
    return render (request, "cardSearch/advanced.html", {'form': advanced_form})


def specific_card_info(request, card_id, set_id=False):
    try:
        if set_id:
            card = CardVersion.get_specific_card(card_id,set_id)
        else:
            card = CardVersion.get_last_version(card_id)
        other_prints = CardVersion.get_all_versions_of_a_card(card.card_id)
        related_cards = card.card_id.related_cards.all()
        related_cards_info = []
        for related_card in related_cards:
            related_cards_info.append(CardVersion.get_last_version(related_card.pk))
        context = { 
            'requestedcard': card,
            'otherprints': other_prints,
            'relatedcards': related_cards_info,
        }
        return render (request, "cardSearch/card.html", context)
    except CardVersion.DoesNotExist:
        raise Http404 ("Card not found")


def specific_set_cards(request, set_id):
    return HttpResponseRedirect(f"/cards/search/set:{set_id}")


class SearchResult(ListView):
    model = CardVersion
    paginate_by = 30
    template_name = "cardSearch/search.html"
    context_object_name = "card_list"
    ordering = ['card_id__card_name']

    def get_queryset(self):
        try:
            user_query = self.kwargs['user_query']
        except:
            return CardVersion.objects.filter(last_print=True)
        queryset = CardVersion.evaluate_string(user_query)
        card_list = get_list_or_404(queryset)
        return card_list
    
    # Si el resultado de la busqueda devuelve solo una carta, redirecciona directamente a la info de esa carta
    def render_to_response(self, context, **response_kwargs):
        if len(self.object_list) == 1:
            return redirect(f"/cards/{self.object_list[0].card_id_id}")
        return super().render_to_response(context, **response_kwargs)
     
