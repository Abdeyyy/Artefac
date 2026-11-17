import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const API_URL = 'http://localhost:5000/api/auth'
const TOKEN_KEY = 'artefac_token'
const USER_KEY = 'artefac_user'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

interface AuthResult {
  success: boolean
  message?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResult>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function clearStorage() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem('artefac_auth')
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

function persistSession(token: string, user: AuthUser, rememberMe = true) {
  clearStorage()
  const store = rememberMe ? localStorage : sessionStorage
  store.setItem(TOKEN_KEY, token)
  store.setItem(USER_KEY, JSON.stringify(user))
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(getStoredToken)
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)

  // Verifikasi sesi token ke backend saat aplikasi dimuat
  useEffect(() => {
    const activeToken = getStoredToken()
    if (!activeToken) return

    fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${activeToken}` }
    })
      .then(async (res) => {
        if (res.status === 401) {
          clearStorage()
          setToken(null)
          setUser(null)
          return
        }
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
          }
        }
      })
      .catch(() => {
        // Jika backend sedang mati sementara, pertahankan sesi lokal
      })
  }, [])

  const login = async (email: string, password: string, rememberMe = true): Promise<AuthResult> => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Email atau kata sandi salah.' }
      }

      persistSession(data.token, data.user, rememberMe)
      setToken(data.token)
      setUser(data.user)
      return { success: true }
    } catch {
      return { success: false, message: 'Tidak dapat terhubung ke server autentikasi (localhost:5000).' }
    }
  }

  const logout = () => {
    const activeToken = token || getStoredToken()
    if (activeToken) {
      fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${activeToken}` }
      }).catch(() => {})
    }
    clearStorage()
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(token),
        user,
        token,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
