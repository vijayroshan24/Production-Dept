from django.contrib import admin
from django.urls import path
from tracker import views

urlpatterns = [
    path("admin/", admin.site.urls), path("", views.home, name="home"), path("health/", views.health, name="health"),
    path("login/", views.login_view, name="login"), path("logout/", views.logout_view, name="logout"),
    path("dashboard/", views.dashboard, name="dashboard"), path("projects/", views.projects, name="projects"),
    path("projects/new/", views.project_create, name="project_create"), path("projects/<int:pk>/edit/", views.project_edit, name="project_edit"),
    path("projects/<int:pk>/delete/", views.project_delete, name="project_delete"),
    path("assembly-lines/", views.assembly_lines, name="assembly_lines"), path("production-log/", views.production_log, name="production_log"),
    path("production-log/new/", views.production_create, name="production_create"), path("team/", views.team, name="team"),
    path("reports/", views.reports, name="reports"), path("reports/export.csv", views.export_report, name="export_report"),
    path("settings/", views.settings_page, name="settings"),
]
