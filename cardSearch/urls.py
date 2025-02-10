from django.urls import path
from . import views

urlpatterns = [
    path('advanced/', views.advanced_search, name="advanced-search"),
    path("<set_id>/<int:card_id>", views.specific_card_info, name="specific_card_info"),
    path("<int:db_card_id>", views.generic_card_info, name="generic_card_info"),
    path("set/<str:set_id>", views.specific_set_cards, name="specific_set_cards"),
    path('search/', views.SearchResult.as_view()),
    path('search/<str:user_query>', views.SearchResult.as_view(), name='search-cards-view'),
]
