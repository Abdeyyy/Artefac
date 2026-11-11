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
import Chatbot from './pages/Chatbot'

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
        <Route path="chatbot" element={<Chatbot />} />
      </Route>
      
      {/* Default route - redirect to login */}
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
