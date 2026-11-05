from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = 'لوحة تحكم أكواد الخصم'
admin.site.site_title = 'أكواد الخصم'

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/', include('coupons.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
