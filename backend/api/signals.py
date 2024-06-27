from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User, Group 


@receiver(post_save, sender=User)
def assign_default_group(sender, instance, created, **kwargs):
    if created:
        default_group_name = 'player'  # Specify your default group name here
        default_group, _ = Group.objects.get_or_create(name=default_group_name)
        instance.groups.add(default_group)
        instance.save()