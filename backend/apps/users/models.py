from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from .manager import UserManager


class User(AbstractUser):
    username = None
    index_number = models.CharField(
        _("index number"),
        max_length=20,
        unique=True,
        help_text=_("Required. Your university index number."),
        error_messages={
            "unique": _("A user with that index number already exists."),
        },
    )

    # Additional fields
    faculty = models.CharField(_("faculty"), max_length=100, blank=True)
    department = models.CharField(_("department"), max_length=100, blank=True)
    level = models.CharField(_("level"), max_length=10, blank=True)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)
    deleted_at = models.DateTimeField(_("deleted at"), blank=True, null=True)

    # Roles
    is_admin = models.BooleanField(_("admin status"), default=False)
    is_moderator = models.BooleanField(_("moderator status"), default=False)

    # Reputation system
    reputation_score = models.IntegerField(_("reputation score"), default=0)
    upload_count = models.IntegerField(_("upload count"), default=0)
    successful_uploads = models.IntegerField(_("successful uploads"), default=0)
    download_count = models.IntegerField(_("download count"), default=0)

    # Profile
    profile_picture = models.ImageField(
        _("profile picture"), upload_to="profile_pics/", null=True, blank=True
    )
    phone_number = models.CharField(_("phone number"), max_length=15, blank=True)
    email_notifications = models.BooleanField(_("email notifications"), default=True)

    USERNAME_FIELD = "index_number"
    REQUIRED_FIELDS = ["email", "first_name", "last_name"]

    objects = UserManager()

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        ordering = ["index_number"]

    def __str__(self):
        return f"{self.index_number} - {self.get_full_name()}"

    @property
    def is_verified_uploader(self):
        """User is verified if they have high reputation"""
        return self.reputation_score >= 50 and self.successful_uploads >= 5

    def update_reputation(self, points):
        """Update user's reputation score"""
        self.reputation_score += points
        self.save(update_fields=["reputation_score"])
