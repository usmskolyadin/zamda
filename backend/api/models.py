from django.db import models
from django.conf import settings
from django.contrib.auth.models import User 
from django.db.models.signals import post_save
from django.dispatch import receiver

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    image = models.ImageField(upload_to="categories/", blank=True, null=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name


class SubCategory(models.Model):
    category = models.ForeignKey(Category, related_name="subcategories", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    slug = models.SlugField()
    image = models.ImageField(upload_to="categories/", blank=True, null=True)

    class Meta:
        unique_together = ('category', 'slug')
        ordering = ['name']

    def __str__(self):
        return f"{self.category.name} → {self.name}"


class ExtraFieldDefinition(models.Model):
    FIELD_TYPES = [
        ('char', 'Текст'),
        ('int', 'Число'),
        ('float', 'Дробное число'),
        ('bool', 'Да/Нет'),
        ('date', 'Дата'),
    ]

    subcategory = models.ForeignKey(
        SubCategory,
        related_name="extra_fields",
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100)
    key = models.SlugField()
    field_type = models.CharField(max_length=10, choices=FIELD_TYPES)

    def __str__(self):
        return f"{self.subcategory}: {self.name}"


class Advertisement(models.Model):
    owner = models.ForeignKey(User, related_name="ads", on_delete=models.CASCADE)
    subcategory = models.ForeignKey('SubCategory', related_name="ads", on_delete=models.CASCADE)

    title = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=255)

    is_active = models.BooleanField(default=True)

    views_count = models.PositiveIntegerField(default=0)
    likes = models.ManyToManyField(
        User,
        related_name="liked_ads",
        through="AdvertisementLike",
        blank=True
    )

    def __str__(self):
        return self.title


class AdvertisementLike(models.Model):
    ad = models.ForeignKey(Advertisement, related_name="ad_likes", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="user_likes", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("ad", "user")

    def __str__(self):
        return f"{self.user.username} → {self.ad.title}"


class AdvertisementImage(models.Model):
    ad = models.ForeignKey(Advertisement, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="ads/")

    def __str__(self):
        return f"Image for {self.ad.title}"


class AdvertisementExtraField(models.Model):
    ad = models.ForeignKey(Advertisement, related_name="extra_values", on_delete=models.CASCADE)
    field_definition = models.ForeignKey(ExtraFieldDefinition, on_delete=models.CASCADE)
    value = models.CharField(max_length=255)  

    class Meta:
        unique_together = ('ad', 'field_definition')

    def __str__(self):
        return f"{self.field_definition.name}: {self.value}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    city = models.CharField(max_length=100, blank=True)
    # reviews = models.ManyToManyField(Review, blank=True)

    def __str__(self):
        return f"{self.user.username} Profile"
    
class Notification(models.Model):
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} → {self.profile.user.username}"

class Chat(models.Model):
    ad = models.ForeignKey(
        'Advertisement',
        related_name="chats",
        on_delete=models.CASCADE
    )
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        related_name="chats_as_buyer", 
        on_delete=models.CASCADE
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        related_name="chats_as_seller", 
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('ad', 'buyer', 'seller')

    def __str__(self):
        return f"Chat on {self.ad.title} ({self.buyer} ↔ {self.seller})"

class Message(models.Model):
    chat = models.ForeignKey(
        Chat,  # <-- исправлено
        related_name="messages",
        on_delete=models.CASCADE
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sent_messages",
        on_delete=models.CASCADE
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.username}: {self.text[:30]}"
    

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        from .models import UserProfile
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class Review(models.Model):
    profile = models.ForeignKey(
        'UserProfile', related_name='reviews', on_delete=models.CASCADE
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='written_reviews', on_delete=models.CASCADE
    )
    rating = models.PositiveSmallIntegerField(default=5)  # 1-5
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('profile', 'author')

    def __str__(self):
        return f"Review by {self.author.username} for {self.profile.user.username}"