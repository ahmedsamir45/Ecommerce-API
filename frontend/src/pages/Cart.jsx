import { useState } from 'react'
import { mediaUrl, api } from '../api/client'
import { useCart } from '../state/CartContext'
import { useAuth } from '../state/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const { cart, cartId, loading, error, updateItem, removeItem, fetchCart, clearCartLocal } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [checkoutError, setCheckoutError] = useState('')

  const items = cart?.items || []
  const total = cart?.grand_total || 0

  if (loading) return <p>Loading cart...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Cart</h1>
        <button onClick={fetchCart} className="text-sm text-blue-600">Refresh</button>
      </div>

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((it) => (
            <div key={it.id} className="bg-white border rounded p-3 flex items-center gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                {it.product?.image ? (
                  <img src={mediaUrl(it.product.image)} alt={it.product?.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs">No image</span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{it.product?.name}</div>
                <div className="text-sm text-gray-600">${(it.product?.price || 0).toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateItem(it.id, Math.max(1, it.quantity - 1))}
                  className="px-2 py-1 border rounded"
                >-</button>
                <span className="w-8 text-center">{it.quantity}</span>
                <button
                  onClick={() => updateItem(it.id, it.quantity + 1)}
                  className="px-2 py-1 border rounded"
                >+</button>
              </div>
              <div className="w-24 text-right font-semibold">${(it.sub_total || 0).toFixed(2)}</div>
              <button onClick={() => removeItem(it.id)} className="text-red-600 text-sm ml-2">Remove</button>
            </div>
          ))}
          <div className="flex items-center justify-end gap-4 mt-2">
            <div className="text-lg font-bold">Total: ${total.toFixed(2)}</div>
            <button
              onClick={async () => {
                try {
                  setCheckoutError('')
                  if (!user) {
                    navigate('/login')
                    return
                  }
                  // Create order from cart
                  const { data: order } = await api.post('/api/orders/', { cart_id: cartId })
                  // Request Stripe checkout session
                  const { data } = await api.post(`/api/orders/${order.id}/pay/`)
                  if (data?.session_url) {
                    // Backend deletes the cart after creating order, so clear local cart id to prevent 404s
                    clearCartLocal()
                    window.location.href = data.session_url
                  } else {
                    setCheckoutError('Failed to create checkout session')
                  }
                } catch (e) {
                  setCheckoutError(e?.response?.data?.error || e.message)
                }
              }}
              className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700"
            >
              Checkout
            </button>
          </div>
          {checkoutError && checkoutError.length > 0 && (
            <div className="text-red-600 text-sm text-right">{checkoutError}</div>
          )}
        </div>
      )}
    </div>
  )
}
