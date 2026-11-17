import { useState, useEffect, useRef } from 'react'
import { 
  Sun, 
  Moon, 
  Zap, 
  RefreshCw,
  TrendingUp,
  ChevronRight
} from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useSocketTelemetry } from '../utils/useSocketTelemetry'

interface IntensityPoint { time: string; intensity: number; pwm: number }

const energyUsage = [
  { hour: '18-19', consumption: 45, cost: 3200 },
  { hour: '19-20', consumption: 68, cost: 4800 },
  { hour: '20-21', consumption: 72, cost: 5100 },
  { hour: '21-22', consumption: 70, cost: 5000 },
  { hour: '22-23', consumption: 65, cost: 4600 },
  { hour: '23-00', consumption: 60, cost: 4200 },
]

export default function SmartLighting() {
  const { telemetry, isConnected, refresh } = useSocketTelemetry()
  const [intensityHistory, setIntensityHistory] = useState<IntensityPoint[]>([])
  const [isUpdatingPju, setIsUpdatingPju] = useState(false)
  const historyRef = useRef<IntensityPoint[]>([])

  useEffect(() => {
    const lux = telemetry.rawSensors?.ldr ?? telemetry.trafficControl?.ldrRaw ?? telemetry.lampPwm * 5
    const now = new Date()
    const label = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const next = [...historyRef.current, { time: label, intensity: lux, pwm: telemetry.lampPwm }].slice(-15)
    historyRef.current = next
    setIntensityHistory([...next])
  }, [telemetry])

  const ldrRaw = telemetry.rawSensors?.ldr ?? telemetry.trafficControl?.ldrRaw ?? 0
  const pjuThreshold = telemetry.trafficControl?.pjuThreshold ?? 300
  const valPju = telemetry.trafficControl?.outputs?.valPJU ?? (ldrRaw < pjuThreshold ? 1 : 0)
  const isManual = telemetry.trafficControl?.isManualOverride ?? false
  const autoMode = !isManual
  const lux = ldrRaw
  const lampIsOn = valPju === 1
  const totalConsumption = energyUsage.reduce((sum, h) => sum + h.consumption, 0)

  const handlePjuControl = async (mode: 'AUTO' | 'ON' | 'OFF') => {
    setIsUpdatingPju(true)
    try {
      const body =
        mode === 'AUTO'
          ? { mode: 'AUTO', reason: 'PJU kembali ke mode Otomatis (LDR)' }
          : {
              mode: 'MANUAL',
              valPJU: mode === 'ON' ? 1 : 0,
              reason: `PJU ${mode === 'ON' ? 'dinyalakan' : 'dimatikan'} manual dari Dashboard`
            }
      await fetch('http://localhost:5000/api/telemetry/traffic-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      await refresh()
    } catch {
      // Abaikan jika backend offline
    } finally {
      setIsUpdatingPju(false)
    }
  }

  const lightingSensors = [
    { id: 1, name: 'Lampu 1', intensity: lux, threshold: 300, status: lampIsOn ? 'MENYALA' : 'MATI', mode: autoMode ? 'Otomatis' : 'Manual', lastUpdated: isConnected ? 'Langsung' : 'Menunggu data' },
    { id: 2, name: 'Lampu 2', intensity: lux, threshold: 300, status: lampIsOn ? 'MENYALA' : 'MATI', mode: autoMode ? 'Otomatis' : 'Manual', lastUpdated: isConnected ? 'Langsung' : 'Menunggu data' },
    { id: 3, name: 'Lampu 3', intensity: lux, threshold: 300, status: lampIsOn ? 'MENYALA' : 'MATI', mode: autoMode ? 'Otomatis' : 'Manual', lastUpdated: isConnected ? 'Langsung' : 'Menunggu data' },
    { id: 4, name: 'Lampu 4', intensity: lux, threshold: 300, status: lampIsOn ? 'MENYALA' : 'MATI', mode: autoMode ? 'Otomatis' : 'Manual', lastUpdated: isConnected ? 'Langsung' : 'Menunggu data' },
  ]

  const lightsOn = lightingSensors.filter(s => s.status === 'MENYALA').length
  const averageIntensity = lightingSensors.reduce((s, x) => s + x.intensity, 0) / lightingSensors.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 mb-1">Kendali Penerangan Pintar</h1>
          <p className="text-gray-500 text-sm">Pemantauan sensor LDR dan pengelolaan lampu jalan otomatis</p>
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
              <p className="text-sm text-gray-500 mb-1">Intensitas Rata-rata</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">{averageIntensity.toFixed(0)} lux</h3>
                {isConnected && <span className="text-sm text-green-600 animate-pulse">●</span>}
              </div>
              <p className="text-sm text-gray-500 mt-2">Ambang batas: 300 lux</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Sun className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Lampu Aktif</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">{lightsOn}/{lightingSensors.length}</h3>
                <span className={`text-sm font-semibold ${lampIsOn ? 'text-orange-600' : 'text-blue-600'}`}>
                  {lampIsOn ? 'MENYALA' : 'MATI'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Lux: <span className="font-mono font-semibold text-dark-900">{ldrRaw}</span> • Ambang: <span className="font-semibold">{autoMode ? `< ${pjuThreshold} (Nyala/Mati)` : 'Manual'}</span>
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <button
                  disabled={isUpdatingPju}
                  onClick={() => handlePjuControl('ON')}
                  className={`px-2 py-0.5 rounded text-xs font-medium border ${
                    isManual && valPju === 1 ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Nyalakan
                </button>
                <button
                  disabled={isUpdatingPju}
                  onClick={() => handlePjuControl('OFF')}
                  className={`px-2 py-0.5 rounded text-xs font-medium border ${
                    isManual && valPju === 0 ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Matikan
                </button>
                <button
                  disabled={isUpdatingPju}
                  onClick={() => handlePjuControl('AUTO')}
                  className={`px-2 py-0.5 rounded text-xs font-medium border ${
                    autoMode ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Auto
                </button>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              {lampIsOn ? <Sun className="w-6 h-6 text-orange-500" /> : <Moon className="w-6 h-6 text-blue-500" />}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Konsumsi</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">{totalConsumption} kWh</h3>
                <span className="text-sm font-semibold text-green-600">-12%</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Pemakaian energi hari ini</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Riwayat Intensitas */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Riwayat Intensitas Langsung</h3>
              <p className="text-sm text-gray-500">Pembacaan lux bergulir (PWM × 5)</p>
            </div>
            {isConnected && <span className="text-xs text-green-600 font-medium animate-pulse">● Mengalir</span>}
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
                <Area type="monotone" dataKey="intensity" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorIntensity)" name="Intensitas (lux)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pemakaian Energi */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Pemakaian Energi (Per Jam)</h3>
              <p className="text-sm text-gray-500">Konsumsi kWh hari ini</p>
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

      {/* Tabel Sensor */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Sensor Penerangan</h3>
            <p className="text-sm text-gray-500">Pembacaan sensor LDR secara real-time (4 unit lampu)</p>
          </div>
          <Sun className="w-5 h-5 text-orange-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Unit Lampu</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Intensitas</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Ambang Batas</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Mode</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Aksi</th>
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
                      <div className={`w-2.5 h-2.5 rounded-full ${sensor.status === 'MENYALA' ? 'bg-orange-400 animate-pulse' : 'bg-gray-400'}`}></div>
                      <span className={`badge ${sensor.status === 'MENYALA' ? 'badge-warning' : 'badge-info'}`}>{sensor.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${sensor.mode === 'Otomatis' ? 'badge-success' : 'badge-warning'}`}>{sensor.mode}</span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center space-x-1">
                      <span>Kendali</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
