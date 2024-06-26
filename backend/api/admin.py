from django.contrib import admin
from .models import AvailableTerm, Note, Player, League

# Register your models here.
admin.site.register(AvailableTerm)
admin.site.register(Note)
admin.site.register(Player)
admin.site.register(League) 