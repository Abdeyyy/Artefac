import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface TrafficForecastItem {
  minute: string;
  minutesAhead: number;
  predictedVehicles: number;
  avgDensity: number;
  perLane: {
    utara: number;
    selatan: number;
    timur: number;
    barat: number;
  };
  confidence: number;
}

export interface TrafficPredictionData {
  modelName: string;
  hasRealData: boolean;
  sampleCount: number;
  overallSlope: number;
  trendLabel: string;
  decisionTree?: {
    regime: string;
    urgency: string;
    busiestLane: string;
    busiestName: string;
    busiestDensity: number;
    recommendedGreenSec: number;
    decisionPath: string[];
  };
  forecasts: TrafficForecastItem[];
}

export interface DeviceHealthNode {
  id: string;
  name: string;
  type: string;
  status: 'Aktif' | 'Terputus';
  source: string;
  retained: boolean;
  reading: string;
  lastSeen: string;
}

export interface DeviceHealthSummary {
  totalDevices: number;
  onlineCount: number;
  offlineCount: number;
  timeoutSeconds: number;
  statusTopic: string;
  retainedHealthTopic: string;
  lastTelemetryAt: string | null;
  devices: DeviceHealthNode[];
  connectivityHistory: Array<{ time: string; connected: number }>;
}

export interface TrafficControlStatus {
  phase:
    | 'US_GREEN'
    | 'YELLOW_TO_TIMUR'
    | 'TIMUR_GREEN'
    | 'YELLOW_TO_BARAT'
    | 'BARAT_GREEN'
    | 'YELLOW_TO_US'
    | 'YELLOW_TO_TB'
    | 'TB_GREEN';
  phaseLabel: string;
  activeCorridor: string;
  activeLane?: string;
  remainingSeconds: number;
  phaseTotalSeconds: number;
  isManualOverride: boolean;
  mode: 'AUTO' | 'MANUAL';
  outputs: {
    valT1: number;
    valT2: number;
    valT3: number;
    valT4?: number;
    valPJU: number;
    pjuPwm1023: number;
  };
  pjuThreshold?: number;
  ldrRaw: number;
  ldrHardwareRaw?: number;
  lastCommand: string;
  lastEventReason: string;
}

export interface TelemetryState {
  lanes: {
    utara: number;
    selatan: number;
    timur: number;
    barat: number;
  };
  activeLane: 'utara' | 'selatan' | 'timur' | 'barat';
  greenDuration: number;
  lampPwm: number;
  binDensity: number;
  binStatus: 'OPEN' | 'CLOSED';
  rawSensors?: {
    ir: string;
    ldr: number;
    ldrHardwareRaw?: number;
    distOut: number;
    distIn: number;
  };
  lastUpdated?: string | Date;
  predictions?: TrafficPredictionData;
  deviceHealth?: DeviceHealthSummary;
  trafficControl?: TrafficControlStatus;
}

const defaultState: TelemetryState = {
  lanes: { utara: 0, selatan: 0, timur: 0, barat: 0 },
  activeLane: 'utara',
  greenDuration: 15,
  lampPwm: 0,
  binDensity: 0,
  binStatus: 'CLOSED'
};

export const useSocketTelemetry = (serverUrl = 'http://localhost:5000') => {
  const [telemetry, setTelemetry] = useState<TelemetryState>(defaultState);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    let socket: Socket | null = null;
    try {
      socket = io(serverUrl, {
        reconnectionAttempts: 10,
        reconnectionDelay: 3000,
        timeout: 3000
      });

      socket.on('connect', () => {
        setIsConnected(true);
      });

      // Menerima update real-time dari Mosquitto MQTT -> Socket.io
      socket.on('smart_city_update', (data: TelemetryState) => {
        if (data && data.lanes) {
          setTelemetry(data);
        }
      });

      socket.on('device_health_update', (deviceHealth: DeviceHealthSummary) => {
        if (deviceHealth) {
          setTelemetry((prev) => ({ ...prev, deviceHealth }));
        }
      });

      socket.on('traffic_light_update', (trafficControl: TrafficControlStatus) => {
        if (trafficControl) {
          setTelemetry((prev) => ({ ...prev, trafficControl }));
        }
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('connect_error', () => {
        setIsConnected(false);
      });
    } catch {
      // Graceful fallback
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [serverUrl]);

  const refresh = async () => {
    try {
      const res = await fetch(`${serverUrl}/api/telemetry/latest`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.lanes) {
          setTelemetry(json.data);
        }
      }
    } catch {
      // Abaikan jika offline
    }
  };

  return { telemetry, isConnected, refresh };
};

