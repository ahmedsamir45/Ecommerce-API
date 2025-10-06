import { Link } from 'react-router-dom'
import { api, mediaUrl } from '../api/client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    api.get('/api/products/?page_size=6')
      .then((res) => { if (mounted) setFeatured(res.data.results || res.data) })
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-xl p-8 md:p-12 mb-8 wow animate__animated animate__fadeIn">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">Shop the Latest Electronics</h1>
            <p className="mt-3 text-white/90">Unbeatable prices. Fast delivery. Trusted by thousands.</p>
            <div className="mt-5 flex gap-3">
              <Link to="/" className="bg-white text-indigo-700 font-semibold px-5 py-3 rounded shadow hover:shadow-md">
                <i className="fa-solid fa-bag-shopping mr-2"></i>Start Shopping
              </Link>
              <a href="#featured" className="bg-black/20 hover:bg-black/30 px-5 py-3 rounded">
                <i className="fa-regular fa-star mr-2"></i>Featured
              </a>
            </div>
          </div>
          <div className="flex-1 text-center">
            <i className="fa-solid fa-laptop-code text-7xl md:text-8xl drop-shadow-lg"></i>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: 'fa-truck-fast', title: 'Fast Delivery', text: 'Get items at your door quickly' },
          { icon: 'fa-shield-halved', title: 'Secure Payments', text: 'Protected and encrypted checkout' },
          { icon: 'fa-rotate', title: 'Easy Returns', text: 'Hassle-free returns within 7 days' },
        ].map((b, idx) => (
          <div key={b.title} className={`bg-white border rounded p-5 flex items-start gap-4 wow animate__animated animate__fadeInUp`} style={{ animationDelay: `${idx * 0.1}s` }}>
            <i className={`fa-solid ${b.icon} text-2xl text-indigo-600`}></i>
            <div>
              <div className="font-semibold">{b.title}</div>
              <div className="text-sm text-gray-600">{b.text}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Featured */}
      <section id="featured" className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Featured</h2>
          <Link to="/" className="text-indigo-600 hover:underline">See all</Link>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featured.map((p, idx) => {
              const img = p.image || (p.images?.[0]?.image) || ''
              return (
                <Link to={`/products/${p.id}`} key={p.id} className="block bg-white border rounded overflow-hidden hover:shadow-lg transition-shadow wow animate__animated animate__fadeInUp" style={{ animationDelay: `${idx * 0.05}s` }}>
                  {img ? (
                    <img src={mediaUrl(img)} alt={p.name} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
                  )}
                  <div className="p-4">
                    <div className="font-medium line-clamp-1">{p.name}</div>
                    <div className="mt-1 text-lg font-semibold">${Number(p.price).toFixed(2)}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
