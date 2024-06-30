from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.dispatch import receiver
import csv
import os


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    verbose_name = "Teniška Liga"

    def ready(self):
        import api.signals 
        from . import signals
        # Connect the post_migrate signal to create_groups
        post_migrate.connect(create_groups, sender=self)
        post_migrate.connect(load_initial_league_data, sender=self)
        post_migrate.connect(create_user, sender=self)
        post_migrate.connect(load_initial_player_data, sender=self)
        post_migrate.connect(load_initial_team_data, sender=self)

# This function is now outside the ApiConfig class
@receiver(post_migrate)
def create_groups(sender, **kwargs):
    from django.contrib.auth.models import Group
    group_names = ["admin", "staff", "player", "user"]
    for name in group_names:
        Group.objects.get_or_create(name=name)

@receiver(post_migrate)
def create_user(sender, **kwargs):
    """
    Creates a superuser if one does not exist.
    """
    from django.contrib.auth.models import User, Group
    if not User.objects.filter(is_superuser=True).exists():
        User.objects.create_superuser('saraveber', 'sara@gmail.com', 'Ananas3510')
        User.objects.create_superuser('tinapostuvan', 'tina@gmail.com', 'Kiwi2002')

     # List of users to create
    users_to_create = [
        {'username': 'admin', 'email': 'admin@example.com', 'password': 'admin', 'groups': ['admin']},
        {'username': 'staff', 'email': 'admin@example.com', 'password': 'staff', 'groups': ['staff']},
        {'username': 'user', 'email': 'user@example.com', 'password': 'user', 'groups': ['user']},
    ]

    # Create users
    for user_data in users_to_create:
        user, created = User.objects.get_or_create(username=user_data['username'], email=user_data['email'])
        if created:
            user.set_password(user_data['password'])
            user.save()
            print(f"User {user.username} created.")
            for group_name in user_data['groups']:
                group, _ = Group.objects.get_or_create(name=group_name)
                user.groups.add(group)
            print(f"User {user.username} created and groups assigned.")



def load_initial_league_data(sender, **kwargs):
    from .models import League
    
    # Check if the table is already populated
    if not League.objects.exists():
        csv_file_path = os.path.join(os.path.dirname(__file__), 'initial_leagues.csv')
        with open(csv_file_path, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            leagues = [
                League(
                    name=row['name'],
                    gender=row['gender'],
                    type=row['type']
                )
                for row in reader
            ]
            League.objects.bulk_create(leagues)
        print("Leagues created")

# Function to load initial player data
def load_initial_player_data(sender, **kwargs):
    from .models import Player

    # Check if the table is already populated
    if not Player.objects.exists():
        csv_file_path = os.path.join(os.path.dirname(__file__), 'initial_players.csv')
        with open(csv_file_path, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            players = [
                Player(
                    name=row['name'],
                    surname=row['surname'],
                    email=row['email'],
                    phone_number=row['phone_number'],
                    gender=row['gender'],
                    birthdate=row['birthdate']
                )
                for row in reader
            ]
            Player.objects.bulk_create(players)
        print("Players created")

def load_initial_team_data(sender, **kwargs):
    from .models import Team, Player, League
    
    if not Team.objects.exists():
        csv_file_path = os.path.join(os.path.dirname(__file__), 'initial_teams.csv')
        with open(csv_file_path, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                league = League.objects.get(id=row['league_id'])
                player1 = Player.objects.get(id=row['player1_id'])
                player2 = Player.objects.get(id=row['player2_id']) if row['player2_id'] else None
                Team.objects.create(
                    league=league,
                    player1=player1,
                    player2=player2,
                    type=row['type']
                )
        print("Teams created")

