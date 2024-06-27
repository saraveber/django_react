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
    

