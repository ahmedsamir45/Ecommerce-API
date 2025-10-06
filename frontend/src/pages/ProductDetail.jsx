import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, mediaUrl } from '../api/client'
import { useCart } from '../state/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [error, setError] = useState('')
  const { addItem } = useCart()

  useEffect(() => {
    api.get(`/api/products/${id}/`)
      .then((res) => setItem(res.data))
      .catch((e) => setError(e.message))
  }, [id])

  if (error) return <p className="text-red-600">{error}</p>
  if (!item) return <p>Loading...</p>

  const img = item.image || (item.images?.[0]?.image) || ''
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        {img ? (
          <img src={mediaUrl(img)} alt={item.name} className="w-full h-80 object-cover rounded" />
        ) : (
          <div className="w-full h-80 bg-gray-100 flex items-center justify-center text-gray-400 rounded">No image</div>
        )}
      </div>
      <div>
        <h1 className="text-2xl font-semibold mb-2">{item.name}</h1>
        <p className="mb-4 text-gray-700">{item.description}</p>
        <div className="text-2xl font-bold mb-4">${item.price}</div>
        <button onClick={() => addItem(item.id, 1)} className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">Add to cart</button>
      </div>
    </div>
  )
}
