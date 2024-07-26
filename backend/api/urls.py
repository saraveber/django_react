from django.urls import path
from . import views

urlpatterns = [
    path('terms/', views.AvailableTermListCreate.as_view(), name='term-list'),  # Corrected here
    path('terms/by-user/', views.AvailableTermListCreateForUser.as_view(), name='term-list-for-user'),  # Corrected here
    path('terms/delete-all/', views.AvailableTermDeleteAll.as_view(), name='delete-all-terms'),
    path('terms/delete-all/user/<int:userId>/', views.AvailableTermDeleteAllForUser.as_view(), name='delete-all-terms-for-user'),
    path('terms/user/<int:userId>/', views.AvailableTermsByUser.as_view(), name='terms-by-user'),
    path('users/get-all-players/', views.PlayerListView.as_view(), name='player-list'),
    path('players/', views.PlayerListCreate.as_view(), name='player-list-create'),
    path('leagues/',views.LeagueList.as_view(), name='league-list'),
    path('teams/', views.TeamListCreate.as_view(), name='team-list-create'),
    path('teams/<int:pk>/', views.TeamUpdateAPIView.as_view(), name='team-update'),
    path('rounds/', views.RoundsListCreate.as_view(), name='round-list-create'),
    path('rounds/<int:pk>/', views.RoundUpdateAPIView.as_view(), name='round-update'),
    path('matches/', views.MatchListCreate.as_view(), name='match-list-create'),
    path('matches/<int:pk>/', views.MatchUpdateAPIView.as_view(), name='match-update'),
    path('assignedmatches/', views.AssignedMatchesListCreate.as_view(), name='assignedMatch-list-create'),
]

