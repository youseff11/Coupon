"""Fill the database with demo categories, stores and coupons.

Usage: python manage.py seed_demo [--admin-password PASS]
"""
import io
import random
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone
from PIL import Image, ImageDraw, ImageFont

from coupons.models import Category, Coupon, Store

CATEGORIES = [
    ('تسوق إلكتروني', 'shopping', 'shopping-cart'),
    ('أزياء وموضة', 'fashion', 'shirt'),
    ('مطاعم وتوصيل', 'food', 'utensils'),
    ('إلكترونيات', 'electronics', 'smartphone'),
    ('سفر وفنادق', 'travel', 'plane'),
    ('جمال وعناية', 'beauty', 'sparkles'),
]

STORES = [
    ('نون', 'noon', 'shopping', '#FEEE00', '#111111', 'noon', True),
    ('أمازون', 'amazon', 'shopping', '#232F3E', '#FF9900', 'a', True),
    ('جوميا', 'jumia', 'shopping', '#F68B1E', '#FFFFFF', 'J', True),
    ('طلبات', 'talabat', 'food', '#FF5A00', '#FFFFFF', 'T', True),
    ('نمشي', 'namshi', 'fashion', '#000000', '#FFFFFF', 'N', True),
    ('شي إن', 'shein', 'fashion', '#111111', '#FFFFFF', 'SH', True),
    ('كارفور', 'carrefour', 'shopping', '#004E9F', '#FFFFFF', 'C', False),
    ('ماكس فاشون', 'max-fashion', 'fashion', '#E4002B', '#FFFFFF', 'M', False),
    ('بوكينج', 'booking', 'travel', '#003580', '#FFFFFF', 'B', True),
    ('سيفورا', 'sephora', 'beauty', '#000000', '#FFFFFF', 'S', False),
    ('بي تك', 'btech', 'electronics', '#0057B8', '#FFFFFF', 'B.', False),
    ('ماكدونالدز', 'mcdonalds', 'food', '#DA291C', '#FFC72C', 'M', False),
]

TEMPLATES = [
    ('خصم {d} على جميع المنتجات', '{d}'),
    ('خصم إضافي {d} للعملاء الجدد', '{d}'),
    ('خصم {d} على الطلب الأول من التطبيق', '{d}'),
    ('توصيل مجاني + خصم {d}', '{d}'),
    ('عرض الجمعة البيضاء: خصم يصل إلى {d}', '{d}'),
]


def make_logo(text, bg, fg):
    img = Image.new('RGB', (400, 400), bg)
    draw = ImageDraw.Draw(img)
    size = 190 if len(text) <= 2 else 120
    font = None
    for name in ('arialbd.ttf', 'Arial Bold.ttf', 'DejaVuSans-Bold.ttf'):
        try:
            font = ImageFont.truetype(name, size)
            break
        except OSError:
            continue
    font = font or ImageFont.load_default()
    box = draw.textbbox((0, 0), text, font=font)
    w, h = box[2] - box[0], box[3] - box[1]
    draw.text(((400 - w) / 2 - box[0], (400 - h) / 2 - box[1]), text, fill=fg, font=font)
    buf = io.BytesIO()
    img.save(buf, 'PNG')
    return ContentFile(buf.getvalue())


class Command(BaseCommand):
    help = 'Create demo data and an admin user'

    def add_arguments(self, parser):
        parser.add_argument('--admin-username', default='admin')
        parser.add_argument('--admin-password', default='admin12345')

    def handle(self, *args, **opts):
        random.seed(7)
        User = get_user_model()
        if not User.objects.filter(username=opts['admin_username']).exists():
            User.objects.create_superuser(opts['admin_username'], '', opts['admin_password'])
            self.stdout.write(f"Admin user created: {opts['admin_username']}")

        cats = {}
        for i, (name, slug, icon) in enumerate(CATEGORIES):
            cats[slug], _ = Category.objects.get_or_create(slug=slug, defaults={'name': name, 'icon': icon, 'order': i})

        today = timezone.localdate()
        for name, slug, cat, bg, fg, letters, featured in STORES:
            store, created = Store.objects.get_or_create(slug=slug, defaults={
                'name': name,
                'category': cats[cat],
                'is_featured': featured,
                'website_url': f'https://www.example.com/{slug}',
                'description': f'أحدث أكواد خصم {name} وكوبونات {name} الفعالة والموثقة يومياً. '
                               f'وفّر أكثر على مشترياتك من {name} مع عروض حصرية.',
            })
            if not created:
                continue
            store.logo.save(f'{slug}.png', make_logo(letters, bg, fg), save=True)
            for j in range(random.randint(3, 6)):
                tpl, _ = random.choice(TEMPLATES)
                d = random.choice(['10%', '15%', '20%', '25%', '30%', '50%', '70%'])
                has_code = j != 0 or random.random() > 0.3
                Coupon.objects.create(
                    store=store,
                    title=tpl.format(d=d),
                    discount=d,
                    code=f'{slug[:3].upper()}{random.randint(10, 99)}' if has_code else '',
                    description='يسري الكود على المنتجات المختارة. لا يمكن دمجه مع عروض أخرى.',
                    link=f'https://www.example.com/{slug}',
                    expires_at=today + timedelta(days=random.choice([3, 10, 30, 60])) if random.random() > 0.3 else None,
                    is_exclusive=random.random() > 0.75,
                    is_verified=random.random() > 0.15,
                    copies_count=random.randint(0, 900),
                )
        self.stdout.write(self.style.SUCCESS(
            f'Done: {Store.objects.count()} stores, {Coupon.objects.count()} coupons'
        ))
