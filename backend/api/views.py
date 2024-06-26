from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import UserSerializer, NoteSerializer, AvailableTermSerializer, PlayerSerializer, LeagueSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, AvailableTerm, Player, League
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

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def perform_create(self, serializer):
        user = self.request.user
        title =serializer.validated_data.get('title')
        
        if Note.objects.filter(author=user, title=title).exists():
            raise ValidationError('This term already exists.')
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]