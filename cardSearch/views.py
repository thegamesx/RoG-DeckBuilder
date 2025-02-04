from django.shortcuts import render, get_list_or_404, get_object_or_404, redirect
from django.http import Http404, HttpResponseRedirect
from django.core.paginator import Paginator
from django.views.generic import ListView
from django.db.models import Q
from RoGDB.models import CardVersion
from RoGDB.forms import AdvancerSearchForm


def advanced_search(request):
    if request.method == "POST":
        advanced_form = AdvancerSearchForm(request.POST)
        if advanced_form.is_valid():
            query_string = CardVersion.construct_string(advanced_form.cleaned_data)
            return HttpResponseRedirect(f'/search/{query_string}')
    else:
        advanced_form = AdvancerSearchForm()
    return render (request, "cardSearch/advanced.html", {'form': advanced_form})


def specific_card_info(request, set_id, card_id):
    try:
        card = CardVersion.get_specific_card(card_id,set_id)
        context = { 'requestedcard': card }
        return render (request, "cardSearch/card.html", context)
    except CardVersion.DoesNotExist:
        raise Http404 ("Card not found")


def generic_card_info(request, db_card_id):
    try:
        card = CardVersion.get_last_version(db_card_id)
        context = { 'requestedcard': card }
        return render (request, "cardSearch/card.html", context)
    except CardVersion.DoesNotExist:
        raise Http404 ("Card not found")


def specific_set_cards(request, set_id):
    return HttpResponseRedirect(f"/search/set:{set_id}")


class SearchResult(ListView):
    model = CardVersion
    paginate_by = 12
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
    
    def render_to_response(self, context, **response_kwargs):
        if len(self.object_list) == 1:
            return redirect(f"/card/{self.object_list[0].card_id_id}")
        return super().render_to_response(context, **response_kwargs)
     
