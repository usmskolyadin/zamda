from django.forms import ValidationError
from django.shortcuts import render
from django.db import IntegrityError

from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import AdvertisementLike, AdvertisementView, Category, Chat, Review, SubCategory, ExtraFieldDefinition, Advertisement, Message, UserProfile
from .serializers import (
    CategorySerializer, ChatSerializer, MessageSerializer, ProfileSerializer, ReviewSerializer, SubCategorySerializer,
    ExtraFieldDefinitionSerializer, AdvertisementSerializer
)
from .permissions import IsOwnerOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class SubCategoryViewSet(viewsets.ModelViewSet):
    queryset = SubCategory.objects.select_related('category').all()
    serializer_class = SubCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category']
    search_fields = ['name']

class ExtraFieldDefinitionViewSet(viewsets.ModelViewSet):
    queryset = ExtraFieldDefinition.objects.select_related('subcategory').all()
    serializer_class = ExtraFieldDefinitionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['subcategory']
    search_fields = ['name','key']

import django_filters

class AdvertisementFilter(FilterSet):
    price_min = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    price_max = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    location = django_filters.CharFilter(field_name="location", lookup_expr="icontains")
    subcategory = django_filters.ModelChoiceFilter(queryset=SubCategory.objects.all())
    created_after = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    owner_username = django_filters.CharFilter(field_name="owner__username", lookup_expr="iexact")
    owner_email = django_filters.CharFilter(field_name="owner__email", lookup_expr="iexact")

    class Meta:
        model = Advertisement
        fields = ["subcategory", "location", "price_min", "price_max", "created_after", 'subcategory__category', 'owner_username', 'owner_email']
        
class AdvertisementViewSet(viewsets.ModelViewSet):
    queryset = Advertisement.objects.select_related("owner", "subcategory__category") \
                                    .prefetch_related("extra_values__field_definition", "likes")
    serializer_class = AdvertisementSerializer
    permission_classes = [IsOwnerOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = AdvertisementFilter
    filterset_fields = ["subcategory", "subcategory__category", "owner__username", "owner__profile__city"]
    search_fields = ["title", "description", "owner__username", "owner__email"]
    ordering_fields = ["created_at", "price"]
    ordering = ["-created_at"]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        ad = self.get_object()
        user = request.user

        like, created = AdvertisementLike.objects.get_or_create(ad=ad, user=user)
        if not created:
            like.delete()
            return Response({"detail": "Unliked", "likes_count": ad.likes.count()})

        return Response({"detail": "Liked", "likes_count": ad.likes.count()})


    @action(detail=True, methods=["post"], permission_classes=[AllowAny])
    def view(self, request, pk=None):
        ad = self.get_object()

        ip = request.META.get("REMOTE_ADDR")
        user = request.user if request.user.is_authenticated else None

        try:
            AdvertisementView.objects.create(ad=ad, user=user, ip_address=ip)
            ad.views_count += 1
            ad.save(update_fields=["views_count"])
            return Response({"detail": "View counted", "views_count": ad.views_count})
        except IntegrityError:
            return Response({"detail": "Already viewed", "views_count": ad.views_count})

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "user": serializer.data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })
    
class UserAdvertisementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AdvertisementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Advertisement.objects.filter(owner=self.request.user)
    

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .serializers import ProfileSerializer
        profile = request.user.profile
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "profile": ProfileSerializer(profile, context={"request": request}).data
        })

    def patch(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)

        user.first_name = request.data.get("first_name", user.first_name)
        user.last_name = request.data.get("last_name", user.last_name)
        user.email = request.data.get("email", user.email)
        user.save()

        if profile:
            profile.city = request.data.get("city", profile.city)
            if "avatar" in request.FILES:
                profile.avatar = request.FILES["avatar"]
            profile.save()

        return Response({"detail": "Profile updated successfully."}, status=status.HTTP_200_OK)
    


class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(
            Q(buyer=self.request.user) | Q(seller=self.request.user)
        )

    def perform_create(self, serializer):
        ad = serializer.validated_data["ad"]
        buyer = self.request.user
        seller = ad.owner
        if buyer == seller:
            raise ValidationError("Нельзя создать чат с самим собой")
        
        chat, created = Chat.objects.get_or_create(
            ad=ad,
            buyer=buyer,
            seller=seller
        )
        serializer.instance = chat
        if created:
            serializer.save(buyer=buyer, seller=seller)


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(profile=self.request.user.profile)

    @action(detail=True, methods=["post"])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"status": "marked as read"})


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    from django.db.models import Q

    def get_queryset(self):
        chat_id = self.request.query_params.get('chat')
        if chat_id:
            chat_id = int(chat_id)
            return Message.objects.filter(
                Q(chat_id=chat_id) & (Q(chat__buyer=self.request.user) | Q(chat__seller=self.request.user))
            )

        return Message.objects.none()
            
    def perform_create(self, serializer):
        chat_id = serializer.validated_data.get('chat')
        chat_obj = get_object_or_404(Chat, id=chat_id.id if hasattr(chat_id, 'id') else chat_id)
        
        if self.request.user != chat_obj.buyer and self.request.user != chat_obj.seller:
            raise ValidationError("You are not a participant of this chat")
        
        serializer.save(sender=self.request.user, chat=chat_obj)
        
    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
            return response
        except ValidationError as e:
            return Response({"detail": e.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return Response({"detail": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserProfile.objects.prefetch_related('reviews').all()
    serializer_class = ProfileSerializer


import random
from django.core.mail import send_mail
from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import EmailVerification
from .serializers import RegisterRequestSerializer, VerifyCodeSerializer
from rest_framework.permissions import AllowAny

class RegisterRequestView(generics.GenericAPIView):
    serializer_class = RegisterRequestSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = str(random.randint(100000, 999999))
        data = serializer.validated_data

        EmailVerification.objects.update_or_create(
            email=data["email"],
            defaults={
                "code": code,
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "password": make_password(data["password"]),
            },
        )

        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        import os

        message = Mail(
            from_email="support@zamda.net",
            to_emails=data["email"],
            subject="ZAMDA - Confirm your registration",
            html_content=f"Your verification code: {code}"
        )

        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)

        return Response({"detail": "Verification code sent to email."}, status=200)


class VerifyCodeView(generics.GenericAPIView):
    serializer_class = VerifyCodeSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        code = serializer.validated_data["code"]

        try:
            record = EmailVerification.objects.get(email=email)
        except EmailVerification.DoesNotExist:
            return Response({"detail": "No verification request found."}, status=400)

        if record.is_expired():
            record.delete()
            return Response({"detail": "Code expired."}, status=400)

        if record.code != code:
            return Response({"detail": "Invalid code."}, status=400)

        user = User.objects.create(
            username=email,
            email=email,
            first_name=record.first_name,
            last_name=record.last_name,
            password=record.password,
        )

        record.delete()

        refresh = RefreshToken.for_user(user)
        return Response({
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=201)