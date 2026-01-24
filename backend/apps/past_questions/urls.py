from django.urls import path
from . import views

app_name = "past_questions"

urlpatterns = [
    # Basic CRUD
    path("", views.PastQuestionListView.as_view(), name="past-question-list"),
    path(
        "<int:pk>/", views.PastQuestionDetailView.as_view(), name="past-question-detail"
    ),
    # Download
    path(
        "<int:pk>/download/",
        views.PastQuestionDownloadView.as_view(),
        name="past-question-download",
    ),
    # Search
    path(
        "search/", views.PastQuestionSearchView.as_view(), name="past-question-search"
    ),
    path(
        "popular/",
        views.PopularPastQuestionsView.as_view(),
        name="popular-past-questions",
    ),
    # User-specific
    path("my-uploads/", views.UserUploadsView.as_view(), name="my-uploads"),
    # Admin/Moderator
    path("pending/", views.PendingReviewListView.as_view(), name="pending-review"),
    path(
        "<int:pk>/approve/",
        views.ApprovePastQuestionView.as_view(),
        name="approve-past-question",
    ),
    path(
        "<int:pk>/reject/",
        views.RejectPastQuestionView.as_view(),
        name="reject-past-question",
    ),
]
