from django import forms
from django.contrib.auth.forms import AuthenticationForm

class CustomAuthenticationForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        self.fields['username'].widget.attrs.update({
            'class': 'form-control mx-auto d-block w-75',
            'placeholder': 'Ingrese su email...',
        })
        self.fields['password'].widget.attrs.update({
            'class': 'form-control mx-auto d-block w-75',
            'placeholder': 'Ingrese su contraseña...',
        })