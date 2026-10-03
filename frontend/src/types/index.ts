export interface TrafficSensor {
  id: number
  direction: string
  vehicleCount: number
  density: 'Low' | 'Medium' | 'High'
  greenTime: number
  status: 'Active' | 'Inactive'
}

export interface TrafficLight {
  direction: string
  currentState: 'red' | 'yellow' | 'green'
  countdown: number
  recommendedTime: number
}

export interface WasteSensor {
  id: number
  name: string
  distance: number
  fullness: number
  status: 'Normal' | 'Near Full' | 'Full'
  lastUpdated: string
}

export interface LightingSensor {
  id: number
  name: string
  intensity: number
  threshold: number
  status: 'ON' | 'OFF'
  mode: 'Auto' | 'Manual'
  lastUpdated: string
}

export interface Device {
  id: string
  name: string
  type: 'ESP32' | 'LoRa Gateway' | 'IR Sensor' | 'Ultrasonic Sensor' | 'LDR Sensor'
  status: 'Online' | 'Offline'
  lastSeen: string
  battery?: number
}

export interface AIRecommendation {
  direction: string
  predictedDensity: number
  congestionLevel: 'Low' | 'Medium' | 'High'
  recommendedGreenTime: number
  confidence: number
}

export interface Alert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export interface DashboardStats {
  systemStatus: 'Online' | 'Offline'
  totalVehicles: number
  trafficLightStatus: string
  wasteFullness: number
  lightingStatus: string
  activeSensors: number
  totalAlerts: number
}
