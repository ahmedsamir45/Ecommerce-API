"""
Django REST Framework Serializers for Store Application

Serializers convert complex data types (like Django models) 
into Python datatypes that can be easily rendered into JSON.
"""

from rest_framework import serializers
import uuid
from storeapp.models import Product, Category, Review, Cart, Cartitems,ProductImage,Profile,Order,OrderItem
from django.db import transaction



class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields= ["id","product","image"]


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for Product model
    
    Fields:
    - name: Product name
    - description: Detailed product description
    - old_price: Original price (before discount)
    - category: Related category (shown as string)
    - slug: URL-friendly identifier
    - id: Primary key
    - price: Current price
    - inventory: Stock quantity
    
    The category field uses StringRelatedField to display the category name 
    instead of just the ID.
    """
    images = ProductImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=100000, allow_empty_file=False, use_url=False),
        write_only=True
    )
    class Meta:
        model = Product
        fields = ['id','name','description','old_price','price','inventory','image','images','uploaded_images']
        extra_kwargs = {
            'image': {'read_only': True}
        }

    def create(self,validated_data):
        uploaded_images = validated_data.pop('uploaded_images')
        product = Product.objects.create(**validated_data)
        for image in uploaded_images:
            newproductimage = ProductImage.objects.create(product=product,image=image)
        return product


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Category model
    
    Fields:
    - title: Category name
    - category_id: Unique identifier
    - slug: URL-friendly version of title
    """
    class Meta:
        model = Category
        fields = ['title','category_id','slug']


class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for Product Reviews
    
    Fields:
    - id: Review ID
    - date_created: When review was posted
    - name: Reviewer's name
    - description: Review content
    
    Includes custom create method that automatically associates
    the review with a product from the URL parameter.
    """
    class Meta:
        model = Review
        fields = ["id","date_created","name","description"]
    
    def create(self, validated_data):
        """Create review with product_id from URL context"""
        product_id = self.context['product_id']
        return Review.objects.create(product_id=product_id, **validated_data)


class SimpleProductSerializer(serializers.ModelSerializer):
    """
    Simplified Product serializer for nested representations
    
    Used in CartItemSerializer to avoid circular references and
    only show essential product information.
    
    Fields:
    - id: Product ID
    - price: Current price
    - name: Product name
    """
    class Meta:
        model = Product
        fields = ['id','price','name','image']


class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializer for items in shopping cart
    
    Fields:
    - id: Cart item ID
    - cart: Parent cart reference
    - product: Nested product info (using SimpleProductSerializer)
    - quantity: Number of units
    - sub_total: Calculated field (quantity × price)
    """
    product = SimpleProductSerializer(many=False)
    sub_total = serializers.SerializerMethodField(method_name='total')
    
    class Meta:
        model = Cartitems
        fields = ['id','cart','product','quantity','sub_total']
    
    def total(self, cartitem: Cartitems):
        """Calculate line item total (price × quantity)"""
        return cartitem.quantity * cartitem.product.price


class AddCartItemSerializer(serializers.ModelSerializer):
    """Serializer for adding items to cart"""
    product_id=serializers.UUIDField()

    def validate_product_id(sef,value):
        if not Product.objects.filter(pk=value).exists():
            raise serializers.ValidationError('no valid product id try again')
        return value
    def validate(self, data):
        if data['quantity'] <= 0:
            raise serializers.ValidationError('Quantity must be greater than zero')
        return data
    def save(self,**kwargs):
        cart_id = self.context['cart_id']
        product_id = self.validated_data['product_id']
        quantity = self.validated_data['quantity']

        # Ensure the cart exists to avoid FK errors
        cart = Cart.objects.filter(pk=cart_id).first()
        if not cart:
            raise serializers.ValidationError('Invalid cart id. Please create a new cart.')

        try:
            cartitem = Cartitems.objects.get(product_id=product_id, cart_id=cart_id)
            cartitem.quantity += quantity
            cartitem.save()
            self.instance = cartitem
        except Cartitems.DoesNotExist:
            # Create using cart instance to satisfy FK constraint
            self.instance = Cartitems.objects.create(
                cart=cart,
                product_id=product_id,
                quantity=quantity,
            )
        return self.instance
    class Meta:
        model = Cartitems
        fields = ['id','product_id','quantity']

class UpdatecartitemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cartitems
        fields = ['quantity']


class CartSerializer(serializers.ModelSerializer):

    """
    Serializer for Shopping Cart
    
    Fields:
    - cart_id: Unique cart identifier
    - items: Nested list of cart items
    - grand_total: Sum of all item totals
    
    Uses prefetch_related in view for optimized queries.
    """
    cart_id = serializers.UUIDField(read_only=True)
    items = CartItemSerializer(many=True, read_only=True)
    grand_total = serializers.SerializerMethodField(method_name='main_total')
    
    class Meta:
        model = Cart
        fields = ['cart_id','items','grand_total'] 
    
    def main_total(self, cart: Cart):
        """Calculate total value of all items in cart"""
        items = cart.items.all()
        total = sum([item.quantity * item.product.price for item in items])
        return total

    def create(self, validated_data):
        # Auto-generate a session_id and attach owner if user is authenticated
        request = self.context.get('request')
        session_id = str(uuid.uuid4())
        owner = None
        if request and request.user and request.user.is_authenticated:
            try:
                from UserProfile.models import Customer
                owner = Customer.objects.get(user=request.user)
            except Exception:
                owner = None
        return Cart.objects.create(session_id=session_id, owner=owner)

class OrderItemSerializer(serializers.ModelSerializer):
    product = SimpleProductSerializer(read_only=True)
    sub_total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["id","product","quantity","sub_total"]

    def get_sub_total(self, obj: OrderItem):
        return obj.quantity * (obj.product.price if obj.product else 0)

class orderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ["id","placed_at","pending_status","status_label","owner","items","total"]

    def get_total(self, obj: Order):
        return obj.total_price

    def get_status_label(self, obj: Order):
        return obj.get_pending_status_display()

class CreateOrderSerializer(serializers.Serializer):
    cart_id = serializers.UUIDField()
    def save(self, **kwargs):
        cart_id = self.validated_data['cart_id']
        user_id = self.context['user_id']

        with transaction.atomic():
            order = Order.objects.create(owner_id=user_id)
            cartitems = Cartitems.objects.filter(cart_id=cart_id)
            orderitems = [
                OrderItem(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                )
                for item in cartitems
            ]
            if orderitems:
                OrderItem.objects.bulk_create(orderitems)
            Cart.objects.filter(cart_id=cart_id).delete()
            return order

class ProfileSarializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["id","name","bio","image"]



