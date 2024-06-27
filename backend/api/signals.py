from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User, Group 
import random  # Import the random module

from .models import Player  # Import your Player model

@receiver(post_save, sender=Player)
def create_user_for_player(sender, instance, created, **kwargs):
    if created:  # Check if a new instance was created
        username = instance.name + instance.surname + str(random.randint(10, 99))
        user = User.objects.create_user(username=username, 
                                        email=instance.email,
                                        first_name=instance.name,
                                        last_name=instance.surname,
                                        password="1234"
                                        )
        instance.user = user
        instance.save()
        


@receiver(post_save, sender=User)
def assign_default_group(sender, instance, created, **kwargs):
    if created:
        default_group_name = 'player'  # Specify your default group name here
        default_group, _ = Group.objects.get_or_create(name=default_group_name)
        instance.groups.add(default_group)
        instance.save()