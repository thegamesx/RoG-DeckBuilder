from django import forms

class SearchForm(forms.Form):

    SEARCH_CHOICES = [
        ("cards", "Cartas"),
        ("decks", "Mazos"),
        ("users", "Creadores"),
    ]

    search_category = forms.ChoiceField(
        choices=SEARCH_CHOICES,
        widget=forms.RadioSelect(attrs={'class': 'btn-check'}),
        initial='cards',
    )

    query = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'form-control search-input',
            'id': 'home-search-input',
            'placeholder': 'Buscar...',
            'aria-label': 'Buscar...',
        }),
        required=False
    )
