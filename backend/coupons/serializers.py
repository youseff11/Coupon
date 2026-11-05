from django.utils.text import slugify
from rest_framework import serializers

from .models import Category, Coupon, Store


def unique_slug(model, value, instance=None):
    base = slugify(value, allow_unicode=True) or 'item'
    slug, i = base, 2
    qs = model.objects.all()
    if instance is not None:
        qs = qs.exclude(pk=instance.pk)
    while qs.filter(slug=slug).exists():
        slug = f'{base}-{i}'
        i += 1
    return slug


class CategorySerializer(serializers.ModelSerializer):
    stores_count = serializers.IntegerField(read_only=True, default=0)
    slug = serializers.SlugField(required=False, allow_blank=True, allow_unicode=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'order', 'stores_count']

    def validate(self, attrs):
        if not attrs.get('slug'):
            name = attrs.get('name') or getattr(self.instance, 'name', '')
            attrs['slug'] = unique_slug(Category, name, self.instance)
        return attrs


class StoreMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = ['id', 'name', 'slug', 'logo']


class CouponSerializer(serializers.ModelSerializer):
    store_info = StoreMiniSerializer(source='store', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Coupon
        fields = [
            'id', 'store', 'store_info', 'title', 'code', 'discount', 'description', 'link',
            'expires_at', 'is_verified', 'is_exclusive', 'is_active', 'is_expired',
            'copies_count', 'created_at',
        ]
        read_only_fields = ['copies_count', 'created_at']


class PublicCouponSerializer(CouponSerializer):
    class Meta(CouponSerializer.Meta):
        fields = [f for f in CouponSerializer.Meta.fields if f not in ('is_active',)]


class StoreSerializer(serializers.ModelSerializer):
    coupons_count = serializers.IntegerField(read_only=True, default=0)
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    category_slug = serializers.CharField(source='category.slug', read_only=True, default=None)
    category_icon = serializers.CharField(source='category.icon', read_only=True, default=None)
    slug = serializers.SlugField(required=False, allow_blank=True, allow_unicode=True)
    remove_logo = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Store
        fields = [
            'id', 'name', 'slug', 'logo', 'description', 'website_url', 'category', 'category_name',
            'category_slug', 'category_icon',
            'is_featured', 'is_active', 'coupons_count', 'created_at', 'remove_logo',
        ]
        read_only_fields = ['created_at']

    def validate(self, attrs):
        if not attrs.get('slug'):
            name = attrs.get('name') or getattr(self.instance, 'name', '')
            attrs['slug'] = unique_slug(Store, name, self.instance)
        return attrs

    def update(self, instance, validated_data):
        if validated_data.pop('remove_logo', False) and 'logo' not in validated_data:
            instance.logo.delete(save=False)
            instance.logo = None
        return super().update(instance, validated_data)

    def create(self, validated_data):
        validated_data.pop('remove_logo', None)
        return super().create(validated_data)


class StoreDetailSerializer(StoreSerializer):
    coupons = serializers.SerializerMethodField()

    class Meta(StoreSerializer.Meta):
        fields = StoreSerializer.Meta.fields + ['coupons']

    def get_coupons(self, obj):
        qs = obj.coupons.live().select_related('store')
        return PublicCouponSerializer(qs, many=True, context=self.context).data
