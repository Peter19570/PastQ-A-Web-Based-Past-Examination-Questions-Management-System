from rest_framework import serializers
from django.core.validators import FileExtensionValidator
from .models import PastQuestion, DownloadHistory
from apps.courses.models import Course
from apps.courses.serializers import CourseSerializer
from apps.users.serializers import UserProfileSerializer


class PastQuestionSerializer(serializers.ModelSerializer):
    """Serializer for Past Question model"""

    # Related fields
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source="course", write_only=True
    )

    uploaded_by = UserProfileSerializer(read_only=True)

    # Computed fields
    semester_display = serializers.CharField(
        source="get_semester_display", read_only=True
    )
    exam_type_display = serializers.CharField(
        source="get_exam_type_display", read_only=True
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    file_type = serializers.CharField(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = PastQuestion
        fields = [
            "id",
            "course",
            "course_id",
            "year",
            "semester",
            "semester_display",
            "exam_type",
            "exam_type_display",
            "title",
            "file",
            "file_url",
            "file_name",
            "file_size",
            "file_type",
            "uploaded_by",
            "uploaded_at",
            "status",
            "status_display",
            "reviewed_by",
            "reviewed_at",
            "rejection_reason",
            "download_count",
            "view_count",
            "lecturer",
            "has_solutions",
            "is_scanned",
            "quality_rating",
        ]
        read_only_fields = [
            "uploaded_by",
            "uploaded_at",
            "file_size",
            "file_name",
            "reviewed_by",
            "reviewed_at",
            "download_count",
            "view_count",
            "status",
            "quality_rating",
        ]

    def get_file_url(self, obj):
        """Get absolute URL for file"""
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def validate_year(self, value):
        """Validate year is reasonable"""
        from django.utils import timezone

        current_year = timezone.now().year

        if value < 2000 or value > current_year + 1:
            raise serializers.ValidationError(
                f"Year must be between 2000 and {current_year + 1}"
            )
        return value

    def validate_file(self, value):
        """Validate file size and type"""
        # Size validation (10MB max)
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f"File too large. Max size is {max_size // (1024*1024)}MB"
            )

        # Type validation
        allowed_types = ["pdf", "jpg", "jpeg", "png"]
        ext = value.name.split(".")[-1].lower()
        if ext not in allowed_types:
            raise serializers.ValidationError(
                f"File type not allowed. Allowed: {', '.join(allowed_types)}"
            )

        return value


class PastQuestionCreateSerializer(PastQuestionSerializer):
    """Serializer for creating past questions (simplified)"""

    class Meta(PastQuestionSerializer.Meta):
        fields = [
            "course_id",
            "year",
            "semester",
            "exam_type",
            "title",
            "file",
            "lecturer",
            "has_solutions",
            "is_scanned",
        ]


class PastQuestionUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating past questions (admin only)"""

    class Meta:
        model = PastQuestion
        fields = ["status", "rejection_reason"]


class DownloadHistorySerializer(serializers.ModelSerializer):
    """Serializer for download history"""

    user = UserProfileSerializer(read_only=True)
    past_question = PastQuestionSerializer(read_only=True)

    class Meta:
        model = DownloadHistory
        fields = ["id", "user", "past_question", "downloaded_at", "ip_address"]
        read_only_fields = ["user", "past_question", "downloaded_at", "ip_address"]


class PastQuestionSearchSerializer(serializers.Serializer):
    """Serializer for search parameters"""

    q = serializers.CharField(required=False, help_text="Search in title")
    course = serializers.CharField(required=False)
    year = serializers.IntegerField(required=False)
    semester = serializers.CharField(required=False)
    exam_type = serializers.CharField(required=False)
    status = serializers.CharField(required=False, default="approved")

    def validate(self, attrs):
        """At least one search parameter"""
        if not any(attrs.values()):
            raise serializers.ValidationError(
                "At least one search parameter is required"
            )
        return attrs
