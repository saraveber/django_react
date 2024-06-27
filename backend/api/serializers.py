from django.contrib.auth.models import User
from rest_framework import serializers
from .models import AvailableTerm, Player, League


class UserSerializer(serializers.ModelSerializer):
    group_names = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "password", "group_names"]
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
        fields = ["name", "surname", "email", "phone_number", "gender", "birthdate"]

class LeagueSerializer(serializers.ModelSerializer):
    class Meta:
        model = League
        fields = ["name", "gender", "type"]
