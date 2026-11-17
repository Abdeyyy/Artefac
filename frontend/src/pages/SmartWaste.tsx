import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  AlertCircle, 
  TrendingUp,
  RefreshCw,
  BarChart3,
  Clock,
  ChevronRight
} from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts'
import { useSocketTelemetry } from '../utils/useSocketTelemetry'

interface FullnessPoint { time: string; fullness: number }

function getBinStatusLabel(density: number): string {
  if (density >= 80) return 'Penuh'
  if (density >= 50) return 'Hampir Penuh'
  return 'Normal'
}

function getStatusColor(label: string) {
  if (label === 'Penuh') return { badge: 'badge-danger', text: 'text-red-600', bg: 'bg-red-50/70 border-red-200' }
  if (label === 'Hampir Penuh') return { badge: 'badge-warning', text: 'text-orange-600', bg: 'bg-amber-50/70 border-amber-200' }
  return { badge: 'badge-success', text: 'text-green-600', bg: 'bg-green-50/70 border-green-200' }
}

export default function SmartWaste() {
  const { telemetry, isConnected, refresh } = useSocketTelemetry()
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
  const distanceCm = telemetry.rawSensors?.distIn ?? Math.round((1 - telemetry.binDensity / 100) * 50)
  const lidLabel = telemetry.binStatus === 'OPEN' ? 'TERBUKA' : 'TERTUTUP'

  const collectionSchedule = [
    {
      bin: 'Tempat Sampah',
      lastCollected: 'Hari Ini 08:30',
      nextSchedule: telemetry.binDensity >= 80 ? 'Segera Hari Ini' : 'Besok 08:30',
      priority: telemetry.binDensity >= 80 ? 'Tinggi' : telemetry.binDensity >= 50 ? 'Sedang' : 'Rendah',
    },
  ]

  const statusDistribution = [
    { name: 'Terisi', value: telemetry.binDensity, color: telemetry.binDensity >= 80 ? '#ef4444' : telemetry.binDensity >= 50 ? '#f59e0b' : '#10b981' },
    { name: 'Tersisa', value: 100 - telemetry.binDensity, color: '#e5e7eb' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 mb-1">Manajemen Sampah Pintar</h1>
          <p className="text-gray-500 text-sm">Pemantauan sensor ultrasonik dan pelacakan kapasitas tempat sampah</p>
        </div>
        <button
          onClick={refresh}
          className="btn-secondary flex items-center space-x-1.5 text-xs px-3 py-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Kapasitas Terisi</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">{telemetry.binDensity}%</h3>
                {isConnected && <span className="text-sm text-green-600 animate-pulse">●</span>}
              </div>
              <p className="text-sm text-gray-500 mt-2">Pembacaan sensor ultrasonik</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Status Tempat Sampah</p>
              <div className="flex items-baseline space-x-2">
                <h3 className={`text-2xl font-bold ${statusColors.text}`}>{binStatusLabel}</h3>
              </div>
              <p className="text-sm text-gray-500 mt-2">Penutup: {lidLabel}</p>
            </div>
            <div className={`p-3 rounded-lg ${binStatusLabel === 'Penuh' ? 'bg-red-50' : 'bg-orange-50'}`}>
              <AlertCircle className={`w-6 h-6 ${binStatusLabel === 'Penuh' ? 'text-red-600' : 'text-orange-600'}`} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Jarak ke Sensor</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">{distanceCm} cm</h3>
                <span className="text-sm text-blue-600">Ultrasonik</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Ruang tersisa</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Monitor Tempat Sampah + Riwayat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visualisasi Langsung */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Monitor Tempat Sampah Langsung</h3>
              <p className="text-sm text-gray-500">Status sensor tempat sampah tunggal</p>
            </div>
            {isConnected && <span className="text-xs text-green-600 font-medium animate-pulse">● Langsung</span>}
          </div>
          <div className="flex items-center justify-center space-x-8">
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
                <div>Penutup: <span className={`font-semibold ${telemetry.binStatus === 'OPEN' ? 'text-orange-600' : 'text-green-600'}`}>{lidLabel}</span></div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span className={`badge ${statusColors.badge}`}>{binStatusLabel}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Kapasitas Terisi</p>
                <p className={`text-lg font-bold ${statusColors.text}`}>{telemetry.binDensity}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Ruang Kosong</p>
                <p className="text-lg font-bold text-dark-900">{distanceCm} cm</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Kondisi Penutup</p>
                <p className={`text-sm font-semibold ${telemetry.binStatus === 'OPEN' ? 'text-orange-600' : 'text-green-600'}`}>{lidLabel}</p>
              </div>
            </div>
          </div>
          {/* Bilah Progres */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>0%</span><span>Tingkat Kepenuhan</span><span>100%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full">
              <motion.div
                className={`h-3 rounded-full ${telemetry.binDensity >= 80 ? 'bg-red-500' : telemetry.binDensity >= 50 ? 'bg-orange-400' : 'bg-green-500'}`}
                animate={{ width: `${telemetry.binDensity}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500 text-right">
              Ambang Batas: Normal (0–49%), Hampir Penuh (50–79%), Penuh (≥80%)
            </div>
          </div>
        </div>

        {/* Grafik Riwayat Kepenuhan */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Riwayat Kepenuhan</h3>
              <p className="text-sm text-gray-500">Pembacaan sensor bergulir</p>
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
                <Area type="monotone" dataKey="fullness" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorFullness)" name="Kapasitas %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
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

      {/* Jadwal Pengangkutan */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Jadwal Pengangkutan</h3>
            <p className="text-sm text-gray-500">Jadwal pengambilan sampah dan tingkat prioritas</p>
          </div>
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Unit</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Terakhir Diangkut</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Jadwal Berikutnya</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Prioritas</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Aksi</th>
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
                      schedule.priority === 'Tinggi' ? 'badge-danger' :
                      schedule.priority === 'Sedang' ? 'badge-warning' :
                      'badge-success'
                    }`}>
                      {schedule.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center space-x-1">
                      <span>Jadwalkan</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Peringatan Dinamis */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Peringatan Manajemen Sampah</h3>
            <p className="text-sm text-gray-500">Notifikasi sistem dan rekomendasi tindakan</p>
          </div>
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${statusColors.bg}`}>
            <div className="flex items-start space-x-3">
              <AlertCircle className={`w-5 h-5 mt-0.5 ${statusColors.text}`} />
              <div className="flex-1">
                <h4 className={`font-semibold mb-1 ${binStatusLabel === 'Penuh' ? 'text-red-950' : binStatusLabel === 'Hampir Penuh' ? 'text-amber-950' : 'text-green-950'}`}>
                  {binStatusLabel === 'Penuh' ? 'Pengangkutan Segera Diperlukan' : binStatusLabel === 'Hampir Penuh' ? 'Tempat Sampah Mendekati Penuh' : 'Status Tempat Sampah Normal'}
                </h4>
                <p className={`text-sm ${binStatusLabel === 'Penuh' ? 'text-red-800' : binStatusLabel === 'Hampir Penuh' ? 'text-amber-800' : 'text-green-800'}`}>
                  Tempat sampah saat ini terisi {telemetry.binDensity}%. {
                    binStatusLabel === 'Penuh' ? 'Segera jadwalkan tim kebersihan untuk pengosongan.' :
                    binStatusLabel === 'Hampir Penuh' ? 'Pertimbangkan penjadwalan pengosongan dalam 4 jam ke depan.' :
                    'Pengangkutan berikutnya dapat berjalan sesuai jadwal.'
                  }
                  {telemetry.binStatus === 'OPEN' && ' ⚠️ Penutup tempat sampah sedang TERBUKA.'}
                </p>
                <div className={`mt-2 text-xs font-medium ${statusColors.text}`}>
                  Kepadatan: {telemetry.binDensity}% • Penutup: {lidLabel} • Status: {binStatusLabel}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-950 mb-1">Jadwal Pemeliharaan</h4>
                <p className="text-sm text-blue-800">
                  Pemeliharaan rutin seluruh sensor sampah dijadwalkan dalam 7 hari ke depan.
                  Siapkan baterai pengganti dan lakukan uji konektivitas.
                </p>
                <div className="mt-2 text-xs font-medium text-blue-700">
                  Jadwal: Minggu depan • Perangkat: Semua • Durasi: 2 jam
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
