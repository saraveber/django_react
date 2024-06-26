from django.apps import AppConfig
from django.db.models.signals import post_migrate
import csv
import os


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        post_migrate.connect(load_initial_league_data, sender=self)

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
