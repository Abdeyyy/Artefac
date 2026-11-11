import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

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
  lastUpdated?: string | Date;
}

const defaultState: TelemetryState = {
  lanes: { utara: 42, selatan: 58, timur: 28, barat: 18 },
  activeLane: 'selatan',
  greenDuration: 35,
  lampPwm: 80,
  binDensity: 65,
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

  return { telemetry, isConnected };
};

