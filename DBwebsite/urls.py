"""
URL configuration for DBwebsite project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from cardSearch.views import SearchResult
from django.contrib.auth import views as auth_views
from users.forms import CustomAuthenticationForm
from users.views import custom_logout_view

urlpatterns = [
    path('', include("homepage.urls")),
    path('cards/', include("cardSearch.urls")),
    # Cambiamos el form del login para poder usar clases
    path('user/login/', auth_views.LoginView.as_view(
        template_name = 'registration/login.html',
        authentication_form = CustomAuthenticationForm
    ), name="login"),
    path('user/', include("users.urls")),
    path('user/', include('django.contrib.auth.urls')),
    path('user/', include('django_registration.backends.one_step.urls')),
    path('admin/', admin.site.urls),
    path('decks/', include("deckbuilder.urls")),
]  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
