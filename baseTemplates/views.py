from django.http import Http404, HttpResponseRedirect

def navbar_buscar(request):
    query = request.GET.get('q', '')
    if not query:
        raise Http404("No search query provided.")
    categoria = request.GET.get('categoria', 'cards')

    if categoria == 'cards':
        return HttpResponseRedirect(f'/cards/search/{query}')
    elif categoria == 'decks':
        return HttpResponseRedirect(f'/decks/search/{query}')
    elif categoria == 'users':
        return HttpResponseRedirect(f'/users/search/{query}')
    else:
        raise Http404("Invalid search category provided.")