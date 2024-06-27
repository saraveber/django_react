from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import UserSerializer, AvailableTermSerializer, PlayerSerializer, LeagueSerializer, UserProfileSerializer, TeamSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import AvailableTerm, Player, League, UserProfile, Team
from rest_framework.exceptions import ValidationError


class AvailableTermListCreate(generics.ListCreateAPIView):
    serializer_class = AvailableTermSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return AvailableTerm.objects.filter(user=user)
    
    def perform_create(self, serializer):
        user = self.request.user
        end_date = serializer.validated_data.get('end_date')
        start_date = serializer.validated_data.get('start_date')

        if AvailableTerm.objects.filter(user=user, start_date=start_date, end_date=end_date).exists():
            print('This term already exists.')
        else:
            if serializer.is_valid():
                serializer.save(user=self.request.user)
            else:
                print(serializer.errors)

class AvailableTermDelleteAll(generics.GenericAPIView):
    serializer_class = AvailableTermSerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        AvailableTerm.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AvailableTermDelete(generics.DestroyAPIView):
    serializer_class = AvailableTermSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return AvailableTerm.objects.filter(user=user)

class PlayerListCreate(generics.ListCreateAPIView):
    serializer_class = PlayerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Player.objects.all()
        name = self.request.query_params.get('name', None)
        
        if name:
            queryset = queryset.filter(name__icontains=name)
        
        return queryset

    def perform_create(self, serializer):
        name = serializer.validated_data.get('name')
        surname = serializer.validated_data.get('surname')
        
        if Player.objects.filter(name=name, surname=surname).exists():
            print('This player already exists.')
        else:
            if serializer.is_valid():
                serializer.save()
            else:
                print(serializer.errors)

class LeagueList(generics.ListCreateAPIView):
    serializer_class = LeagueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = League.objects.all()
        gender = self.request.query_params.get('gender', None)
        league_type = self.request.query_params.get('type', None)
        if gender:
            queryset = queryset.filter(gender=gender)
        if league_type:
            queryset = queryset.filter(type=league_type)
        return queryset

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class UserProfileDetail(generics.RetrieveAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):

        #TODO: check documentation for get_or_create method; is there a better way to do this?
        
        user_profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return user_profile

class TeamListCreate(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Team.objects.all()

    def perform_create(self, serializer):
        p1 = serializer.validated_data.get('player1')
        p2 = serializer.validated_data.get('player2')
        
        if Team.objects.filter(player1=p1, player2=p2).exists() or Team.objects.filter(player1=p2, player2=p1).exists():
            print('This team already exists.')
        else:
            if serializer.is_valid():
                serializer.save()
            else:
                print(serializer.errors)