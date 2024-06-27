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

# This function is now outside the ApiConfig class
@receiver(post_migrate)
def create_groups(sender, **kwargs):
    from django.contrib.auth.models import Group
    group_names = ["admin", "staff", "player", "user"]
    for name in group_names:
        Group.objects.get_or_create(name=name)
        

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
