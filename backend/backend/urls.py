from django.contrib import admin
from django.urls import path,include
from api.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Import necessary modules

# Define URL patterns
urlpatterns = [
    path('admin/', admin.site.urls),  # Admin site URL
    path('api/user/register/', CreateUserView.as_view(), name='register'),  # User registration URL
    path('api/token/', TokenObtainPairView.as_view(), name='get_token'),  # Token obtain URL
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh'),  # Token refresh URL
    path('api-auth/', include('rest_framework.urls')),  # Authentication URLs
    path('api/', include('api.urls'))  # API URLs
]
