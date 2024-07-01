from django.contrib.auth.models import User
from django.contrib.auth import authenticate, update_session_auth_hash
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from .models import AvailableTerm, Player, League, Team, Round
from .serializers import UserSerializer, AvailableTermSerializer, AvailableTermForUserSerializer, PlayerSerializer, LeagueSerializer, TeamSerializer, RoundSerializer

from .permissions import IsAdminUser, IsPlayerUser, IsStaffUser, IsOnlyUser ,IsAdminOrStaffUser

#Terms
#TODO: Add permissions to the views; 
#TODO: Add another view that is secure and only allows the user to see their own terms
#TODO: Add another view that is secure and only allows the admin/staff to see all terms
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



class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not user.check_password(current_password):
            return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)  # Important for keeping the user logged in

        return Response({'success': True}, status=status.HTTP_200_OK)

class RoundsListCreate(generics.ListCreateAPIView):
    serializer_class = RoundSerializer
    permission_classes = [IsAuthenticated, IsAdminOrStaffUser]

    def get_queryset(self):
        return Round.objects.all()

    def perform_create(self, serializer):
        r_num = serializer.validated_data.get('round_number')
        
        if Round.objects.filter(round_number=r_num).exists():
            print('This round already exists.')
        else:
            if serializer.is_valid():
                serializer.save()
            else:
                print(serializer.errors)