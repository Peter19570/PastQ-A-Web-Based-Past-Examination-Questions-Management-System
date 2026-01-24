from django.urls import path
from .views import auth, profile, admin

app_name = "users"

urlpatterns = [
    # Auth endpoints
    path("register/", auth.UserRegistrationView.as_view(), name="register"),
    path("login/", auth.UserLoginView.as_view(), name="login"),
    path("logout/", auth.LogoutView.as_view(), name="logout"),
    path("password-reset/", auth.PasswordResetView.as_view(), name="password-reset"),
    path(
        "password-reset-confirm/<int:pk>/",
        auth.PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
    # Profile endpoints
    path("profile/", profile.UserProfileView.as_view(), name="profile"),
    path(
        "profile/change-password",
        profile.ChangePasswordView.as_view(),
        name="change-password",
    ),
    # Admin endpoints
    path("users/", admin.UserListView.as_view(), name="user-list"),
    path("users/<int:pk>/", admin.UserDetailView.as_view(), name="user-detail"),
]
