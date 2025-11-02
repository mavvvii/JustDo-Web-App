"""Django settings for the backend ToDo application.

This module contains the settings and configurations for the Django application~,
including database connections, installed apps, middleware, and other configurations.
"""

# pylint: disable=invalid-name

import os
import sys
from datetime import timedelta
from pathlib import Path
from typing import Any

BASE_DIR: Path = Path(__file__).resolve().parent.parent

SECRET_KEY: str | None = os.environ.get("DJANGO_SECRET_KEY")

if "pylint" in sys.argv[0]:
    SECRET_KEY = "insecure-secret-key-for-pylint-checks"

assert SECRET_KEY, "SECRET_KEY environment variable must be set"

DEBUG: bool = os.environ.get("DJANGO_PRODUCTION", "False") == "False"

ALLOWED_HOSTS: list[str]
CORS_ALLOWED_ORIGINS: list[str]
CSRF_TRUSTED_ORIGINS: list[str]

if DEBUG:
    ALLOWED_HOSTS = ["*"]

    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:5500",
    ]

    CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS.copy()

    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
else:
    CORS_ALLOWED_ORIGINS = os.environ.get("DJANGO_CORS_ALLOWED_ORIGINS", "").split(",")
    CSRF_TRUSTED_ORIGINS = os.environ.get("DJANGO_CSRF_TRUSTED_ORIGINS", "").split(",")
    ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "").split(",")

    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

EMAIL_HOST: str = os.environ.get("DJANGO_EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT: int = int(os.environ.get("DJANGO_EMAIL_PORT", 587))
EMAIL_USE_TLS: bool = os.environ.get("DJANGO_EMAIL_USE_TLS", "True") == "True"
EMAIL_HOST_USER: str | None = os.environ.get("DJANGO_EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD: str | None = os.environ.get("DJANGO_EMAIL_HOST_PASSWORD")

FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:3000")

INSTALLED_APPS: list[str] = [
    "jazzmin",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "drf_spectacular",
    "corsheaders",
    "users",
    "todos",
]

MIDDLEWARE: list[str] = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # For serving static files
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF: str = "backend.urls"

TEMPLATES: list[dict[str, Any]] = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION: str = "backend.wsgi.application"


DATABASES: dict[str, dict[str, str | None]] = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DJANGO_DATABASE_NAME"),
        "USER": os.environ.get("DJANGO_DATABASE_USER"),
        "PASSWORD": os.environ.get("DJANGO_DATABASE_PASSWORD"),
        "HOST": os.environ.get("DJANGO_DATABASE_HOST"),
        "PORT": os.environ.get("DJANGO_DATABASE_PORT"),
    }
}

AUTH_PASSWORD_VALIDATORS: list[dict[str, str]] = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

REST_FRAMEWORK: dict[str, Any] = {
    "DEFAULT_AUTHENTICATION_CLASSES": ("users.authenticate.CustomCookiesAuthentication",),
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "1000/day",
        "user": "10000/day",
    },
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "PAGE_SIZE": 100,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_VERSIONING_CLASS": "rest_framework.versioning.URLPathVersioning",
    "DEFAULT_VERSION": "v1",
    "ALLOWED_VERSIONS": [
        "v1",
    ],
}

SIMPLE_JWT: dict[str, Any] = {
    "ACCESS_TOKEN_NAME": "access_token",
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),
    "REFRESH_TOKEN_NAME": "refresh_token",
    "REFRESH_TOKEN_LIFETIME_REMEMBER_ME": timedelta(days=7),
    "CSRF_TOKEN_NAME": "csrftoken",
    "CSRF_TOKEN_LIFETIME": timedelta(minutes=5),
    "CSRF_COOKIE_HTTPONLY": False,
    "AUTH_COOKIE": "access_token",
    "AUTH_COOKIE_SECURE": not DEBUG,
    "AUTH_COOKIE_HTTPONLY": True,
    "AUTH_COOKIE_SAMESITE": "Lax",
}

CORS_ALLOW_CREDENTIALS: bool = True

LANGUAGE_CODE: str = "en-us"
TIME_ZONE: str = "UTC"
USE_I18N: bool = True
USE_TZ: bool = True

STATIC_URL: str = "static/"
STATIC_ROOT: str = "static/"

AUTH_USER_MODEL = "users.User"

DEFAULT_AUTO_FIELD: str = "django.db.models.BigAutoField"
