import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { Telemetry } from './models/Telemetry.js';
import { getSnapshotForTelemetry, getLatestState, getLatestStateWithPredictions } from './services/stateService.js';
import telemetryRoutes from './routes/telemetryRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { ensureDefaultUsers } from './services/authService.js';
import { initMQTT } from './config/mqtt.js';
import { trafficController } from './services/trafficController.js';
import { deviceHealthService } from './services/deviceHealthService.js';

// Muat variabel lingkungan
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

const PORT = process.env.PORT || 5000;
const SNAPSHOT_INTERVAL_MS = Number(process.env.TELEMETRY_SNAPSHOT_INTERVAL) || 60000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    dbState: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    latestCityState: getLatestState(),
    timestamp: new Date().toISOString()
  });
});

// Root info
app.get('/', (req, res) => {
  res.json({
    name: 'ARTEFAC Backend API',
    description: 'Artos Real-Time Adaptive Traffic, Automatic Lighting & Waste Control',
    endpoints: {
      health: 'GET /api/health',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me',
      latestTelemetry: 'GET /api/telemetry/latest',
      predictions: 'GET /api/telemetry/predictions',
      updateTelemetry: 'POST /api/telemetry/update',
      telemetryHistory: 'GET /api/telemetry/history',
      trafficStatus: 'GET /api/telemetry/traffic-status',
      trafficOverride: 'POST /api/telemetry/traffic-override',
      chat: 'POST /api/chat',
      chatHistory: 'GET /api/chat/history'
    },
    mqtt: {
      broker: process.env.MQTT_BROKER_URL || 'mqtt://127.0.0.1:1883',
      topic: process.env.MQTT_TOPIC || 'artefac/simpang/artos/telemetry',
      commandTopic: process.env.MQTT_COMMAND_TOPIC || 'artefac/simpang/artos/command'
    }
  });
});

// Socket.io event handling
io.on('connection', (socket) => {
  console.log(`🔌 Client React terhubung via Socket.io: ${socket.id}`);
  
  // Kirim state RAM + status traffic light + device health + hasil prediksi AI saat pertama kali client terhubung
  socket.emit('traffic_light_update', trafficController.getStatus());
  socket.emit('device_health_update', deviceHealthService.getSummary());
  socket.emit('smart_city_update', getLatestStateWithPredictions());

  // Kendali Manual Override / AUTO dari Dashboard React via Socket.io
  socket.on('traffic_override', (payload = {}, ack) => {
    try {
      const updatedStatus = trafficController.setManualOverride(payload);
      if (typeof ack === 'function') {
        ack({ success: true, data: updatedStatus });
      }
    } catch (err) {
      if (typeof ack === 'function') {
        ack({ success: false, message: err.message });
      }
    }
  });

  socket.on('disconnect', () => {
    // Client disconnect
  });
});

// Inisialisasi Mosquitto MQTT Broker & Hubungkan ke Socket.io
initMQTT(io);

// Background Worker: Throttled Snapshot per 60 detik (1 menit)
// Untuk menghemat kuota free-tier MongoDB Atlas
setInterval(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const snapshot = getSnapshotForTelemetry();
      await Telemetry.create(snapshot);
      console.log(`⏱️ [Snapshot 1-Menit] Snapshot telemetri berhasil disimpan ke Atlas (${new Date().toLocaleTimeString()})`);
    }
  } catch (error) {
    console.error('⚠️ [Snapshot Error] Gagal menyimpan telemetri:', error.message);
  }
}, SNAPSHOT_INTERVAL_MS);

// Mulai server
const startServer = async () => {
  await connectDB();
  await ensureDefaultUsers();

  server.listen(PORT, () => {
    console.log(`🚀 ARTEFAC Backend Server berjalan di http://localhost:${PORT}`);
    console.log(`⏱️ Snapshot Telemetri Interval: ${SNAPSHOT_INTERVAL_MS / 1000}s`);
    console.log(`⚡ Real-time RAM Engine & Socket.io aktif (Latensi < 5ms)`);
  });
};

startServer();
