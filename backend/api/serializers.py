from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note
from .models import AvailableTerm
from .models import Player


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}

class AvailableTermSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableTerm
        fields = ["id", "user", "start_date", "end_date", "created_at"]
        extra_kwargs = {"user": {"read_only": True}}

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ["name", "surname", "email", "phone_number", "gender", "birthdate", "leagues"]