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

    # Actualizamos el contexto para mostrar el campo de ordenación y la dirección correctos en el template
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        sort_by = self.request.GET.get('sort_by', 'card_id__card_name')
        order = self.request.GET.get('order', 'des')

        context['current_sort_by'] = sort_by
        context['current_order'] = order

        # Mapeo de campos para mostrar texto legible
        field_labels = {
            'card_id__card_name': 'Nombre',
            'card_id__faction': 'Facciones',
            'card_id__rarity': 'Rareza',
            'card_id__converted_cost': 'Coste total',
            'card_id__attack': 'Ataque',
            'card_id__health': 'Salud',
            'card_id__release_date': 'Fecha de impresión',
        }

        context['sort_by_label'] = field_labels.get(sort_by, 'Nombre')
        context['order_label'] = 'Ascendente' if order == 'asc' else 'Descendente'
        context['order_icon'] = 'bi-arrow-up' if order == 'asc' else 'bi-arrow-down'

        return context

    def get_queryset(self):
        try:
            user_query = self.kwargs['user_query']
            queryset = CardVersion.evaluate_string(user_query)
        except KeyError:
            # TODO: Programar un aviso de que no se encontró ningun resultado
            queryset = CardVersion.get_all_cards()
        
        # Ordenamos según el campo y dirección de ordenación seleccionados. Por defecto, ordena por nombre de carta de forma ascendente
        sort_by = self.request.GET.get('sort_by', 'card_id__card_name')
        order = self.request.GET.get('order', 'asc')

        # Como reemplazamos el get_queryset, hay que llamar a get_ordering manualmente
        ordering = f"-{sort_by}" if order == 'des' else sort_by
        return queryset.order_by(ordering)
    
    # Si el resultado de la busqueda devuelve solo una carta, redirecciona directamente a la info de esa carta
    def render_to_response(self, context, **response_kwargs):
        if len(self.object_list) == 1:
            return redirect(f"/cards/{self.object_list[0].card_id_id}")
        return super().render_to_response(context, **response_kwargs)
     
