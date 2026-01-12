from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import PermissionDenied
from .serializers import RegisterSerializer, UserSerializer, AccountantOwnerSerializer
from .models import User, AccountantOwner


class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class AccountantOwnerViewSet(ModelViewSet):
    serializer_class = AccountantOwnerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return AccountantOwner.objects.all().select_related('owner', 'accountant')
        if user.role == 'owner':
            return AccountantOwner.objects.filter(owner=user).select_related('owner', 'accountant')
        if user.role == 'accountant':
            return AccountantOwner.objects.filter(accountant=user).select_related('owner', 'accountant')
        return AccountantOwner.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        owner = serializer.validated_data.get('owner')
        accountant = serializer.validated_data.get('accountant')

        # Only admin or the owner can create link; accountant cannot self-assign
        if user.role == 'admin':
            serializer.save()
            return
        if user.role == 'owner':
            if owner != user:
                raise PermissionDenied("Δεν μπορείτε να αναθέσετε άλλον ιδιοκτήτη")
            serializer.save()
            return
        raise PermissionDenied("Ο λογιστής δεν μπορεί να αυτο-ανατεθεί")
