from django.contrib.auth.models import User
from django.contrib.auth import authenticate, update_session_auth_hash
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from .models import AvailableTerm, Player, League, Team, Round, Match, AssignedMatch
from .serializers import UserSerializer, AvailableTermSerializer, AvailableTermForUserSerializer, PlayerSerializer, LeagueSerializer, TeamSerializer, RoundSerializer, MatchSerializer, AssignedMatchSerializer

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
        player_id = self.request.query_params.get('player_id', None)
        print(player_id)
        if gender:
            queryset = queryset.filter(gender=gender)
        if league_type:
            queryset = queryset.filter(type=league_type)
        if player_id:
            # Filter leagues that have teams where the player is either player1 or player2
            teams_with_player = Team.objects.filter(
                Q(player1=player_id) | Q(player2=player_id)
            ).values_list('league', flat=True)

            queryset = queryset.filter(id__in=teams_with_player)

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
        """
        Optionally restricts the returned teams to a given league,
        by filtering against a `league` query parameter in the URL.
        """
        queryset = Team.objects.all()
        league_id = self.request.query_params.get('league', None)
        if league_id is not None:
            queryset = queryset.filter(league=league_id)
        return queryset

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

class TeamUpdateAPIView(generics.UpdateAPIView):
    queryset = Team.objects.all()  # Queryset to fetch Round instances
    serializer_class = TeamSerializer  # Serializer class for validation
    permission_classes = [IsAdminOrStaffUser]  # Permissions for accessing this view

    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')  # Retrieve the primary key from URL kwargs
        try:
            instance = Team.objects.get(pk=pk)  # Fetch the specific instance
        except Team.DoesNotExist:
            return Response({'error': 'Team not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Update fields based on request data
        serializer = TeamSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



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
        queryset = Round.objects.all()
        is_active = self.request.query_params.get('is_active', None)

        if is_active == 'true':
            queryset = queryset.filter(is_active=True)

        return queryset

    def perform_create(self, serializer):
        r_num = serializer.validated_data.get('round_number')
        
        if Round.objects.filter(round_number=r_num).exists():
            print('This round already exists.')
        else:
            if serializer.is_valid():
                serializer.save()
            else:
                print(serializer.errors)

class RoundUpdateAPIView(generics.UpdateAPIView):
    queryset = Round.objects.all()  # Queryset to fetch Round instances
    serializer_class = RoundSerializer  # Serializer class for validation
    permission_classes = [IsAdminOrStaffUser]  # Permissions for accessing this view

    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')  # Retrieve the primary key from URL kwargs
        try:
            instance = Round.objects.get(pk=pk)  # Fetch the specific instance
        except Round.DoesNotExist:
            return Response({'error': 'Round not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Update fields based on request data
        serializer = RoundSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MatchListCreate(generics.ListCreateAPIView):
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated, IsAdminOrStaffUser]

    def get_queryset(self):
        queryset = Match.objects.all()
        league_id = self.request.query_params.get('league_id', None)
        team_id = self.request.query_params.get('team_id', None)
        player_id = self.request.query_params.get('player_id', None)
        is_active_round = self.request.query_params.get('is_active_round', None)
        #TODO: ADD OTHER FILTERS BASED ON FINISHED MATCHES, ACTIVE MATCHES, ETC
        if league_id:
            queryset = queryset.filter(league_id=league_id)
        if team_id:
            queryset = queryset.filter(Q(team_host_id=team_id) | Q(team_guest_id=team_id))
        if player_id:
            queryset = queryset.filter(
                Q(team_host__player1_id=player_id) | Q(team_host__player2_id=player_id) |
                Q(team_guest__player1_id=player_id) | Q(team_guest__player2_id=player_id)
            )
        if is_active_round == 'true':
            queryset = queryset.filter(round_number__is_active=True)


        
        return queryset


    def perform_create(self, serializer):
        host = serializer.validated_data.get('team_host')
        guest = serializer.validated_data.get('team_guest')
        
        if Match.objects.filter(team_guest=guest,team_host=host).exists() or Match.objects.filter(team_guest=host,team_host=guest).exists():
            print('This match already exists.')
        else:
            if serializer.is_valid():
                serializer.save()
            else:
                print(serializer.errors)

class MatchUpdateAPIView(generics.UpdateAPIView):
    queryset = Match.objects.all()  # Queryset to fetch Round instances
    serializer_class = MatchSerializer  # Serializer class for validation
    permission_classes = [IsAdminOrStaffUser]  # Permissions for accessing this view

    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')  # Retrieve the primary key from URL kwargs
        try:
            instance = Match.objects.get(pk=pk)  # Fetch the specific instance
        except Match.DoesNotExist:
            return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Update fields based on request data
        serializer = MatchSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AssignedMatchesListCreate(generics.ListCreateAPIView):
    serializer_class = AssignedMatchSerializer
    permission_classes = [IsAuthenticated, IsAdminOrStaffUser]

    def get_queryset(self):
        queryset = AssignedMatch.objects.filter(
            is_cancelled=False,
            match__is_finished=False
        )
        return queryset
    

    def perform_create(self, serializer):
        match = serializer.validated_data.get('match')
        
        if AssignedMatch.objects.filter(match=match,is_cancelled=False).exists():
            print('This assigned match already exists.')
        else:
            if serializer.is_valid():
                serializer.save()
            else:
                print(serializer.errors)