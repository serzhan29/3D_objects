from django.contrib import admin
from .models import Model3D, Assembly, AssemblyStep

from adminsortable2.admin import SortableAdminMixin


@admin.register(Model3D)
class Model3DAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    search_fields = ('title',)
    list_filter = ('created_at',)



@admin.register(Assembly)
class Model3DDetailView(admin.ModelAdmin):
    list_display = ('title', 'description', 'created_at')
    list_filter = ('title', 'created_at')


@admin.register(AssemblyStep)
class AssemblyStepAdmin(SortableAdminMixin, admin.ModelAdmin):
    list_display = ('assembly', 'order', 'title')
    list_filter = ('assembly',)

