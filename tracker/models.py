from django.conf import settings
from django.db import models

class Project(models.Model):
    ON_TRACK = "ON_TRACK"
    AT_RISK = "AT_RISK"
    DELAYED = "DELAYED"
    STATUS_CHOICES = [(ON_TRACK, "On track"), (AT_RISK, "At risk"), (DELAYED, "Delayed")]
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=32, unique=True)
    manager = models.CharField(max_length=100)
    assembly_line = models.CharField(max_length=100)
    target_units = models.PositiveIntegerField(default=1000)
    completed_units = models.PositiveIntegerField(default=0)
    due_date = models.DateField()
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default=ON_TRACK)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["due_date", "name"]

    def __str__(self):
        return f"{self.code} · {self.name}"

    @property
    def progress_percent(self):
        if not self.target_units:
            return 0
        return min(100, round(self.completed_units / self.target_units * 100))

class ProductionUpdate(models.Model):
    SHIFT_CHOICES = [("Shift A", "Shift A"), ("Shift B", "Shift B"), ("Shift C", "Shift C")]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="updates")
    quantity = models.PositiveIntegerField()
    shift = models.CharField(max_length=16, choices=SHIFT_CHOICES, default="Shift A")
    note = models.CharField(max_length=280, blank=True)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"{self.quantity} units · {self.project.name}"
