from django import forms
from .models import CardSet, Format
from django.db.utils import OperationalError, ProgrammingError

class AdvancerSearchForm(forms.Form):

    TYPE = [
        ("","---"),
        ("Criatura","Criatura"),
        ("Sigilo","Sigilo"),
        ("Magia Lenta","Magia Lenta"),
        ("Magia Rápida","Magia Rápida"),
        ("Artefacto","Artefacto"),
        ("Terreno","Terreno"),
        ("Estructura","Estructura"),
        ("Token","Token"),
    ]

    FACTION = [
        ("","---"),
        ("Neptuno","Neptuno"),
        ("Pluton","Pluton"),
        ("Jupiter","Jupiter"),
        ("Saturno","Saturno"),
        ("Marte","Marte"),
        ("Tierra","Tierra"),
    ]

    RARITY = [
        ("","---"),
        ("Comun","Comun"),
        ("Rara","Rara"),
        ("Epica","Epica"),
        ("Legendaria","Legendaria"),
    ]

    OPERATORS = [
        ("=", "Igual a"),
        (">", "Mayor a"),
        (">=", "Mayor o igual a"),
        ("<", "Menor a"),
        ("<=", "Menor o igual a"),
        ("!=", "Diferente a"),
    ]

    LEGALITY = [
        ("legal", "Legal"),
        ("banned", "Prohibida"),
    ]

    card_name = forms.CharField(label="Nombre", max_length=200, required=False, widget=forms.TextInput(attrs={'class': 'form-control'}))
    text_box = forms.CharField(label="Habilidad", max_length=2000, required=False, widget=forms.Textarea(attrs={'class': 'form-control','rows':"1"}))
    card_type = forms.ChoiceField(label="Tipo", choices=TYPE, required=False, widget=forms.Select(attrs={'class': 'form-select'}))
    faction = forms.ChoiceField(label="Facción", choices=FACTION, required=False, widget=forms.Select(attrs={'class': 'form-select'}))
    cost = forms.CharField(label="Coste", max_length=20, required=False, widget=forms.TextInput(attrs={'class': 'form-select'}))
    cc_operator = forms.ChoiceField(choices=OPERATORS, required=False, widget=forms.Select(attrs={'class': 'form-select'}))
    converted_cost = forms.IntegerField(label="Costo total", required=False, widget=forms.NumberInput(attrs={'class': 'form-control', 'min': 0, 'step': 1}))
    a_operator = forms.ChoiceField(choices=OPERATORS, required=False, widget=forms.Select(attrs={'class': 'form-select'}))
    attack = forms.IntegerField(label="Ataque", required=False, widget=forms.NumberInput(attrs={'class': 'form-control', 'min': 0, 'step': 1}))
    h_operator = forms.ChoiceField(choices=OPERATORS, required=False, widget=forms.Select(attrs={'class': 'form-select'}))
    health = forms.IntegerField(label="Vida", required=False, widget=forms.NumberInput(attrs={'class': 'form-control', 'min': 0, 'step': 1}))
    rarity = forms.ChoiceField(label="Rareza", choices=RARITY, required=False, widget=forms.Select(attrs={'class': 'form-select'}))
    set_dropdown = forms.ChoiceField(label="Expansion", required=False, widget=forms.Select(attrs={'class': 'form-select'}))
    legality = forms.ChoiceField(label="Legal", choices=LEGALITY, required=False, widget=forms.Select(attrs={'class': 'form-select'}))
    format = forms.ChoiceField(label="Formato", required=False, widget=forms.Select(attrs={'class': 'form-select'}))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


        try:
            self.fields['set_dropdown'].choices = CardSet.get_list_of_sets()
        except (OperationalError, ProgrammingError):
            self.fields['set_dropdown'].choices = [("", "---")]

        try:
            self.fields['format'].choices = Format.get_list_of_formats()
        except (OperationalError, ProgrammingError):
            self.fields['format'].choices = [("", "---")]