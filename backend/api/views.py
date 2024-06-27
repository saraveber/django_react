from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import UserSerializer, AvailableTermSerializer, AvailableTermForUserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import AvailableTerm
from rest_framework.exceptions import ValidationError

from .permissions import IsAdminUser, IsPlayerUser, IsStaffUser, IsOnlyUser ,IsAdminOrStaffUser

#Terms
class AvailableTermsByUser(generics.ListAPIView):
    serializer_class = AvailableTermSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """
        This view should return a list of all the terms
        for the user as determined by the userId captured from the URL.
        """
        userId = self.kwargs['userId']
        return AvailableTerm.objects.filter(user__id=userId)


#This view is used by admin/staff to add term for specific user
class AvailableTermListCreateForUser(generics.ListCreateAPIView):
    serializer_class = AvailableTermForUserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrStaffUser]

    def perform_create(self, serializer):
        user = serializer.validated_data.get('user')
        end_date = serializer.validated_data.get('end_date')
        start_date = serializer.validated_data.get('start_date')

        if AvailableTerm.objects.filter(user=user, start_date=start_date, end_date=end_date).exists():
            print('This term already exists.')
        else:
            if serializer.is_valid():
                serializer.save()
            else:
                print(serializer.errors)


# Class that returns all available terms for the current user
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

# Class that deletes all available terms for a specific user
class AvailableTermDeleteAllForUser(generics.GenericAPIView):
    serializer_class = AvailableTermSerializer
    permission_classes = [IsAuthenticated, IsAdminOrStaffUser]

    def delete(self, request, *args, **kwargs):
        userId = self.kwargs['userId']
        AvailableTerm.objects.filter(user__id=userId).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Class that deletes all available terms for the current user
class AvailableTermDeleteAll(generics.GenericAPIView):
    serializer_class = AvailableTermSerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        AvailableTerm.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Class that creates a new user
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


# Class that returns Current user 
class UserView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    
#Class that returns all users that are players
class PlayerListView(generics.ListAPIView):
    queryset = User.objects.filter(groups__name='player')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrStaffUser]
