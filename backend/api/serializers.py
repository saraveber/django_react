from django.contrib.auth.models import User
from rest_framework import serializers
from .models import AvailableTerm, Player, League, Team, Round, Match, AssignedMatch


class UserSerializer(serializers.ModelSerializer):
    group_names = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "password", "group_names", "first_name", "last_name"]
        extra_kwargs = {"password": {"write_only": True}}


    def get_group_names(self, user):
        return [group.name for group in user.groups.all()]

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    



class AvailableTermSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableTerm
        fields = ["id", "user", "start_date", "end_date", "created_at"]
        extra_kwargs = {"user": {"read_only": True}}



#this serilizer is used for admin/staff to add term for specific user
class AvailableTermForUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableTerm
        fields = ["id", "user", "start_date", "end_date", "created_at"]

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ["id","name", "surname", "email", "phone_number", "gender", "birthdate","user"]

class LeagueSerializer(serializers.ModelSerializer):
    class Meta:
        model = League
        fields = ["id", "name", "gender", "type"]

class TeamSerializer(serializers.ModelSerializer):
    player1_obj = PlayerSerializer(source='player1', read_only=True)
    player2_obj = PlayerSerializer(source='player2', allow_null=True, read_only=True)
    class Meta:
        model = Team
        fields = ['id', 'league', 'player1', 'player2', 'number_of_played_matches', 'wins', 'losses', 'points', 'is_in_playoff', 'playoff_place', 'playoff_wins', 'type', 'player1_obj', 'player2_obj']

class RoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Round
        fields = ['round_number', 'start_date', 'end_date', 'is_active']

class MatchSerializer(serializers.ModelSerializer):
    overlap_terms = serializers.SerializerMethodField()
    team_host_obj = TeamSerializer(source='team_host', read_only=True)
    team_guest_obj = TeamSerializer(source='team_guest', read_only=True)
    round_obj = RoundSerializer(source='round', read_only=True)
    class Meta:
        model = Match
        fields = ['id', 'league', 'round_number', 'team_host', 'team_guest', 'is_assigned', 'is_finished','gem_result', 'set_result','team_host_obj', 'team_guest_obj', 'round_obj' , 'overlap_terms']
    
    def is_overlap_longer_than_2_hours(self,term1, term2):
        latest_start = max(term1.start_date, term2.start_date)
        earliest_end = min(term1.end_date, term2.end_date)
        overlap = (earliest_end - latest_start).total_seconds() / 3600  
        return overlap > 2
    
    def get_overlap_terms(self, obj):
        team_host = obj.team_host
        team_guest = obj.team_guest

        players = [
            player for player in [
                team_host.player1,
                team_host.player2,
                team_guest.player1,
                team_guest.player2
            ] if player is not None
        ]

        player_terms = {}
        for player in players:
            if player:
                terms = AvailableTerm.objects.filter(user=player.user)
                player_terms[player.user] = sorted(terms, key=lambda x: x.start_date)

        overlap_terms = player_terms[players[0].user]
        for player in players[1:]:
            overlap_terms = [term for term in overlap_terms if any(
                self.is_overlap_longer_than_2_hours(term, other_term) for other_term in player_terms[player.user]
            )]

            if not overlap_terms:
                break

        return AvailableTermSerializer(overlap_terms, many=True).data if overlap_terms else []


class AssignedMatchSerializer(serializers.ModelSerializer):
    match_obj = MatchSerializer(source='match', read_only=True)
    class Meta:
        model = AssignedMatch
        fields = ['id', 'match', 'start_date', 'end_date', 'tennis_field', 'is_cancelled', 'team_who_cancelled', 'reason_for_cancellation', 'match_obj']
