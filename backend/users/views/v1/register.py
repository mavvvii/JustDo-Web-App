"""
User viewsets for API version 1.

This module provides versioned viewsets for handling user-related operations
such as listing all users or retrieving a specific user. Access is restricted
to authenticated users.

Classes:
    UserViewSetV1: ViewSet for listing and retrieving users in API v1.

Example:
    from users.views import UserViewSetV1
"""

from typing import List, Type
from uuid import UUID

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db import IntegrityError
from django.db.models import Q, QuerySet
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from users.models import User
from users.serializers import RegisterSerializerV1


class UserRegisterView(APIView):
    """User registration view.

    This viewset allows users to register a new account.

    Attributes:
        queryset (QuerySet): All user objects.
        serializer_class (Type[Serializer]): Serializer used for user details.
        permission_classes (list): List of permission classes required to access the endpoints.
        pagination_class (None): Pagination is disabled for this view.
    Methods:
        get_serializer: Returns the serializer class for the current action.
        get_queryset: Returns the queryset of all user objects.
        post: Creates a new user with the provided data.
    """

    queryset: QuerySet[User] = User.objects.all()
    serializer_class: Type[RegisterSerializerV1] = RegisterSerializerV1
    permission_classes: List[Type[BasePermission]] = [AllowAny]
    pagination_class: None = None

    def get_serializer(self, *args, **kwargs):
        """Get the serializer class for the current action.

        Args:
            *args: Positional arguments for the serializer.
            **kwargs: Keyword arguments for the serializer.

        Returns:
            Serializer: An instance of the serializer class.
        """
        return self.serializer_class(*args, **kwargs)

    def get_queryset(self):
        """Get the queryset for the view.

        Returns:
            QuerySet[User]: The queryset of all user objects.
        """
        return self.queryset

    def post(self, request: Request) -> Response:
        """Create a new user with the provided data.

        Args:
            request (Request): The incoming HTTP request containing user data.

        Returns:
            Response: A Response object indicating the result of the user creation.
        """
        serializer: Type[RegisterSerializerV1] = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        users: QuerySet[User] = self.get_queryset().filter(
            Q(username=serializer.validated_data["username"])
            | Q(email=serializer.validated_data["email"])
        )
        if users.exists():
            return Response({"detail": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_user: User = serializer.save()

            user_id: UUID = new_user.id
            token: str = default_token_generator.make_token(new_user)

            activation_link: str = f"{settings.FRONTEND_URL}/activate?user_id={user_id}&token={token}"

            send_mail(
                subject="Activate your account",
                message=f"Click the link to activate your account: {activation_link}",
                from_email=f"{settings.EMAIL_HOST_USER}",
                recipient_list=[new_user.email],
            )

        except (ValidationError, IntegrityError) as e:
            return Response(
                {
                    "detail": "Error occurred during user creation or email sending.",
                    "error": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "detail": "User created successfully.",
                "message": "Check your email to activate your account.",
            },
            status=status.HTTP_201_CREATED,
        )
