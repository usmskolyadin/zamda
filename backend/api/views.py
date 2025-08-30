from django.forms import ValidationError
from django.shortcuts import render

from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Category, Chat, Review, SubCategory, ExtraFieldDefinition, Advertisement, Message, UserProfile
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


class AdvertisementFilter(FilterSet):
    owner_username = CharFilter(field_name="owner__username", lookup_expr="iexact")
    owner_email = CharFilter(field_name="owner__email", lookup_expr="iexact")

    class Meta:
        model = Advertisement
        fields = ['subcategory', 'subcategory__category', 'owner_username', 'owner_email']

class AdvertisementViewSet(viewsets.ModelViewSet):
    queryset = Advertisement.objects.select_related('owner','subcategory__category') \
                                    .all().prefetch_related('extra_values__field_definition')
    serializer_class = AdvertisementSerializer
    permission_classes = [IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = AdvertisementFilter
    search_fields = ['title','description']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    filterset_fields = ["subcategory", "subcategory__category", "owner__username", "owner__profile__city"]

    search_fields = ["title", "description", "owner__username", "owner__email"]
    ordering_fields = ["created_at", "price"]
    ordering = ["-created_at"]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

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
        user = request.user
        profile = getattr(user, 'profile', None)
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "profile": {
                "avatar": request.build_absolute_uri(profile.avatar.url) if profile and profile.avatar else None,
                "city": profile.city if profile else None,
            }
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

        if seller == buyer:
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

    def get_queryset(self):
        chat_id = self.request.query_params.get('chat')
        if chat_id:
            return Message.objects.filter(
                chat_id=chat_id,
                chat__buyer=self.request.user
            ) | Message.objects.filter(
                chat_id=chat_id,
                chat__seller=self.request.user
            )
        return Message.objects.none()
            
    def perform_create(self, serializer):
        chat = serializer.validated_data.get('chat', None)
        if not chat or not getattr(chat, 'id', None):
            raise ValidationError("Chat is required and must have an id")

        chat = get_object_or_404(Chat, id=chat.id)
        if self.request.user != chat.buyer and self.request.user != chat.seller:
            raise ValidationError("You are not a participant of this chat")

        serializer.save(sender=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            return Response({"detail": e.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response({"detail": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserProfile.objects.prefetch_related('reviews').all()
    serializer_class = ProfileSerializer