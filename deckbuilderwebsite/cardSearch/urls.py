from django.urls import path
from . import views

urlpatterns = [
    path("card/<set_id>/<int:card_id>", views.card_info, name="card_info")
]
