import {
  Cpu,
  Wifi,
  WifiOff,
  Activity,
  RefreshCw,
  Server,
  Radio,
  Zap
} from 'lucide-react'
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts'
import { useSocketTelemetry, DeviceHealthNode } from '../utils/useSocketTelemetry'

const fallbackDevices: DeviceHealthNode[] = [
  { id: 'MQTT-01', name: 'Broker Mosquitto Lokal', type: 'Broker MQTT', status: 'Terputus', source: 'Menunggu koneksi', retained: false, reading: 'Terputus', lastSeen: 'Belum ada data' },
  { id: 'ESP32-01', name: 'Kontroler Utama ESP32', type: 'ESP32 Gateway', status: 'Terputus', source: 'Menunggu LWT/Heartbeat', retained: false, reading: 'Menunggu paket', lastSeen: 'Belum ada data' },
  { id: 'LORA-01', name: 'Link LoRa Antar-ESP', type: 'LoRa Transceiver', status: 'Terputus', source: 'Menunggu telemetri', retained: false, reading: 'Tidak ada paket', lastSeen: 'Belum ada data' }
]

export default function DeviceStatus() {
  const { telemetry, isConnected, refresh } = useSocketTelemetry()
  const health = telemetry.deviceHealth

  const devices = health?.devices ?? fallbackDevices
  const totalDevices = health?.totalDevices ?? devices.length
  const totalOnline = health?.onlineCount ?? devices.filter((d) => d.status === 'Aktif').length
  const totalOffline = health?.offlineCount ?? Math.max(0, totalDevices - totalOnline)
  const connectivityHistory = health?.connectivityHistory?.length
    ? health.connectivityHistory
    : [{ time: '--:--', connected: totalOnline }]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 mb-1">Status Perangkat</h1>
          <p className="text-gray-500 text-sm">
            Pemantauan konektivitas real-time via MQTT Retained Message, LWT, &amp; Heartbeat LoRa
          </p>
        </div>
        <button
          onClick={refresh}
          className="btn-secondary flex items-center space-x-1.5 text-xs px-3 py-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Statistik Ringkas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Perangkat</p>
              <h3 className="text-2xl font-bold text-dark-900">{totalDevices}</h3>
              <p className="text-xs text-gray-500 mt-2">Broker, ESP32, LoRa &amp; sensor</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Cpu className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Aktif</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-green-600">{totalOnline}</h3>
                {totalOnline > 0 && <span className="text-sm text-green-600 animate-pulse">●</span>}
              </div>
              <p className="text-xs text-gray-500 mt-2">Terhubung &amp; mengirim data</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Wifi className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Terputus</p>
              <h3 className={`text-2xl font-bold ${totalOffline > 0 ? 'text-red-600' : 'text-dark-900'}`}>
                {totalOffline}
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                {totalOffline > 0 ? 'LWT OFFLINE / timeout paket' : 'Semua perangkat normal'}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${totalOffline > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <WifiOff className={`w-6 h-6 ${totalOffline > 0 ? 'text-red-600' : 'text-gray-500'}`} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-gray-500 mb-1">Deteksi Putus</p>
              <h3 className="text-2xl font-bold text-dark-900 whitespace-nowrap">
                {health?.timeoutSeconds ?? 15} dtk
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                {isConnected ? 'Socket.io & Retained aktif' : 'Socket terputus'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 shrink-0">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Grafik & Info MQTT Retained */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Riwayat Konektivitas</h3>
              <p className="text-sm text-gray-500">Perubahan jumlah perangkat aktif secara real-time</p>
            </div>
            <Server className="w-5 h-5 text-blue-600" />
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={connectivityHistory}>
                <defs>
                  <linearGradient id="colorConn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[0, Math.max(totalDevices, 15)]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#111827'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="connected"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorConn)"
                  name="Perangkat Aktif"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-dark-900">Konfigurasi Retained Message &amp; LWT</h3>
                <p className="text-sm text-gray-500">Mekanisme deteksi otomatis perangkat terputus</p>
              </div>
              <Radio className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Topik Status LWT / Retained (dari ESP32)</p>
                <code className="font-mono text-xs text-dark-900 font-semibold">
                  {health?.statusTopic || 'artefac/simpang/artos/status'}
                </code>
                <p className="text-xs text-gray-500 mt-1">
                  Set payload <span className="font-mono font-medium">ONLINE</span> saat konek dan LWT{' '}
                  <span className="font-mono font-medium">OFFLINE</span> (<span className="font-mono">retain=true</span>) agar status terputus langsung terdeteksi.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Topik Ringkasan Kesehatan Retained (Server)</p>
                <code className="font-mono text-xs text-dark-900 font-semibold">
                  {health?.retainedHealthTopic || 'artefac/simpang/artos/devices/status'}
                </code>
                <p className="text-xs text-gray-500 mt-1">
                  Watchdog menandai node <span className="font-semibold text-red-600">Terputus</span> otomatis jika tidak ada telemetri masuk lebih dari{' '}
                  {health?.timeoutSeconds ?? 15} detik.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Telemetri terakhir:</span>
            <span className="font-mono font-medium text-dark-900">
              {health?.lastTelemetryAt
                ? new Date(health.lastTelemetryAt).toLocaleTimeString('id-ID')
                : 'Menunggu data sensor'}
            </span>
          </div>
        </div>
      </div>

      {/* Daftar Perangkat */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Daftar Perangkat</h3>
            <p className="text-sm text-gray-500">
              {totalDevices} perangkat — {totalOnline} aktif, {totalOffline} terputus
            </p>
          </div>
          <Zap className="w-5 h-5 text-blue-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Nama Perangkat</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tipe</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Sumber Deteksi</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Pembacaan</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Terakhir Terlihat</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => {
                const isActive = device.status === 'Aktif'
                return (
                  <tr
                    key={device.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      !isActive ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono text-sm font-medium text-dark-900">{device.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-dark-900">{device.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-600 text-sm">{device.type}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                          }`}
                        ></div>
                        <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}>
                          {device.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                        {device.source}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-700 text-sm font-mono">{device.reading}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-600 text-sm">{device.lastSeen}</div>
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
