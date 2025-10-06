# Django + DRF Backend Guide

This guide explains how Django and Django REST Framework (DRF) work, how this project is structured, and a study roadmap to learn the backend step-by-step.

---

## 1) How Django Works (Big Picture)

- **MTV Pattern**
  - Model: Database tables in Python code (in `storeapp/models.py`).
  - Template: HTML rendering (not used for API; frontend is React).
  - View: Business logic responding to requests (in `api/views.py`).
- **Settings**: Global configuration in `ecommerce/settings.py` (DB, installed apps, middleware, CORS, Stripe keys, etc.).
- **URLs**: Request routing in `ecommerce/urls.py` and app-level `api/urls.py`.
- **Apps**: Modular pieces of functionality (e.g., `storeapp/`, `api/`, `UserProfile/`).
- **Migrations**: Versioned DB schema changes generated from models.

Request flow (simplified):
```
Browser/Client -> URLconf -> View -> (Model/DB, Serializers) -> Response (JSON)
```

---

## 2) How DRF Works (Big Picture)

- **Serializers**: Convert between Python objects and JSON (e.g., `api/serializer.py`).
- **ViewSets**: Class-based views for CRUD and custom actions (e.g., `OrderviewSet` in `api/views.py`).
- **Routers/URLs**: Map viewsets to URL patterns (`api/urls.py`).
- **Permissions & Auth**: Access control (JWT via `djoser`/`rest_framework_simplejwt` configured in settings).
- **Pagination/Filtering**: Built-in helpers (see `DjangoFilterBackend`, `PageNumberPagination`).

Core DRF components in this project:
- `ProductViewSet`, `CartViewSet`, `CartIemViewSet`, `OrderviewSet` in `api/views.py`.
- `ProductSerializer`, `CartSerializer`, `orderSerializer`, etc. in `api/serializer.py`.

---

## 3) Project Structure (This Repo)

```
DRF_CH-main/
├── api/                        # API layer (views, serializers, filters)
│   ├── views.py                # ViewSets and actions
│   ├── serializer.py           # Serializers (input/output schemas)
│   ├── urls.py                 # API routes
│   └── filter.py               # Filtering logic
├── ecommerce/                  # Django project settings & root urls
│   ├── settings.py             # INSTALLED_APPS, DB, CORS, Stripe, etc.
│   ├── urls.py                 # Root URL router
│   ├── wsgi.py                 # WSGI entry point
│   └── __init__.py
├── storeapp/                   # Domain models (Products, Categories, Cart, Order)
│   ├── models.py               # ORM models and business fields
│   └── migrations/             # Auto-generated DB migrations
├── UserProfile/                # Profile/customer-related models
├── frontend/                   # React app (separate SPA)
│   └── src/
│       ├── pages/              # React pages
│       ├── state/              # React context for auth/cart
│       └── api/client.js       # Axios client
├── requirements.txt            # Backend dependencies
├── README.md                   # Root documentation
└── BACKEND_GUIDE.md            # This guide
```

---

## 4) Key Backend Features in This Project

- **Products & Categories**
  - `ProductViewSet` exposes listing, search, ordering, filtering.
- **Cart**
  - `CartViewSet` creates/retrieves carts.
  - `CartIemViewSet` (spelling preserved) handles add/update/remove items safely.
- **Orders & Payments**
  - `OrderviewSet.create()` creates an order from a cart (returns full order with `id`).
  - `OrderviewSet.pay()` creates a Stripe Checkout session and returns `session_url`.
  - `OrderviewSet.success_payment()` marks the order as completed after Stripe redirect.
- **Auth**
  - JWT (via SimpleJWT/Djoser). Endpoints for login/register are in the project; frontend consumes them.

---

## 5) Typical Request Flows

- Create Cart
  1. `POST /api/carts/` -> `{ cart_id }`
  2. `GET /api/carts/{id}/` -> cart content

- Add to Cart
  1. `POST /api/carts/{id}/items/` with `{ product_id, quantity }`
  2. `PATCH /api/carts/{id}/items/{item_id}/` to update qty
  3. `DELETE /api/carts/{id}/items/{item_id}/`

- Checkout & Pay
  1. `POST /api/orders/` with `{ cart_id }` -> returns order `{ id, ... }`
  2. `POST /api/orders/{id}/pay/` -> `{ session_url }`
  3. Browser redirects to Stripe Checkout
  4. Stripe redirects to `FRONTEND_URL/orders/{id}/success` or `/cancel`
  5. Success page calls `GET /api/orders/{id}/success_payment/`

---

## 6) Important Files to Know

- `api/views.py`: ViewSets and actions (core API behavior)
- `api/serializer.py`: Data validation and representation
- `ecommerce/settings.py`: Environment config (CORS, Stripe, JWT, etc.)
- `storeapp/models.py`: Data model for products, carts, orders

---

## 7) Common Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
ython manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver

# Open Django shell
python manage.py shell
```

---

## 8) Environment & Configuration

- `.env` keys used by `ecommerce/settings.py` (or defaults):
  - `DEBUG`, `SECRET_KEY`
  - `DATABASE_URL` (or SQLite default)
  - `STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY`
  - `FRONTEND_URL` (e.g., `http://localhost:5173`)
- CORS allowed origins set for local dev (5173/3000).

---

## 9) Testing & Debugging Tips

- Use Django shell to quickly inspect models:
  ```python
  from storeapp.models import Product
  Product.objects.all()[:5]
  ```
- Check server logs for incoming requests and errors.
- Add DRF `DEFAULT_RENDERER_CLASSES`/`DEFAULT_PARSER_CLASSES` for debug readability if needed.
- Verify authentication headers (JWT) in requests for protected endpoints.

---

## 10) Security Checklist (Essentials)

- Disable `DEBUG` in production.
- Use strong `SECRET_KEY` and secure cookie/session settings.
- Restrict CORS/CSRF to known origins.
- Validate user ownership in querysets (`get_queryset()` scoping) and in actions.
- Validate inputs in serializers (types, ranges, existence).

---

## 11) Study Roadmap (Backend: Django + DRF)

### Phase 1 — Python & Web Basics
- Python essentials (datatypes, functions, OOP)
- HTTP, REST, JSON, Status codes
- Virtualenv, pip, basic CLI

### Phase 2 — Django Core
- Project/app structure (`manage.py`, apps, settings)
- Models & ORM (relations, queries, migrations)
- Admin site customization
- URLs & Views (function/class-based)
- Middleware basics

Practice: build a simple blog with CRUD in Django Admin + custom views.

### Phase 3 — Django REST Framework
- Serializers (ModelSerializer, custom fields, validation)
- ViewSets & Routers
- Permissions & Authentication (JWT)
- Pagination, Filtering, Ordering
- Throttling & Versioning (overview)

Practice: build a simple REST API for your blog posts & comments.

### Phase 4 — E-commerce Domain
- Designing models for products, categories, carts, orders, payments
- Checkout workflows and stock considerations
- Webhooks (Stripe webhooks in production)

Practice: extend the blog API with a small store (digital products) and a cart.

### Phase 5 — Production Topics
- Settings per environment (dev/stage/prod)
- Logging & Monitoring
- Caching (Redis), Celery for async tasks
- Deployment (Gunicorn/Uvicorn + Nginx, Docker)
- Security hardening

### Suggested Resources
- Django: docs.djangoproject.com
- DRF: www.django-rest-framework.org
- Two Scoops of Django (book)
- Test-Driven Development with Python (book)
- Stripe Docs (payments) and Twelve-Factor App

---

## 12) How to Learn with This Project

- Read `storeapp/models.py` to understand data design.
- Follow requests start-to-finish: `ecommerce/urls.py` -> `api/urls.py` -> `api/views.py` -> `api/serializer.py` -> DB.
- Use the frontend to exercise API endpoints and watch server logs.
- Add tests incrementally for serializers and views.

