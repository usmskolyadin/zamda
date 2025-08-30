from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    CategoryViewSet, ChatViewSet, CurrentUserView, MessageViewSet, RegisterView, ReviewViewSet, SubCategoryViewSet, ExtraFieldDefinitionViewSet, AdvertisementViewSet, UserAdvertisementViewSet, UserProfileViewSet
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('subcategories', SubCategoryViewSet)
router.register('field-definitions', ExtraFieldDefinitionViewSet)
router.register('ads', AdvertisementViewSet)
router.register("chats", ChatViewSet)
router.register("messages", MessageViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/me/', CurrentUserView.as_view(), name='current_user'), 
]
