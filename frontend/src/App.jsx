import { Link, Routes, Route, Navigate } from 'react-router-dom'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import OrderSuccess from './pages/OrderSuccess'
import OrderCancel from './pages/OrderCancel'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuth } from './state/AuthContext'
import { CartProvider, useCart } from './state/CartContext'
function Nav() {
  const { user, logout } = useAuth()
  const { cart } = useCart() || {}
  const count = cart?.items?.reduce((acc, it) => acc + it.quantity, 0) || 0
  return (
    <nav className="bg-white border-b">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold text-blue-700 flex items-center gap-2">
            <i className="fa-solid fa-store"></i>
            Ecommerce
          </Link>
          <Link to="/" className="text-sm text-gray-700 hover:text-blue-700 flex items-center gap-2">
            <i className="fa-solid fa-house"></i> Home
          </Link>
          <Link to="/products" className="text-sm text-gray-700 hover:text-blue-700 flex items-center gap-2">
            <i className="fa-solid fa-list"></i> Products
          </Link>
          <Link to="/orders" className="text-sm text-gray-700 hover:text-blue-700 flex items-center gap-2">
            <i className="fa-regular fa-rectangle-list"></i> Orders
          </Link>
          <Link to="/cart" className="text-sm text-gray-700 hover:text-blue-700 flex items-center gap-2">
            <i className="fa-solid fa-cart-shopping"></i> Cart{count ? ` (${count})` : ''}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm flex items-center gap-2"><i className="fa-regular fa-user"></i>{user.email}</span>
              <button onClick={logout} className="text-sm text-white bg-blue-600 px-3 py-1 rounded flex items-center gap-2">
                <i className="fa-solid fa-right-from-bracket"></i> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-700 hover:text-blue-700 flex items-center gap-2"><i className="fa-regular fa-circle-user"></i> Login</Link>
              <Link to="/register" className="text-sm text-white bg-blue-600 px-3 py-1 rounded flex items-center gap-2"><i className="fa-solid fa-user-plus"></i> Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 wow animate__animated animate__fadeIn">
        <Nav />
        <main className="container py-6">
          <Routes>
            <Route index element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id/success" element={<OrderSuccess />} />
            <Route path="/orders/:id/cancel" element={<OrderCancel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="border-t bg-white">
          <div className="container py-6 text-sm text-gray-600 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-copyright"></i>
              <span>{new Date().getFullYear()} Ecommerce</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-blue-700" aria-label="Facebook"><i className="fa-brands fa-facebook"></i></a>
              <a href="#" className="hover:text-blue-700" aria-label="Twitter"><i className="fa-brands fa-x-twitter"></i></a>
              <a href="#" className="hover:text-blue-700" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  )
}
