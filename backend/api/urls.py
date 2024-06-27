from django.urls import path
from . import views


urlpatterns  = [
    path('terms/', views.AvailableTermListCreate.as_view(), name='term-list'),
    path('terms/delete/<int:pk>/', views.AvailableTermDelete.as_view(), name='delete-term'),
    path('terms/delete-all/', views.AvailableTermDelleteAll.as_view(), name='delete-all-terms'),
    path('players/', views.PlayerListCreate.as_view(), name='player-list-create'),
    path('leagues/',views.LeagueList.as_view(), name='league-list'),
    path('teams/', views.TeamListCreate.as_view(), name='team-list-create'),
]

