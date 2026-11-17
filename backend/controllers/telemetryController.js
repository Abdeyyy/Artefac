import { getLatestState, getLatestStateWithPredictions, getHistoryBuffer, updateState } from '../services/stateService.js';
import { predictTrafficFlow } from '../services/aiModels.js';
import { trafficController } from '../services/trafficController.js';
import { deviceHealthService } from '../services/deviceHealthService.js';
import { Telemetry } from '../models/Telemetry.js';

/**
 * GET /api/telemetry/latest
 * Mengambil state RAM real-time (< 5ms) untuk dashboard dan AI Engine
 */
export const getLatestTelemetry = (req, res) => {
  const startTime = process.hrtime();
  const state = getLatestStateWithPredictions();
  const diff = process.hrtime(startTime);
  const latencyMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

  res.json({
    success: true,
    source: 'RAM',
    latencyMs: `${latencyMs}ms`,
    data: state
  });
};

/**
 * GET /api/telemetry/predictions
 * Mengambil hasil prediksi arus lalu lintas model Hybrid AI (EMA + Regresi Linier + Decision Tree)
 */
export const getTrafficPredictions = (req, res) => {
  const current = getLatestState();
  const predictions = predictTrafficFlow(current, getHistoryBuffer());
  res.json({
    success: true,
    data: predictions
  });
};

/**
 * POST /api/telemetry/update
 * Menerima pembaruan data sensor dari ESP32 / Gateway IoT
 */
export const updateTelemetryData = (req, res) => {
  try {
    deviceHealthService.recordTelemetryHeartbeat(req.body);
    const trafficStatus = trafficController.processTelemetry(req.body, { broadcast: false });
    const updated = updateState(req.body);
    const io = req.app.get('io');
    if (io) {
      io.emit('traffic_light_update', trafficStatus);
      io.emit('smart_city_update', getLatestStateWithPredictions());
    }
    res.json({
      success: true,
      message: 'RAM state & traffic controller berhasil diperbarui',
      data: updated,
      trafficControl: trafficStatus
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/telemetry/history
 * Mengambil rekaman log snapshot telemetri dari MongoDB Atlas
 */
export const getTelemetryHistory = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 60, 500);
    const history = await Telemetry.find()
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data histori telemetri',
      error: error.message
    });
  }
};

/**
 * GET /api/telemetry/traffic-status
 * Mengambil status real-time Adaptive Traffic Light & PJU (fase, countdown, kepadatan koridor, mode manual)
 */
export const getTrafficStatus = (req, res) => {
  res.json({
    success: true,
    data: trafficController.getStatus()
  });
};

/**
 * POST /api/telemetry/traffic-override
 * Mengaktifkan/menonaktifkan mode manual override dari Dashboard React / Admin
 */
export const setTrafficOverride = (req, res) => {
  try {
    const status = trafficController.setManualOverride(req.body || {});
    res.json({
      success: true,
      message: status.isManualOverride
        ? 'Mode Manual Override diaktifkan'
        : 'Siklus AUTO adaptif dilanjutkan',
      data: status
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/telemetry/devices
 * Mengambil status perangkat IoT (ESP32, LoRa, 9 Sensor IR, LDR, Ultrasonik) berbasis Retained MQTT & Watchdog
 */
export const getDeviceHealth = (req, res) => {
  res.json({
    success: true,
    data: deviceHealthService.getSummary()
  });
};

