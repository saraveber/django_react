from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import UserSerializer, AvailableTermSerializer, UserProfileSerializer 
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import AvailableTerm, UserProfile
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