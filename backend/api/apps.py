from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.dispatch import receiver

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    verbose_name = "Teniška Liga"

    def ready(self):
        import api.signals

    def ready(self):
        import api.signals 
        from . import signals
        # Connect the post_migrate signal to create_groups
        post_migrate.connect(create_groups, sender=self)

# This function is now outside the ApiConfig class
@receiver(post_migrate)
def create_groups(sender, **kwargs):
    from django.contrib.auth.models import Group
    group_names = ["admin", "staff", "player", "user"]
    for name in group_names:
        Group.objects.get_or_create(name=name)