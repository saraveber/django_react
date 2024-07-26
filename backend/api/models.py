from django.db import models

from django.contrib.auth.models import User

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
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True) 
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

class Round(models.Model):
    round_number = models.IntegerField(primary_key=True)
    start_date = models.DateField(null=True)
    end_date = models.DateField(null=True)
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return f"Round {self.round_number}"

class Match(models.Model):
    league = models.ForeignKey(League, on_delete=models.CASCADE)
    round_number = models.ForeignKey(Round, on_delete=models.CASCADE)
    team_host = models.ForeignKey(Team, related_name='team_host', on_delete=models.CASCADE)
    team_guest = models.ForeignKey(Team, related_name='team_guest', on_delete=models.CASCADE)
    is_assigned = models.BooleanField(default=False)
    is_finished = models.BooleanField(default=False)
    gem_result = models.CharField(max_length=255, null=True, blank=True)
    set_result = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Match {self.league} - {self.team_host} vs {self.team_guest}"

# Define the AssignedMatch model
class AssignedMatch(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    tennis_field = models.IntegerField()
    is_cancelled = models.BooleanField(default=False)
    team_who_cancelled = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True)
    reason_for_cancellation = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Assigned Match for {self.match}"