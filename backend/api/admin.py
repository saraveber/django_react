from django.contrib import admin
from .models import AvailableTerm, Note

# Register your models here.
admin.site.register(AvailableTerm)
admin.site.register(Note)