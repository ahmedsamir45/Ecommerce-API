from rest_framework.decorators import action
from rest_framework.status import HTTP_204_NO_CONTENT, HTTP_201_CREATED, HTTP_400_BAD_REQUEST
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, DestroyModelMixin
from django_filters.rest_framework import DjangoFilterBackend
from .filter import *
from .serializer import *
from storeapp.models import *
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.conf import settings
from rest_framework.exceptions import ValidationError
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

class ProductViewSet(ModelViewSet):
    """
    Complete CRUD interface for Products
    
    Features:
    - Filtering: Uses ProductFilter class
    - Search: By name or description
    - Ordering: By old_price
    - Pagination: PageNumberPagination
    
    Optimized with select_related to prevent N+1 queries on category.
    """
    queryset = Product.objects.all().select_related('category')
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['old_price']
    pagination_class = PageNumberPagination

class CategoryViewSet(ModelViewSet):
    """
    Standard CRUD interface for Categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ReviewViewSet(ModelViewSet):
    """
    Review management tied to specific products
    
    The product ID comes from URL parameter (product_pk).
    Automatically sets product context for serializer.
    """
    serializer_class = ReviewSerializer

    def get_serializer_context(self):
        """Inject product_id from URL into serializer context"""
        return {'product_id': self.kwargs['product_pk']}

    def get_queryset(self):
        """Return only reviews for the specified product"""
        return Review.objects.filter(product_id=self.kwargs['product_pk'])

class CartViewSet(CreateModelMixin, RetrieveModelMixin, DestroyModelMixin, GenericViewSet):
    """
    Cart management with two actions:
    - create: Make new cart
    - retrieve: Get cart details
    
    Uses prefetch_related to optimize item/product queries.
    Cart items are read-only in this interface - manage items separately.
    """
    queryset = Cart.objects.prefetch_related('items__product')
    serializer_class = CartSerializer

class CartIemViewSet(ModelViewSet):
    http_method_names = ['get', 'patch', 'delete', 'post']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AddCartItemSerializer
        elif self.request.method == 'PATCH':
            return UpdatecartitemSerializer
        return CartItemSerializer
    
    def get_serializer_context(self):
        return {'cart_id': self.kwargs['cart_pk']}
    
    def get_queryset(self):
        return Cartitems.objects.filter(cart_id=self.kwargs['cart_pk'])

class ProfileViewSet(ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSarializer
    parser_classes = (MultiPartParser, FormParser)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {"message": "Profile created successfully", "data": serializer.data},
            status=HTTP_201_CREATED,
            headers=headers
        )

class OrderviewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUser() if self.action in ['update', 'partial_update', 'destroy'] else IsAuthenticated()]

    @action(detail=True, methods=['POST'])
    def pay(self, request, pk=None):
        order = self.get_object()
        if order.pending_status != 'P':
            raise ValidationError("This order is not pending payment")
        
        amount = order.total_price
        email = request.user.email
        order_id = str(order.id)
        
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': 'Supa Electronics Store',
                            'description': 'Best store in town',
                        },
                        'unit_amount': int(amount * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                metadata={'order_id': order_id},
                customer_email=email,
                success_url=f'{settings.FRONTEND_URL}/orders/{order_id}/success/',
                cancel_url=f'{settings.FRONTEND_URL}/orders/{order_id}/cancel/',
            )
            return Response({'session_url': session.url})
        except Exception as e:
            return Response({'error': str(e)}, status=HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['GET'])
    def success_payment(self, request, pk=None):
        order = self.get_object()
        order.pending_status = "C"
        order.save()
        serializer = self.get_serializer(order)
        return Response({
            'message': 'Payment successful',
            'data': serializer.data
        })

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CreateOrderSerializer
        return orderSerializer
    
    def get_serializer_context(self):
        return {"user_id": self.request.user.id}
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all().order_by('-placed_at')
        return Order.objects.filter(owner=user).order_by('-placed_at')




##gineric
"""
class APIProducts(ListCreateAPIView):
    queryset=Product.objects.all()
    serializer_class = ProductSerializer

class ApiProduct(RetrieveUpdateDestroyAPIView):
    queryset=Product.objects.all()
    serializer_class = ProductSerializer


class APICategory(ListCreateAPIView):
    queryset=Category.objects.all()
    serializer_class = CategorySerializer

class ApiCategories(RetrieveUpdateDestroyAPIView):
    queryset=Category.objects.all()
    serializer_class = CategorySerializer

"""




    
### class based view
"""class APIProducts(APIView):
    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    def post(self,request):
        serializer = ProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
class ApiProduct(APIView):
    def get(self, request, pk):
        product = get_object_or_404(Product,id=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    def put(self,request,pk):
        product = get_object_or_404(Product,id=pk)
        serializer = ProductSerializer(product, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    def delete(self,request,pk):
        product = get_object_or_404(Product,id=pk)
        product.delete()
        return Response(status=HTTP_204_NO_CONTENT)





class APICategories(APIView):
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    def post(self,request):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
class ApiCategory(APIView):
    def get(self, request, pk):
        category = get_object_or_404(Category,category_id=pk)
        serializer = CategorySerializer(category)
        return Response(serializer.data)
    def put(self,request,pk):
        category = get_object_or_404(Category,category_id=pk)
        serializer = CategorySerializer(category, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    def delete(self,request,pk):
        category = get_object_or_404(Category,category_id=pk)
        category.delete()
        return Response(status=HTTP_204_NO_CONTENT)"""
## functioon based view
"""
@api_view(['GET',"POST"])
def api_products(request):
    if request.method == 'GET':
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    if request.method=="POST":
        serializer = ProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.data)


@api_view(['GET','PUT','DELETE'])
def api_product(request, pk):
    product = get_object_or_404(Product,id=pk)
    if request.method =="GET":
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    if request.method =="PUT":
        serializer = ProductSerializer(product, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    if request.method == 'DELETE':
        product.delete()
        return Response(status=HTTP_204_NO_CONTENT)



@api_view(['GET','POST'])
def api_categories(request):
    if request.method == 'GET':
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    if request.method =='POST':
        serializer = CategorySerializer(request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

@api_view(['DELETE','PUT','GET'])
def api_category(request, pk):
    category = get_object_or_404(Category,category_id=pk)
    if request.method =='GET':
        serializer = CategorySerializer(category)
        return Response(serializer.data)
    if request.method == 'PUT':
        serializer = CategorySerializer(category, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
"""