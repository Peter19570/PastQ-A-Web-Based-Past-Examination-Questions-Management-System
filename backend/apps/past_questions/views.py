from rest_framework import generics, status, filters, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.http import FileResponse
import os
from .permissions import *
from django.utils import timezone
from .models import PastQuestion, DownloadHistory
from apps.users.models import User
from .serializers import (
    PastQuestionSerializer,
    PastQuestionCreateSerializer,
    PastQuestionSearchSerializer,
)
from apps.courses.models import Course


class PastQuestionListView(generics.ListCreateAPIView):
    """
    List past questions or upload new one
    GET: List approved past questions (public)
    POST: Upload new past question (authenticated users)
    """

    serializer_class = PastQuestionSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["course", "year", "semester", "exam_type", "status"]
    search_fields = ["title", "course__code", "course__title", "lecturer"]
    ordering_fields = ["year", "uploaded_at", "download_count"]
    ordering = ["-year", "-uploaded_at"]

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permission() for permission in [IsAdminUser | IsModerator]]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PastQuestionCreateSerializer
        return PastQuestionSerializer

    def get_queryset(self):
        queryset = PastQuestion.objects.select_related("course", "uploaded_by")
        user = getattr(self.request, "user", None)

        if (
            user
            and user.is_authenticated
            and (
                IsAdminUser().has_permission(self.request, self)
                or IsModerator().has_permission(self.request, self)
            )
        ):
            return queryset.all()
        return queryset.filter(status="approved")

    def perform_create(self, serializer):
        """Set uploaded_by to current user"""
        user = self.request.user
        serializer.save(uploaded_by=self.request.user)
        user.upload_count += 1
        user.save(update_fields=["upload_count"])


class PastQuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a past question
    """

    queryset = PastQuestion.objects.all()
    serializer_class = PastQuestionSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permission() for permission in [IsAdminUser | IsModerator]]

    def retrieve(self, request, *args, **kwargs):
        """Increment view count and user download count on retrieve"""
        instance = self.get_object()
        user = request.user

        with transaction.atomic():
            if not (user.is_authenticated and (user.is_admin or user.is_moderator)):
                instance.view_count += 1

            if user.is_authenticated and not (user.is_admin or user.is_moderator):
                instance.download_count += 1
                user.download_count += 1
                user.save(update_fields=["download_count"])

            instance.save(update_fields=["view_count", "download_count"])

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class PastQuestionDownloadView(APIView):
    """
    Download a past question file and increment user stats
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        past_question = get_object_or_404(PastQuestion, pk=pk)

        if past_question.status != "approved" and not (
            request.user.is_admin or request.user.is_moderator
        ):
            return Response(
                {"error": "This past question is not approved yet"},
                status=status.HTTP_403_FORBIDDEN,
            )

        file_path = past_question.file.path
        if not os.path.exists(file_path):
            return Response(
                {"error": "File not found"}, status=status.HTTP_404_NOT_FOUND
            )

        with transaction.atomic():
            past_question.increment_download_count()

            user = request.user
            user.download_count += 1
            user.save(update_fields=["download_count"])

            DownloadHistory.objects.create(
                user=user,
                past_question=past_question,
                ip_address=request.META.get("REMOTE_ADDR"),
            )

        response = FileResponse(
            open(file_path, "rb"), content_type="application/octet-stream"
        )
        response["Content-Disposition"] = (
            f'attachment; filename="{past_question.file_name}"'
        )
        return response


class PastQuestionSearchView(generics.ListAPIView):
    """
    Advanced search for past questions
    """

    serializer_class = PastQuestionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = PastQuestion.objects.filter(status="approved")

        # Get search parameters
        serializer = PastQuestionSearchSerializer(data=self.request.query_params)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Apply filters
        if data.get("course"):
            queryset = queryset.filter(course__code__icontains=data["course"])
        if data.get("year"):
            queryset = queryset.filter(year=data["year"])
        if data.get("semester"):
            queryset = queryset.filter(semester=data["semester"])
        if data.get("exam_type"):
            queryset = queryset.filter(exam_type=data["exam_type"])
        if data.get("q"):
            queryset = queryset.filter(
                Q(title__icontains=data["q"])
                | Q(course__code__icontains=data["q"])
                | Q(course__title__icontains=data["q"])
                | Q(lecturer__icontains=data["q"])
            )

        return queryset.select_related("course", "uploaded_by")


class UserUploadsView(generics.ListAPIView):
    """
    Get past questions uploaded by current user
    """

    serializer_class = PastQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            PastQuestion.objects.filter(uploaded_by=self.request.user)
            .select_related("course")
            .order_by("-uploaded_at")
        )


class PendingReviewListView(generics.ListAPIView):
    """
    Get past questions pending review (admin/moderator only)
    """

    serializer_class = PastQuestionSerializer
    permission_classes = [IsAdminUser | IsModerator]

    def get_queryset(self):
        return (
            PastQuestion.objects.filter(status="pending")
            .select_related("course", "uploaded_by")
            .order_by("uploaded_at")
        )


class ApprovePastQuestionView(APIView):
    """
    Approve a past question (admin/moderator only)
    """

    permission_classes = [IsAdminUser | IsModerator]

    def post(self, request, pk):
        past_question = get_object_or_404(PastQuestion, pk=pk)

        if past_question.status == "approved":
            return Response(
                {"error": "Past question is already approved"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        past_question.status = "approved"
        past_question.reviewed_by = request.user
        past_question.reviewed_at = timezone.now()
        past_question.save()

        uploader = past_question.uploaded_by
        uploader.successful_uploads += 1
        uploader.save(update_fields=["successful_uploads"])

        # TODO: Send notification to uploader

        return Response(
            {"message": "Past question approved successfully"},
            status=status.HTTP_200_OK,
        )


class RejectPastQuestionView(APIView):
    """
    Reject a past question (admin/moderator only)
    """

    permission_classes = [IsAdminUser | IsModerator]

    def post(self, request, pk):
        past_question = get_object_or_404(PastQuestion, pk=pk)

        rejection_reason = request.data.get("rejection_reason", "")
        if not rejection_reason:
            return Response(
                {"error": "Rejection reason is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        past_question.status = "rejected"
        past_question.reviewed_by = request.user
        past_question.reviewed_at = timezone.now()
        past_question.rejection_reason = rejection_reason
        past_question.save()

        # TODO: Send notification to uploader

        return Response(
            {"message": "Past question rejected successfully"},
            status=status.HTTP_200_OK,
        )


class PopularPastQuestionsView(generics.ListAPIView):
    """
    Get most downloaded past questions
    """

    serializer_class = PastQuestionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            PastQuestion.objects.filter(status="approved")
            .select_related("course")
            .order_by("-download_count")[:20]
        )
