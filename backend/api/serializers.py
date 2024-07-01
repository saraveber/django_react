from django.contrib.auth.models import User
from rest_framework import serializers
from .models import AvailableTerm, Player, League, Team


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
        fields = ["id","name", "surname", "email", "phone_number", "gender", "birthdate"]

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
