import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, setAuthToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/jwt/create/', { email, password })
    setToken(data.access)
    localStorage.setItem('token', data.access)
    // For simplicity, store minimal user object
    const u = { email }
    setUser(u)
    localStorage.setItem('user', JSON.stringify(u))
  }

  const register = async (email, password, firstName = '', lastName = '') => {
    await api.post('/auth/users/', {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    })
    // After registration, immediately login
    await login(email, password)
  }

  const logout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuthToken('')
  }

  const value = useMemo(() => ({ token, user, login, register, logout }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
