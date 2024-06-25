from django.db import models
from django.contrib.auth.models import User

# Legacy code
# class NoteAdmin(admin.ModelAdmin):
class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

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
        ('O', 'Other'),
    ]

    name = models.CharField(max_length=100,null=True)
    surname = models.CharField(max_length=100,null=True)
    email = models.EmailField(null=True)
    phone_number = models.CharField(max_length=15,null=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES,null=True)
    birthdate = models.DateField(null=True) 
    leagues = models.CharField(max_length=255,null=True)

    def __str__(self):
        return f"{self.name} {self.surname}"