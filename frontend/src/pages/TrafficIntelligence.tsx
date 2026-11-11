import { useState, useEffect, useRef } from 'react'
import { 
  TrafficCone,
  Clock,
  TrendingUp,
  AlertCircle,
  Cpu,
  Zap,
  RefreshCw,
  ChevronRight,
  Car,
  MapPin,
  Wifi,
  WifiOff
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useSocketTelemetry } from '../utils/useSocketTelemetry'

interface HistoryPoint {
  time: string
  vehicles: number
  density: number
}

function getDensityLabel(val: number) {
  if (val >= 70) return 'High'
  if (val >= 30) return 'Medium'
  return 'Low'
}

function getDensityColor(label: string) {
  if (label === 'High') return 'badge-danger'
  if (label === 'Medium') return 'badge-warning'
  return 'badge-success'
}

const aiPredictions = [
  { minute: 5, predictedVehicles: 85, confidence: 88 },
  { minute: 10, predictedVehicles: 92, confidence: 82 },
  { minute: 15, predictedVehicles: 78, confidence: 76 },
  { minute: 20, predictedVehicles: 65, confidence: 85 },
  { minute: 25, predictedVehicles: 58, confidence: 79 },
]

export default function TrafficIntelligence() {
  const { telemetry, isConnected } = useSocketTelemetry()
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const historyRef = useRef<HistoryPoint[]>([])

  // Rolling history buffer (max 20 points)
  useEffect(() => {
    const total = Object.values(telemetry.lanes).reduce((a, b) => a + b, 0)
    const avgDensity = total / 4
    const now = new Date()
    const label = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    const next = [...historyRef.current, { time: label, vehicles: total, density: Math.round(avgDensity) }].slice(-20)
    historyRef.current = next
    setHistory([...next])
  }, [telemetry])

  const trafficSensors = [
    { id: 1, laneKey: 'utara' as const, direction: 'Magelang', vehicles: telemetry.lanes.utara, density: getDensityLabel(telemetry.lanes.utara), greenTime: telemetry.activeLane === 'utara' ? telemetry.greenDuration : Math.round(telemetry.greenDuration * 0.6), status: 'Active' },
    { id: 2, laneKey: 'timur' as const, direction: 'Purworejo', vehicles: telemetry.lanes.timur, density: getDensityLabel(telemetry.lanes.timur), greenTime: telemetry.activeLane === 'timur' ? telemetry.greenDuration : Math.round(telemetry.greenDuration * 0.7), status: 'Active' },
    { id: 3, laneKey: 'selatan' as const, direction: 'Yogyakarta', vehicles: telemetry.lanes.selatan, density: getDensityLabel(telemetry.lanes.selatan), greenTime: telemetry.activeLane === 'selatan' ? telemetry.greenDuration : Math.round(telemetry.greenDuration * 0.8), status: 'Active' },
    { id: 4, laneKey: 'barat' as const, direction: 'Artos', vehicles: telemetry.lanes.barat, density: getDensityLabel(telemetry.lanes.barat), greenTime: telemetry.activeLane === 'barat' ? telemetry.greenDuration : Math.round(telemetry.greenDuration * 0.5), status: 'Active' },
  ]

  const totalVehicles = Object.values(telemetry.lanes).reduce((a, b) => a + b, 0)
  const peakDensity = Math.max(...Object.values(telemetry.lanes))
  const activeLaneLabel = { utara: 'Magelang', selatan: 'Yogyakarta', timur: 'Purworejo', barat: 'Artos' }[telemetry.activeLane]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Traffic Intelligence</h1>
          <p className="text-gray-600">Real-time monitoring and AI-powered traffic control</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Live badge */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            isConnected ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}>
            {isConnected ? <><Wifi className="w-3.5 h-3.5" /><span>Live</span></> : <><WifiOff className="w-3.5 h-3.5" /><span>Offline</span></>}
          </div>
          <button className="btn-secondary flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Manual Control</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Vehicles</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">{totalVehicles}</h3>
                {isConnected && <span className="text-sm text-green-600 animate-pulse">●</span>}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Sensors</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">4/4</h3>
                <span className="text-sm text-green-600">All online</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <Cpu className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Green Duration</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">{telemetry.greenDuration}s</h3>
                <span className="text-sm text-blue-600">Adaptive</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Peak Density</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">{peakDensity}%</h3>
                <span className={`text-sm font-medium ${peakDensity >= 70 ? 'text-red-600' : peakDensity >= 30 ? 'text-orange-600' : 'text-green-600'}`}>
                  {getDensityLabel(peakDensity)}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Lane Banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4 flex items-center space-x-4">
        <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
        <div>
          <span className="text-sm font-semibold text-green-800">Active Green Light: </span>
          <span className="text-sm text-green-700">{activeLaneLabel} ({telemetry.activeLane})</span>
          <span className="ml-4 text-sm text-green-600">Duration: {telemetry.greenDuration}s</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Traffic History */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Live Traffic History</h3>
              <p className="text-sm text-gray-500">Rolling total vehicle density</p>
            </div>
            {isConnected && <span className="text-xs text-green-600 font-medium animate-pulse">● Streaming</span>}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '10px' }} tick={false} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', color: '#111827' }} />
                <Line type="monotone" dataKey="vehicles" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total Vehicles" />
                <Line type="monotone" dataKey="density" stroke="#10b981" strokeWidth={2} dot={false} name="Avg Density" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span>Total Vehicles</span></div>
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Density Level</span></div>
          </div>
        </div>

        {/* AI Predictions */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">AI Predictions</h3>
              <p className="text-sm text-gray-500">Traffic density forecast</p>
            </div>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiPredictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="minute" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="predictedVehicles" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Next 5 minutes: 85 vehicles predicted (88% confidence)</p>
          </div>
        </div>
      </div>

      {/* Sensor Data Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Sensor Monitoring</h3>
            <p className="text-sm text-gray-500">4 infrared sensors — real-time data</p>
          </div>
          <TrafficCone className="w-5 h-5 text-blue-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Direction</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Density %</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Level</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Green Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Signal</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trafficSensors.map((sensor) => {
                const isActive = sensor.laneKey === telemetry.activeLane
                return (
                  <tr key={sensor.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isActive ? 'bg-green-50/60' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-dark-900">{sensor.direction}</span>
                        {isActive && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Active</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 rounded-full bg-gray-200">
                          <div
                            className={`h-2 rounded-full ${sensor.vehicles >= 70 ? 'bg-red-500' : sensor.vehicles >= 30 ? 'bg-orange-400' : 'bg-green-500'}`}
                            style={{ width: `${sensor.vehicles}%` }}
                          ></div>
                        </div>
                        <span className="text-dark-900 font-medium text-sm">{sensor.vehicles}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getDensityColor(sensor.density)}`}>{sensor.density}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-dark-900 font-medium">{sensor.greenTime}s</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`flex items-center space-x-1.5`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></div>
                        <span className={`text-sm font-medium ${isActive ? 'text-green-600' : 'text-red-500'}`}>{isActive ? 'Green' : 'Red'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center space-x-1">
                        <span>Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
