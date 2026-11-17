import mqtt from 'mqtt';
import { updateState, getLatestStateWithPredictions } from '../services/stateManager.js';
import { trafficController } from '../services/trafficController.js';
import { deviceHealthService } from '../services/deviceHealthService.js';

export const initMQTT = (io) => {
  // Hubungkan ke Mosquitto Broker Lokal
  const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://127.0.0.1:1883';
  const telemetryTopic = process.env.MQTT_TOPIC || 'artefac/simpang/artos/telemetry';
  const commandTopic = process.env.MQTT_COMMAND_TOPIC || 'artefac/simpang/artos/command';
  const statusTopic = process.env.MQTT_STATUS_TOPIC || 'artefac/simpang/artos/status';

  const client = mqtt.connect(brokerUrl, {
    reconnectPeriod: 5000, // Otomatis mencoba rekoneksi jika Mosquitto belum aktif
    connectTimeout: 5000
  });

  // Inisialisasi state machine Adaptive Traffic Controller (interval non-blocking 1 detik)
  trafficController.init({
    io,
    mqttClient: client,
    commandTopic,
    dashboardStateProvider: getLatestStateWithPredictions
  });

  // Inisialisasi pemantau status perangkat berbasis Retained Message + Timeout Watchdog
  deviceHealthService.init({
    io,
    mqttClient: client,
    onChange: () => {
      if (io) {
        io.emit('smart_city_update', getLatestStateWithPredictions());
      }
    }
  });

  client.on('connect', () => {
    console.log(`⚡ Terhubung ke Mosquitto MQTT Broker (${brokerUrl})`);
    deviceHealthService.setBrokerConnected(true);
    client.subscribe([telemetryTopic, statusTopic, `${statusTopic}/#`], (err) => {
      if (!err) console.log(`📡 Subscribed: ${telemetryTopic} & ${statusTopic}/# (Retained/LWT)`);
    });
    // Sinkronkan perintah lampu/PJU terkini ke broker saat baru terkoneksi
    trafficController.publishIfChanged(true);
  });

  client.on('message', (topic, message, packet) => {
    // 1. Tangani pesan status perangkat (Retained Message / LWT ONLINE / OFFLINE)
    if (topic === statusTopic || topic.startsWith(`${statusTopic}/`)) {
      const summary = deviceHealthService.handleStatusMessage(topic, message, Boolean(packet?.retain));
      console.log(
        `🩺 MQTT Status [${topic}]${packet?.retain ? ' (RETAINED)' : ''} => aktif: ${summary.onlineCount}/${summary.totalDevices}`
      );
      return;
    }

    try {
      // Bersihkan karakter kontrol (\r, \n, \t, \0, dll.) yang sering terbawa buffer LoRa ESP32
      let cleaned = message.toString('utf8').replace(/[\u0000-\u001F\u007F]/g, '').trim();
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
      }
      const payload = JSON.parse(cleaned);
      
      // 2. Update Heartbeat Perangkat + State RAM + Mesin Adaptif Traffic Light & PJU
      deviceHealthService.recordTelemetryHeartbeat(payload);
      const trafficStatus = trafficController.processTelemetry(payload, { broadcast: false });
      const updated = updateState(payload);
      console.log(
        `📩 MQTT [${topic}] => phase:${trafficStatus.phase}(${trafficStatus.remainingSeconds}s) US:${trafficStatus.corridors.US.vehicles}/5(${trafficStatus.corridors.US.densityLevel}) TB:${trafficStatus.corridors.TB.vehicles}/4(${trafficStatus.corridors.TB.densityLevel}) pwm:${updated.lampPwm}% bin:${updated.binDensity}% (${updated.binStatus})`
      );

      // 3. Broadcast Live Data + Status Traffic Light + Prediksi AI ke React UI via Socket.io
      if (io) {
        io.emit('traffic_light_update', trafficStatus);
        io.emit('smart_city_update', getLatestStateWithPredictions());
      }
    } catch (err) {
      console.error('❌ Error parsing MQTT Payload:', err.message, '| Raw:', JSON.stringify(message.toString()));
    }
  });

  client.on('close', () => {
    deviceHealthService.setBrokerConnected(false);
  });

  client.on('offline', () => {
    deviceHealthService.setBrokerConnected(false);
  });

  // Tangani error agar proses Node tidak crash jika Mosquitto belum dinyalakan
  client.on('error', (err) => {
    deviceHealthService.setBrokerConnected(false);
    console.warn(`⚠️ Mosquitto MQTT Info: ${err.message}. Menunggu broker di ${brokerUrl}...`);
  });

  return client;
};

