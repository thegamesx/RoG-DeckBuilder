from django import forms

class SearchForm(forms.Form):

    CATEGORIES = [
        ("search", "Cartas"),
        ("decks", "Mazos"),
        ("users", "Creadores"),
    ]

    search_category = forms.ChoiceField(label="Categoria", choices=CATEGORIES)
    search_query = forms.CharField(label="", max_length=1000)
