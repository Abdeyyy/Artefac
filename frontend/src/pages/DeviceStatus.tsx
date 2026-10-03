import { motion } from 'framer-motion'
import { 
  Cpu, 
  Wifi, 
  Activity, 
  Battery,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Clock,
  Zap,
  Server
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts'

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
  { id: 'US-01', name: 'Waste Sensor', type: 'Ultrasonic Sensor', status: 'Online', lastSeen: '3 min ago', battery: 68 },
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
  const onlineDevices = devices.filter(device => device.status === 'Online').length
  const offlineDevices = devices.filter(device => device.status === 'Offline').length
  const averageBattery = devices.filter(device => device.battery).reduce((sum, device) => sum + device.battery!, 0) / devices.filter(device => device.battery).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Device Status</h1>
          <p className="text-dark-400">IoT device connectivity and health monitoring</p>
        </div>
        <div className="flex items-center space-x-3">
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400 mb-1">Total Devices</p>
              <h3 className="text-2xl font-bold text-white">{devices.length}</h3>
              <p className="text-sm text-dark-400 mt-2">Connected IoT devices</p>
            </div>
            <div className="p-3 rounded-lg bg-primary-500/10">
              <Cpu className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400 mb-1">Online</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-white">{onlineDevices}</h3>
                <span className="text-sm text-success-400">{((onlineDevices/devices.length)*100).toFixed(0)}%</span>
              </div>
              <p className="text-sm text-dark-400 mt-2">Active connections</p>
            </div>
            <div className="p-3 rounded-lg bg-success-500/10">
              <Activity className="w-6 h-6 text-success-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400 mb-1">Offline</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-white">{offlineDevices}</h3>
                <span className="text-sm text-danger-400">Requires attention</span>
              </div>
              <p className="text-sm text-dark-400 mt-2">Needs troubleshooting</p>
            </div>
            <div className="p-3 rounded-lg bg-danger-500/10">
              <AlertCircle className="w-6 h-6 text-danger-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400 mb-1">Avg Battery</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-white">{averageBattery.toFixed(0)}%</h3>
                <span className="text-sm text-warning-400">Good</span>
              </div>
              <p className="text-sm text-dark-400 mt-2">Battery-powered devices</p>
            </div>
            <div className="p-3 rounded-lg bg-warning-500/10">
              <Battery className="w-6 h-6 text-warning-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Device Grid */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Device Inventory</h3>
            <p className="text-sm text-dark-400">All connected IoT devices and sensors</p>
          </div>
          <Cpu className="w-5 h-5 text-primary-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-lg border ${
                device.status === 'Online' 
                  ? 'bg-dark-800/50 border-success-500/30' 
                  : 'bg-dark-800/30 border-danger-500/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    device.type === 'ESP32' ? 'bg-primary-500/20' :
                    device.type === 'LoRa Gateway' ? 'bg-purple-500/20' :
                    device.type.includes('IR') ? 'bg-success-500/20' :
                    device.type.includes('Ultrasonic') ? 'bg-warning-500/20' :
                    'bg-blue-500/20'
                  }`}>
                    {device.type === 'ESP32' ? (
                      <Cpu className="w-4 h-4 text-primary-400" />
                    ) : device.type === 'LoRa Gateway' ? (
                      <Wifi className="w-4 h-4 text-purple-400" />
                    ) : device.type.includes('IR') ? (
                      <Activity className="w-4 h-4 text-success-400" />
                    ) : device.type.includes('Ultrasonic') ? (
                      <Zap className="w-4 h-4 text-warning-400" />
                    ) : (
                      <Server className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{device.name}</h4>
                    <p className="text-xs text-dark-400">{device.id}</p>
                  </div>
                </div>
                <span className={`badge ${
                  device.status === 'Online' ? 'badge-success' : 'badge-danger'
                }`}>
                  {device.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-400">Type</span>
                  <span className="text-white font-medium">{device.type}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-400">Last Seen</span>
                  <span className="text-white font-medium">{device.lastSeen}</span>
                </div>

                {device.battery !== null && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-dark-400">Battery</span>
                      <span className={`font-medium ${
                        device.battery > 70 ? 'text-success-400' :
                        device.battery > 40 ? 'text-warning-400' :
                        'text-danger-400'
                      }`}>
                        {device.battery}%
                      </span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          device.battery > 70 ? 'bg-success-500' :
                          device.battery > 40 ? 'bg-warning-500' :
                          'bg-danger-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${device.battery}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-dark-800">
                  <button className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center space-x-1">
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Connectivity Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Connectivity History</h3>
              <p className="text-sm text-dark-400">Device connection trends over time</p>
            </div>
            <Wifi className="w-5 h-5 text-primary-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={connectivityHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="connected" 
                  stroke="#0ea5e9" 
                  fill="url(#colorConnected)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorConnected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-dark-400">
            <p>Average connected devices: {((connectivityHistory.reduce((sum, item) => sum + item.connected, 0) / connectivityHistory.length).toFixed(1))}</p>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Battery Health</h3>
              <p className="text-sm text-dark-400">Battery levels across IR sensors</p>
            </div>
            <Battery className="w-5 h-5 text-warning-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batteryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="device" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar 
                  dataKey="battery" 
                  radius={[4, 4, 0, 0]}
                >
                  {batteryHistory.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.battery > 70 ? '#10b981' :
                        entry.battery > 40 ? '#f59e0b' :
                        '#ef4444'
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-success-500"></div>
              <span className="text-sm text-dark-300">Good (&gt;70%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-warning-500"></div>
              <span className="text-sm text-dark-300">Low (40-70%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-danger-500"></div>
              <span className="text-sm text-dark-300">Critical (&lt;40%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">System Performance</h3>
            <p className="text-sm text-dark-400">Network and communication metrics</p>
          </div>
          <Activity className="w-5 h-5 text-success-400" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {systemMetrics.map((metric) => (
            <div key={metric.metric} className="p-4 rounded-lg bg-dark-800/50 border border-dark-700">
              <p className="text-sm text-dark-400 mb-1">{metric.metric}</p>
              <p className="text-xl font-bold text-white mb-2">{metric.value}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                metric.status === 'excellent' ? 'bg-success-500/20 text-success-400' :
                metric.status === 'good' ? 'bg-primary-500/20 text-primary-400' :
                'bg-warning-500/20 text-warning-400'
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
            <h3 className="text-lg font-semibold text-white">Device Alerts</h3>
            <p className="text-sm text-dark-400">Active warnings and notifications</p>
          </div>
          <AlertCircle className="w-5 h-5 text-danger-400" />
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-danger-500/10 border border-danger-500/30">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-danger-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">Device Offline - IR-04</h4>
                <p className="text-sm text-dark-300">
                  West Sensor (IR-04) has been offline for 2 hours. Battery level at 45%.
                  Please check physical connection and battery status.
                </p>
                <div className="mt-2 text-xs text-danger-400">
                  Device: IR-04 • Last seen: 2 hours ago • Priority: High
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-warning-500/10 border border-warning-500/30">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-warning-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">Low Battery Warning</h4>
                <p className="text-sm text-dark-300">
                  IR-03 (78%) and IR-07 (76%) batteries are below 80%. 
                  Schedule battery replacement within 48 hours.
                </p>
                <div className="mt-2 text-xs text-warning-400">
                  Affected: IR-03, IR-07 • Recommended: Replace batteries
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/30">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-primary-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">Maintenance Schedule</h4>
                <p className="text-sm text-dark-300">
                  Next scheduled maintenance for all devices is in 7 days.
                  Prepare replacement batteries and perform connectivity tests.
                </p>
                <div className="mt-2 text-xs text-primary-400">
                  Schedule: Next week • Devices: All • Duration: 4 hours
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
