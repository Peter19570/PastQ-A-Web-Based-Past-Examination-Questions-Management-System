from django.contrib import admin
from .models import PastQuestion, DownloadHistory


@admin.register(PastQuestion)
class PastQuestionAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "course",
        "year",
        "semester",
        "status",
        "uploaded_by",
        "uploaded_at",
    )
    list_filter = ("status", "year", "semester", "course__faculty", "exam_type")
    search_fields = (
        "title",
        "course__code",
        "course__title",
        "uploaded_by__index_number",
    )
    readonly_fields = ("uploaded_at", "reviewed_at", "download_count", "view_count")
    list_editable = ("status",)
    actions = ["approve_selected", "reject_selected"]

    fieldsets = (
        (
            "Basic Info",
            {"fields": ("course", "year", "semester", "exam_type", "title")},
        ),
        (
            "File",
            {
                "fields": (
                    "file",
                    "file_name",
                    "file_size",
                    "has_solutions",
                    "is_scanned",
                )
            },
        ),
        ("Additional Info", {"fields": ("lecturer", "quality_rating")}),
        (
            "Status",
            {"fields": ("status", "rejection_reason", "reviewed_by", "reviewed_at")},
        ),
        (
            "Upload Info",
            {"fields": ("uploaded_by", "uploaded_at", "download_count", "view_count")},
        ),
    )

    def approve_selected(self, request, queryset):
        updated = queryset.update(status="approved", reviewed_by=request.user)
        self.message_user(request, f"{updated} past questions approved.")

    approve_selected.short_description = "Approve selected"

    def reject_selected(self, request, queryset):
        updated = queryset.update(status="rejected", reviewed_by=request.user)
        self.message_user(request, f"{updated} past questions rejected.")

    reject_selected.short_description = "Reject selected"


@admin.register(DownloadHistory)
class DownloadHistoryAdmin(admin.ModelAdmin):
    list_display = ("user", "past_question", "downloaded_at", "ip_address")
    list_filter = ("downloaded_at",)
    search_fields = ("user__index_number", "past_question__title")
    readonly_fields = ("downloaded_at",)
