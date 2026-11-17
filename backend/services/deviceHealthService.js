import { normalizeLdrValue, parseIrPayload } from './trafficController.js';

const DEFAULT_TIMEOUT_MS = Number(process.env.DEVICE_OFFLINE_TIMEOUT_MS) || 15000;
const STATUS_TOPIC = process.env.MQTT_STATUS_TOPIC || 'artefac/simpang/artos/status';
const RETAINED_HEALTH_TOPIC = process.env.MQTT_DEVICE_HEALTH_TOPIC || 'artefac/simpang/artos/devices/status';

function formatRelativeTime(timestampMs, nowMs = Date.now()) {
  if (!timestampMs) return 'Belum ada data';
  const diffSec = Math.max(0, Math.floor((nowMs - timestampMs) / 1000));
  if (diffSec < 3) return 'Baru saja';
  if (diffSec < 60) return `${diffSec} dtk lalu`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  const diffHour = Math.floor(diffMin / 60);
  return `${diffHour} jam lalu`;
}

class DeviceHealthService {
  constructor() {
    this.io = null;
    this.mqttClient = null;
    this.watchdogTimer = null;
    this.brokerConnected = false;
    this.lastTelemetryAt = null;
    this.lastStatusMessageAt = null;
    this.explicitNodeStatuses = new Map(); // key: deviceId -> { status: 'Aktif'|'Terputus', retained: boolean, updatedAt: number, reason: string }
    this.lastRawSensors = {
      ir: '1:1:1:1:1:1:1:1:1',
      ldr: 0,
      distIn: 0,
      distOut: 0
    };
    this.lastSnapshotSignature = '';
    this.connectivityHistory = [];
    this.onChangeCallback = null;
  }

  init({ io = null, mqttClient = null, onChange = null } = {}) {
    if (io) this.io = io;
    if (mqttClient) this.mqttClient = mqttClient;
    if (typeof onChange === 'function') this.onChangeCallback = onChange;

    if (!this.watchdogTimer) {
      this.watchdogTimer = setInterval(() => {
        this.evaluateWatchdog();
      }, 2000);
      if (typeof this.watchdogTimer.unref === 'function') {
        this.watchdogTimer.unref();
      }
    }
  }

  stop() {
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  setBrokerConnected(connected) {
    this.brokerConnected = Boolean(connected);
    this.emitIfChanged(true);
  }

  /**
   * Menangani pesan status dari topik retained / LWT (contoh: artefac/simpang/artos/status atau .../ESP32-01)
   */
  handleStatusMessage(topic, rawMessage, isRetained = false) {
    const now = Date.now();
    this.lastStatusMessageAt = now;
    const text = rawMessage.toString('utf8').replace(/[\u0000-\u001F\u007F]/g, '').trim();
    if (!text) return this.getSummary(now);

    const topicParts = String(topic).split('/').filter(Boolean);
    const tail = topicParts[topicParts.length - 1];
    const defaultId = tail && tail !== 'status' ? tail.toUpperCase() : 'ESP32-01';

    try {
      const parsed = JSON.parse(text);
      const id = String(parsed.id || parsed.deviceId || defaultId).toUpperCase();
      const rawStatus = String(parsed.status || parsed.state || '').toUpperCase();
      const isOnline = ['ONLINE', 'AKTIF', 'CONNECTED', 'UP', '1', 'TRUE'].includes(rawStatus);
      this.explicitNodeStatuses.set(id, {
        status: isOnline ? 'Aktif' : 'Terputus',
        retained: Boolean(isRetained),
        updatedAt: now,
        reason: isRetained ? 'Retained MQTT Status' : 'MQTT Status Event'
      });
      if (id === 'ESP32-01' && isOnline) {
        this.lastTelemetryAt = this.lastTelemetryAt || now;
      }
    } catch {
      // Plain text payload: "ONLINE" / "OFFLINE" (umum dipakai pada MQTT LWT + retain)
      const upper = text.toUpperCase();
      const isOnline = ['ONLINE', 'AKTIF', 'CONNECTED', 'OK', '1'].includes(upper);
      this.explicitNodeStatuses.set(defaultId, {
        status: isOnline ? 'Aktif' : 'Terputus',
        retained: Boolean(isRetained),
        updatedAt: now,
        reason: isRetained ? `Retained LWT/Status (${upper})` : `MQTT Status (${upper})`
      });
      // Jika gateway/ESP32 mengirim LWT OFFLINE, sinkronkan node LoRa di belakangnya
      if (defaultId === 'ESP32-01' && !isOnline) {
        this.explicitNodeStatuses.set('LORA-01', {
          status: 'Terputus',
          retained: Boolean(isRetained),
          updatedAt: now,
          reason: 'Gateway ESP32 OFFLINE (LWT)'
        });
      }
    }

    this.emitIfChanged(true);
    return this.getSummary(now);
  }

  /**
   * Dipanggil setiap paket telemetri valid masuk dari ESP32/LoRa
   */
  recordTelemetryHeartbeat(payload) {
    const now = Date.now();
    this.lastTelemetryAt = now;

    if (payload && typeof payload === 'object') {
      if (payload.ir !== undefined) this.lastRawSensors.ir = String(payload.ir);
      if (payload.ldr !== undefined) {
        this.lastRawSensors.ldr = normalizeLdrValue(payload.ldr);
        this.lastRawSensors.ldrHardwareRaw = Number(payload.ldr) || 0;
      }
      if (payload.distIn !== undefined) this.lastRawSensors.distIn = Number(payload.distIn) || 0;
      if (payload.distOut !== undefined) this.lastRawSensors.distOut = Number(payload.distOut) || 0;
    }

    this.explicitNodeStatuses.set('ESP32-01', {
      status: 'Aktif',
      retained: false,
      updatedAt: now,
      reason: 'Telemetri MQTT Aktif'
    });
    this.explicitNodeStatuses.set('LORA-01', {
      status: 'Aktif',
      retained: false,
      updatedAt: now,
      reason: 'Paket LoRa Diterima'
    });

    this.emitIfChanged(false);
    return this.getSummary(now);
  }

  evaluateWatchdog() {
    this.emitIfChanged(false);
  }

  isGatewayTimedOut(now = Date.now()) {
    if (!this.lastTelemetryAt) return true;
    return now - this.lastTelemetryAt > DEFAULT_TIMEOUT_MS;
  }

  getSummary(now = Date.now()) {
    const timedOut = this.isGatewayTimedOut(now);
    const espExplicit = this.explicitNodeStatuses.get('ESP32-01');
    const loraExplicit = this.explicitNodeStatuses.get('LORA-01');

    const espOnline =
      espExplicit?.reason?.includes('OFFLINE') || espExplicit?.status === 'Terputus'
        ? false
        : !timedOut || Boolean(espExplicit?.status === 'Aktif' && now - espExplicit.updatedAt <= DEFAULT_TIMEOUT_MS);

    const loraOnline =
      loraExplicit?.status === 'Terputus' && !espOnline
        ? false
        : !timedOut;

    const espLastSeenMs = espExplicit?.updatedAt && (!this.lastTelemetryAt || espExplicit.updatedAt > this.lastTelemetryAt)
      ? espExplicit.updatedAt
      : this.lastTelemetryAt;

    const parsedIr = parseIrPayload(this.lastRawSensors.ir);
    const irDevices = parsedIr.rawBits.map((bit, idx) => {
      const corridor = idx <= 4 ? 'Utara-Selatan' : 'Timur-Barat';
      return {
        id: `IR-0${idx + 1}`,
        name: `Sensor IR #${idx + 1} (${corridor})`,
        type: 'Sensor IR',
        status: loraOnline ? 'Aktif' : 'Terputus',
        source: loraOnline ? 'Heartbeat LoRa' : 'Timeout / Terputus',
        retained: false,
        reading: bit === 0 ? 'Kendaraan (0)' : 'Kosong (1)',
        lastSeen: formatRelativeTime(this.lastTelemetryAt, now)
      };
    });

    const devices = [
      {
        id: 'MQTT-01',
        name: 'Broker Mosquitto Lokal',
        type: 'Broker MQTT',
        status: this.brokerConnected ? 'Aktif' : 'Terputus',
        source: 'Koneksi Broker',
        retained: false,
        reading: this.brokerConnected ? 'Terhubung' : 'Terputus',
        lastSeen: this.brokerConnected ? 'Baru saja' : 'Tidak terhubung'
      },
      {
        id: 'ESP32-01',
        name: 'Kontroler Utama ESP32',
        type: 'ESP32 Gateway',
        status: espOnline ? 'Aktif' : 'Terputus',
        source: espExplicit?.retained ? 'Retained MQTT' : espOnline ? 'Heartbeat MQTT' : 'Timeout (>15 dtk)',
        retained: Boolean(espExplicit?.retained),
        reading: espExplicit?.reason || (espOnline ? 'Online' : 'Menunggu paket'),
        lastSeen: formatRelativeTime(espLastSeenMs, now)
      },
      {
        id: 'LORA-01',
        name: 'Link LoRa Antar-ESP',
        type: 'LoRa Transceiver',
        status: loraOnline ? 'Aktif' : 'Terputus',
        source: loraOnline ? 'Telemetri LoRa' : 'Timeout (>15 dtk)',
        retained: Boolean(loraExplicit?.retained),
        reading: loraOnline ? 'Sinkron' : 'Tidak ada paket',
        lastSeen: formatRelativeTime(this.lastTelemetryAt, now)
      },
      ...irDevices,
      {
        id: 'LDR-01',
        name: 'Sensor Cahaya PJU',
        type: 'Sensor LDR',
        status: loraOnline ? 'Aktif' : 'Terputus',
        source: loraOnline ? 'Telemetri LoRa' : 'Timeout (>15 dtk)',
        retained: false,
        reading: `LDR ${this.lastRawSensors.ldr}`,
        lastSeen: formatRelativeTime(this.lastTelemetryAt, now)
      },
      {
        id: 'US-01',
        name: 'Sensor Kapasitas Sampah (Dalam)',
        type: 'Ultrasonik',
        status: loraOnline ? 'Aktif' : 'Terputus',
        source: loraOnline ? 'Telemetri LoRa' : 'Timeout (>15 dtk)',
        retained: false,
        reading: `${this.lastRawSensors.distIn} cm`,
        lastSeen: formatRelativeTime(this.lastTelemetryAt, now)
      },
      {
        id: 'US-02',
        name: 'Sensor Gerakan Sampah (Luar)',
        type: 'Ultrasonik',
        status: loraOnline ? 'Aktif' : 'Terputus',
        source: loraOnline ? 'Telemetri LoRa' : 'Timeout (>15 dtk)',
        retained: false,
        reading: `${this.lastRawSensors.distOut} cm`,
        lastSeen: formatRelativeTime(this.lastTelemetryAt, now)
      }
    ];

    const totalDevices = devices.length;
    const onlineCount = devices.filter((d) => d.status === 'Aktif').length;
    const offlineCount = totalDevices - onlineCount;

    return {
      totalDevices,
      onlineCount,
      offlineCount,
      timeoutSeconds: Math.round(DEFAULT_TIMEOUT_MS / 1000),
      statusTopic: STATUS_TOPIC,
      retainedHealthTopic: RETAINED_HEALTH_TOPIC,
      lastTelemetryAt: this.lastTelemetryAt ? new Date(this.lastTelemetryAt).toISOString() : null,
      devices,
      connectivityHistory: this.connectivityHistory
    };
  }

  emitIfChanged(force = false) {
    const now = Date.now();
    const summary = this.getSummary(now);
    const signature = summary.devices.map((d) => `${d.id}:${d.status}`).join('|');

    if (force || signature !== this.lastSnapshotSignature) {
      this.lastSnapshotSignature = signature;

      const timeLabel = new Date(now).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      this.connectivityHistory.push({
        time: timeLabel,
        connected: summary.onlineCount
      });
      if (this.connectivityHistory.length > 20) {
        this.connectivityHistory.shift();
      }
      summary.connectivityHistory = this.connectivityHistory;

      // Publish retained health summary ke Mosquitto agar client yang baru terhubung langsung tahu kondisi terakhir
      if (this.mqttClient && typeof this.mqttClient.publish === 'function' && this.brokerConnected) {
        const retainedPayload = JSON.stringify({
          onlineCount: summary.onlineCount,
          offlineCount: summary.offlineCount,
          totalDevices: summary.totalDevices,
          esp32: summary.devices.find((d) => d.id === 'ESP32-01')?.status || 'Terputus',
          lora: summary.devices.find((d) => d.id === 'LORA-01')?.status || 'Terputus',
          updatedAt: new Date(now).toISOString()
        });
        this.mqttClient.publish(RETAINED_HEALTH_TOPIC, retainedPayload, { qos: 1, retain: true });
      }

      if (this.io) {
        this.io.emit('device_health_update', summary);
      }
      if (this.onChangeCallback) {
        this.onChangeCallback(summary);
      }
    }
  }
}

export const deviceHealthService = new DeviceHealthService();

