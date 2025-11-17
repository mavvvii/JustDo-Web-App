"""
Task viewsets for API version 1.

This module provides versioned viewsets for handling task-related operations
such as listing all tasks or retrieving a specific task. Access is restricted
to authenticated users.

Classes:
    TaskViewSetV1: ViewSet for listing and retrieving tasks in API v1.

Example:
    from todos.views import TaskViewSetV1
"""

from typing import List, Type
from uuid import UUID

from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from todos.models import Board, Task
from todos.serializers import TaskSerializerV1


# pylint: disable=too-many-ancestors
class TaskViewSet(ModelViewSet):
    """Task ViewSet handling tasks for version 1 of the API.

    This viewset allows authenticated users to do CRUD operations on tasks.

    Attributes:
        queryset (QuerySet[Task]): All task objects.
        serializer_class (TaskSerializerV1): Serializer used for task details.
        permission_classes (list[BasePermission]): List of permission classes
                                                   required to access the endpoints.
    Methods:
        get_queryset: Returns the queryset of tasks filtered by the authenticated user.
        list: Returns a list of all tasks.
        retrieve: Returns a task by their primary key.
        perform_create: Creates a new task.
        update: Updates an existing task.
        destroy: Deletes a task.
    """

    serializer_class: Type[TaskSerializerV1] = TaskSerializerV1
    permission_classes: List[Type[BasePermission]] = [IsAuthenticated]

    def get_queryset(self) -> QuerySet[Task]:
        """Return the queryset of tasks filtered by the authenticated user and board id.

        Args:
            None

        Returns:
            QuerySet[Task]: A queryset of tasks owned by the authenticated user.
        """
        board_id: UUID = self.kwargs.get("board_pk")

        get_object_or_404(Board, pk=board_id)

        return Task.objects.filter(board_id=board_id, is_archived=False)

    def list(self, request: Request, *args, **kwargs) -> Response:
        """Return a list of tasks.

        Args:
            request (Request): The incoming HTTP request.

        Returns:
            Response: A Response object containing serialized task data.
        """
        queryset: QuerySet[Task] = self.get_queryset()
        serializer: TaskSerializerV1 = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        """Return a task by their primary key.

        Args:
            request (Request): The incoming HTTP request.
            pk (UUID): The primary key of the task to retrieve.
        Returns:
            Response: A Response object containing serialized task data.
        """
        board_id: UUID = self.kwargs.get("board_pk")
        pk: UUID | None = kwargs.get("pk")

        task: Task = get_object_or_404(
            Task, pk=pk, board_id=board_id, board__user_id=request.user.id
        )

        serializer: TaskSerializerV1 = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request: Request, *args, **kwargs) -> Response:
        """Create a new task.

        Args:
            request (Request): The incoming HTTP request.
        Returns:
            Response: A Response object containing the created task's data.
        """
        board_id: UUID = self.kwargs.get("board_pk")
        board: Board = get_object_or_404(Board, id=board_id, user_id=request.user)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(board=board)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request: Request, *args, **kwargs) -> Response:
        """Update an existing task.

        Args:
            request (Request): The incoming HTTP request.
            pk (UUID): The primary key of the task to update.
        Returns:
            Response: A Response object containing the updated task's data.
        """
        board_id: UUID = self.kwargs.get("board_pk")
        pk: UUID | None = kwargs.get("pk")

        task: Task = get_object_or_404(
            Task, pk=pk, board_id=board_id, board__user_id=request.user.id
        )
        serializer: TaskSerializerV1 = self.get_serializer(
            task,
            data=request.data,
            partial=kwargs.get("partial", False),
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        """Delete a task.

        Args:
            request (Request): The incoming HTTP request.
            pk (UUID): The primary key of the task to delete.
        Returns:
            Response: A Response object indicating the deletion status.
        """
        board_id: UUID = self.kwargs.get("board_pk")
        pk: UUID | None = kwargs.get("pk")

        task: Task = get_object_or_404(
            Task, pk=pk, board_id=board_id, board__user_id=request.user.id
        )
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
