import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, mediaUrl } from '../api/client'
import { useCart } from '../state/CartContext'

export default function Products() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addItem, hasProduct, removeProduct } = useCart()

  useEffect(() => {
    let mounted = true
    api.get('/api/products/')
      .then((res) => { if (mounted) { setItems(res.data.results || res.data) } })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((p) => {
          const img = p.image || (p.images?.[0]?.image) || ''
          const inCart = hasProduct(p.id)
          return (
            <div key={p.id} className="bg-white border rounded shadow-sm overflow-hidden flex flex-col">
              <Link to={`/products/${p.id}`} className="block">
                {img ? (
                  <img src={mediaUrl(img)} alt={p.name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
                )}
              </Link>
              <div className="p-4 flex-1 flex flex-col">
                <Link to={`/products/${p.id}`} className="font-medium line-clamp-1 hover:text-blue-700">{p.name}</Link>
                <div className="mt-1 text-lg font-semibold">${p.price}</div>
                {inCart ? (
                  <button onClick={() => removeProduct(p.id)} className="mt-auto bg-red-600 text-white rounded px-3 py-2 hover:bg-red-700">Remove</button>
                ) : (
                  <button onClick={() => addItem(p.id, 1)} className="mt-auto bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700">Add to cart</button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
