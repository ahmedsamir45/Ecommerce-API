import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'

export default function OrderSuccess() {
  const { id } = useParams()
  const [message, setMessage] = useState('Finalizing your order...')
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.get(`/api/orders/${id}/success_payment/`)
      .then(() => { if (mounted) setMessage('Payment successful. Your order is confirmed!') })
      .catch((e) => setError(e?.response?.data?.detail || e.message))
    return () => { mounted = false }
  }, [id])

  return (
    <div className="max-w-lg mx-auto bg-white border rounded p-6">
      <h1 className="text-2xl font-semibold mb-2">Order #{id}</h1>
      {error ? (
        <p className="text-red-600 mb-4">{error}</p>
      ) : (
        <p className="text-green-700 mb-4">{message}</p>
      )}
      <div className="flex gap-3">
        <Link to="/orders" className="text-white bg-blue-600 px-3 py-2 rounded">Go to Orders</Link>
        <Link to="/" className="text-blue-600 px-3 py-2">Continue Shopping</Link>
      </div>
    </div>
  )
}
