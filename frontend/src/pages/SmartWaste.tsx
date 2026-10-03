import { motion } from 'framer-motion'
import { 
  Trash2, 
  AlertCircle, 
  TrendingUp, 
  RefreshCw,
  BarChart3,
  Clock,
  ChevronRight
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts'

const wasteSensors = [
  { id: 1, name: 'Main Gate', distance: 45, fullness: 65, status: 'Near Full', lastUpdated: '2 min ago' },
  { id: 2, name: 'North Side', distance: 80, fullness: 20, status: 'Normal', lastUpdated: '5 min ago' },
  { id: 3, name: 'East Gate', distance: 30, fullness: 85, status: 'Full', lastUpdated: '1 min ago' },
  { id: 4, name: 'West Side', distance: 60, fullness: 40, status: 'Normal', lastUpdated: '3 min ago' },
  { id: 5, name: 'South Gate', distance: 25, fullness: 90, status: 'Full', lastUpdated: 'Just now' },
]

const fullnessHistory = [
  { time: '08:00', fullness: 45 },
  { time: '09:00', fullness: 52 },
  { time: '10:00', fullness: 58 },
  { time: '11:00', fullness: 65 },
  { time: '12:00', fullness: 72 },
  { time: '13:00', fullness: 68 },
  { time: '14:00', fullness: 75 },
]

const collectionSchedule = [
  { bin: 'Main Gate', lastCollected: 'Today 08:30', nextSchedule: 'Tomorrow 08:30', priority: 'High' },
  { bin: 'East Gate', lastCollected: 'Yesterday 14:00', nextSchedule: 'Today 16:00', priority: 'High' },
  { bin: 'South Gate', lastCollected: 'Today 10:15', nextSchedule: 'Tomorrow 10:15', priority: 'Medium' },
  { bin: 'North Side', lastCollected: '2 days ago', nextSchedule: 'Tomorrow 09:00', priority: 'Low' },
  { bin: 'West Side', lastCollected: 'Today 07:45', nextSchedule: 'Tomorrow 07:45', priority: 'Low' },
]

const statusDistribution = [
  { name: 'Normal', value: 40, color: '#10b981' },
  { name: 'Near Full', value: 35, color: '#f59e0b' },
  { name: 'Full', value: 25, color: '#ef4444' },
]

export default function SmartWaste() {
  const totalFullness = wasteSensors.reduce((sum, sensor) => sum + sensor.fullness, 0) / wasteSensors.length
  const fullBins = wasteSensors.filter(sensor => sensor.status === 'Full').length
  const nearFullBins = wasteSensors.filter(sensor => sensor.status === 'Near Full').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Smart Waste Management</h1>
          <p className="text-dark-400">Ultrasonic sensor monitoring and waste level tracking</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>Dispatch Team</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400 mb-1">Average Fullness</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-white">{totalFullness.toFixed(1)}%</h3>
                <span className="text-sm text-success-400">+2.5%</span>
              </div>
              <p className="text-sm text-dark-400 mt-2">Across all bins</p>
            </div>
            <div className="p-3 rounded-lg bg-primary-500/10">
              <BarChart3 className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400 mb-1">Full Bins</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-white">{fullBins}</h3>
                <span className="text-sm text-danger-400">Requires attention</span>
              </div>
              <p className="text-sm text-dark-400 mt-2">Immediate collection needed</p>
            </div>
            <div className="p-3 rounded-lg bg-danger-500/10">
              <AlertCircle className="w-6 h-6 text-danger-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400 mb-1">Near Full Bins</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-white">{nearFullBins}</h3>
                <span className="text-sm text-warning-400">Monitor closely</span>
              </div>
              <p className="text-sm text-dark-400 mt-2">Schedule collection soon</p>
            </div>
            <div className="p-3 rounded-lg bg-warning-500/10">
              <TrendingUp className="w-6 h-6 text-warning-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Waste Bin Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Bin Monitoring</h3>
              <p className="text-sm text-dark-400">Real-time ultrasonic sensor data</p>
            </div>
            <Trash2 className="w-5 h-5 text-success-400" />
          </div>
          <div className="space-y-4">
            {wasteSensors.map((sensor) => (
              <motion.div
                key={sensor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-lg bg-dark-800/50 border border-dark-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      sensor.status === 'Full' ? 'bg-danger-500/20' :
                      sensor.status === 'Near Full' ? 'bg-warning-500/20' :
                      'bg-success-500/20'
                    }`}>
                      <Trash2 className={`w-4 h-4 ${
                        sensor.status === 'Full' ? 'text-danger-400' :
                        sensor.status === 'Near Full' ? 'text-warning-400' :
                        'text-success-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{sensor.name}</h4>
                      <p className="text-xs text-dark-400">Sensor #{sensor.id}</p>
                    </div>
                  </div>
                  <span className={`badge ${
                    sensor.status === 'Full' ? 'badge-danger' :
                    sensor.status === 'Near Full' ? 'badge-warning' :
                    'badge-success'
                  }`}>
                    {sensor.status}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-dark-400">Fullness Level</span>
                    <span className="text-white font-medium">{sensor.fullness}%</span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        sensor.fullness > 80 ? 'bg-danger-500' :
                        sensor.fullness > 50 ? 'bg-warning-500' :
                        'bg-success-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${sensor.fullness}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-dark-400">Distance</p>
                    <p className="text-white font-medium">{sensor.distance} cm</p>
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

        {/* Charts and Distribution */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Fullness Trend</h3>
                <p className="text-sm text-dark-400">Hourly waste level progression</p>
              </div>
              <TrendingUp className="w-5 h-5 text-primary-400" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fullnessHistory}>
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
                    dataKey="fullness" 
                    stroke="#0ea5e9" 
                    fill="url(#colorFullness)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorFullness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-dark-400">
              <p>Peak fullness typically occurs between 12:00-14:00</p>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Status Distribution</h3>
                <p className="text-sm text-dark-400">Current bin status overview</p>
              </div>
              <BarChart3 className="w-5 h-5 text-success-400" />
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

      {/* Collection Schedule */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Collection Schedule</h3>
            <p className="text-sm text-dark-400">Waste collection planning and history</p>
          </div>
          <Clock className="w-5 h-5 text-warning-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Waste Bin</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Last Collected</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Next Schedule</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Priority</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {collectionSchedule.map((schedule) => (
                <tr key={schedule.bin} className="border-b border-dark-800/50 hover:bg-dark-800/30">
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{schedule.bin}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-dark-300">{schedule.lastCollected}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white font-medium">{schedule.nextSchedule}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${
                      schedule.priority === 'High' ? 'badge-danger' :
                      schedule.priority === 'Medium' ? 'badge-warning' :
                      'badge-success'
                    }`}>
                      {schedule.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center space-x-1">
                      <span>Schedule</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-dark-400">
          <p>Thresholds: Normal (0-50%), Near Full (51-80%), Full (81-100%)</p>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Waste Management Alerts</h3>
            <p className="text-sm text-dark-400">System notifications and recommendations</p>
          </div>
          <AlertCircle className="w-5 h-5 text-danger-400" />
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-danger-500/10 border border-danger-500/30">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-danger-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">Immediate Collection Required</h4>
                <p className="text-sm text-dark-300">
                  South Gate waste bin is 90% full. Schedule collection team immediately.
                </p>
                <div className="mt-2 text-xs text-danger-400">
                  Last updated: Just now • Priority: High
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-warning-500/10 border border-warning-500/30">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-warning-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">Near Full Bins Detected</h4>
                <p className="text-sm text-dark-300">
                  Main Gate (65%) and East Gate (85%) are approaching full capacity.
                  Consider scheduling collection within 4 hours.
                </p>
                <div className="mt-2 text-xs text-warning-400">
                  Last updated: 2 minutes ago • Priority: Medium
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-success-500/10 border border-success-500/30">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-success-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">Regular Collection Complete</h4>
                <p className="text-sm text-dark-300">
                  North Side waste bin collected successfully at 08:30. Next collection scheduled for tomorrow.
                </p>
                <div className="mt-2 text-xs text-success-400">
                  Completed: Today 08:30 • Status: Normal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
