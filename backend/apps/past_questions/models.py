from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.utils.translation import gettext_lazy as _
from apps.courses.models import Course


class PastQuestion(models.Model):
    """
    MVP Past Question model
    """

    # Status choices
    STATUS_CHOICES = [
        ("pending", "Pending Review"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    # Semester choices (sync with Course if needed)
    SEMESTER_CHOICES = [
        ("first", "First Semester"),
        ("second", "Second Semester"),
        ("third", "Third Semester"),
    ]

    # Exam type
    EXAM_TYPE_CHOICES = [
        ("midterm", "Midterm Exam"),
        ("final", "Final Exam"),
        ("quiz", "Quiz"),
        ("assignment", "Assignment"),
        ("test", "Test"),
        ("other", "Other"),
    ]

    # --- Core Metadata ---
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="past_questions",
        verbose_name=_("course"),
    )

    year = models.IntegerField(
        _("academic year"), help_text=_("e.g., 2023 for 2022/2023 academic year")
    )

    semester = models.CharField(
        _("semester"), max_length=20, choices=SEMESTER_CHOICES, default="first"
    )

    exam_type = models.CharField(
        _("exam type"), max_length=20, choices=EXAM_TYPE_CHOICES, default="final"
    )

    title = models.CharField(
        _("title"),
        max_length=200,
        blank=True,
        help_text=_("Optional descriptive title"),
    )

    # --- File ---
    file = models.FileField(
        _("file"),
        upload_to="past_questions/%Y/%m/%d/",
        validators=[
            FileExtensionValidator(allowed_extensions=["pdf", "jpg", "jpeg", "png"])
        ],
        help_text=_("PDF or Image files only (max 10MB)"),
    )

    # File metadata
    file_size = models.IntegerField(
        _("file size"), default=0, help_text=_("Size in bytes")
    )

    file_name = models.CharField(_("original filename"), max_length=255, blank=True)

    # --- Upload Info ---
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="uploaded_past_questions",
        verbose_name=_("uploaded by"),
    )

    uploaded_at = models.DateTimeField(_("uploaded at"), auto_now_add=True)

    # --- Review Status ---
    status = models.CharField(
        _("status"), max_length=20, choices=STATUS_CHOICES, default="pending"
    )

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_past_questions",
        verbose_name=_("reviewed by"),
    )

    reviewed_at = models.DateTimeField(_("reviewed at"), null=True, blank=True)

    rejection_reason = models.TextField(
        _("rejection reason"),
        blank=True,
        help_text=_("Reason for rejection if applicable"),
    )

    # --- Analytics ---
    download_count = models.IntegerField(_("download count"), default=0)

    view_count = models.IntegerField(_("view count"), default=0)

    # --- Optional Metadata ---
    lecturer = models.CharField(
        _("lecturer"),
        max_length=100,
        blank=True,
        help_text=_("Name of lecturer/professor"),
    )

    has_solutions = models.BooleanField(
        _("has solutions"),
        default=False,
        help_text=_("Does this include solutions/answers?"),
    )

    is_scanned = models.BooleanField(
        _("is scanned"), default=False, help_text=_("Is this a scanned document?")
    )

    # --- Quality ---
    quality_rating = models.FloatField(
        _("quality rating"), default=0.0, help_text=_("Average user rating (0-5)")
    )

    class Meta:
        ordering = ["-uploaded_at"]
        verbose_name = _("past question")
        verbose_name_plural = _("past questions")
        indexes = [
            models.Index(fields=["status", "uploaded_at"]),
            models.Index(fields=["course", "year", "semester"]),
            models.Index(fields=["uploaded_by"]),
        ]
        unique_together = ["course", "year", "semester", "exam_type", "file_name"]

    def __str__(self):
        return f"{self.course.code} - {self.year} {self.get_semester_display()}"

    def save(self, *args, **kwargs):
        """Auto-calculate file size and store original filename"""
        if self.file:
            if not self.file_size:
                self.file_size = self.file.size
            if not self.file_name:
                self.file_name = self.file.name.split("/")[-1]  # Get filename only

        # Auto-generate title if empty
        if not self.title:
            self.title = f"{self.course.code} {self.exam_type.title()} {self.year}"

        super().save(*args, **kwargs)

    @property
    def is_approved(self):
        return self.status == "approved"

    @property
    def is_pending(self):
        return self.status == "pending"

    @property
    def file_type(self):
        """Get file extension"""
        if self.file_name:
            return self.file_name.split(".")[-1].lower()
        return ""

    def increment_download_count(self):
        """Increment download count"""
        self.download_count += 1
        self.save(update_fields=["download_count"])


class DownloadHistory(models.Model):
    """Track downloads for analytics"""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="downloads"
    )

    past_question = models.ForeignKey(
        PastQuestion, on_delete=models.CASCADE, related_name="download_history"
    )

    downloaded_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ["-downloaded_at"]
        verbose_name_plural = "Download Histories"

    def __str__(self):
        return f"{self.user.index_number} downloaded {self.past_question}"
