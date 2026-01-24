# apps/courses/serializers.py
from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course model"""

    # Computed fields
    faculty_display = serializers.CharField(
        source="get_faculty_display", read_only=True
    )
    semester_display = serializers.CharField(
        source="get_semester_display", read_only=True
    )
    past_question_count = serializers.IntegerField(read_only=True)
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )

    class Meta:
        model = Course
        fields = [
            "id",
            "code",
            "title",
            "faculty",
            "faculty_display",
            "department",
            "level",
            "semester",
            "semester_display",
            "credit_hours",
            "description",
            "is_active",
            "past_question_count",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def validate_code(self, value):
        """Validate course code format"""
        value = value.upper().strip()
        if not value:
            raise serializers.ValidationError("Course code is required")

        # Basic format validation: e.g., CSC101, MAT101
        if len(value) < 4:
            raise serializers.ValidationError("Course code is too short")

        return value

    def validate_level(self, value):
        """Validate level format"""
        value = str(value).strip()
        if not value.isdigit():
            raise serializers.ValidationError("Level must be a number")

        level_int = int(value)
        if level_int < 100 or level_int > 500:
            raise serializers.ValidationError("Level must be between 100 and 500")

        return value

    def create(self, validated_data):
        """Set created_by to current user"""
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class CourseCreateSerializer(CourseSerializer):
    """Serializer for creating courses (with fewer fields)"""

    class Meta(CourseSerializer.Meta):
        fields = [
            "code",
            "title",
            "faculty",
            "department",
            "level",
            "semester",
            "credit_hours",
            "description",
        ]


class CourseSearchSerializer(serializers.Serializer):
    """Serializer for course search"""

    q = serializers.CharField(required=False, help_text="Search query")
    faculty = serializers.CharField(required=False)
    department = serializers.CharField(required=False)
    level = serializers.CharField(required=False)
    semester = serializers.CharField(required=False)

    def validate(self, attrs):
        """Validate search parameters"""
        if not any(attrs.values()):
            raise serializers.ValidationError(
                "At least one search parameter is required"
            )
        return attrs
