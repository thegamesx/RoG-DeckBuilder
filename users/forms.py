from django.contrib.auth.forms import AuthenticationForm
from django_registration.forms import RegistrationForm

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

class CustomRegistrationForm(RegistrationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Agregamos Bootstrap a todos los campos
        for field in self.fields.values():
            field.widget.attrs.update({'class': 'form-control'})