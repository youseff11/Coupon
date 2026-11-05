from django.contrib import admin

from .models import Category, Coupon, Store


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'icon', 'order']
    prepopulated_fields = {'slug': ['name']}


class CouponInline(admin.TabularInline):
    model = Coupon
    extra = 0
    fields = ['title', 'code', 'discount', 'expires_at', 'is_active']


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_featured', 'is_active']
    list_filter = ['is_active', 'is_featured', 'category']
    search_fields = ['name']
    prepopulated_fields = {'slug': ['name']}
    inlines = [CouponInline]


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['title', 'store', 'code', 'discount', 'expires_at', 'is_active', 'copies_count']
    list_filter = ['is_active', 'is_exclusive', 'store']
    search_fields = ['title', 'code', 'store__name']
