# apps/courses/urls.py
from django.urls import path
from . import views

app_name = "courses"

urlpatterns = [
    # Basic CRUD
    path("", views.CourseListView.as_view(), name="course-list"),
    path("<str:code>/", views.CourseDetailView.as_view(), name="course-detail"),
    # Search and filter
    path("search/", views.CourseSearchView.as_view(), name="course-search"),
    path("popular/", views.PopularCoursesView.as_view(), name="popular-courses"),
    # Metadata endpoints
    path("faculties/", views.FacultyListView.as_view(), name="faculty-list"),
    path("departments/", views.DepartmentListView.as_view(), name="department-list"),
]
