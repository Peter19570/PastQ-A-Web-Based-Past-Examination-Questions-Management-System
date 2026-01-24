from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model"""

    list_display = (
        "index_number",
        "email",
        "first_name",
        "last_name",
        "faculty",
        "level",
        "is_admin",
        "is_staff",
        "is_active",
    )
    list_filter = ("is_admin", "is_staff", "is_active", "faculty", "level")
    search_fields = ("index_number", "email", "first_name", "last_name")
    ordering = ("index_number",)

    fieldsets = (
        (None, {"fields": ("index_number", "password")}),
        (
            "Personal Info",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "email",
                    "faculty",
                    "department",
                    "level",
                    "profile_picture",
                    "phone_number",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_admin",
                    "is_moderator",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            "Stats",
            {
                "fields": (
                    "reputation_score",
                    "upload_count",
                    "successful_uploads",
                )
            },
        ),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "index_number",
                    "email",
                    "password1",
                    "password2",
                    "first_name",
                    "last_name",
                    "faculty",
                    "level",
                ),
            },
        ),
    )

    readonly_fields = ("last_login", "date_joined")
