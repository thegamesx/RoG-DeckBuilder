from django import forms
from .models import CardSet

class AdvancerSearchForm(forms.Form):

    TYPE = [
        ("Criatura","Criatura"),
        ("Sigilo","Sigilo"),
        ("Magia Lenta","Magia Lenta"),
        ("Magia Rapida","Magia Rapida"),
        ("Artefacto","Artefacto"),
        ("Terreno","Terreno"),
        ("Estructura","Estructura"),
        ("Token","Token"),
    ]

    FACTION = [
        ("Neptuno","Neptuno"),
        ("Pluton","Pluton"),
        ("Jupiter","Jupiter"),
        ("Saturno","Saturno"),
        ("Marte","Marte"),
    ]

    RARITY = [
        ("Comun","Comun"),
        ("Rara","Rara"),
        ("Epica","Epica"),
        ("Legendaria","Legendaria"),
    ]

    card_name = forms.CharField(label="Nombre", max_length=200, required=False)
    text_box = forms.CharField(label="Habilidad", max_length=2000, required=False)
    card_type = forms.ChoiceField(label="Tipo", choices=TYPE, required=False)
    faction = forms.ChoiceField(label="Facción", choices=FACTION, required=False)
    cost = forms.CharField(label="Coste", max_length=20, required=False)
    converted_cost = forms.IntegerField(label="Costo total", required=False)
    attack = forms.IntegerField(label="Ataque", required=False)
    health = forms.IntegerField(label="Vida", required=False)
    rarity = forms.ChoiceField(label="Rareza", choices=RARITY, required=False)
    set_dropdown = forms.ChoiceField(label="Expansion", choices=CardSet.get_list_of_sets(), required=False)
