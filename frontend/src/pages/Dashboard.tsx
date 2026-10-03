import { motion } from 'framer-motion'
import { 
  Activity, 
  Car, 
  TrafficCone, 
  Trash2, 
  Sun, 
  TrendingUp,
  Users,
  AlertCircle
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const trafficData = [
  { time: '08:00', vehicles: 45, avgSpeed: 35 },
  { time: '09:00', vehicles: 68, avgSpeed: 28 },
  { time: '10:00', vehicles: 52, avgSpeed: 32 },
  { time: '11:00', vehicles: 75, avgSpeed: 25 },
  { time: '12:00', vehicles: 90, avgSpeed: 20 },
  { time: '13:00', vehicles: 60, avgSpeed: 30 },
  { time: '14:00', vehicles: 48, avgSpeed: 33 },
]

const regionData = [
  { region: 'Magelang', infected: 22125, died: 4038, cured: 757 },
  { region: 'Purworejo', infected: 2597, died: 49, cured: 145 },
  { region: 'Yogyakarta', infected: 2361, died: 8, cured: 241 },
  { region: 'Artos', infected: 2251, died: 5, cured: 135 },
  { region: 'North', infected: 2170, died: 5, cured: 98 },
  { region: 'South', infected: 2100, died: 7, cured: 21 },
]

const weeklyActivity = [
  { day: 'Mon', vehicles: 1200 },
  { day: 'Tue', vehicles: 1800 },
  { day: 'Wed', vehicles: 1500 },
  { day: 'Thu', vehicles: 2100 },
  { day: 'Fri', vehicles: 2400 },
  { day: 'Sat', vehicles: 1900 },
  { day: 'Sun', vehicles: 1300 },
]

const stats = [
  {
    title: 'Total Vehicles',
    value: '129,044',
    change: '+4,301',
    changeType: 'increase',
    icon: Car,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    title: 'Waste Bins Full',
    value: '15',
    change: '+2',
    changeType: 'increase',
    icon: Trash2,
    color: 'bg-red-500',
    lightColor: 'bg-red-50',
    textColor: 'text-red-600',
  },
  {
    title: 'Lights Active',
    value: '25',
    change: '+6',
    changeType: 'increase',
    icon: Sun,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-600',
  },
  {
    title: 'Active Sensors',
    value: '11/12',
    change: '+1',
    changeType: 'increase',
    icon: Activity,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-600',
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header with Date */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Information</h1>
          <div className="flex items-center space-x-4 mt-2">
            <button className="text-sm text-dark-400 hover:text-dark-100">My region</button>
            <button className="text-sm text-primary-500 font-medium border-b-2 border-primary-500 pb-1">Simpang Artos</button>
            <button className="text-sm text-dark-400 hover:text-dark-100">Indonesia</button>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-primary-500">
          <button className="p-2 hover:bg-dark-800 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-dark-100 font-medium">19 April 2020</span>
          <button className="p-2 hover:bg-dark-800 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-dark-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.lightColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
            <div>
              <p className="text-sm text-dark-500 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-dark-900 mb-2">{stat.value}</h3>
              <div className="flex items-center space-x-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  stat.changeType === 'increase' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-dark-200">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Traffic Map</h3>
          <div className="h-96 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Simplified Map Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full p-8">
                {/* Traffic Points */}
                <div className="absolute top-1/4 left-1/4 flex flex-col items-center">
                  <div className="bg-orange-500 text-white rounded-full px-4 py-2 font-bold shadow-lg">
                    866
                  </div>
                  <div className="text-xs mt-1 font-medium text-dark-700">Magelang</div>
                </div>
                
                <div className="absolute top-1/2 right-1/3 flex flex-col items-center">
                  <div className="bg-orange-500 text-white rounded-full px-4 py-2 font-bold shadow-lg">
                    895
                  </div>
                  <div className="text-xs mt-1 font-medium text-dark-700">Purworejo</div>
                </div>
                
                <div className="absolute bottom-1/3 left-1/2 flex flex-col items-center">
                  <div className="bg-red-500 text-white rounded-full px-4 py-2 font-bold shadow-lg">
                    2,170
                  </div>
                  <div className="text-xs mt-1 font-medium text-dark-700">Yogyakarta</div>
                </div>
                
                <div className="absolute top-1/2 left-1/3 flex flex-col items-center">
                  <div className="bg-red-500 text-white rounded-full px-4 py-2 font-bold shadow-lg">
                    2,361
                  </div>
                  <div className="text-xs mt-1 font-medium text-dark-700">Artos</div>
                </div>

                <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center">
                  <div className="bg-red-500 text-white rounded-full px-4 py-2 font-bold shadow-lg">
                    22,125
                  </div>
                  <div className="text-xs mt-1 font-medium text-dark-700">Simpang Artos</div>
                </div>

                {/* Legend */}
                <div className="absolute top-4 left-4 bg-white rounded-lg p-3 shadow-md">
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-dark-700">Over 1000</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-dark-700">Up to 1000</span>
                    </div>
                  </div>
                </div>

                {/* Map Label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl font-bold text-dark-300 opacity-30">
                    SIMPANG<br/>ARTOS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-dark-200">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Statistics</h3>
          <div className="space-y-1">
            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-dark-500 pb-2 border-b border-dark-200">
              <div>Region</div>
              <div className="text-right">Vehicles</div>
              <div className="text-right">Issues</div>
              <div className="text-right text-green-600">Active</div>
            </div>
            {regionData.map((region, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 text-sm py-2 border-b border-dark-100">
                <div className="font-medium text-dark-900">{region.region}</div>
                <div className="text-right text-dark-700">{region.infected.toLocaleString()}</div>
                <div className="text-right text-red-600">{region.died}</div>
                <div className="text-right text-green-600">{region.cured}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Flow Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-dark-200">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Traffic Flow Today</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                <Area 
                  type="monotone" 
                  dataKey="vehicles" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVehicles)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-dark-200">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Weekly Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
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
                  dataKey="vehicles" 
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
