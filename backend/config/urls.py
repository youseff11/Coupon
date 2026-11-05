from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = 'لوحة تحكم أكواد الخصم'
admin.site.site_title = 'أكواد الخصم'

from coupons.views import serve_stored_file

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/', include('coupons.urls')),
]

if settings.USE_DB_STORAGE:
    urlpatterns.append(path('media/<path:name>', serve_stored_file))
else:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
