from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from ..serializers import *


class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def generate_tokens(self, user):
        token = RefreshToken.for_user(user)
        return {"access": str(token.access_token), "refresh": str(token)}

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        self.token = self.generate_tokens(user)

        return Response(
            {
                "user": UserProfileSerializer(user).data,
                "msg": "registration successful!",
                "tokens": self.token,
            },
            status=status.HTTP_201_CREATED,
        )


class UserLoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer

    def generate_tokens(self, user):
        token = RefreshToken.for_user(user)
        return {"access": str(token.access_token), "refresh": str(token)}

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        self.tokens = self.generate_tokens(user)

        user.save(update_fields=["last_login"])

        return Response(
            {
                "tokens": self.tokens,
                "user": UserProfileSerializer(user).data,
                "msg": "login successful!",
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh = request.data.get("refresh")
            if not refresh:
                raise ValueError("refresh token is invalid")
            token = RefreshToken(refresh)
            token.blacklist()

            return Response(
                {"msg": "logged out successfully!"}, status=status.HTTP_200_OK
            )
        except (TokenError, InvalidToken):
            return Response({"msg": "session cleared"}, status=status.HTTP_201_CREATED)


class PasswordResetView(generics.GenericAPIView):
    serializer_class = PasswordResetSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Normally you would send an email here with a token
        return response.Response(
            {"msg": "Password reset link sent (simulation)."}, status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, user_id):
        from django.contrib.auth.models import User

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid user."}, status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user)
        return response.Response(
            {"msg": "Password has been reset successfully."}, status=status.HTTP_200_OK
        )
