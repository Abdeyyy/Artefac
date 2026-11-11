import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Trash2, 
  AlertCircle, 
  TrendingUp,
  RefreshCw,
  BarChart3,
  Clock,
  ChevronRight,
  Wifi,
  WifiOff
} from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts'
import { useSocketTelemetry } from '../utils/useSocketTelemetry'

interface FullnessPoint { time: string; fullness: number }

const collectionSchedule = [
  { bin: 'Simpang Artos', lastCollected: 'Today 08:30', nextSchedule: 'Tomorrow 08:30', priority: 'High' },
  { bin: 'North Side', lastCollected: 'Yesterday 14:00', nextSchedule: 'Today 16:00', priority: 'High' },
  { bin: 'South Gate', lastCollected: 'Today 10:15', nextSchedule: 'Tomorrow 10:15', priority: 'Medium' },
  { bin: 'East Wing', lastCollected: '2 days ago', nextSchedule: 'Tomorrow 09:00', priority: 'Low' },
  { bin: 'West Side', lastCollected: 'Today 07:45', nextSchedule: 'Tomorrow 07:45', priority: 'Low' },
]

function getBinStatusLabel(density: number): string {
  if (density >= 80) return 'Full'
  if (density >= 50) return 'Near Full'
  return 'Normal'
}

function getStatusColor(label: string) {
  if (label === 'Full') return { badge: 'badge-danger', text: 'text-red-600', bg: 'bg-red-50/70 border-red-200' }
  if (label === 'Near Full') return { badge: 'badge-warning', text: 'text-orange-600', bg: 'bg-amber-50/70 border-amber-200' }
  return { badge: 'badge-success', text: 'text-green-600', bg: 'bg-green-50/70 border-green-200' }
}

export default function SmartWaste() {
  const { telemetry, isConnected } = useSocketTelemetry()
  const [fullnessHistory, setFullnessHistory] = useState<FullnessPoint[]>([])
  const historyRef = useRef<FullnessPoint[]>([])

  useEffect(() => {
    const now = new Date()
    const label = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const next = [...historyRef.current, { time: label, fullness: telemetry.binDensity }].slice(-15)
    historyRef.current = next
    setFullnessHistory([...next])
  }, [telemetry])

  const binStatusLabel = getBinStatusLabel(telemetry.binDensity)
  const statusColors = getStatusColor(binStatusLabel)
  const distanceCm = Math.round((1 - telemetry.binDensity / 100) * 100)

  const statusDistribution = [
    { name: 'Fullness', value: telemetry.binDensity, color: telemetry.binDensity >= 80 ? '#ef4444' : telemetry.binDensity >= 50 ? '#f59e0b' : '#10b981' },
    { name: 'Remaining', value: 100 - telemetry.binDensity, color: '#e5e7eb' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Smart Waste Management</h1>
          <p className="text-gray-500">Ultrasonic sensor monitoring and waste level tracking</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            isConnected ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}>
            {isConnected ? <><Wifi className="w-3.5 h-3.5" /><span>Live</span></> : <><WifiOff className="w-3.5 h-3.5" /><span>Offline</span></>}
          </div>
          <button className="btn-secondary flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>Dispatch Team</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Bin Fullness</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">{telemetry.binDensity}%</h3>
                {isConnected && <span className="text-sm text-green-600 animate-pulse">●</span>}
              </div>
              <p className="text-sm text-gray-500 mt-2">Simpang Artos bin</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Bin Status</p>
              <div className="flex items-baseline space-x-2">
                <h3 className={`text-2xl font-bold ${statusColors.text}`}>{binStatusLabel}</h3>
              </div>
              <p className="text-sm text-gray-500 mt-2">Lid: {telemetry.binStatus}</p>
            </div>
            <div className={`p-3 rounded-lg ${binStatusLabel === 'Full' ? 'bg-red-50' : 'bg-orange-50'}`}>
              <AlertCircle className={`w-6 h-6 ${binStatusLabel === 'Full' ? 'text-red-600' : 'text-orange-600'}`} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Distance to Sensor</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">{distanceCm} cm</h3>
                <span className="text-sm text-blue-600">Ultrasonic</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Remaining capacity</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Bin Monitor + History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Bin Visual */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Live Bin Monitor</h3>
              <p className="text-sm text-gray-500">Simpang Artos waste bin</p>
            </div>
            {isConnected && <span className="text-xs text-green-600 font-medium animate-pulse">● Live</span>}
          </div>
          <div className="flex items-center justify-center space-x-8">
            {/* Bin visualizer */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-40 border-4 border-gray-400 rounded-b-xl bg-gray-100 overflow-hidden">
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 ${
                    telemetry.binDensity >= 80 ? 'bg-red-400' : telemetry.binDensity >= 50 ? 'bg-orange-400' : 'bg-green-400'
                  }`}
                  animate={{ height: `${telemetry.binDensity}%` }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white drop-shadow z-10">{telemetry.binDensity}%</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center">
                <div>Lid: <span className={`font-semibold ${telemetry.binStatus === 'OPEN' ? 'text-orange-600' : 'text-green-600'}`}>{telemetry.binStatus}</span></div>
              </div>
            </div>
            {/* Stats */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span className={`badge ${statusColors.badge}`}>{binStatusLabel}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fullness</p>
                <p className={`text-lg font-bold ${statusColors.text}`}>{telemetry.binDensity}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Free Space</p>
                <p className="text-lg font-bold text-dark-900">{distanceCm} cm</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Lid State</p>
                <p className={`text-sm font-semibold ${telemetry.binStatus === 'OPEN' ? 'text-orange-600' : 'text-green-600'}`}>{telemetry.binStatus}</p>
              </div>
            </div>
          </div>
          {/* Fill bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>0%</span><span>Fill Level</span><span>100%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full">
              <motion.div
                className={`h-3 rounded-full ${telemetry.binDensity >= 80 ? 'bg-red-500' : telemetry.binDensity >= 50 ? 'bg-orange-400' : 'bg-green-500'}`}
                animate={{ width: `${telemetry.binDensity}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500 text-right">
              Thresholds: Normal (0–49%), Near Full (50–79%), Full (≥80%)
            </div>
          </div>
        </div>

        {/* Fullness History Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Fullness History</h3>
              <p className="text-sm text-gray-500">Rolling sensor readings</p>
            </div>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fullnessHistory}>
                <defs>
                  <linearGradient id="colorFullness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '10px' }} tick={false} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', color: '#111827' }} />
                <Area type="monotone" dataKey="fullness" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorFullness)" name="Fullness %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Distribution */}
          <div className="mt-4 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDistribution} layout="vertical">
                <XAxis type="number" domain={[0, 100]} style={{ fontSize: '10px' }} />
                <YAxis type="category" dataKey="name" style={{ fontSize: '10px' }} width={60} />
                <Tooltip contentStyle={{ fontSize: '12px', color: '#111827' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {statusDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Collection Schedule */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Collection Schedule</h3>
            <p className="text-sm text-gray-500">Waste collection timetable and priorities</p>
          </div>
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Bin Location</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Last Collected</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Next Schedule</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Priority</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {collectionSchedule.map((schedule) => (
                <tr key={schedule.bin} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-dark-900">{schedule.bin}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-600 text-sm">{schedule.lastCollected}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-dark-900 font-medium text-sm">{schedule.nextSchedule}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${
                      schedule.priority === 'High' ? 'badge-danger' :
                      schedule.priority === 'Medium' ? 'badge-warning' :
                      'badge-success'
                    }`}>
                      {schedule.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center space-x-1">
                      <span>Schedule</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Alert */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Waste Management Alerts</h3>
            <p className="text-sm text-gray-500">System notifications and recommendations</p>
          </div>
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <div className="space-y-4">
          {/* Dynamic alert based on live density */}
          <div className={`p-4 rounded-xl border ${statusColors.bg}`}>
            <div className="flex items-start space-x-3">
              <AlertCircle className={`w-5 h-5 mt-0.5 ${statusColors.text}`} />
              <div className="flex-1">
                <h4 className={`font-semibold mb-1 ${binStatusLabel === 'Full' ? 'text-red-950' : binStatusLabel === 'Near Full' ? 'text-amber-950' : 'text-green-950'}`}>
                  {binStatusLabel === 'Full' ? 'Immediate Collection Required' : binStatusLabel === 'Near Full' ? 'Bin Approaching Capacity' : 'Bin Status Normal'}
                </h4>
                <p className={`text-sm ${binStatusLabel === 'Full' ? 'text-red-800' : binStatusLabel === 'Near Full' ? 'text-amber-800' : 'text-green-800'}`}>
                  Simpang Artos bin is {telemetry.binDensity}% full. {
                    binStatusLabel === 'Full' ? 'Schedule collection team immediately.' :
                    binStatusLabel === 'Near Full' ? 'Consider scheduling collection within 4 hours.' :
                    'Next collection can proceed as scheduled.'
                  }
                  {telemetry.binStatus === 'OPEN' && ' ⚠️ Bin lid is currently OPEN.'}
                </p>
                <div className={`mt-2 text-xs font-medium ${statusColors.text}`}>
                  Density: {telemetry.binDensity}% • Lid: {telemetry.binStatus} • Status: {binStatusLabel}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-950 mb-1">Maintenance Schedule</h4>
                <p className="text-sm text-blue-800">
                  Next scheduled maintenance for all waste sensors is in 7 days.
                  Prepare replacement batteries and perform connectivity tests.
                </p>
                <div className="mt-2 text-xs font-medium text-blue-700">
                  Schedule: Next week • Devices: All • Duration: 2 hours
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
