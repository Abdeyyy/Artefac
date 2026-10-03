import { motion } from 'framer-motion'
import { 
  TrafficCone, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  Cpu,
  Zap,
  RefreshCw,
  ChevronRight,
  Car,
  MapPin
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const trafficSensors = [
  { id: 1, direction: 'Magelang', vehicles: 18, density: 'Medium', greenTime: 25, status: 'Active' },
  { id: 2, direction: 'Purworejo', vehicles: 27, density: 'High', greenTime: 40, status: 'Active' },
  { id: 3, direction: 'Yogyakarta', vehicles: 21, density: 'High', greenTime: 35, status: 'Active' },
  { id: 4, direction: 'Artos', vehicles: 8, density: 'Low', greenTime: 15, status: 'Active' },
  { id: 5, direction: 'North', vehicles: 14, density: 'Medium', greenTime: 20, status: 'Active' },
  { id: 6, direction: 'South', vehicles: 19, density: 'Medium', greenTime: 25, status: 'Active' },
  { id: 7, direction: 'East', vehicles: 12, density: 'Low', greenTime: 18, status: 'Inactive' },
  { id: 8, direction: 'West', vehicles: 23, density: 'High', greenTime: 30, status: 'Active' },
]

const trafficHistory = [
  { time: '08:00', vehicles: 45, density: 0.6 },
  { time: '09:00', vehicles: 68, density: 0.8 },
  { time: '10:00', vehicles: 52, density: 0.65 },
  { time: '11:00', vehicles: 75, density: 0.9 },
  { time: '12:00', vehicles: 90, density: 1.0 },
  { time: '13:00', vehicles: 60, density: 0.7 },
  { time: '14:00', vehicles: 48, density: 0.6 },
]

const aiPredictions = [
  { minute: 5, predictedVehicles: 85, confidence: 88 },
  { minute: 10, predictedVehicles: 92, confidence: 82 },
  { minute: 15, predictedVehicles: 78, confidence: 76 },
  { minute: 20, predictedVehicles: 65, confidence: 85 },
  { minute: 25, predictedVehicles: 58, confidence: 79 },
]

export default function TrafficIntelligence() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Traffic Intelligence</h1>
          <p className="text-gray-600">Real-time monitoring and AI-powered traffic control</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Manual Control</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Vehicles</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">1,248</h3>
                <span className="text-sm text-green-600">+12%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Sensors</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">7/8</h3>
                <span className="text-sm text-orange-600">1 inactive</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <Cpu className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Avg Green Time</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">26s</h3>
                <span className="text-sm text-blue-600">Adaptive</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Peak Density</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-dark-900">92%</h3>
                <span className="text-sm text-red-600">Heavy</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Map */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Simpang Artos Traffic Map</h3>
            <p className="text-sm text-gray-500">Real-time vehicle detection and traffic flow</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Low Density</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm text-gray-600">Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">High</span>
            </div>
          </div>
        </div>

        {/* Traffic Map Visualization */}
        <div className="h-96 bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg border border-gray-200 overflow-hidden relative">
          {/* Simplified Map */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-80 h-80">
              {/* Road Intersection */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Vertical Road */}
                <div className="absolute inset-x-0 top-0 h-full w-4 bg-gray-300 rounded-full mx-auto">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-8 bg-blue-300 rounded-full animate-pulse"></div>
                </div>
                
                {/* Horizontal Road */}
                <div className="absolute inset-y-0 left-0 w-full h-4 bg-gray-300 rounded-full my-auto">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                </div>

                {/* Sensor Points */}
                {trafficSensors.map((sensor, index) => {
                  const positions = [
                    { top: '20%', left: '50%' }, // North
                    { top: '50%', left: '80%' }, // East
                    { top: '80%', left: '50%' }, // South
                    { top: '50%', left: '20%' }, // West
                    { top: '35%', left: '35%' }, // NW
                    { top: '35%', left: '65%' }, // NE
                    { top: '65%', left: '65%' }, // SE
                    { top: '65%', left: '35%' }, // SW
                  ]

                  const densityColor = sensor.density === 'High' ? 'bg-red-500' : 
                                     sensor.density === 'Medium' ? 'bg-orange-500' : 
                                     'bg-green-500'

                  return (
                    <div
                      key={sensor.id}
                      className={`absolute w-6 h-6 ${densityColor} rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-md`}
                      style={positions[index]}
                    >
                      <MapPin className="w-3 h-3 text-white" />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-md border border-gray-200">
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-700">Low (&lt;30%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-700">Medium (30-70%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-700">High (&gt;70%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic History Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Traffic Flow</h3>
              <p className="text-sm text-gray-500">Hourly vehicle count and density</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="vehicles" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="density" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">Vehicle Count</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Density Level</span>
            </div>
          </div>
        </div>

        {/* AI Predictions */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">AI Predictions</h3>
              <p className="text-sm text-gray-500">Traffic density forecast</p>
            </div>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiPredictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="minute" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="predictedVehicles" 
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Next 5 minutes: 85 vehicles predicted (88% confidence)</p>
          </div>
        </div>
      </div>

      {/* Sensor Data Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Sensor Monitoring</h3>
            <p className="text-sm text-gray-500">8 infrared sensors real-time data</p>
          </div>
          <TrafficCone className="w-5 h-5 text-blue-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Direction</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Vehicles</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Density</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Green Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trafficSensors.map((sensor) => (
                <tr key={sensor.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-dark-900">{sensor.direction}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-dark-900 font-medium">{sensor.vehicles}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${
                      sensor.density === 'High' ? 'badge-danger' :
                      sensor.density === 'Medium' ? 'badge-warning' :
                      'badge-success'
                    }`}>
                      {sensor.density}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-dark-900 font-medium">{sensor.greenTime}s</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${
                      sensor.status === 'Active' ? 'badge-success' : 'badge-danger'
                    }`}>
                      {sensor.status}
                    </span>
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
    </div>
  )
}
