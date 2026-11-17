/**
 * In-Memory RAM City State Management & Rolling Time-Series Buffer
 * Menjaga latensi pembacaan data di bawah 5ms tanpa overhead query database.
 * State hanya diperbarui dari data sensor asli (MQTT ESP32/LoRa / API update).
 */
import { predictTrafficFlow } from './aiModels.js';
import { computePjuState, normalizeLdrValue, parseIrPayload, trafficController } from './trafficController.js';
import { deviceHealthService } from './deviceHealthService.js';

let latestCityState = {
  lanes: {
    utara: 0,
    selatan: 0,
    timur: 0,
    barat: 0
  },
  activeLane: 'utara',
  greenDuration: 15,
  lampPwm: 0,
  binDensity: 0,
  binStatus: 'CLOSED',
  rawSensors: {
    ir: '1:1:1:1:1:1:1:1:1',
    ldr: 0,
    ldrHardwareRaw: 0,
    distOut: 0,
    distIn: 0
  },
  lastUpdated: null
};

const MAX_HISTORY_POINTS = 60;
const telemetryHistoryBuffer = [];
const laneList = ['utara', 'selatan', 'timur', 'barat'];

/**
 * Mengambil state kota saat ini langsung dari RAM (< 5ms)
 */
export const getLatestState = () => {
  return {
    ...latestCityState,
    lanes: { ...latestCityState.lanes },
    rawSensors: { ...latestCityState.rawSensors }
  };
};

export const getState = getLatestState;

export const getHistoryBuffer = () => telemetryHistoryBuffer;

export const getLatestStateWithPredictions = () => {
  const base = getLatestState();
  return {
    ...base,
    predictions: predictTrafficFlow(base, telemetryHistoryBuffer),
    trafficControl: trafficController.getStatus(),
    deviceHealth: deviceHealthService.getSummary()
  };
};

function mapLdrToPwm(ldrValue) {
  const v = Math.max(0, Number(ldrValue) || 0);
  if (v <= 100) return Math.round(v);
  if (v <= 255) return Math.round((v / 255) * 100);
  if (v <= 1023) return Math.round((v / 1023) * 100);
  return Math.round((Math.min(4095, v) / 4095) * 100);
}

/**
 * Memperbarui state RAM dari sensor telemetri (IoT ESP32 LoRa Gateway / MQTT)
 * Mendukung format standar { lanes, activeLane, ... } maupun format gateway hardware { ir, ldr, distOut, distIn }
 */
export const updateState = (newState) => {
  if (!newState) return getLatestState();

  // 1. Format hardware ESP32 LoRa Gateway: { ir: "0:1:1:0:1:1:1:1:1", ldr, distOut, distIn }
  // Active-low IR: 0 = terdeteksi kendaraan, 1 = kosong. Indeks 0..4 = U-S, 5..8 = T-B.
  if (typeof newState.ir === 'string') {
    const parsedIr = parseIrPayload(newState.ir);
    latestCityState.rawSensors.ir = newState.ir;
    latestCityState.lanes = { ...parsedIr.lanes };

    // Sinkronkan activeLane & greenDuration fallback (dibatasi 15..50 untuk validasi skema MongoDB)
    if (!newState.activeLane) {
      const sorted = laneList
        .map((k) => ({ k, val: latestCityState.lanes[k] }))
        .sort((a, b) => b.val - a.val);
      if (sorted[0].val > 0) {
        latestCityState.activeLane = sorted[0].k;
      }
      if (newState.greenDuration === undefined) {
        latestCityState.greenDuration = Math.min(50, Math.max(15, Math.round(15 + (sorted[0].val / 100) * 35)));
      }
    }
  }

  if (newState.ldr !== undefined) {
    const normalizedLdr = normalizeLdrValue(newState.ldr);
    latestCityState.rawSensors.ldr = normalizedLdr;
    latestCityState.rawSensors.ldrHardwareRaw = Number(newState.ldr) || 0;
    if (newState.lampPwm === undefined) {
      const pju = computePjuState(normalizedLdr);
      latestCityState.lampPwm = pju.valPJU === 1 ? 100 : 0;
    }
  }

  if (newState.distIn !== undefined) {
    const distInCm = Math.max(0, Number(newState.distIn) || 0);
    latestCityState.rawSensors.distIn = distInCm;
    if (newState.binDensity === undefined) {
      // Kapasitas penuh pada jarak <= 3 cm dari sensor; kosong pada >= 50 cm (dapat diatur via .env)
      const fullCm = Number(process.env.BIN_FULL_CM) || 3;
      const emptyCm = Number(process.env.BIN_EMPTY_CM) || 50;
      const clamped = Math.min(emptyCm, Math.max(fullCm, distInCm));
      latestCityState.binDensity = Math.round(((emptyCm - clamped) / (emptyCm - fullCm)) * 100);
    }
  }

  if (newState.distOut !== undefined) {
    const distOutCm = Math.max(0, Number(newState.distOut) || 0);
    latestCityState.rawSensors.distOut = distOutCm;
    if (!newState.binStatus) {
      // Samakan dengan firmware ESP8266: tutup terbuka jika jarak tangan > 0 && < 5 cm
      const openThresholdCm = Number(process.env.BIN_OPEN_DIST_CM) || 5;
      latestCityState.binStatus = distOutCm > 0 && distOutCm < openThresholdCm ? 'OPEN' : 'CLOSED';
    }
  }

  // 2. Format standar JSON { lanes, activeLane, greenDuration, lampPwm, binDensity, binStatus }
  if (newState.lanes) {
    latestCityState.lanes = {
      utara: Math.min(100, Math.max(0, Number(newState.lanes.utara ?? latestCityState.lanes.utara))),
      selatan: Math.min(100, Math.max(0, Number(newState.lanes.selatan ?? latestCityState.lanes.selatan))),
      timur: Math.min(100, Math.max(0, Number(newState.lanes.timur ?? latestCityState.lanes.timur))),
      barat: Math.min(100, Math.max(0, Number(newState.lanes.barat ?? latestCityState.lanes.barat))),
    };
  }

  if (newState.activeLane && laneList.includes(newState.activeLane)) {
    latestCityState.activeLane = newState.activeLane;
  }

  if (newState.greenDuration !== undefined) {
    latestCityState.greenDuration = Math.min(50, Math.max(15, Number(newState.greenDuration)));
  }

  if (newState.lampPwm !== undefined) {
    latestCityState.lampPwm = Math.min(100, Math.max(0, Number(newState.lampPwm)));
  }

  if (newState.binDensity !== undefined) {
    latestCityState.binDensity = Math.min(100, Math.max(0, Number(newState.binDensity)));
    if (!newState.binStatus && newState.distOut === undefined) {
      latestCityState.binStatus = latestCityState.binDensity >= 90 ? 'OPEN' : 'CLOSED';
    }
  }

  if (newState.binStatus && ['OPEN', 'CLOSED'].includes(newState.binStatus)) {
    latestCityState.binStatus = newState.binStatus;
  }

  latestCityState.lastUpdated = new Date();

  // Simpan ke buffer time-series untuk model prediksi AI
  telemetryHistoryBuffer.push({
    lanes: { ...latestCityState.lanes },
    activeLane: latestCityState.activeLane,
    timestamp: latestCityState.lastUpdated
  });
  if (telemetryHistoryBuffer.length > MAX_HISTORY_POINTS) {
    telemetryHistoryBuffer.shift();
  }

  return getLatestState();
};

/**
 * Menghasilkan snapshot untuk disimpan periodik ke Mongoose Telemetry Model
 */
export const getSnapshotForTelemetry = () => {
  return {
    timestamp: new Date(),
    lanes: { ...latestCityState.lanes },
    activeLane: latestCityState.activeLane,
    greenDuration: latestCityState.greenDuration,
    lampPwm: latestCityState.lampPwm,
    binDensity: latestCityState.binDensity,
    binStatus: latestCityState.binStatus
  };
};
