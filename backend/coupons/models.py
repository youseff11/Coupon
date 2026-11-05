from django.db import models
from django.utils import timezone


class Category(models.Model):
    name = models.CharField('الاسم', max_length=100)
    slug = models.SlugField('الرابط', max_length=120, unique=True, allow_unicode=True)
    icon = models.CharField('الأيقونة', max_length=40, default='tag', blank=True)
    order = models.PositiveIntegerField('الترتيب', default=0)

    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'تصنيف'
        verbose_name_plural = 'التصنيفات'

    def __str__(self):
        return self.name


class Store(models.Model):
    name = models.CharField('اسم الشركة', max_length=150)
    slug = models.SlugField('الرابط', max_length=160, unique=True, allow_unicode=True)
    logo = models.ImageField('الشعار', upload_to='logos/', blank=True, null=True)
    description = models.TextField('الوصف', blank=True)
    website_url = models.URLField('رابط الموقع', blank=True)
    category = models.ForeignKey(
        Category, verbose_name='التصنيف', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='stores',
    )
    is_featured = models.BooleanField('مميز', default=False)
    is_active = models.BooleanField('مفعل', default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', 'name']
        verbose_name = 'شركة'
        verbose_name_plural = 'الشركات'

    def __str__(self):
        return self.name


class CouponQuerySet(models.QuerySet):
    def live(self):
        today = timezone.localdate()
        return self.filter(is_active=True, store__is_active=True).filter(
            models.Q(expires_at__isnull=True) | models.Q(expires_at__gte=today)
        )


class Coupon(models.Model):
    store = models.ForeignKey(Store, verbose_name='الشركة', on_delete=models.CASCADE, related_name='coupons')
    title = models.CharField('العنوان', max_length=200)
    code = models.CharField('كود الخصم', max_length=60, blank=True,
                            help_text='اتركه فارغاً لو العرض بدون كود')
    discount = models.CharField('قيمة الخصم', max_length=30, blank=True, help_text='مثال: 15% أو 100 جنيه')
    description = models.TextField('التفاصيل', blank=True)
    link = models.URLField('رابط العرض', blank=True)
    expires_at = models.DateField('تاريخ الانتهاء', null=True, blank=True)
    is_verified = models.BooleanField('موثق', default=True)
    is_exclusive = models.BooleanField('حصري', default=False)
    is_active = models.BooleanField('مفعل', default=True)
    copies_count = models.PositiveIntegerField('مرات النسخ', default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CouponQuerySet.as_manager()

    class Meta:
        ordering = ['-is_exclusive', '-created_at']
        verbose_name = 'كوبون'
        verbose_name_plural = 'الكوبونات'

    def __str__(self):
        return f'{self.store.name} - {self.title}'

    @property
    def is_expired(self):
        return bool(self.expires_at and self.expires_at < timezone.localdate())
