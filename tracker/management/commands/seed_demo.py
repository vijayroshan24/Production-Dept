from datetime import timedelta
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone
from tracker.models import Project, ProductionUpdate

class Command(BaseCommand):
    help = "Create fictional sample account and production dashboard data."

    def handle(self, *args, **options):
        User = get_user_model()
        user, created = User.objects.get_or_create(
            username="demo@production.local",
            defaults={"email": "demo@production.local", "first_name": "Alex", "last_name": "Morgan"},
        )
        if created:
            user.set_password("Demo123!")
            user.save()
        if Project.objects.exists():
            self.stdout.write(self.style.SUCCESS("Demo data already exists; nothing changed."))
            return
        today = timezone.localdate()
        rows = [
            ("Hydraulic Press Assembly", "PRJ-2026-014", "Ravi Kumar", "Assembly line 01", 500, 428, 14, Project.ON_TRACK),
            ("Precision Gearbox Series B", "PRJ-2026-011", "Sunita Patel", "Machining line 02", 400, 212, 8, Project.AT_RISK),
            ("Conveyor Drive Unit", "PRJ-2026-009", "Arjun Joshi", "Assembly line 03", 300, 94, 4, Project.DELAYED),
            ("Industrial Pump Housing", "PRJ-2026-018", "Neha Shah", "Fabrication line 01", 420, 356, 17, Project.ON_TRACK),
        ]
        projects = [Project.objects.create(name=name, code=code, manager=manager, assembly_line=line,
            target_units=target, completed_units=completed, due_date=today + timedelta(days=due), status=status)
            for name, code, manager, line, target, completed, due, status in rows]
        entries = [
            (0,150,"Shift A","Quality checks passed on first batch.",0),(0,120,"Shift B","Press setup completed.",1),(0,158,"Shift A","Output is tracking ahead of plan.",2),
            (1,90,"Shift A","Gear cutting completed.",1),(1,72,"Shift B","Tooling change extended the shift.",2),(1,50,"Shift A","Final inspection in progress.",3),
            (2,44,"Shift A","Conveyor alignment required adjustment.",1),(2,50,"Shift B","Line restarted after maintenance.",0),
            (3,120,"Shift A","Fabrication batch complete.",0),(3,132,"Shift B","Second batch underway.",1),(3,104,"Shift A","Quality review passed.",2),
        ]
        for project_index, quantity, shift, note, days_ago in entries:
            item = ProductionUpdate.objects.create(project=projects[project_index], quantity=quantity, shift=shift, note=note, recorded_by=user)
            ProductionUpdate.objects.filter(pk=item.pk).update(recorded_at=timezone.now() - timedelta(days=days_ago, hours=2))
        self.stdout.write(self.style.SUCCESS("Demo user and fictional sample data are ready."))\n