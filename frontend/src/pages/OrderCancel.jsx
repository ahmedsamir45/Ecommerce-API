import { Link, useParams } from 'react-router-dom'

export default function OrderCancel() {
  const { id } = useParams()
  return (
    <div className="max-w-lg mx-auto bg-white border rounded p-6">
      <h1 className="text-2xl font-semibold mb-2">Order #{id}</h1>
      <p className="text-gray-700 mb-4">Payment was canceled. You can try again.</p>
      <div className="flex gap-3">
        <Link to="/cart" className="text-white bg-blue-600 px-3 py-2 rounded">Return to Cart</Link>
        <Link to="/" className="text-blue-600 px-3 py-2">Continue Shopping</Link>
      </div>
    </div>
  )
}
