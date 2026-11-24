import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Car, 
  Trash2, 
  Sun,
  RefreshCw
} from 'lucide-react'
import { BarChart, Bar, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useSocketTelemetry } from '../utils/useSocketTelemetry'
import SimpangArtosMap from '../components/SimpangArtosMap'

const laneLabels: Record<string, string> = {
  utara: 'Magelang',
  selatan: 'Yogyakarta',
  timur: 'Artos',
  barat: 'Purworejo',
}

function getDensityLabel(val: number) {
  if (val >= 70) return 'Tinggi'
  if (val >= 30) return 'Sedang'
  return 'Rendah'
}

const weeklyActivity = [
  { day: 'Sen', vehicles: 1200 },
  { day: 'Sel', vehicles: 1800 },
  { day: 'Rab', vehicles: 1500 },
  { day: 'Kam', vehicles: 2100 },
  { day: 'Jum', vehicles: 2400 },
  { day: 'Sab', vehicles: 1900 },
  { day: 'Min', vehicles: 1300 },
]

interface TrafficPoint {
  time: string
  vehicles: number
}

export default function Dashboard() {
  const { telemetry, isConnected, refresh } = useSocketTelemetry()
  const [trafficHistory, setTrafficHistory] = useState<TrafficPoint[]>([])
  const historyRef = useRef<TrafficPoint[]>([])

  // Buffer riwayat kepadatan lalu lintas bergulir (maks 12 titik)
  useEffect(() => {
    const total = Object.values(telemetry.lanes).reduce((a, b) => a + b, 0)
    const now = new Date()
    const label = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const next = [...historyRef.current, { time: label, vehicles: total }].slice(-12)
    historyRef.current = next
    setTrafficHistory([...next])
  }, [telemetry])

  const totalVehicles = Object.values(telemetry.lanes).reduce((a, b) => a + b, 0)
  const binStatus = telemetry.binDensity >= 80 ? 'Penuh' : telemetry.binDensity >= 50 ? 'Hampir Penuh' : 'Normal'
  const binColor = telemetry.binDensity >= 80 ? 'text-red-600' : telemetry.binDensity >= 50 ? 'text-orange-600' : 'text-green-600'
  const lampLabel = telemetry.lampPwm > 30 ? 'MENYALA' : 'MATI'

  const isUsGreen =
    telemetry.trafficControl?.activeCorridor === 'US' ||
    telemetry.activeLane === 'utara' ||
    telemetry.activeLane === 'selatan'

  const regionData = [
    { region: 'Magelang (Utara)', vehicles: telemetry.lanes.utara, density: getDensityLabel(telemetry.lanes.utara), active: isUsGreen ? 'Hijau' : 'Merah' },
    { region: 'Artos (Timur)', vehicles: telemetry.lanes.timur, density: getDensityLabel(telemetry.lanes.timur), active: telemetry.activeLane === 'timur' ? 'Hijau' : 'Merah' },
    { region: 'Yogyakarta (Selatan)', vehicles: telemetry.lanes.selatan, density: getDensityLabel(telemetry.lanes.selatan), active: isUsGreen ? 'Hijau' : 'Merah' },
    { region: 'Purworejo (Barat)', vehicles: telemetry.lanes.barat, density: getDensityLabel(telemetry.lanes.barat), active: telemetry.activeLane === 'barat' ? 'Hijau' : 'Merah' },
  ]

  const stats = [
    {
      title: 'Total Kepadatan',
      value: `${totalVehicles}`,
      sub: `Jalur aktif: ${laneLabels[telemetry.activeLane]}`,
      icon: Car,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Tempat Sampah',
      value: `${telemetry.binDensity}%`,
      sub: binStatus,
      icon: Trash2,
      color: 'bg-red-500',
      lightColor: 'bg-red-50',
      textColor: binColor,
    },
    {
      title: 'Daya Lampu (PWM)',
      value: `${telemetry.lampPwm}%`,
      sub: `Lampu: ${lampLabel}`,
      icon: Sun,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: 'Durasi Hijau',
      value: `${telemetry.greenDuration} dtk`,
      sub: 'Sinyal adaptif',
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
          <h1 className="text-2xl font-bold text-dark-900">Informasi Utama</h1>
        </div>
        <button
          onClick={refresh}
          className="btn-secondary flex items-center space-x-1.5 text-xs px-3 py-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Kartu Statistik */}
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

      {/* Peta & Tabel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peta Asli Simpang Artos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Peta Lalu Lintas Simpang Artos</h3>
          <SimpangArtosMap telemetry={telemetry} />
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
            <div className="flex items-center space-x-1"><div className="w-4 h-1.5 rounded-full bg-green-600"></div><span>Jalan Senggang (&lt;30%)</span></div>
            <div className="flex items-center space-x-1"><div className="w-4 h-1.5 rounded-full bg-amber-500"></div><span>Sedang (30–69%)</span></div>
            <div className="flex items-center space-x-1"><div className="w-4 h-1.5 rounded-full bg-red-500"></div><span>Padat (≥70%)</span></div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center space-x-1"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div><span>Lampu Hijau</span></div>
            <div className="flex items-center space-x-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span>Lampu Merah</span></div>
          </div>
        </div>

        {/* Tabel Statistik */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Statistik Jalur</h3>
          <div className="space-y-1">
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-500 pb-2 border-b border-gray-200">
              <div>Jalur</div>
              <div className="text-right">Kepadatan</div>
              <div className="text-right">Status</div>
              <div className="text-right">Sinyal</div>
            </div>
            {regionData.map((row, index) => (
              <div key={index} className={`grid grid-cols-4 gap-2 text-sm py-2.5 border-b border-gray-100 ${
                row.active === 'Hijau' ? 'bg-green-50/50 rounded' : ''
              }`}>
                <div className="font-semibold text-dark-900 text-xs">{row.region}</div>
                <div className="text-right text-dark-800 font-medium">{row.vehicles}%</div>
                <div className={`text-right font-medium text-xs ${
                  row.density === 'Tinggi' ? 'text-red-600' : row.density === 'Sedang' ? 'text-orange-600' : 'text-green-600'
                }`}>{row.density}</div>
                <div className={`text-right font-medium text-xs ${row.active === 'Hijau' ? 'text-green-600' : 'text-red-500'}`}>{row.active}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Kepadatan Langsung */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-900">Kepadatan Lalu Lintas Langsung</h3>
            {isConnected && <span className="text-xs text-green-600 font-medium animate-pulse">● Langsung</span>}
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
                <Area type="monotone" dataKey="vehicles" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorVehicles)" name="Total Kepadatan" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aktivitas Mingguan */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Aktivitas Mingguan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', color: '#111827' }} />
                <Bar dataKey="vehicles" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Kendaraan" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
