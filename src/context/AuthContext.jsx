import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient, ADMIN_DEV_TOKEN } from '../services/api'
import { toast } from 'sonner'

const AuthContext = createContext(null)

const DEFAULT_ADMIN_USER = {
  id: '1a1580be-8ed0-4e77-b359-91f0763d24d1',
  phone_number: '+2250700000001',
  first_name: 'Awa',
  last_name: 'Koné',
  role: 'COOP_ADMIN',
  cooperative_name: 'Coopérative CAPED',
  cooperative_id: '6b0901f9-d797-4143-a9b7-d3641970eeba',
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('coopia_token')
    if (!saved || saved.includes('demo-token') || !saved.startsWith('eyJ')) {
      localStorage.setItem('coopia_token', ADMIN_DEV_TOKEN)
      return ADMIN_DEV_TOKEN
    }
    return saved
  })

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('coopia_user')
    try {
      if (saved) return JSON.parse(saved)
    } catch {}
    localStorage.setItem('coopia_user', JSON.stringify(DEFAULT_ADMIN_USER))
    return DEFAULT_ADMIN_USER
  })
  const [loading, setLoading] = useState(true)

  // Synchronisation du header Authorization
  useEffect(() => {
    let activeToken = token
    if (!activeToken || activeToken.includes('demo-token') || !activeToken.startsWith('eyJ')) {
      activeToken = ADMIN_DEV_TOKEN
    }
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${activeToken}`
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
