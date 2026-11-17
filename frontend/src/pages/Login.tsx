import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn, Mail, Lock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    const result = await login(email, password, rememberMe)
    setLoading(false)

    if (!result.success) {
      const msg = result.message || 'Email atau kata sandi salah.'
      setErrorMsg(msg)
      toast.error(msg)
      return
    }

    toast.success('Login berhasil! Mengalihkan ke dasbor...')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full min-h-screen flex flex-col lg:flex-row"
      >
        {/* Sisi Kiri - Ilustrasi */}
        <div className="lg:w-1/2 relative bg-gradient-to-br from-blue-600 to-blue-400 min-h-[400px] lg:min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="/images/mascot.webp" 
              alt="Pemantauan Kota Pintar" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const fallback = document.getElementById('fallback-illustration')
                if (fallback) fallback.style.display = 'flex'
              }}
            />
            <div id="fallback-illustration" className="hidden absolute inset-0 flex-col items-center justify-center text-center p-8">
              <div className="text-white/80 text-sm mb-4">
                <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                <p>Sistem pemantauan lalu lintas pintar</p>
                <p>Visualisasi data real-time</p>
                <p>Prediksi berbasis kecerdasan buatan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sisi Kanan - Form Masuk */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-sm">
            {/* Logo Mobile */}
            <div className="lg:hidden mb-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl mb-4">
                <div className="text-white text-xl font-bold">A</div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">ARTEFAC</h1>
              <p className="text-gray-600 text-sm">Pemantauan Kota Pintar</p>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang Kembali</h2>
              <p className="text-gray-600">Masuk ke akun operator ARTEFAC</p>
            </div>

            {/* Pesan Error */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center space-x-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Masuk */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              {/* Input Kata Sandi */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Ingat Saya */}
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                  Ingat saya (7 hari)
                </label>
              </div>

              {/* Tombol Masuk */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sedang masuk...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Masuk</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                © 2026 Sistem ARTEFAC
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
