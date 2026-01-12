
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from apartments.views import ApartmentViewSet, TenantViewSet, RentPaymentViewSet, DocumentViewSet, NotificationViewSet, TenantHistoryViewSet
from users.views import AccountantOwnerViewSet

router = DefaultRouter()
router.register(r'apartments', ApartmentViewSet, basename='apartment')
router.register(r'tenants', TenantViewSet, basename='tenant')
router.register(r'payments', RentPaymentViewSet, basename='payment')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'tenant-history', TenantHistoryViewSet, basename='tenant-history')
router.register(r'accountant-owners', AccountantOwnerViewSet, basename='accountant-owner')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/users/', include('users.urls')),
    path('api/', include(router.urls)),
]

