from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('categories', views.AdminCategoryViewSet, basename='admin-category')
router.register('stores', views.AdminStoreViewSet, basename='admin-store')
router.register('coupons', views.AdminCouponViewSet, basename='admin-coupon')

urlpatterns = [
    path('categories/', views.PublicCategoryList.as_view()),
    path('stores/', views.PublicStoreList.as_view()),
    path('stores/<str:slug>/', views.PublicStoreDetail.as_view()),
    path('coupons/', views.PublicCouponList.as_view()),
    path('coupons/<int:pk>/copy/', views.track_copy),

    path('auth/login/', views.login),
    path('auth/logout/', views.logout),
    path('auth/me/', views.me),

    path('admin/stats/', views.admin_stats),
    path('admin/', include(router.urls)),
]
