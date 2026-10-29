import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient } from '../services/api'
import { toast } from 'sonner'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('coopia_token') || null)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('coopia_user')
    try {
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // Synchronisation du header Authorization
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete apiClient.defaults.headers.common['Authorization']
    }
    setLoading(false)
  }, [token])

  // Vérifier et rafraîchir le profil utilisateur si token présent
  const refreshProfile = async () => {
    if (!token) return
    try {
      const res = await apiClient.get('/auth/me')
      if (res.data?.user) {
        setUser(res.data.user)
        localStorage.setItem('coopia_user', JSON.stringify(res.data.user))
      }
    } catch (e) {
      console.warn('Erreur rafraîchissement profil:', e)
    }
  }

  const login = (accessToken, userData) => {
    setToken(accessToken)
    setUser(userData)
    localStorage.setItem('coopia_token', accessToken)
    localStorage.setItem('coopia_user', JSON.stringify(userData))
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('coopia_token')
    localStorage.removeItem('coopia_user')
    delete apiClient.defaults.headers.common['Authorization']
    toast.success('Déconnexion réussie', {
      description: 'Session gérant fermée en toute sécurité.',
    })
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
