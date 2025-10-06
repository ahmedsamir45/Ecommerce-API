import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../state/AuthContext'
import { Link } from 'react-router-dom'

export default function Orders() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    if (!user) {
      setLoading(false)
      return
    }
    api.get('/api/orders/')
      .then((res) => { if (mounted) setItems(res.data?.results || res.data) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [user])

  if (!user) return <p>Please <Link to="/login" className="text-blue-600">login</Link> to see your orders.</p>
  if (loading) return <p>Loading orders...</p>
  if (error) return <p className="text-red-600">{error}</p>

  if (!items.length) return <p>No orders yet.</p>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Your Orders</h1>
      <div className="grid gap-4">
        {items.map((o) => (
          <div key={o.id} className="bg-white border rounded p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Order #{o.id}</div>
                <div className="text-sm text-gray-600">Placed: {new Date(o.placed_at).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">{o.status_label || o.pending_status}</span>
                <span className="text-sm font-semibold">Total: ${Number(o.total || 0).toFixed(2)}</span>
              </div>
            </div>
            {o.items?.length ? (
              <div className="mt-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-1">Product</th>
                      <th className="py-1">Qty</th>
                      <th className="py-1">Price</th>
                      <th className="py-1 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {o.items.map((it) => (
                      <tr key={it.id} className="border-t">
                        <td className="py-1">{it.product?.name || it.product}</td>
                        <td className="py-1">{it.quantity}</td>
                        <td className="py-1">${Number(it.product?.price || 0).toFixed(2)}</td>
                        <td className="py-1 text-right">${Number(it.sub_total || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
