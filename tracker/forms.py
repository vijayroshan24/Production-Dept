from django import forms
from .models import Project, ProductionUpdate

class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ["name", "code", "manager", "assembly_line", "target_units", "due_date", "status"]
        widgets = {
            "due_date": forms.DateInput(attrs={"type": "date"}),
            "name": forms.TextInput(attrs={"placeholder": "e.g. Hydraulic Press Assembly"}),
            "code": forms.TextInput(attrs={"placeholder": "e.g. PRJ-2026-014"}),
            "manager": forms.TextInput(attrs={"placeholder": "Project manager"}),
            "assembly_line": forms.TextInput(attrs={"placeholder": "Assembly line 01"}),
            "target_units": forms.NumberInput(attrs={"min": 1}),
        }

class ProductionUpdateForm(forms.ModelForm):
    class Meta:
        model = ProductionUpdate
        fields = ["project", "quantity", "shift", "note"]
        widgets = {
            "quantity": forms.NumberInput(attrs={"min": 1, "placeholder": "e.g. 42"}),
            "note": forms.Textarea(attrs={"rows": 3, "placeholder": "Add context for this update"}),
        }
