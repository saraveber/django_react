from django.urls import path
from . import views

urlpatterns = [
    path('terms/', views.AvailableTermListCreate.as_view(), name='term-list'),  # Corrected here
    path('terms/delete/<int:pk>/', views.AvailableTermDelete.as_view(), name='delete-term'),
    path('terms/delete-all/', views.AvailableTermDeleteAll.as_view(), name='delete-all-terms'),
    path('terms/user/<int:userId>/', views.TermsByUser.as_view(), name='terms-by-user'),
    path('users/get-all-players/', views.PlayerListView.as_view(), name='player-list'),
]