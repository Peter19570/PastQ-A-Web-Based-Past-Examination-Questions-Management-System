# apps/courses/admin.py
from django.contrib import admin
from .models import Course


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "title",
        "faculty",
        "department",
        "level",
        "semester",
        "is_active",
    )
    list_filter = ("faculty", "department", "level", "semester", "is_active")
    search_fields = ("code", "title", "department")
    list_editable = ("is_active",)
    ordering = ("code",)
    fieldsets = (
        ("Course Information", {"fields": ("code", "title", "description")}),
        (
            "Classification",
            {"fields": ("faculty", "department", "level", "semester", "credit_hours")},
        ),
        ("Status", {"fields": ("is_active", "created_by")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
    readonly_fields = ("created_by", "created_at", "updated_at")

    def save_model(self, request, obj, form, change):
        """Set created_by if not set"""
        if not obj.pk and not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
