import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { register } = useAuth()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(email, password, firstName, lastName)
      navigate('/')
    } catch (e) {
      const msg = e?.response?.data
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }
  }

  return (
    <div className="max-w-sm mx-auto bg-white border rounded p-6">
      <h1 className="text-xl font-semibold mb-4">Register</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="First name" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Last name" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white rounded py-2">Create account</button>
      </form>
    </div>
  )
}
