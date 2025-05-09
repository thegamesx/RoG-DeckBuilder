from django import forms

class DeckSearchForm(forms.Form):
    
    query = forms.CharField(label="Buscar", max_length=200, required=False, widget=forms.TextInput(attrs={'class': 'card-filter form-control', 'id':'card-filter', 'placeholder': 'Buscar mazos...'}))