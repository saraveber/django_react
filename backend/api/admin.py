from django.contrib import admin
from .models import AvailableTerm, Player, League,  Team



# Register your models here.
admin.site.register(AvailableTerm)
admin.site.register(Player)
admin.site.register(League) 
admin.site.register(Team)
