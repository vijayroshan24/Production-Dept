from django.contrib import admin
from .models import Project, ProductionUpdate

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "manager", "status", "due_date")
    search_fields = ("name", "code", "manager")
    list_filter = ("status",)

@admin.register(ProductionUpdate)
class ProductionUpdateAdmin(admin.ModelAdmin):
    list_display = ("project", "quantity", "shift", "recorded_by", "recorded_at")
    list_filter = ("shift",)
