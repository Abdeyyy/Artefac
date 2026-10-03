import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Moon,
  Sun,
  RefreshCw,
  TrafficCone,
  Save,
  ChevronRight,
  Shield,
  Database
} from 'lucide-react'

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    alerts: true,
    reports: false,
  })
  const [trafficSettings, setTrafficSettings] = useState({
    minGreenTime: 15,
    maxGreenTime: 60,
    densityThreshold: 70,
    adaptiveControl: true,
  })

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleTrafficSettingChange = (key: keyof typeof trafficSettings, value: number | boolean) => {
    setTrafficSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = () => {
    // In real app, this would save to backend
    alert('Settings saved successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
          <p className="text-dark-400">System configuration and user preferences</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Account Settings */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Account Settings</h3>
            <p className="text-sm text-dark-400">Personal information and security</p>
          </div>
          <User className="w-5 h-5 text-primary-400" />
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark-300 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className="input-field w-full"
                placeholder="Operator Name"
                defaultValue="System Operator"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="input-field w-full"
                placeholder="operator@artefac.digital"
                defaultValue="operator@artefac.digital"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-dark-300 mb-2">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                className="input-field w-full"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-dark-300 mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className="input-field w-full"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-300 mb-2">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="input-field w-full"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-6 border-t border-dark-800">
            <button className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center space-x-1">
              <span>Advanced Security Settings</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">System Preferences</h3>
              <p className="text-sm text-dark-400">Interface and behavior settings</p>
            </div>
            <SettingsIcon className="w-5 h-5 text-warning-400" />
          </div>

          <div className="space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Theme</p>
                <p className="text-sm text-dark-400">Switch between light and dark mode</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-14 h-8 rounded-full relative transition-colors ${
                  darkMode ? 'bg-primary-600' : 'bg-dark-700'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white flex items-center justify-center transition-transform ${
                  darkMode ? 'translate-x-7' : 'translate-x-1'
                }`}>
                  {darkMode ? (
                    <Moon className="w-4 h-4 text-dark-800" />
                  ) : (
                    <Sun className="w-4 h-4 text-dark-800" />
                  )}
                </div>
              </button>
            </div>

            {/* Notifications */}
            <div>
              <p className="font-medium text-white mb-4">Notifications</p>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-sm text-dark-400">
                        {key === 'email' && 'Receive email notifications'}
                        {key === 'push' && 'Browser push notifications'}
                        {key === 'alerts' && 'System alert notifications'}
                        {key === 'reports' && 'Daily and weekly reports'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        value ? 'bg-success-500' : 'bg-dark-700'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        value ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Refresh */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Data Refresh Rate</p>
                <p className="text-sm text-dark-400">Auto-refresh interval for real-time data</p>
              </div>
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-dark-400" />
                <select className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>5 seconds</option>
                  <option>10 seconds</option>
                  <option>30 seconds</option>
                  <option>1 minute</option>
                  <option>5 minutes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Traffic Settings */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Traffic Control</h3>
              <p className="text-sm text-dark-400">Adaptive traffic light parameters</p>
            </div>
            <TrafficCone className="w-5 h-5 text-danger-400" />
          </div>

          <div className="space-y-6">
            {/* Minimum Green Time */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-white">Minimum Green Time</label>
                <span className="text-primary-400 font-medium">{trafficSettings.minGreenTime}s</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={trafficSettings.minGreenTime}
                onChange={(e) => handleTrafficSettingChange('minGreenTime', parseInt(e.target.value))}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500"
              />
              <div className="flex justify-between text-xs text-dark-400 mt-1">
                <span>5s</span>
                <span>Safety minimum</span>
                <span>30s</span>
              </div>
            </div>

            {/* Maximum Green Time */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-white">Maximum Green Time</label>
                <span className="text-primary-400 font-medium">{trafficSettings.maxGreenTime}s</span>
              </div>
              <input
                type="range"
                min="30"
                max="120"
                step="5"
                value={trafficSettings.maxGreenTime}
                onChange={(e) => handleTrafficSettingChange('maxGreenTime', parseInt(e.target.value))}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500"
              />
              <div className="flex justify-between text-xs text-dark-400 mt-1">
                <span>30s</span>
                <span>Traffic flow limit</span>
                <span>120s</span>
              </div>
            </div>

            {/* Density Threshold */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-white">Density Threshold</label>
                <span className="text-primary-400 font-medium">{trafficSettings.densityThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                step="5"
                value={trafficSettings.densityThreshold}
                onChange={(e) => handleTrafficSettingChange('densityThreshold', parseInt(e.target.value))}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500"
              />
              <div className="flex justify-between text-xs text-dark-400 mt-1">
                <span>50%</span>
                <span>Congestion level</span>
                <span>90%</span>
              </div>
            </div>

            {/* Adaptive Control */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Adaptive Control</p>
                <p className="text-sm text-dark-400">Enable AI-based traffic optimization</p>
              </div>
              <button
                onClick={() => handleTrafficSettingChange('adaptiveControl', !trafficSettings.adaptiveControl)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  trafficSettings.adaptiveControl ? 'bg-success-500' : 'bg-dark-700'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  trafficSettings.adaptiveControl ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="pt-6 border-t border-dark-800">
              <p className="text-sm text-dark-400 mb-4">
                <Shield className="w-4 h-4 inline mr-1" />
                <span className="font-medium text-white">Safety Note:</span> Traffic control parameters affect public safety.
                Changes should be made by authorized personnel only.
              </p>
              <button className="text-danger-400 hover:text-danger-300 text-sm font-medium flex items-center space-x-1">
                <span>Reset to Default Values</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Data Management</h3>
            <p className="text-sm text-dark-400">Data retention and export settings</p>
          </div>
          <Database className="w-5 h-5 text-success-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Data Retention Period
            </label>
            <select className="input-field w-full">
              <option>30 days</option>
              <option>90 days</option>
              <option>180 days</option>
              <option>1 year</option>
              <option>Indefinite</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Auto Backup Schedule
            </label>
            <select className="input-field w-full">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Disabled</option>
            </select>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-dark-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-medium text-white mb-1">Export Data</p>
              <p className="text-sm text-dark-400">Download system data for analysis</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-secondary">
                Export CSV
              </button>
              <button className="btn-secondary">
                Export JSON
              </button>
              <button className="btn-primary">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">System Information</h3>
            <p className="text-sm text-dark-400">ARTEFAC system details and version</p>
          </div>
          <SettingsIcon className="w-5 h-5 text-primary-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-700">
            <p className="text-sm text-dark-400 mb-1">System Version</p>
            <p className="text-xl font-bold text-white">ARTEFAC v2.1.4</p>
            <p className="text-xs text-dark-400 mt-2">Latest stable release</p>
          </div>

          <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-700">
            <p className="text-sm text-dark-400 mb-1">Last Updated</p>
            <p className="text-xl font-bold text-white">2024-03-15</p>
            <p className="text-xs text-dark-400 mt-2">System maintenance completed</p>
          </div>

          <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-700">
            <p className="text-sm text-dark-400 mb-1">Database Size</p>
            <p className="text-xl font-bold text-white">2.4 GB</p>
            <p className="text-xs text-dark-400 mt-2">Sensor data and logs</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-dark-800">
          <button className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center space-x-1">
            <span>View System Logs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
