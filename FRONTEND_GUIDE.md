# React Frontend Guide (Vite + Tailwind)

This guide explains how the React frontend is structured, how it talks to the DRF API, the checkout flow, UI libraries used, and a learning roadmap for frontend topics.

---

## 1) Stack Overview

- React 18 + Vite (fast dev server and build)
- React Router v6 for routing
- Context API for Auth and Cart state
- Axios for HTTP requests
- Tailwind CSS for utility-first styling
- Animate.css + WOW.js for animations
- Font Awesome for icons

---

## 2) Project Structure (frontend/)

```
frontend/
├── index.html                 # HTML shell; loads FA, Animate.css, WOW.js
├── src/
│   ├── main.jsx               # App entry (Router + Providers)
│   ├── App.jsx                # Layout, nav, routes, footer
│   ├── api/
│   │   └── client.js          # Axios instance (base URL, auth headers)
│   ├── state/
│   │   ├── AuthContext.jsx    # Login/register, user state, JWT storage
│   │   └── CartContext.jsx    # Cart id, cart items, add/update/remove
│   └── pages/
│       ├── Home.jsx           # Hero, features, featured products (animated)
│       ├── Products.jsx       # Product grid (add/remove to cart)
│       ├── ProductDetail.jsx  # Product details
│       ├── Cart.jsx           # Cart list + Checkout button
│       ├── Orders.jsx         # Past orders dashboard
│       ├── OrderSuccess.jsx   # Stripe success redirect (finalize order)
│       ├── OrderCancel.jsx    # Stripe cancel redirect
│       ├── Login.jsx          # Auth login page
│       └── Register.jsx       # Auth register page
└── styles.css                 # Tailwind + custom styles
```

---

## 3) Routing

Defined in `src/App.jsx` using React Router:
- `/` → `Home`
- `/products` → `Products`
- `/products/:id` → `ProductDetail`
- `/cart` → `Cart`
- `/orders` → `Orders`
- `/orders/:id/success` → `OrderSuccess`
- `/orders/:id/cancel` → `OrderCancel`
- `/login`, `/register`

The nav and footer are in `App.jsx` and use Font Awesome icons.

---

## 4) API Client and Auth

- `src/api/client.js` exports `api` (Axios instance) and `mediaUrl()` helper for images.
- Base URL defaults to `http://localhost:8000`; can be overridden via `VITE_API_BASE`.
- `AuthContext.jsx` stores JWT in localStorage and sets Authorization header on `api`.
- `useAuth()` exposes `user`, `login()`, `register()`, `logout()`.

Typical usage:
```js
import { api } from '../api/client'
const { data } = await api.get('/api/products/')
```

---

## 5) Cart State and Checkout

- `CartContext.jsx` manages `cartId` and `cart` data.
  - `ensureCart()` verifies the current `cartId`; if missing/404, creates a new cart with `POST /api/carts/`.
  - `fetchCart()` loads the current cart and heals if the cart was deleted server-side.
  - `addItem(productId, qty)`, `updateItem(itemId, qty)`, `removeItem(itemId)`, `removeProduct(productId)`.
  - `clearCartLocal()` clears local storage/cart state (used after order creation).

- Checkout flow in `Cart.jsx`:
  1. Require login; otherwise `navigate('/login')`.
  2. `POST /api/orders/` with `{ cart_id }` → returns order `{ id, ... }`.
  3. `POST /api/orders/{id}/pay/` → returns `{ session_url }`.
  4. Call `clearCartLocal()` then `window.location.href = session_url`.

- After Stripe:
  - Success → `/orders/:id/success` calls `GET /api/orders/{id}/success_payment/`.
  - Cancel → `/orders/:id/cancel` shows a message and a link back to the cart.

---

## 6) Orders Dashboard

- `Orders.jsx` calls `GET /api/orders/` and displays:
  - Order id, placed date, human-readable status, total
  - Items with product name, price, quantity, and subtotal

Relies on backend serializers returning nested product info and totals.

---

## 7) UI Libraries and Animations

- `index.html` includes:
  - Font Awesome CSS (icons)
  - Animate.css (animation classes)
  - WOW.js (triggers animations on scroll) with `new WOW().init()`
- Use `wow animate__animated animate__fadeInUp` (etc.) on elements.
- Tailwind utility classes for layout, grid, colors, spacing, borders, shadows.

---

## 8) Error Handling & UX

- Show loading and error states (`useState` flags) for pages that fetch data.
- Validate inputs before sending (e.g., quantities > 0).
- Display API errors from Axios (`e.response?.data` or `e.message`).
- Consider adding toasts (e.g., react-hot-toast) for success/error feedback.

---

## 9) Environment and Config

- `frontend/.env` (optional):
  ```env
  VITE_API_BASE=http://localhost:8000
  ```
- Backend redirects from Stripe use `FRONTEND_URL` in Django settings; default set to Vite dev: `http://localhost:5173`.

---

## 10) Development Commands

```bash
# from frontend/
npm install         # install deps
npm run dev         # start Vite dev server
npm run build       # production build
npm run preview     # preview build locally
```

---

## 11) Performance Tips

- Avoid re-fetching on every render; use `useEffect` with proper deps.
- Memoize heavy components or lists when necessary.
- Paginate product lists on the backend and forward page params.
- Lazy-load routes or components if the app grows.

---

## 12) Study Roadmap (Frontend)

### Phase 1 — React Basics
- Components, props, state, events
- JSX, lists, keys, conditional rendering
- Hooks: `useState`, `useEffect`

### Phase 2 — Routing & Data Fetching
- React Router v6 (routes, params, navigation)
- `fetch` vs Axios, handling loading/error
- Environment variables in Vite

### Phase 3 — State Management
- Context API (Auth, Cart) + custom hooks
- LocalStorage for persistence
- When to consider Redux or RTK Query

### Phase 4 — UI/UX
- Tailwind basics (layout, spacing, typography)
- Icons (Font Awesome)
- Animations (Animate.css, WOW.js)
- Notifications (toasts), skeleton loaders

### Phase 5 — Integration & Testing
- Integrate with DRF endpoints (auth, products, cart, orders)
- End-to-end checkout with Stripe (test mode)
- Testing components (Testing Library), mocking API calls

### Resources
- React docs: https://react.dev
- React Router: https://reactrouter.com
- Vite: https://vitejs.dev
- Tailwind: https://tailwindcss.com
- Axios: https://axios-http.com
- Stripe Checkout: https://stripe.com/docs/payments/checkout

---

## 13) How to Expand This Frontend

- Add categories and filters (price range, brand, rating)
- Search with debounced input
- Product reviews UI (read/write)
- Saved addresses and profile settings
- Admin pages (if needed) for managing products and orders

