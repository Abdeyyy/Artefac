import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  TrafficCone, 
  Trash2, 
  Sun, 
  Cpu, 
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  User,
  Home,
  Map,
  BarChart3,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: TrafficCone, label: 'Traffic', path: '/traffic' },
    { icon: Trash2, label: 'Waste', path: '/waste' },
    { icon: Sun, label: 'Lighting', path: '/lighting' },
    { icon: Cpu, label: 'Devices', path: '/devices' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: AlertCircle, label: 'Alerts', path: '/alerts' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img 
              src="/images/Logo%20Artefac.webp" 
              alt="Artefac Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-dark-900">ARTEFAC</h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? 'text-blue-500 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                }`}
                onClick={() => {
                  navigate(item.path)
                  onClose()
                }}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-dark-900">Operator</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-dark-900">Dashboard Overview</h2>
            <p className="text-sm text-gray-500">Real-time monitoring & control</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="hidden lg:flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-dark-900">Simpang Artos</p>
              <p className="text-xs text-gray-500">Magelang</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full border-2 border-blue-200"></div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
