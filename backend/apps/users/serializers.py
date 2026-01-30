from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    index_number = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"password": "passwords do not match."})

        if User.objects.filter(index_number=attrs["index_number"]):
            raise serializers.ValidationError("index number already exists")
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    index_number = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        index_number = attrs.get("index_number")
        password = attrs.get("password")

        if index_number and password:
            user = authenticate(
                request=self.context.get("request"),
                username=index_number,
                password=password,
            )

            if not user:
                raise serializers.ValidationError(
                    "unable to log in with provided credentials."
                )

            if not user.is_active:
                raise serializers.ValidationError("user account is disabled.")

            if not user.deleted_at == None:
                raise serializers.ValidationError("cannot access this account")
        else:
            raise serializers.ValidationError(
                'Must include "index_number" and "password".'
            )

        attrs["user"] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    is_verified_uploader = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "index_number",
            "email",
            "first_name",
            "last_name",
            "faculty",
            "department",
            "level",
            "reputation_score",
            "upload_count",
            "successful_uploads",
            "download_count",
            "is_verified_uploader",
            "profile_picture",
            "date_joined",
            "last_login",
            "phone_number",
            "is_admin",
            "is_moderator",
            "is_staff",
            "is_active",
        ]
        read_only_fields = [
            "date_joined",
            "last_login",
            "reputation_score",
            "upload_count",
            "successful_uploads",
            "is_verified_uploader",
            "date_joined",
            "is_admin",
            "is_moderator",
        ]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context["request"].user

        if not user.check_password(attrs["old_password"]):
            raise serializers.ValidationError({"old_password": "Password is incorrect"})

        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match"}
            )

        return attrs

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user with this email found.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        return attrs

    def save(self, user):
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user
