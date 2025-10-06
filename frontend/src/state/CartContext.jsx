import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartId, setCartId] = useState(() => localStorage.getItem('cartId') || '')
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ensureCart = async () => {
    // If we have a stored id, verify it exists; otherwise create a new cart
    if (cartId) {
      try {
        await api.get(`/api/carts/${cartId}/`)
        return cartId
      } catch (e) {
        // If 404, fall through to create new
      }
    }
    const { data } = await api.post('/api/carts/', {})
    const id = data.cart_id
    setCartId(id)
    localStorage.setItem('cartId', id)
    return id
  }

  const fetchCart = async () => {
    try {
      setLoading(true)
      const id = cartId || (await ensureCart())
      const { data } = await api.get(`/api/carts/${id}/`)
      setCart(data)
      setError('')
    } catch (e) {
      if (e?.response?.status === 404) {
        // Create a fresh cart and refetch
        const id = await ensureCart()
        try {
          const { data } = await api.get(`/api/carts/${id}/`)
          setCart(data)
          setError('')
        } catch (err) {
          setError(err.message)
        }
      } else {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cartId) fetchCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartId])

  const addItem = async (productId, quantity = 1) => {
    const id = cartId || (await ensureCart())
    await api.post(`/api/carts/${id}/items/`, {
      product_id: productId,
      quantity,
    })
    await fetchCart()
  }

  const updateItem = async (itemId, quantity) => {
    const id = await ensureCart()
    await api.patch(`/api/carts/${id}/items/${itemId}/`, { quantity })
    await fetchCart()
  }

  const removeItem = async (itemId) => {
    const id = await ensureCart()
    await api.delete(`/api/carts/${id}/items/${itemId}/`)
    await fetchCart()
  }

  const getItemByProduct = (productId) => {
    return cart?.items?.find((it) => String(it?.product?.id) === String(productId))
  }

  const hasProduct = (productId) => !!getItemByProduct(productId)

  const removeProduct = async (productId) => {
    const it = getItemByProduct(productId)
    if (it) {
      await removeItem(it.id)
    }
  }

  const value = useMemo(
    () => ({
      cartId, cart, loading, error,
      fetchCart, addItem, updateItem, removeItem,
      hasProduct, getItemByProduct, removeProduct,
    }),
    [cartId, cart, loading, error]
  )

  const clearCartLocal = () => {
    setCartId('')
    setCart(null)
    localStorage.removeItem('cartId')
  }

  // include clearCartLocal in value
  value.clearCartLocal = clearCartLocal

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
