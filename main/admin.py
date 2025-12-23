from django.contrib import admin
from .models import Model3D


@admin.register(Model3D)
class Model3DAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'created_at')
    search_fields = ('title', 'created_at')


