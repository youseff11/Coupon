# وفّر كود — موقع أكواد الخصم

موقع أكواد خصم وكوبونات (React + Django) مع لوحة تحكم احترافية متجاوبة.

## المميزات

**الموقع (للعملاء)**
- الصفحة الرئيسية: بحث، متاجر مميزة، تصنيفات، أحدث الكوبونات والأكثر استخداماً
- صفحة لكل شركة (`/stores/noon`) فيها الشعار والوصف وكل الكوبونات مع فلترة (أكواد / عروض)
- زر **انسخ الكود** ينسخ الكود ويفتح نافذة فيها الكود ورابط المتجر
- زر **مشاركة** (واتساب، فيسبوك، تليجرام، إكس، نسخ الرابط). الرابط المشارك يفتح الكوبون مباشرة
- عداد لمرات نسخ كل كود، وعلامات موثق/حصري/ينتهي قريباً
- تصميم عربي RTL متجاوب مع الموبايل

**لوحة التحكم (`/admin`)**
- إحصائيات: الشركات، الكوبونات الفعالة، مرات النسخ، الكوبونات التي ستنتهي قريباً
- إدارة الشركات: إضافة/تعديل/حذف، رفع الشعار (سحب وإفلات)، تفعيل وتمييز
- إدارة الكوبونات: اسم الشركة، الكود، قيمة الخصم، الرابط، تاريخ الانتهاء، موثق/حصري
- إدارة التصنيفات
- الجداول تتحول لكروت على الموبايل، والقائمة الجانبية قابلة للطي

## التشغيل

### Backend (Django)
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo      # بيانات تجريبية + مستخدم admin
python manage.py runserver
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

افتح http://localhost:5173 للموقع و http://localhost:5173/admin للوحة التحكم.

حساب الأدمن التجريبي ينشئه `seed_demo`: المستخدم `admin` وكلمة المرور `admin12345`.
لإنشاء أدمن آخر: `python manage.py createsuperuser`.

> غيّر كلمة المرور قبل رفع الموقع على الإنترنت.

## الرفع على سيرفر (Production)
- اضبط متغيرات البيئة: `DJANGO_SECRET_KEY`، `DJANGO_DEBUG=0`، `DJANGO_ALLOWED_HOSTS`، `CORS_ALLOWED_ORIGINS`
- ابنِ الواجهة: `npm run build` واخدم مجلد `frontend/dist` (مع توجيه كل المسارات إلى `index.html`)
- مرّر `/api` و `/media` إلى Django (مثلاً عبر Nginx)، و`python manage.py collectstatic`
- لو الـ API على دومين مختلف: `VITE_API_URL=https://api.example.com/api npm run build`

## هيكل المشروع
```
backend/
  config/            إعدادات Django
  coupons/           الموديلات، الـ API، أمر seed_demo
frontend/
  src/pages/         صفحات الموقع
  src/admin/         لوحة التحكم
  src/components/    كارت الكوبون، المشاركة، الهيدر...
  src/styles/        التصميم
```

## الـ API
| Endpoint | الوصف |
|---|---|
| `GET /api/stores/` | المتاجر (`search`, `category`, `featured`) |
| `GET /api/stores/<slug>/` | متجر مع كوبوناته الفعالة |
| `GET /api/coupons/` | الكوبونات (`search`, `ordering=popular`, `exclusive`) |
| `POST /api/coupons/<id>/copy/` | تسجيل نسخ الكود |
| `POST /api/auth/login/` | تسجيل دخول الأدمن (Token) |
| `/api/admin/stores/`, `/api/admin/coupons/`, `/api/admin/categories/` | CRUD للأدمن |
| `GET /api/admin/stats/` | إحصائيات لوحة التحكم |
