import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn, Mail, Lock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('operator@artefac.digital')
  const [password, setPassword] = useState('artefac2024')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      login()
      toast.success('Login successful! Redirecting to dashboard...')
      
      setTimeout(() => {
        navigate('/')
      }, 1000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full min-h-screen flex flex-col lg:flex-row"
      >
        {/* Left side - Illustration */}
        <div className="lg:w-1/2 relative bg-gradient-to-br from-blue-600 to-blue-400 min-h-[400px] lg:min-h-screen flex items-center justify-center overflow-hidden">
          
          {/* Image Container */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="/images/mascot.webp" 
              alt="Smart City Monitoring" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback illustration
                e.currentTarget.style.display = 'none'
                const fallback = document.getElementById('fallback-illustration')
                if (fallback) fallback.style.display = 'flex'
              }}
            />
            <div id="fallback-illustration" className="hidden absolute inset-0 flex-col items-center justify-center text-center p-8">
              <div className="text-white/80 text-sm mb-4">
                <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                <p>Smart traffic monitoring system</p>
                <p>Real-time data visualization</p>
                <p>AI-powered predictions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-sm">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl mb-4">
                <div className="text-white text-xl font-bold">A</div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">ARTEFAC</h1>
              <p className="text-gray-600 text-sm">Smart City Monitoring</p>
            </div>

            {/* Login Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
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
                    placeholder="operator@artefac.digital"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium text-gray-700">Demo Credentials</span>
                </p>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>Email: operator@artefac.digital</p>
                  <p>Password: artefac2024</p>
                </div>
                <button
                  onClick={() => {
                    setEmail('operator@artefac.digital')
                    setPassword('artefac2024')
                    toast.success('Demo credentials filled!')
                  }}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                >
                  Auto-fill Demo Credentials
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                © 2024 ARTEFAC System
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
