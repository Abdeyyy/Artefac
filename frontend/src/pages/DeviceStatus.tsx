import { 
  Cpu, 
  Wifi, 
  Activity, 
  Battery,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Zap,
  Server,
  WifiOff
} from 'lucide-react'
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts'
import { useSocketTelemetry } from '../utils/useSocketTelemetry'

const devices = [
  { id: 'ESP32-01', name: 'Main Controller', type: 'ESP32', status: 'Online', lastSeen: 'Just now', battery: 85 },
  { id: 'LORA-01', name: 'LoRa Gateway', type: 'LoRa Gateway', status: 'Online', lastSeen: '2 min ago', battery: null },
  { id: 'IR-01', name: 'North Sensor', type: 'IR Sensor', status: 'Online', lastSeen: '15 sec ago', battery: 92 },
  { id: 'IR-02', name: 'South Sensor', type: 'IR Sensor', status: 'Online', lastSeen: '30 sec ago', battery: 88 },
  { id: 'IR-03', name: 'East Sensor', type: 'IR Sensor', status: 'Online', lastSeen: '45 sec ago', battery: 78 },
  { id: 'IR-04', name: 'West Sensor', type: 'IR Sensor', status: 'Offline', lastSeen: '2 hours ago', battery: 45 },
  { id: 'IR-05', name: 'NE Sensor', type: 'IR Sensor', status: 'Online', lastSeen: '1 min ago', battery: 95 },
  { id: 'IR-06', name: 'NW Sensor', type: 'IR Sensor', status: 'Online', lastSeen: '50 sec ago', battery: 82 },
  { id: 'IR-07', name: 'SE Sensor', type: 'IR Sensor', status: 'Online', lastSeen: '40 sec ago', battery: 76 },
  { id: 'IR-08', name: 'SW Sensor', type: 'IR Sensor', status: 'Online', lastSeen: '35 sec ago', battery: 91 },
  { id: 'US-01', name: 'Waste Sensor', type: 'Ultrasonic', status: 'Online', lastSeen: '3 min ago', battery: 68 },
  { id: 'LDR-01', name: 'Lighting Sensor', type: 'LDR Sensor', status: 'Online', lastSeen: '2 min ago', battery: 74 },
]

const connectivityHistory = [
  { time: '08:00', connected: 10 },
  { time: '09:00', connected: 11 },
  { time: '10:00', connected: 11 },
  { time: '11:00', connected: 10 },
  { time: '12:00', connected: 9 },
  { time: '13:00', connected: 11 },
  { time: '14:00', connected: 10 },
]

const batteryHistory = [
  { device: 'IR-01', battery: 92, trend: 'stable' },
  { device: 'IR-02', battery: 88, trend: 'stable' },
  { device: 'IR-03', battery: 78, trend: 'decreasing' },
  { device: 'IR-04', battery: 45, trend: 'critical' },
  { device: 'IR-05', battery: 95, trend: 'stable' },
  { device: 'IR-06', battery: 82, trend: 'stable' },
  { device: 'IR-07', battery: 76, trend: 'decreasing' },
  { device: 'IR-08', battery: 91, trend: 'stable' },
]

const systemMetrics = [
  { metric: 'Uptime', value: '99.8%', status: 'excellent' },
  { metric: 'Latency', value: '45ms', status: 'good' },
  { metric: 'Packet Loss', value: '0.2%', status: 'good' },
  { metric: 'Data Rate', value: '1.2 Mbps', status: 'excellent' },
  { metric: 'Error Rate', value: '0.05%', status: 'good' },
  { metric: 'Response Time', value: '120ms', status: 'average' },
]

export default function DeviceStatus() {
  const { isConnected, telemetry } = useSocketTelemetry()

  const onlineDevices = devices.filter(d => d.status === 'Online').length
  const offlineDevices = devices.filter(d => d.status === 'Offline').length
  const withBattery = devices.filter(d => d.battery != null)
  const averageBattery = withBattery.reduce((s, d) => s + (d.battery ?? 0), 0) / withBattery.length

  // Add MQTT broker as a live row
  const mqttDevice = {
    id: 'MQTT-01',
    name: 'Mosquitto Broker',
    type: 'MQTT Broker',
    status: isConnected ? 'Online' : 'Offline',
    lastSeen: isConnected ? 'Just now' : 'Unknown',
    battery: null as null | number,
  }
  const allDevices = [...devices, mqttDevice]
  const totalOnline = allDevices.filter(d => d.status === 'Online').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Device Status</h1>
          <p className="text-gray-500">IoT device connectivity and health monitoring</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Live MQTT badge */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isConnected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
          }`}>
            {isConnected ? <><Wifi className="w-3.5 h-3.5" /><span>MQTT Connected</span></> : <><WifiOff className="w-3.5 h-3.5" /><span>MQTT Offline</span></>}
          </div>
          <button className="btn-secondary flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Status</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>Reboot All</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Devices</p>
              <h3 className="text-2xl font-bold text-dark-900">{allDevices.length}</h3>
              <p className="text-sm text-gray-500 mt-2">Connected IoT devices</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Cpu className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Online</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">{totalOnline}</h3>
                {isConnected && <span className="text-sm text-green-600 animate-pulse">●</span>}
              </div>
              <p className="text-sm text-gray-500 mt-2">{allDevices.length - totalOnline} offline</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Wifi className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Avg Battery</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">{averageBattery.toFixed(0)}%</h3>
                <span className={`text-sm font-semibold ${averageBattery > 70 ? 'text-green-600' : averageBattery > 40 ? 'text-orange-600' : 'text-red-600'}`}>
                  {averageBattery > 70 ? 'Good' : averageBattery > 40 ? 'Low' : 'Critical'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Across sensor nodes</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <Battery className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Data Rate</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">{isConnected ? '~4s' : 'N/A'}</h3>
                <span className={`text-sm font-semibold ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>{isConnected ? 'Live' : 'Offline'}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Socket.io update rate</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connectivity History */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Connectivity History</h3>
              <p className="text-sm text-gray-500">Devices online over time</p>
            </div>
            <Server className="w-5 h-5 text-blue-600" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={connectivityHistory}>
                <defs>
                  <linearGradient id="colorConn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[0, 13]} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', color: '#111827' }} />
                <Area type="monotone" dataKey="connected" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorConn)" name="Devices" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Battery Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Battery Levels</h3>
              <p className="text-sm text-gray-500">IR sensor nodes</p>
            </div>
            <Battery className="w-5 h-5 text-orange-600" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batteryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="device" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="battery" radius={[4, 4, 0, 0]} name="Battery %">
                  {batteryHistory.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.battery > 70 ? '#10b981' : entry.battery > 40 ? '#f59e0b' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div><span>Good (&gt;70%)</span></div>
            <div className="flex items-center space-x-1"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div><span>Low (40-70%)</span></div>
            <div className="flex items-center space-x-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span>Critical (&lt;40%)</span></div>
          </div>
        </div>
      </div>

      {/* Device Table (includes live MQTT row) */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Device Registry</h3>
            <p className="text-sm text-gray-500">{allDevices.length} devices — {totalOnline} online</p>
          </div>
          <Zap className="w-5 h-5 text-blue-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Device ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Last Seen</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Battery</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allDevices.map((device) => (
                <tr
                  key={device.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    device.id === 'MQTT-01' ? (isConnected ? 'bg-green-50/40' : 'bg-red-50/40') : ''
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
                      <div className={`w-2.5 h-2.5 rounded-full ${device.status === 'Online' ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></div>
                      <span className={`badge ${device.status === 'Online' ? 'badge-success' : 'badge-danger'}`}>{device.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-600 text-sm">{device.lastSeen}</div>
                  </td>
                  <td className="py-3 px-4">
                    {device.battery != null ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-12 h-2 rounded-full bg-gray-200">
                          <div
                            className={`h-2 rounded-full ${device.battery > 70 ? 'bg-green-500' : device.battery > 40 ? 'bg-orange-400' : 'bg-red-500'}`}
                            style={{ width: `${device.battery}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-dark-900 font-medium">{device.battery}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center space-x-1">
                      <span>Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Metrics */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">System Performance</h3>
            <p className="text-sm text-gray-500">Network and communication metrics</p>
          </div>
          <Activity className="w-5 h-5 text-green-600" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {systemMetrics.map((metric) => (
            <div key={metric.metric} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">{metric.metric}</p>
              <p className="text-xl font-bold text-dark-900 mb-2">{metric.value}</p>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                metric.status === 'excellent' ? 'bg-green-100 text-green-700' :
                metric.status === 'good' ? 'bg-blue-100 text-blue-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Device Alerts */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Device Alerts</h3>
            <p className="text-sm text-gray-500">Active warnings and notifications</p>
          </div>
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <div className="space-y-4">
          {/* Dynamic MQTT status alert */}
          <div className={`p-4 rounded-xl border ${isConnected ? 'bg-green-50/70 border-green-200' : 'bg-red-50/70 border-red-200'}`}>
            <div className="flex items-start space-x-3">
              {isConnected ? <Wifi className="w-5 h-5 text-green-600 mt-0.5" /> : <WifiOff className="w-5 h-5 text-red-600 mt-0.5" />}
              <div className="flex-1">
                <h4 className={`font-semibold mb-1 ${isConnected ? 'text-green-950' : 'text-red-950'}`}>
                  {isConnected ? 'Backend Connected — Live Data Streaming' : 'Backend Offline — Showing Default State'}
                </h4>
                <p className={`text-sm ${isConnected ? 'text-green-800' : 'text-red-800'}`}>
                  {isConnected
                    ? `Receiving live telemetry via Socket.io. Last update: ${telemetry.lastUpdated ? new Date(telemetry.lastUpdated).toLocaleTimeString() : 'just now'}`
                    : 'Could not connect to backend server at localhost:5000. Data shown is default fallback state.'}
                </p>
                <div className={`mt-2 text-xs font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                  Socket.io → localhost:5000 • MQTT → Mosquitto :1883
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-red-50/70 border border-red-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-950 mb-1">Device Offline — IR-04</h4>
                <p className="text-sm text-red-800">
                  West Sensor (IR-04) has been offline for 2 hours. Battery level at 45%.
                  Please check physical connection and battery status.
                </p>
                <div className="mt-2 text-xs font-medium text-red-700">
                  Device: IR-04 • Last seen: 2 hours ago • Priority: High
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-amber-950 mb-1">Low Battery Warning</h4>
                <p className="text-sm text-amber-800">
                  IR-03 (78%) and IR-07 (76%) batteries are below 80%.
                  Schedule battery replacement within 48 hours.
                </p>
                <div className="mt-2 text-xs font-medium text-amber-700">
                  Affected: IR-03, IR-07 • Recommended: Replace batteries
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
