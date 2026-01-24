from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Course
from .permissions import *
from .serializers import (
    CourseSerializer,
    CourseCreateSerializer,
    CourseSearchSerializer,
)


class CourseListView(generics.ListCreateAPIView):
    """
    List all courses or create a new course
    GET: List courses (public)
    POST: Create new course (admin/moderator only)
    """

    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["faculty", "department", "level", "semester"]
    search_fields = ["code", "title", "description"]
    ordering_fields = ["code", "title", "level"]
    ordering = ["code"]

    def get_permissions(self):
        """Different permissions for GET vs POST"""
        if self.request.method == "GET":
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = permission_classes = [IsAdminUser | IsModerator]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        """Use different serializer for creation"""
        if self.request.method == "POST":
            return CourseCreateSerializer
        return CourseSerializer

    def get_queryset(self):
        """Filter queryset based on query params"""
        queryset = super().get_queryset()

        # Filter by search query if provided
        search_query = self.request.query_params.get("q")
        if search_query:
            queryset = queryset.filter(
                Q(code__icontains=search_query)
                | Q(title__icontains=search_query)
                | Q(description__icontains=search_query)
            )

        return queryset


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a course
    """

    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    lookup_field = "code"  # Use course code instead of ID

    def get_permissions(self):
        """Different permissions for different methods"""
        if self.request.method == "GET":
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = permission_classes = [IsAdminUser | IsModerator]
        return [permission() for permission in permission_classes]

    def perform_destroy(self, instance):
        """Soft delete by marking as inactive"""
        instance.is_active = False
        instance.save()

    def destroy(self, request, *args, **kwargs):
        """Override to return custom response"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"detail": f"Course {instance.code} deactivated successfully"},
            status=status.HTTP_200_OK,
        )


class CourseSearchView(generics.ListAPIView):
    """
    Advanced search for courses
    """

    serializer_class = CourseSearchSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Course.objects.filter(is_active=True)

        # Get search parameters
        faculty = self.request.query_params.get("faculty")
        department = self.request.query_params.get("department")
        level = self.request.query_params.get("level")
        semester = self.request.query_params.get("semester")
        search_query = self.request.query_params.get("q")

        # Apply filters
        if faculty:
            queryset = queryset.filter(faculty=faculty)
        if department:
            queryset = queryset.filter(department__icontains=department)
        if level:
            queryset = queryset.filter(level=level)
        if semester:
            queryset = queryset.filter(semester=semester)
        if search_query:
            queryset = queryset.filter(
                Q(code__icontains=search_query) | Q(title__icontains=search_query)
            )

        return queryset

    def list(self, request, *args, **kwargs):
        """Return count along with results"""
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(
                {"count": queryset.count(), "results": serializer.data}
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response({"count": queryset.count(), "results": serializer.data})


class PopularCoursesView(generics.ListAPIView):
    """
    Get most popular courses (with most past questions)
    """

    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # For now, return active courses ordered by code
        # Later, we'll order by past_question_count
        return Course.objects.filter(is_active=True).order_by("code")[:20]


class FacultyListView(APIView):
    """
    Get list of all faculties
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        faculties = [
            {"value": value, "label": label} for value, label in Course.FACULTY_CHOICES
        ]
        return Response(faculties)


class DepartmentListView(generics.ListAPIView):
    """
    Get list of departments (optionally filtered by faculty)
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        faculty = request.query_params.get("faculty")

        queryset = Course.objects.filter(is_active=True)

        if faculty:
            queryset = queryset.filter(faculty=faculty)

        # Get unique departments
        departments = (
            queryset.values_list("department", flat=True)
            .distinct()
            .order_by("department")
        )

        departments_list = [
            {"value": dept, "label": dept} for dept in departments if dept
        ]

        return Response(departments_list)
