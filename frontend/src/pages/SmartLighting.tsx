import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Sun, 
  Moon, 
  Zap, 
  RefreshCw,
  TrendingUp,
  Clock,
  AlertCircle,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Wifi,
  WifiOff
} from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useSocketTelemetry } from '../utils/useSocketTelemetry'

interface IntensityPoint { time: string; intensity: number; pwm: number }

const statusDistributionStatic = [
  { name: 'ON', value: 80, color: '#f59e0b' },
  { name: 'OFF', value: 20, color: '#64748b' },
]

const energyUsage = [
  { hour: '18-19', consumption: 45, cost: 3200 },
  { hour: '19-20', consumption: 68, cost: 4800 },
  { hour: '20-21', consumption: 72, cost: 5100 },
  { hour: '21-22', consumption: 70, cost: 5000 },
  { hour: '22-23', consumption: 65, cost: 4600 },
  { hour: '23-00', consumption: 60, cost: 4200 },
]

export default function SmartLighting() {
  const [autoMode, setAutoMode] = useState(true)
  const { telemetry, isConnected } = useSocketTelemetry()
  const [intensityHistory, setIntensityHistory] = useState<IntensityPoint[]>([])
  const historyRef = useRef<IntensityPoint[]>([])

  useEffect(() => {
    const lux = telemetry.lampPwm * 5
    const now = new Date()
    const label = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const next = [...historyRef.current, { time: label, intensity: lux, pwm: telemetry.lampPwm }].slice(-15)
    historyRef.current = next
    setIntensityHistory([...next])
  }, [telemetry])

  const lux = telemetry.lampPwm * 5
  const lampIsOn = telemetry.lampPwm > 30
  const totalConsumption = energyUsage.reduce((sum, h) => sum + h.consumption, 0)

  const lightingSensors = [
    { id: 1, name: 'Simpang Artos', intensity: lux, threshold: 300, status: lampIsOn ? 'ON' : 'OFF', mode: autoMode ? 'Auto' : 'Manual', lastUpdated: 'Just now' },
    { id: 2, name: 'North Street', intensity: Math.round(lux * 0.9), threshold: 300, status: lampIsOn ? 'ON' : 'OFF', mode: 'Auto', lastUpdated: '1 min ago' },
    { id: 3, name: 'East Gate', intensity: Math.round(lux * 1.1), threshold: 300, status: Math.round(lux * 1.1) < 300 ? 'ON' : 'OFF', mode: 'Auto', lastUpdated: '2 min ago' },
    { id: 4, name: 'West Side', intensity: Math.round(lux * 0.8), threshold: 300, status: lampIsOn ? 'ON' : 'OFF', mode: autoMode ? 'Auto' : 'Manual', lastUpdated: '3 min ago' },
  ]

  const lightsOn = lightingSensors.filter(s => s.status === 'ON').length
  const averageIntensity = lightingSensors.reduce((s, x) => s + x.intensity, 0) / lightingSensors.length

  const sdynamic = [
    { name: 'ON', value: lightsOn * 25, color: '#f59e0b' },
    { name: 'OFF', value: (lightingSensors.length - lightsOn) * 25, color: '#64748b' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Smart Lighting Control</h1>
          <p className="text-gray-500">LDR sensor monitoring and automated lighting management</p>
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
          <button
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
              autoMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-dark-800 border border-gray-300'
            }`}
            onClick={() => setAutoMode(!autoMode)}
          >
            {autoMode ? (
              <><ToggleRight className="w-5 h-5" /><span>Auto Mode</span></>
            ) : (
              <><ToggleLeft className="w-5 h-5" /><span>Manual Mode</span></>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Average Intensity</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">{averageIntensity.toFixed(0)} lux</h3>
                {isConnected && <span className="text-sm text-green-600 animate-pulse">●</span>}
              </div>
              <p className="text-sm text-gray-500 mt-2">Threshold: 300 lux</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Sun className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Lights Active</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">{lightsOn}/{lightingSensors.length}</h3>
                <span className={`text-sm font-semibold ${lampIsOn ? 'text-orange-600' : 'text-blue-600'}`}>
                  {lampIsOn ? 'ON' : 'OFF'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">PWM: {telemetry.lampPwm}%</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              {lampIsOn ? <Sun className="w-6 h-6 text-orange-500" /> : <Moon className="w-6 h-6 text-blue-500" />}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Consumption</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">{totalConsumption} kWh</h3>
                <span className="text-sm font-semibold text-green-600">-12%</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Today's energy usage</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Live PWM indicator */}
      <div className={`rounded-xl px-6 py-4 flex items-center space-x-4 ${lampIsOn ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-gray-200'}`}>
        <div className={`w-4 h-4 rounded-full ${lampIsOn ? 'bg-orange-400 animate-pulse' : 'bg-gray-400'}`}></div>
        <div>
          <span className={`text-sm font-semibold ${lampIsOn ? 'text-orange-800' : 'text-gray-700'}`}>Lamp PWM: {telemetry.lampPwm}% </span>
          <span className={`text-sm ${lampIsOn ? 'text-orange-700' : 'text-gray-600'}`}>≈ {lux} lux — {lampIsOn ? 'Lamp is ON' : 'Lamp is OFF'}</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intensity History */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Live Intensity History</h3>
              <p className="text-sm text-gray-500">Rolling lux readings (PWM × 5)</p>
            </div>
            {isConnected && <span className="text-xs text-green-600 font-medium animate-pulse">● Streaming</span>}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={intensityHistory}>
                <defs>
                  <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '10px' }} tick={false} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, 500]} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', color: '#111827' }} />
                <Area type="monotone" dataKey="intensity" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorIntensity)" name="Intensity (lux)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy Usage */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Energy Usage (Hourly)</h3>
              <p className="text-sm text-gray-500">kWh consumption today</p>
            </div>
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={energyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="consumption" fill="#f59e0b" radius={[4, 4, 0, 0]} name="kWh" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sensor Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Lighting Sensors</h3>
            <p className="text-sm text-gray-500">LDR sensor real-time readings</p>
          </div>
          <Sun className="w-5 h-5 text-orange-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Location</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Intensity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Threshold</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Mode</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lightingSensors.map((sensor) => (
                <tr key={sensor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-dark-900">{sensor.name}</div>
                    <div className="text-xs text-gray-400">{sensor.lastUpdated}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-dark-900 font-medium">{sensor.intensity} lux</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-dark-900 font-medium text-sm">{sensor.threshold} lux</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${sensor.status === 'ON' ? 'bg-orange-400 animate-pulse' : 'bg-gray-400'}`}></div>
                      <span className={`badge ${sensor.status === 'ON' ? 'badge-warning' : 'badge-info'}`}>{sensor.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${sensor.mode === 'Auto' ? 'badge-success' : 'badge-warning'}`}>{sensor.mode}</span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center space-x-1">
                      <span>Control</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Lighting Schedule</h3>
            <p className="text-sm text-gray-500">Time-based automation rules</p>
          </div>
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Time Range</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Action</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Threshold</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Mode</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4"><div className="font-semibold text-dark-900">06:00 - 18:00</div></td>
                <td className="py-3 px-4"><div className="text-gray-600 text-sm">Auto sensor-based control</div></td>
                <td className="py-3 px-4"><div className="text-dark-900 font-medium text-sm">300 lux</div></td>
                <td className="py-3 px-4"><span className="badge badge-success">Auto</span></td>
                <td className="py-3 px-4"><span className="badge badge-warning">Active</span></td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4"><div className="font-semibold text-dark-900">18:00 - 22:00</div></td>
                <td className="py-3 px-4"><div className="text-gray-600 text-sm">Full brightness</div></td>
                <td className="py-3 px-4"><div className="text-dark-900 font-medium text-sm">300 lux</div></td>
                <td className="py-3 px-4"><span className="badge badge-success">Auto</span></td>
                <td className="py-3 px-4"><span className="badge badge-warning">Active</span></td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4"><div className="font-semibold text-dark-900">22:00 - 05:00</div></td>
                <td className="py-3 px-4"><div className="text-gray-600 text-sm">Dim to 70% brightness</div></td>
                <td className="py-3 px-4"><div className="text-dark-900 font-medium text-sm">200 lux</div></td>
                <td className="py-3 px-4"><span className="badge badge-info">Scheduled</span></td>
                <td className="py-3 px-4"><span className="badge badge-success">Enabled</span></td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4"><div className="font-semibold text-dark-900">Emergency</div></td>
                <td className="py-3 px-4"><div className="text-gray-600 text-sm">Manual override available</div></td>
                <td className="py-3 px-4"><div className="text-dark-900 font-medium text-sm">N/A</div></td>
                <td className="py-3 px-4"><span className="badge badge-danger">Manual</span></td>
                <td className="py-3 px-4"><span className="badge badge-success">Ready</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Lighting Alerts</h3>
            <p className="text-sm text-gray-500">System notifications and recommendations</p>
          </div>
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="space-y-4">
          {/* Dynamic alert */}
          <div className={`p-4 rounded-xl border ${lampIsOn ? 'bg-orange-50/70 border-orange-200' : 'bg-green-50/70 border-green-200'}`}>
            <div className="flex items-start space-x-3">
              <AlertCircle className={`w-5 h-5 mt-0.5 ${lampIsOn ? 'text-orange-600' : 'text-green-600'}`} />
              <div className="flex-1">
                <h4 className={`font-semibold mb-1 ${lampIsOn ? 'text-orange-950' : 'text-green-950'}`}>
                  {lampIsOn ? 'Lamp Active' : 'Lamp Inactive'}
                </h4>
                <p className={`text-sm ${lampIsOn ? 'text-orange-800' : 'text-green-800'}`}>
                  Current lamp PWM is {telemetry.lampPwm}% ≈ {lux} lux.
                  {lampIsOn ? ` Lamp is ON. ${autoMode ? 'Auto mode active.' : 'Manual mode active.'}` : ' Lamp is OFF — below activation threshold.'}
                </p>
                <div className={`mt-2 text-xs font-medium ${lampIsOn ? 'text-orange-700' : 'text-green-700'}`}>
                  PWM: {telemetry.lampPwm}% • Lux: {lux} • Mode: {autoMode ? 'Auto' : 'Manual'}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-green-50/70 border border-green-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-950 mb-1">Energy Saving Achieved</h4>
                <p className="text-sm text-green-800">
                  Smart lighting system saved 12% energy compared to yesterday through optimized scheduling.
                </p>
                <div className="mt-2 text-xs font-medium text-green-700">
                  Savings: 45 kWh • Cost reduction: IDR 32,000
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
