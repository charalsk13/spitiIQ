from rest_framework import serializers
from .models import User, AccountantOwner


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role')


class AccountantOwnerSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    accountant_username = serializers.CharField(source='accountant.username', read_only=True)

    class Meta:
        model = AccountantOwner
        fields = ('id', 'accountant', 'owner', 'owner_username', 'accountant_username', 'created_at')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default="owner")

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role')

    def create(self, validated_data):
        role = validated_data.pop('role', 'owner')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password'],
            role=role
        )
        return user
