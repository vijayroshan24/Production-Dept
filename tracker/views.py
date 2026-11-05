import csv
from datetime import timedelta
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import F, Sum
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST
from .forms import ProjectForm, ProductionUpdateForm
from .models import Project, ProductionUpdate

TEAM = [
    {"name": "Ravi Kumar", "role": "Manager", "area": "Assembly line 01", "shift": "Shift A", "active": "2 min ago", "status": "Active"},
    {"name": "Sunita Patel", "role": "Manager", "area": "Machining line 02", "shift": "Shift A", "active": "5 min ago", "status": "Active"},
    {"name": "Mohan Das", "role": "Supervisor", "area": "Assembly line 01", "shift": "Shift A", "active": "Just now", "status": "Active"},
    {"name": "Kiran Rao", "role": "Supervisor", "area": "Assembly line 03", "shift": "Shift B", "active": "18 min ago", "status": "Active"},
]
LINES = [
    {"name": "Assembly line 01", "site": "North plant", "supervisor": "Mohan Das", "project": "Hydraulic Press Assembly", "output": "428 / 500", "state": "Running"},
    {"name": "Machining line 02", "site": "North plant", "supervisor": "Priya Nair", "project": "Precision Gearbox Series B", "output": "212 / 400", "state": "Running"},
    {"name": "Assembly line 03", "site": "East plant", "supervisor": "Kiran Rao", "project": "Conveyor Drive Unit", "output": "94 / 300", "state": "At risk"},
    {"name": "Fabrication line 01", "site": "East plant", "supervisor": "Neha Shah", "project": "Industrial Pump Housing", "output": "356 / 420", "state": "Running"},
]
PAGE_META = {
    "Overview": ("Production overview", "Here’s how your production floor is performing today."),
    "Projects": ("Projects", "Track delivery, ownership, and progress across active projects."),
    "Assembly lines": ("Assembly lines", "Monitor work cells, active shifts, throughput, and line health."),
    "Production log": ("Production log", "Review shift updates and completed units recorded by the team."),
    "Team": ("Team", "People, roles, and production responsibilities for this workspace."),
    "Reports": ("Reports", "Production summaries and delivery performance for your selected period."),
    "Settings": ("Settings", "Demo workspace preferences and sample account details."),
}

def home(request):
    return redirect("dashboard" if request.user.is_authenticated else "login")

def health(request):
    return JsonResponse({"status": "ok", "app": "production-tracker-demo"})

def login_view(request):
    if request.user.is_authenticated:
        return redirect("dashboard")
    error = ""
    if request.method == "POST":
        email = request.POST.get("email", "").strip()
        user = authenticate(request, username=email, password=request.POST.get("password", ""))
        if user is not None:
            login(request, user)
            return redirect("dashboard")
        error = "That email and password did not match the demo account."
    return render(request, "tracker/login.html", {"error": error})

@require_POST
def logout_view(request):
    logout(request)
    return redirect("login")

def _shell(request, section, context=None, template=None):
    title, description = PAGE_META[section]
    data = {"section": section, "title": title, "description": description,
            "update_count": ProductionUpdate.objects.count(), "today": timezone.localdate()}
    data.update(context or {})
    return render(request, template or "tracker/section.html", data)

@login_required
def dashboard(request):
    projects = list(Project.objects.all())
    updates = ProductionUpdate.objects.select_related("project", "recorded_by")
    total = len(projects)
    units = sum(project.completed_units for project in projects)
    on_track = sum(project.status == Project.ON_TRACK for project in projects)
    at_risk = sum(project.status == Project.AT_RISK for project in projects)
    delayed = sum(project.status == Project.DELAYED for project in projects)
    chart = []
    today = timezone.localdate()
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        actual = updates.filter(recorded_at__date=day).aggregate(total=Sum("quantity"))["total"] or 0
        planned = 330 + (offset * 23 % 115)
        chart.append({"day": day.strftime("%a"), "actual": actual, "planned": planned,
                      "actual_height": min(100, max(5, round(actual / 550 * 100))),
                      "planned_height": min(100, max(8, round(planned / 550 * 100)))})
    context = {"projects": projects, "recent_projects": projects[:4], "recent_updates": updates[:5],
               "active_projects": total, "units_completed": units, "on_track": on_track,
               "at_risk": at_risk, "delayed": delayed, "attention": at_risk + delayed, "chart": chart}
    return _shell(request, "Overview", context, "tracker/dashboard.html")

@login_required
def projects(request):
    query = request.GET.get("q", "").strip()
    status = request.GET.get("status", "")
    items = Project.objects.all()
    if query:
        from django.db.models import Q
        items = items.filter(Q(name__icontains=query) | Q(code__icontains=query) | Q(manager__icontains=query) | Q(assembly_line__icontains=query))
    if status in {Project.ON_TRACK, Project.AT_RISK, Project.DELAYED}:
        items = items.filter(status=status)
    return _shell(request, "Projects", {"projects": items, "query": query, "status_filter": status}, "tracker/projects.html")

@login_required
def project_create(request):
    form = ProjectForm(request.POST or None, initial={"target_units": 1000, "due_date": timezone.localdate() + timedelta(days=14)})
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Project created")
        return redirect("projects")
    return _shell(request, "Projects", {"form": form, "form_title": "Create project", "submit_label": "Create project"}, "tracker/project_form.html")

@login_required
def project_edit(request, pk):
    item = get_object_or_404(Project, pk=pk)
    form = ProjectForm(request.POST or None, instance=item)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Project updated")
        return redirect("projects")
    return _shell(request, "Projects", {"form": form, "form_title": "Edit project", "submit_label": "Save changes", "project": item}, "tracker/project_form.html")

@login_required
def project_delete(request, pk):
    item = get_object_or_404(Project, pk=pk)
    if request.method == "POST":
        item.delete()
        messages.success(request, "Project removed")
        return redirect("projects")
    return _shell(request, "Projects", {"project": item}, "tracker/project_confirm_delete.html")

@login_required
def production_log(request):
    query = request.GET.get("q", "").strip()
    updates = ProductionUpdate.objects.select_related("project", "recorded_by")
    if query:
        from django.db.models import Q
        updates = updates.filter(Q(project__name__icontains=query) | Q(note__icontains=query))
    return _shell(request, "Production log", {"updates": updates, "query": query}, "tracker/production_log.html")

@login_required
def production_create(request):
    form = ProductionUpdateForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        item = form.save(commit=False)
        item.recorded_by = request.user
        item.save()
        Project.objects.filter(pk=item.project_id).update(completed_units=F("completed_units") + item.quantity)
        messages.success(request, "Production update recorded")
        return redirect("production_log")
    return _shell(request, "Production log", {"form": form, "form_title": "Record production update", "submit_label": "Save update"}, "tracker/production_form.html")

@login_required
def assembly_lines(request):
    return _shell(request, "Assembly lines", {"lines": LINES}, "tracker/assembly_lines.html")

@login_required
def team(request):
    return _shell(request, "Team", {"members": TEAM}, "tracker/team.html")

@login_required
def reports(request):
    return _shell(request, "Reports", {"projects": Project.objects.all(), "updates": ProductionUpdate.objects.all()}, "tracker/reports.html")

@login_required
def export_report(request):
    report_type = request.GET.get("type", "projects")
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = f'attachment; filename="production-{report_type}.csv"'
    writer = csv.writer(response)
    if report_type == "updates":
        writer.writerow(["Recorded at", "Project", "Quantity", "Shift", "Recorded by", "Note"])
        for item in ProductionUpdate.objects.select_related("project", "recorded_by"):
            name = item.recorded_by.get_full_name() if item.recorded_by else "Demo user"
            writer.writerow([item.recorded_at.isoformat(), item.project.name, item.quantity, item.shift, name, item.note])
    else:
        writer.writerow(["Project", "Code", "Manager", "Assembly line", "Completed units", "Target units", "Due date", "Status"])
        for item in Project.objects.all():
            writer.writerow([item.name, item.code, item.manager, item.assembly_line, item.completed_units, item.target_units, item.due_date, item.get_status_display()])
    return response

@login_required
def settings_page(request):
    return _shell(request, "Settings", {}, "tracker/settings.html")
