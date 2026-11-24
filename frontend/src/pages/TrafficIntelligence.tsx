import { useState, useEffect, useRef } from 'react'
import { 
  TrafficCone,
  Clock,
  TrendingUp,
  AlertCircle,
  Cpu,
  RefreshCw,
  ChevronRight,
  Car,
  MapPin
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useSocketTelemetry } from '../utils/useSocketTelemetry'

interface HistoryPoint {
  time: string
  vehicles: number
  density: number
}

function getDensityLabel(val: number) {
  if (val >= 70) return 'Tinggi'
  if (val >= 30) return 'Sedang'
  return 'Rendah'
}

function getDensityColor(label: string) {
  if (label === 'Tinggi') return 'badge-danger'
  if (label === 'Sedang') return 'badge-warning'
  return 'badge-success'
}

const emptyPredictions = [
  { minute: '5 mnt', predictedVehicles: 0, avgDensity: 0, confidence: 65 },
  { minute: '10 mnt', predictedVehicles: 0, avgDensity: 0, confidence: 62 },
  { minute: '15 mnt', predictedVehicles: 0, avgDensity: 0, confidence: 59 },
  { minute: '20 mnt', predictedVehicles: 0, avgDensity: 0, confidence: 56 },
  { minute: '25 mnt', predictedVehicles: 0, avgDensity: 0, confidence: 55 },
]

export default function TrafficIntelligence() {
  const { telemetry, isConnected, refresh } = useSocketTelemetry()
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const historyRef = useRef<HistoryPoint[]>([])

  const aiPredictionData = telemetry.predictions
  const aiForecasts = aiPredictionData?.forecasts?.length ? aiPredictionData.forecasts : emptyPredictions
  const nextFive = aiForecasts[0]

  // Buffer riwayat bergulir (maks 20 titik)
  useEffect(() => {
    const total = Object.values(telemetry.lanes).reduce((a, b) => a + b, 0)
    const avgDensity = total / 4
    const now = new Date()
    const label = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    const next = [...historyRef.current, { time: label, vehicles: total, density: Math.round(avgDensity) }].slice(-20)
    historyRef.current = next
    setHistory([...next])
  }, [telemetry])

  const isUsGreen =
    telemetry.trafficControl?.activeCorridor === 'US' ||
    telemetry.activeLane === 'utara' ||
    telemetry.activeLane === 'selatan'

  const trafficSensors = [
    { id: 1, laneKey: 'utara' as const, direction: 'Magelang', vehicles: telemetry.lanes.utara, density: getDensityLabel(telemetry.lanes.utara), greenTime: isUsGreen ? telemetry.greenDuration : Math.round(telemetry.greenDuration * 0.6), status: 'Aktif' },
    { id: 2, laneKey: 'timur' as const, direction: 'Artos', vehicles: telemetry.lanes.timur, density: getDensityLabel(telemetry.lanes.timur), greenTime: telemetry.activeLane === 'timur' ? telemetry.greenDuration : Math.round(telemetry.greenDuration * 0.7), status: 'Aktif' },
    { id: 3, laneKey: 'selatan' as const, direction: 'Yogyakarta', vehicles: telemetry.lanes.selatan, density: getDensityLabel(telemetry.lanes.selatan), greenTime: isUsGreen ? telemetry.greenDuration : Math.round(telemetry.greenDuration * 0.8), status: 'Aktif' },
    { id: 4, laneKey: 'barat' as const, direction: 'Purworejo', vehicles: telemetry.lanes.barat, density: getDensityLabel(telemetry.lanes.barat), greenTime: telemetry.activeLane === 'barat' ? telemetry.greenDuration : Math.round(telemetry.greenDuration * 0.5), status: 'Aktif' },
  ]

  const totalVehicles = Object.values(telemetry.lanes).reduce((a, b) => a + b, 0)
  const peakDensity = Math.max(...Object.values(telemetry.lanes))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 mb-1">Intelijen Lalu Lintas</h1>
          <p className="text-gray-600 text-sm">Pemantauan real-time dan kendali lalu lintas berbasis AI</p>
        </div>
        <button
          onClick={refresh}
          className="btn-secondary flex items-center space-x-1.5 text-xs px-3 py-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-1 truncate">Total Kepadatan</p>
              <div className="flex items-baseline space-x-1.5">
                <h3 className="text-xl font-bold text-dark-900 whitespace-nowrap">{totalVehicles}</h3>
                {isConnected && <span className="text-xs text-green-600 animate-pulse">●</span>}
              </div>
              <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">4 jalur sensor</p>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50 shrink-0">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-1 truncate">Sensor Aktif</p>
              <h3 className="text-xl font-bold text-dark-900 whitespace-nowrap">4/4</h3>
              <p className="text-xs text-green-600 font-medium mt-0.5 whitespace-nowrap">Semua aktif</p>
            </div>
            <div className="p-2.5 rounded-lg bg-orange-50 shrink-0">
              <Cpu className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-1 truncate">Durasi Hijau</p>
              <h3 className="text-xl font-bold text-dark-900 whitespace-nowrap">{telemetry.greenDuration} dtk</h3>
              <p className="text-xs text-blue-600 font-medium mt-0.5 whitespace-nowrap">Adaptif</p>
            </div>
            <div className="p-2.5 rounded-lg bg-green-50 shrink-0">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-1 truncate">Kepadatan Puncak</p>
              <h3 className="text-xl font-bold text-dark-900 whitespace-nowrap">{peakDensity}%</h3>
              <p className={`text-xs font-medium mt-0.5 whitespace-nowrap ${peakDensity >= 70 ? 'text-red-600' : peakDensity >= 30 ? 'text-orange-600' : 'text-green-600'}`}>
                {getDensityLabel(peakDensity)}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-purple-50 shrink-0">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Riwayat Lalu Lintas Langsung */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Riwayat Lalu Lintas Langsung</h3>
              <p className="text-sm text-gray-500">Total kepadatan kendaraan bergulir</p>
            </div>
            {isConnected && <span className="text-xs text-green-600 font-medium animate-pulse">● Mengalir</span>}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '10px' }} tick={false} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', color: '#111827' }} />
                <Line type="monotone" dataKey="vehicles" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total Kepadatan" />
                <Line type="monotone" dataKey="density" stroke="#10b981" strokeWidth={2} dot={false} name="Rata-rata Kepadatan" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span>Total Kepadatan</span></div>
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Tingkat Kepadatan</span></div>
          </div>
        </div>

        {/* Prediksi AI */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Prediksi Arus Lalu Lintas (AI)</h3>
              <p className="text-sm text-gray-500">
                {aiPredictionData?.modelName || 'Hybrid EMA + Regresi Linier + Decision Tree'}
              </p>
            </div>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiForecasts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="minute" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="avgDensity" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Prediksi Rata-rata (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600 flex flex-wrap items-center justify-between gap-2">
            <p>
              {aiPredictionData?.hasRealData
                ? `5 menit ke depan: prediksi rata-rata ${nextFive.avgDensity}% (total ${nextFive.predictedVehicles}, keyakinan ${nextFive.confidence}%)`
                : 'Menunggu data MQTT ESP32 untuk menghitung proyeksi arus 5–25 menit ke depan'}
            </p>
            {aiPredictionData && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                Tren: {aiPredictionData.trendLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Data Sensor */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Pemantauan Sensor</h3>
            <p className="text-sm text-gray-500">Data real-time 4 jalur sensor inframerah</p>
          </div>
          <TrafficCone className="w-5 h-5 text-blue-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Arah Jalur</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Kepadatan %</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tingkat</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Waktu Hijau</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Sinyal</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Aksi</th>
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
                        {isActive && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Aktif</span>}
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
                      <div className="text-dark-900 font-medium">{sensor.greenTime} dtk</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></div>
                        <span className={`text-sm font-medium ${isActive ? 'text-green-600' : 'text-red-500'}`}>{isActive ? 'Hijau' : 'Merah'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center space-x-1">
                        <span>Detail</span>
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
