import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TrafficIntelligence from './pages/TrafficIntelligence'
import SmartWaste from './pages/SmartWaste'
import SmartLighting from './pages/SmartLighting'
import DeviceStatus from './pages/DeviceStatus'
import Settings from './pages/Settings'

// Placeholder pages for new routes
const Analytics = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-dark-900">Analytics</h1>
    <p className="text-gray-600">Advanced data analysis and insights</p>
    <div className="card">Analytics dashboard coming soon...</div>
  </div>
)

const Alerts = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-dark-900">Alerts</h1>
    <p className="text-gray-600">System notifications and warnings</p>
    <div className="card">Alerts management coming soon...</div>
  </div>
)

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="traffic" element={<TrafficIntelligence />} />
        <Route path="waste" element={<SmartWaste />} />
        <Route path="lighting" element={<SmartLighting />} />
        <Route path="devices" element={<DeviceStatus />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Default route - redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'bg-white text-dark-900 border border-gray-200',
            style: {
              background: '#ffffff',
              color: '#111827',
              border: '1px solid #e5e7eb',
            },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
