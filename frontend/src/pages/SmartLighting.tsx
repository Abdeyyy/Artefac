import { useState } from 'react'
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
  ToggleRight
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const lightingSensors = [
  { id: 1, name: 'Main Road', intensity: 320, threshold: 300, status: 'ON', mode: 'Auto', lastUpdated: '2 min ago' },
  { id: 2, name: 'North Street', intensity: 280, threshold: 300, status: 'ON', mode: 'Auto', lastUpdated: '3 min ago' },
  { id: 3, name: 'East Gate', intensity: 450, threshold: 300, status: 'OFF', mode: 'Auto', lastUpdated: '1 min ago' },
  { id: 4, name: 'West Side', intensity: 250, threshold: 300, status: 'ON', mode: 'Manual', lastUpdated: '5 min ago' },
  { id: 5, name: 'South Path', intensity: 290, threshold: 300, status: 'ON', mode: 'Auto', lastUpdated: 'Just now' },
]

const intensityHistory = [
  { time: '18:00', intensity: 150, status: 'OFF' },
  { time: '19:00', intensity: 80, status: 'ON' },
  { time: '20:00', intensity: 50, status: 'ON' },
  { time: '21:00', intensity: 40, status: 'ON' },
  { time: '22:00', intensity: 35, status: 'ON' },
  { time: '23:00', intensity: 30, status: 'ON' },
  { time: '00:00', intensity: 25, status: 'ON' },
  { time: '01:00', intensity: 280, status: 'OFF' },
  { time: '02:00', intensity: 350, status: 'OFF' },
]

const energyUsage = [
  { hour: '18-19', consumption: 45, cost: 3200 },
  { hour: '19-20', consumption: 68, cost: 4800 },
  { hour: '20-21', consumption: 72, cost: 5100 },
  { hour: '21-22', consumption: 70, cost: 5000 },
  { hour: '22-23', consumption: 65, cost: 4600 },
  { hour: '23-00', consumption: 60, cost: 4200 },
]

const statusDistribution = [
  { name: 'ON', value: 80, color: '#f59e0b' },
  { name: 'OFF', value: 20, color: '#64748b' },
]

export default function SmartLighting() {
  const [autoMode, setAutoMode] = useState(true)
  
  const averageIntensity = lightingSensors.reduce((sum, sensor) => sum + sensor.intensity, 0) / lightingSensors.length
  const lightsOn = lightingSensors.filter(sensor => sensor.status === 'ON').length
  const totalConsumption = energyUsage.reduce((sum, hour) => sum + hour.consumption, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Smart Lighting Control</h1>
          <p className="text-dark-400">LDR sensor monitoring and automated lighting management</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
          <button 
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
              autoMode 
                ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                : 'bg-dark-700 hover:bg-dark-600 text-dark-100 border border-dark-600'
            }`}
            onClick={() => setAutoMode(!autoMode)}
          >
            {autoMode ? (
              <>
                <ToggleRight className="w-5 h-5" />
                <span>Auto Mode</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5" />
                <span>Manual Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400 mb-1">Average Intensity</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-white">{averageIntensity.toFixed(0)} lux</h3>
                <span className="text-sm text-success-400">Within range</span>
              </div>
              <p className="text-sm text-dark-400 mt-2">Threshold: 300 lux</p>
            </div>
            <div className="p-3 rounded-lg bg-primary-500/10">
              <Sun className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400 mb-1">Lights Active</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-white">{lightsOn}/5</h3>
                <span className="text-sm text-warning-400">{((lightsOn/5)*100).toFixed(0)}% active</span>
              </div>
              <p className="text-sm text-dark-400 mt-2">Based on ambient light</p>
            </div>
            <div className="p-3 rounded-lg bg-warning-500/10">
              <Zap className="w-6 h-6 text-warning-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400 mb-1">Energy Consumption</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-white">{totalConsumption} kWh</h3>
                <span className="text-sm text-success-400">-12% vs yesterday</span>
              </div>
              <p className="text-sm text-dark-400 mt-2">Last 6 hours</p>
            </div>
            <div className="p-3 rounded-lg bg-success-500/10">
              <TrendingUp className="w-6 h-6 text-success-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Lighting Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Lighting Control Panel</h3>
              <p className="text-sm text-dark-400">Individual light control and monitoring</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-success-500"></div>
              <span className="text-sm text-dark-300">Auto</span>
            </div>
          </div>
          <div className="space-y-4">
            {lightingSensors.map((sensor) => (
              <motion.div
                key={sensor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-lg bg-dark-800/50 border border-dark-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      sensor.status === 'ON' ? 'bg-warning-500/20' : 'bg-dark-700/50'
                    }`}>
                      {sensor.status === 'ON' ? (
                        <Sun className="w-4 h-4 text-warning-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-dark-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{sensor.name}</h4>
                      <p className="text-xs text-dark-400">LDR Sensor #{sensor.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`badge ${
                      sensor.mode === 'Auto' ? 'badge-success' : 'badge-info'
                    }`}>
                      {sensor.mode}
                    </span>
                    <button className={`w-10 h-6 rounded-full relative transition-colors ${
                      sensor.status === 'ON' ? 'bg-warning-500' : 'bg-dark-700'
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        sensor.status === 'ON' ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Intensity Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-dark-400">Light Intensity</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{sensor.intensity} lux</span>
                      <span className={`text-xs ${
                        sensor.intensity < sensor.threshold ? 'text-success-400' : 'text-dark-400'
                      }`}>
                        Threshold: {sensor.threshold} lux
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        sensor.intensity < sensor.threshold ? 'bg-warning-500' : 'bg-dark-600'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (sensor.intensity / 500) * 100)}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-dark-400">Status</p>
                    <p className={`font-medium ${
                      sensor.status === 'ON' ? 'text-warning-400' : 'text-dark-300'
                    }`}>
                      {sensor.status === 'ON' ? 'Illuminating' : 'Idle'}
                    </p>
                  </div>
                  <div>
                    <p className="text-dark-400">Last Updated</p>
                    <p className="text-white font-medium">{sensor.lastUpdated}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Intensity Trend</h3>
                <p className="text-sm text-dark-400">24-hour light intensity monitoring</p>
              </div>
              <TrendingUp className="w-5 h-5 text-primary-400" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={intensityHistory}>
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
                    dataKey="intensity" 
                    stroke="#f59e0b" 
                    fill="url(#colorIntensity)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-dark-400">
              <p>Lights automatically turn ON when intensity drops below 300 lux</p>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Status Distribution</h3>
                <p className="text-sm text-dark-400">Current lighting status overview</p>
              </div>
              <Sun className="w-5 h-5 text-warning-400" />
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center space-x-6">
              {statusDistribution.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-dark-300">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Energy Consumption */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Energy Consumption</h3>
            <p className="text-sm text-dark-400">Hourly power usage and cost analysis</p>
          </div>
          <Zap className="w-5 h-5 text-success-400" />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={energyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar 
                dataKey="consumption" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                dot={{ fill: '#0ea5e9', r: 4 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-success-500"></div>
              <span className="text-dark-300">Consumption (kWh)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
              <span className="text-dark-300">Cost (IDR)</span>
            </div>
          </div>
          <button className="text-primary-400 hover:text-primary-300 flex items-center space-x-1">
            <span>View Detailed Report</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lighting Schedule */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Lighting Schedule</h3>
            <p className="text-sm text-dark-400">Automated lighting control timetable</p>
          </div>
          <Clock className="w-5 h-5 text-warning-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Action</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Intensity Threshold</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Mode</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dark-800/50 hover:bg-dark-800/30">
                <td className="py-3 px-4">
                  <div className="font-medium text-white">18:00 - 06:00</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-dark-300">Auto ON when &lt;300 lux</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-white font-medium">300 lux</div>
                </td>
                <td className="py-3 px-4">
                  <span className="badge badge-success">Auto</span>
                </td>
                <td className="py-3 px-4">
                  <span className="badge badge-warning">Active</span>
                </td>
              </tr>
              <tr className="border-b border-dark-800/50 hover:bg-dark-800/30">
                <td className="py-3 px-4">
                  <div className="font-medium text-white">06:00 - 18:00</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-dark-300">Auto OFF when &gt;300 lux</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-white font-medium">300 lux</div>
                </td>
                <td className="py-3 px-4">
                  <span className="badge badge-success">Auto</span>
                </td>
                <td className="py-3 px-4">
                  <span className="badge badge-warning">Active</span>
                </td>
              </tr>
              <tr className="border-b border-dark-800/50 hover:bg-dark-800/30">
                <td className="py-3 px-4">
                  <div className="font-medium text-white">22:00 - 05:00</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-dark-300">Dim to 70% brightness</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-white font-medium">200 lux</div>
                </td>
                <td className="py-3 px-4">
                  <span className="badge badge-info">Scheduled</span>
                </td>
                <td className="py-3 px-4">
                  <span className="badge badge-success">Enabled</span>
                </td>
              </tr>
              <tr className="hover:bg-dark-800/30">
                <td className="py-3 px-4">
                  <div className="font-medium text-white">Emergency</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-dark-300">Manual override available</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-white font-medium">N/A</div>
                </td>
                <td className="py-3 px-4">
                  <span className="badge badge-danger">Manual</span>
                </td>
                <td className="py-3 px-4">
                  <span className="badge badge-success">Ready</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts and Recommendations */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Lighting Alerts</h3>
            <p className="text-sm text-dark-400">System notifications and recommendations</p>
          </div>
          <AlertCircle className="w-5 h-5 text-warning-400" />
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-success-500/10 border border-success-500/30">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-success-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">Energy Saving Achieved</h4>
                <p className="text-sm text-dark-300">
                  Smart lighting system saved 12% energy compared to yesterday through optimized scheduling.
                </p>
                <div className="mt-2 text-xs text-success-400">
                  Savings: 45 kWh • Cost reduction: IDR 32,000
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-warning-500/10 border border-warning-500/30">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-warning-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">Manual Override Detected</h4>
                <p className="text-sm text-dark-300">
                  West Side lighting is in manual mode. Consider switching back to auto mode for energy optimization.
                </p>
                <div className="mt-2 text-xs text-warning-400">
                  Location: West Side • Mode: Manual • Duration: 2 hours
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/30">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-primary-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">Schedule Optimization</h4>
                <p className="text-sm text-dark-300">
                  AI suggests adjusting dimming schedule to 23:00-04:00 for additional 8% energy savings.
                </p>
                <div className="mt-2 text-xs text-primary-400">
                  Recommendation: Adjust schedule • Potential savings: 30 kWh/month
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
