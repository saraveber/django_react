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
    

