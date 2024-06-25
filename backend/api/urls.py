from django.urls import path
from . import views


urlpatterns  = [
    path('terms/', views.AvailableTermListCreate.as_view(), name='term-list'),
    path('terms/delete/<int:pk>/', views.AvailableTermDelete.as_view(), name='delete-term'),
    path('terms/delete-all/', views.AvailableTermDelleteAll.as_view(), name='delete-all-terms'),
]

