from datetime import timedelta

from django.contrib.auth import authenticate
from django.db.models import Count, F, Q, Sum
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import Category, Coupon, Store, StoredFile
from .serializers import (
    CategorySerializer, CouponSerializer, PublicCouponSerializer,
    StoreDetailSerializer, StoreSerializer,
)


def live_coupons_q(prefix='coupons__'):
    today = timezone.localdate()
    return Q(**{f'{prefix}is_active': True}) & (
        Q(**{f'{prefix}expires_at__isnull': True}) | Q(**{f'{prefix}expires_at__gte': today})
    )


# ---------- Public API ----------

class PublicCategoryList(generics.ListAPIView):
    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        return Category.objects.annotate(
            stores_count=Count('stores', filter=Q(stores__is_active=True))
        )


class PublicStoreList(generics.ListAPIView):
    serializer_class = StoreSerializer

    def get_queryset(self):
        qs = Store.objects.filter(is_active=True).select_related('category').annotate(
            coupons_count=Count('coupons', filter=live_coupons_q())
        )
        p = self.request.query_params
        if p.get('search'):
            qs = qs.filter(Q(name__icontains=p['search']) | Q(description__icontains=p['search']))
        if p.get('category'):
            qs = qs.filter(category__slug=p['category'])
        if p.get('featured') == '1':
            qs = qs.filter(is_featured=True)
        if p.get('all') == '1':
            self.pagination_class = None
        return qs


class PublicStoreDetail(generics.RetrieveAPIView):
    serializer_class = StoreDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return Store.objects.filter(is_active=True).select_related('category').annotate(
            coupons_count=Count('coupons', filter=live_coupons_q())
        )


class PublicCouponList(generics.ListAPIView):
    serializer_class = PublicCouponSerializer

    def get_queryset(self):
        qs = Coupon.objects.live().select_related('store')
        p = self.request.query_params
        if p.get('search'):
            s = p['search']
            qs = qs.filter(Q(title__icontains=s) | Q(store__name__icontains=s) | Q(description__icontains=s))
        if p.get('exclusive') == '1':
            qs = qs.filter(is_exclusive=True)
        if p.get('ordering') == 'popular':
            qs = qs.order_by('-copies_count', '-created_at')
        else:
            qs = qs.order_by('-created_at')
        return qs


@api_view(['POST'])
def track_copy(request, pk):
    updated = Coupon.objects.live().filter(pk=pk).update(copies_count=F('copies_count') + 1)
    if not updated:
        return Response(status=status.HTTP_404_NOT_FOUND)
    return Response({'ok': True})


def serve_stored_file(request, name):
    obj = StoredFile.objects.filter(name=name).only('content', 'content_type').first()
    if obj is None:
        raise Http404
    response = HttpResponse(bytes(obj.content), content_type=obj.content_type)
    response['Cache-Control'] = 'public, max-age=86400'
    return response


# ---------- Auth ----------

@api_view(['POST'])
def login(request):
    user = authenticate(
        username=request.data.get('username', ''),
        password=request.data.get('password', ''),
    )
    if not user or not user.is_staff:
        return Response({'detail': 'اسم المستخدم أو كلمة المرور غير صحيحة'}, status=status.HTTP_400_BAD_REQUEST)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user': {'username': user.username, 'name': user.get_full_name()}})


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def me(request):
    u = request.user
    return Response({'username': u.username, 'name': u.get_full_name()})


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def logout(request):
    Token.objects.filter(user=request.user).delete()
    return Response({'ok': True})


# ---------- Admin API ----------

class AdminCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        return Category.objects.annotate(stores_count=Count('stores'))


class AdminStoreViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = StoreSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = Store.objects.select_related('category').annotate(coupons_count=Count('coupons'))
        p = self.request.query_params
        if p.get('search'):
            qs = qs.filter(name__icontains=p['search'])
        if p.get('category'):
            qs = qs.filter(category_id=p['category'])
        if p.get('status') == 'active':
            qs = qs.filter(is_active=True)
        elif p.get('status') == 'inactive':
            qs = qs.filter(is_active=False)
        if p.get('all') == '1':
            self.pagination_class = None
        return qs.order_by('-created_at')


class AdminCouponViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = CouponSerializer

    def get_queryset(self):
        qs = Coupon.objects.select_related('store')
        p = self.request.query_params
        today = timezone.localdate()
        if p.get('search'):
            s = p['search']
            qs = qs.filter(Q(title__icontains=s) | Q(code__icontains=s) | Q(store__name__icontains=s))
        if p.get('store'):
            qs = qs.filter(store_id=p['store'])
        st = p.get('status')
        if st == 'active':
            qs = qs.filter(is_active=True).filter(Q(expires_at__isnull=True) | Q(expires_at__gte=today))
        elif st == 'expired':
            qs = qs.filter(expires_at__lt=today)
        elif st == 'inactive':
            qs = qs.filter(is_active=False)
        return qs.order_by('-created_at')


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_stats(request):
    today = timezone.localdate()
    coupons = Coupon.objects.all()
    live = Coupon.objects.live()
    top = live.select_related('store').order_by('-copies_count')[:5]
    return Response({
        'stores': Store.objects.count(),
        'active_stores': Store.objects.filter(is_active=True).count(),
        'coupons': coupons.count(),
        'live_coupons': live.count(),
        'expired_coupons': coupons.filter(expires_at__lt=today).count(),
        'expiring_soon': live.filter(expires_at__isnull=False, expires_at__lte=today + timedelta(days=7)).count(),
        'categories': Category.objects.count(),
        'total_copies': coupons.aggregate(s=Sum('copies_count'))['s'] or 0,
        'top_coupons': CouponSerializer(top, many=True, context={'request': request}).data,
        'top_stores': [
            {'id': s.id, 'name': s.name, 'copies': s.copies or 0}
            for s in Store.objects.annotate(copies=Sum('coupons__copies_count')).order_by(F('copies').desc(nulls_last=True))[:5]
        ],
    })
