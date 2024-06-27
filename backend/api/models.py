from django.db import models
from django.contrib.auth.models import User


# Define UserProfile model
class UserProfile(models.Model):
    USER_TYPE_CHOICES = (
        ('admin', 'Admin'),
        ('staff', 'Staff'),
        ('leaque player', 'Leaque Player'), #TODO: Discuss this with Tina
        ('user', 'User')
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='user')

    def __str__(self):
        return f"{self.user} - {self.user_type}"

# Define the AvailableTerm model
class AvailableTerm(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='available_terms')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)    

    def __str__(self):
        return f"{self.user} - {self.start_date} - {self.end_date}"

class Player(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]

    name = models.CharField(max_length=100,null=True)
    surname = models.CharField(max_length=100,null=True)
    email = models.EmailField(null=True)
    phone_number = models.CharField(max_length=15,null=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES,null=True)
    birthdate = models.DateField(null=True) 

    def __str__(self):
        return f"{self.name} {self.surname}"

class League(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('X', 'Mixed'),
    ]

    TYPE_CHOICES = [
        ('S', 'Single'),
        ('D', 'Double'),
    ]

    name = models.CharField(max_length=100)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    type = models.CharField(max_length=1, choices=TYPE_CHOICES)

    def __str__(self):
        return self.name

class Team(models.Model):
    TYPE_CHOICES = [
        ('S', 'Single'),
        ('D', 'Double'),
    ]

    league = models.ForeignKey(League, on_delete=models.CASCADE,null=True)
    player1 = models.ForeignKey(Player, related_name='team_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(Player, related_name='team_player2', on_delete=models.SET_NULL, null=True, blank=True)
    number_of_played_matches = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    points = models.IntegerField(default=0)
    is_in_playoff = models.BooleanField(default=False)
    playoff_place = models.IntegerField(null=True, blank=True, default=0)
    playoff_wins = models.IntegerField(default=0)
    type = models.CharField(max_length=1, choices=TYPE_CHOICES, null=True)

    def __str__(self):
        return f"Team {self.id} - {self.league.name} - {self.player1} and {self.player2}"
