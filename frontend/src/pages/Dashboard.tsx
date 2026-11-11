import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Car, 
  Trash2, 
  Sun,
  Wifi,
  WifiOff
} from 'lucide-react'
import { BarChart, Bar, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useSocketTelemetry } from '../utils/useSocketTelemetry'

const laneLabels: Record<string, string> = {
  utara: 'Magelang',
  selatan: 'Yogyakarta',
  timur: 'Purworejo',
  barat: 'Artos',
}

function getDensityLabel(val: number) {
  if (val >= 70) return 'High'
  if (val >= 30) return 'Medium'
  return 'Low'
}

const weeklyActivity = [
  { day: 'Mon', vehicles: 1200 },
  { day: 'Tue', vehicles: 1800 },
  { day: 'Wed', vehicles: 1500 },
  { day: 'Thu', vehicles: 2100 },
  { day: 'Fri', vehicles: 2400 },
  { day: 'Sat', vehicles: 1900 },
  { day: 'Sun', vehicles: 1300 },
]

interface TrafficPoint {
  time: string
  vehicles: number
}

export default function Dashboard() {
  const { telemetry, isConnected } = useSocketTelemetry()
  const [trafficHistory, setTrafficHistory] = useState<TrafficPoint[]>([])
  const historyRef = useRef<TrafficPoint[]>([])

  // Rolling traffic history buffer (max 12 points)
  useEffect(() => {
    const total = Object.values(telemetry.lanes).reduce((a, b) => a + b, 0)
    const now = new Date()
    const label = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const next = [...historyRef.current, { time: label, vehicles: total }].slice(-12)
    historyRef.current = next
    setTrafficHistory([...next])
  }, [telemetry])

  const totalVehicles = Object.values(telemetry.lanes).reduce((a, b) => a + b, 0)
  const binStatus = telemetry.binDensity >= 80 ? 'Full' : telemetry.binDensity >= 50 ? 'Near Full' : 'Normal'
  const binColor = telemetry.binDensity >= 80 ? 'text-red-600' : telemetry.binDensity >= 50 ? 'text-orange-600' : 'text-green-600'
  const lampLabel = telemetry.lampPwm > 30 ? 'ON' : 'OFF'

  const regionData = [
    { region: 'Magelang (Utara)', vehicles: telemetry.lanes.utara, density: getDensityLabel(telemetry.lanes.utara), active: telemetry.activeLane === 'utara' ? 'Green' : 'Red' },
    { region: 'Purworejo (Timur)', vehicles: telemetry.lanes.timur, density: getDensityLabel(telemetry.lanes.timur), active: telemetry.activeLane === 'timur' ? 'Green' : 'Red' },
    { region: 'Yogyakarta (Selatan)', vehicles: telemetry.lanes.selatan, density: getDensityLabel(telemetry.lanes.selatan), active: telemetry.activeLane === 'selatan' ? 'Green' : 'Red' },
    { region: 'Artos (Barat)', vehicles: telemetry.lanes.barat, density: getDensityLabel(telemetry.lanes.barat), active: telemetry.activeLane === 'barat' ? 'Green' : 'Red' },
  ]

  const stats = [
    {
      title: 'Total Vehicles',
      value: totalVehicles.toString(),
      sub: `Active lane: ${laneLabels[telemetry.activeLane]}`,
      icon: Car,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Waste Bin',
      value: `${telemetry.binDensity}%`,
      sub: binStatus,
      icon: Trash2,
      color: 'bg-red-500',
      lightColor: 'bg-red-50',
      textColor: binColor,
    },
    {
      title: 'Light PWM',
      value: `${telemetry.lampPwm}%`,
      sub: `Lamp: ${lampLabel}`,
      icon: Sun,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: 'Green Duration',
      value: `${telemetry.greenDuration}s`,
      sub: 'Adaptive signal',
      icon: Activity,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Information</h1>
          <div className="flex items-center space-x-4 mt-2">
            <button className="text-sm text-gray-500 hover:text-dark-900 transition-colors">My region</button>
            <button className="text-sm text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Simpang Artos</button>
            <button className="text-sm text-gray-500 hover:text-dark-900 transition-colors">Indonesia</button>
          </div>
        </div>
        {/* Connection Badge */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
          isConnected ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
        }`}>
          {isConnected
            ? <><Wifi className="w-3.5 h-3.5" /><span>Live</span></>
            : <><WifiOff className="w-3.5 h-3.5" /><span>Offline</span></>
          }
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.lightColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-dark-900 mb-1">{stat.value}</h3>
              <p className={`text-xs font-medium ${stat.textColor}`}>{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Map & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simpang Artos visual map */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Simpang Artos — Live Signal</h3>
          <div className="relative bg-gray-100 rounded-xl" style={{ height: 240 }}>
            {/* Roads */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-full bg-gray-300 opacity-50 rounded"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-12 bg-gray-300 opacity-50 rounded"></div>
            </div>
            {/* Lane indicators */}
            {(['utara','selatan','timur','barat'] as const).map(lane => {
              const isActive = telemetry.activeLane === lane
              const density = telemetry.lanes[lane]
              const posMap: Record<string, string> = {
                utara: 'top-2 left-1/2 -translate-x-1/2',
                selatan: 'bottom-2 left-1/2 -translate-x-1/2',
                timur: 'right-2 top-1/2 -translate-y-1/2',
                barat: 'left-2 top-1/2 -translate-y-1/2',
              }
              return (
                <div key={lane} className={`absolute ${posMap[lane]} flex flex-col items-center`}>
                  <div className={`w-3 h-3 rounded-full mb-1 ${isActive ? 'bg-green-500' : 'bg-red-400'}`}></div>
                  <div className="bg-white rounded-lg px-2 py-1 shadow text-center">
                    <div className="text-xs font-bold text-dark-900">{laneLabels[lane]}</div>
                    <div className="text-xs text-gray-500">{density}%</div>
                  </div>
                </div>
              )
            })}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-3xl font-extrabold text-blue-900 opacity-10 tracking-widest text-center">
                SIMPANG<br/>ARTOS
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div><span>Green Light</span></div>
            <div className="flex items-center space-x-1"><div className="w-2.5 h-2.5 rounded-full bg-red-400"></div><span>Red Light</span></div>
          </div>
        </div>

        {/* Statistics Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Lane Statistics</h3>
          <div className="space-y-1">
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-500 pb-2 border-b border-gray-200">
              <div>Lane</div>
              <div className="text-right">Density</div>
              <div className="text-right">Status</div>
              <div className="text-right">Signal</div>
            </div>
            {regionData.map((row, index) => (
              <div key={index} className={`grid grid-cols-4 gap-2 text-sm py-2.5 border-b border-gray-100 ${
                row.active === 'Green' ? 'bg-green-50/50 rounded' : ''
              }`}>
                <div className="font-semibold text-dark-900 text-xs">{row.region}</div>
                <div className="text-right text-dark-800 font-medium">{row.vehicles}%</div>
                <div className={`text-right font-medium text-xs ${
                  row.density === 'High' ? 'text-red-600' : row.density === 'Medium' ? 'text-orange-600' : 'text-green-600'
                }`}>{row.density}</div>
                <div className={`text-right font-medium text-xs ${row.active === 'Green' ? 'text-green-600' : 'text-red-500'}`}>{row.active}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Traffic Flow Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-900">Live Traffic Density</h3>
            {isConnected && <span className="text-xs text-green-600 font-medium animate-pulse">● Live</span>}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficHistory}>
                <defs>
                  <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '11px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} domain={[0, 400]} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', color: '#111827' }} />
                <Area type="monotone" dataKey="vehicles" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorVehicles)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Weekly Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', color: '#111827' }} />
                <Bar dataKey="vehicles" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
