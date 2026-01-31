from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Course(models.Model):
    """
    Course model - represents a university course
    """

    # Faculty choices (can be expanded later)
    FACULTY_CHOICES = [
        ("computing", "Computing & Information Systems"),
        ("engineering", "Engineering"),
        ("business", "Business School"),
        ("graduate", "Graduate School"),
    ]

    # Semester choices
    SEMESTER_CHOICES = [
        ("first", "First Semester"),
        ("second", "Second Semester"),
        ("third", "Third Semester"),
    ]

    # Core fields
    code = models.CharField(
        _("course code"),
        max_length=20,
        unique=True,
        help_text=_("e.g., CSC101, MAT101, PHY101"),
    )

    title = models.CharField(
        _("course title"), max_length=200, help_text=_("Full course title")
    )

    # Classification
    faculty = models.CharField(_("faculty"), max_length=50, choices=FACULTY_CHOICES)

    department = models.CharField(
        _("department"), max_length=100, help_text=_("Department offering the course")
    )

    level = models.CharField(
        _("level"), max_length=10, help_text=_("e.g., 100, 200, 300, 400")
    )

    semester = models.CharField(
        _("semester"), max_length=20, choices=SEMESTER_CHOICES, default="first"
    )

    # Optional but useful
    credit_hours = models.PositiveSmallIntegerField(
        _("credit hours"), default=3, help_text=_("Number of credit hours")
    )

    description = models.TextField(
        _("description"), blank=True, help_text=_("Course description and objectives")
    )

    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_courses",
        verbose_name=_("created by"),
    )

    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_("Is this course currently being offered?"),
    )
    course_past_questions = models.IntegerField(
        _("course's past questions"), null=True, default=0
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["code"]
        verbose_name = _("course")
        verbose_name_plural = _("courses")
        indexes = [
            models.Index(fields=["code"]),
            models.Index(fields=["faculty", "level"]),
            models.Index(fields=["department"]),
        ]

    def __str__(self):
        return f"{self.code}: {self.title}"

    def save(self, *args, **kwargs):
        """Auto-capitalize course code"""
        if self.code:
            self.code = self.code.upper()
        super().save(*args, **kwargs)

    @property
    def past_question_count(self):
        """Number of past questions available for this course"""
        # We'll implement this later when we have past_questions app
        from apps.past_questions.models import PastQuestion

        return PastQuestion.objects.filter(course=self).count()

    @property
    def faculty_display(self):
        """Get human-readable faculty name"""
        return dict(self.FACULTY_CHOICES).get(self.faculty, self.faculty)
