from djoser.serializers import UserCreateSerializer

class MyUserCreatSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        fields=['id','first_name','last_name','email','password','username']