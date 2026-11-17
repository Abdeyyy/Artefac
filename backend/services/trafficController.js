export const TRAFFIC_CONSTANTS = {
  STANDARD_GREEN_SECONDS: 10,
  EXTENDED_GREEN_SECONDS: 18,
  YELLOW_SECONDS: 2,
  EMPTY_CUTOFF_SECONDS: 4,
  CONGESTION_THRESHOLD_VEHICLES: 3,
  LDR_PJU_THRESHOLD: Number(process.env.LDR_PJU_THRESHOLD) || 300,
  LDR_DARK_BELOW: String(process.env.LDR_DARK_BELOW ?? 'true').toLowerCase() !== 'false',
  INVERT_LDR: String(process.env.INVERT_LDR ?? 'false').toLowerCase() === 'true',
  LDR_MAX_ADC: Number(process.env.LDR_MAX_ADC) || 1023,
  DEFAULT_COMMAND_TOPIC: process.env.MQTT_COMMAND_TOPIC || 'artefac/simpang/artos/command'
};

export const TRAFFIC_PHASES = {
  US_GREEN: {
    key: 'US_GREEN',
    label: 'Koridor Utara-Selatan Hijau',
    valT1: 1,
    valT2: 0,
    valT3: 0,
    defaultDuration: TRAFFIC_CONSTANTS.STANDARD_GREEN_SECONDS,
    corridor: 'US'
  },
  YELLOW_TO_TB: {
    key: 'YELLOW_TO_TB',
    label: 'Transisi Kuning ke Timur-Barat',
    valT1: 0,
    valT2: 0,
    valT3: 1,
    defaultDuration: TRAFFIC_CONSTANTS.YELLOW_SECONDS,
    corridor: 'TRANSITION'
  },
  TB_GREEN: {
    key: 'TB_GREEN',
    label: 'Koridor Timur-Barat Hijau',
    valT1: 0,
    valT2: 1,
    valT3: 0,
    defaultDuration: TRAFFIC_CONSTANTS.STANDARD_GREEN_SECONDS,
    corridor: 'TB'
  },
  YELLOW_TO_US: {
    key: 'YELLOW_TO_US',
    label: 'Transisi Kuning ke Utara-Selatan',
    valT1: 0,
    valT2: 0,
    valT3: 1,
    defaultDuration: TRAFFIC_CONSTANTS.YELLOW_SECONDS,
    corridor: 'TRANSITION'
  }
};

/**
 * Menghitung level kepadatan koridor dari jumlah kendaraan terdeteksi.
 * @param {number} vehicleCount
 * @returns {'LOW' | 'MEDIUM' | 'HIGH'}
 */
export function getDensityLevel(vehicleCount) {
  if (vehicleCount >= TRAFFIC_CONSTANTS.CONGESTION_THRESHOLD_VEHICLES) return 'HIGH';
  if (vehicleCount === 2) return 'MEDIUM';
  return 'LOW';
}

function calcSubsetPct(bits, indices) {
  if (!indices.length) return 0;
  const occupied = indices.reduce((acc, idx) => acc + (bits[idx] === 0 ? 1 : 0), 0);
  return Math.round((occupied / indices.length) * 100);
}

/**
 * Parsing string 9 sensor IR dipisah titik dua (:).
 * Konvensi active-low: '0' = terdeteksi kendaraan, '1' = kosong.
 * Indeks 0..4 (5 sensor) = Koridor Utara-Selatan (U-S).
 * Indeks 5..8 (4 sensor) = Koridor Timur-Barat (T-B).
 * @param {string | number[]} irInput
 */
export function parseIrPayload(irInput) {
  let parts;
  if (Array.isArray(irInput)) {
    parts = irInput;
  } else if (typeof irInput === 'string') {
    parts = irInput.trim().split(':');
  } else {
    parts = [];
  }

  // Default bit = 1 (kosong) jika data tidak lengkap agar tidak menghasilkan deteksi palsu
  const rawBits = Array.from({ length: 9 }, (_, i) => {
    const raw = parts[i];
    if (raw === undefined || raw === null || String(raw).trim() === '') return 1;
    return Number(raw) === 0 ? 0 : 1;
  });

  const usBits = rawBits.slice(0, 5);
  const tbBits = rawBits.slice(5, 9);

  const usVehicles = usBits.filter((b) => b === 0).length;
  const tbVehicles = tbBits.filter((b) => b === 0).length;

  return {
    rawBits,
    usVehicles,
    tbVehicles,
    usTotalSensors: 5,
    tbTotalSensors: 4,
    usDensityLevel: getDensityLevel(usVehicles),
    tbDensityLevel: getDensityLevel(tbVehicles),
    usDensityPct: Math.round((usVehicles / 5) * 100),
    tbDensityPct: Math.round((tbVehicles / 4) * 100),
    lanes: {
      utara: calcSubsetPct(rawBits, [0, 1]),
      selatan: calcSubsetPct(rawBits, [2, 3, 4]),
      timur: calcSubsetPct(rawBits, [5, 6]),
      barat: calcSubsetPct(rawBits, [7, 8])
    }
  };
}

/**
 * Membalik logika ADC LDR mikrokontroler jika hardware membaca nilai tinggi saat gelap:
 * Di mikrokontroler: gelap -> nilai ADC tinggi (0..1023)
 * Di server / dashboard: dibalik menjadi (1023 - raw) sehingga semakin gelap nilainya semakin kecil (lux rendah).
 */
export function normalizeLdrValue(rawLdr) {
  const num = Math.max(0, Number(rawLdr) || 0);
  if (!TRAFFIC_CONSTANTS.INVERT_LDR) {
    return Math.min(TRAFFIC_CONSTANTS.LDR_MAX_ADC, num);
  }
  return Math.max(0, Math.min(TRAFFIC_CONSTANTS.LDR_MAX_ADC, TRAFFIC_CONSTANTS.LDR_MAX_ADC - num));
}

/**
 * Menghitung status PJU dari nilai sensor LDR (mode biner: Nyala Terang Penuh / Mati).
 * @param {number} ldr
 * @param {number} threshold
 */
export function computePjuState(ldr, threshold = TRAFFIC_CONSTANTS.LDR_PJU_THRESHOLD) {
  const numericLdr = Math.max(0, Number(ldr) || 0);
  const isDark = TRAFFIC_CONSTANTS.LDR_DARK_BELOW
    ? numericLdr < threshold
    : numericLdr > threshold;

  const valPJU = isDark ? 1 : 0;
  // Biner murni: Terang Penuh (1023) saat nyala, 0 saat mati (tanpa redup-terang bertahap)
  const pjuPwm1023 = isDark ? 1023 : 0;

  return {
    ldr: numericLdr,
    valPJU,
    pjuPwm1023
  };
}

/**
 * Format tepat string perintah MQTT: CMD,<valT1>,<valT2>,<valT3>,<valPJU>
 * valPJU dikirim 1023 (Terang Penuh 100%) saat menyala dan 0 saat mati
 * agar analogWrite(PJU_PIN, valPJU) pada ESP8266 menyala terang maksimal.
 */
export function formatMqttCommand(valT1, valT2, valT3, valPJU) {
  const pjuVal = Number(valPJU) ? 1023 : 0;
  return `CMD,${Number(valT1) ? 1 : 0},${Number(valT2) ? 1 : 0},${Number(valT3) ? 1 : 0},${pjuVal}`;
}

export class AdaptiveTrafficController {
  constructor(options = {}) {
    this.io = null;
    this.mqttClient = null;
    this.commandTopic = options.commandTopic || TRAFFIC_CONSTANTS.DEFAULT_COMMAND_TOPIC;
    this.tickInterval = null;
    this.onStateChange = typeof options.onStateChange === 'function' ? options.onStateChange : null;
    this.dashboardStateProvider =
      typeof options.dashboardStateProvider === 'function' ? options.dashboardStateProvider : null;

    this.phase = 'US_GREEN';
    this.remainingSeconds = TRAFFIC_CONSTANTS.STANDARD_GREEN_SECONDS;
    this.phaseTotalSeconds = TRAFFIC_CONSTANTS.STANDARD_GREEN_SECONDS;
    this.hasExtendedThisCycle = false;
    this.emptySeconds = 0;

    this.valT1 = 1;
    this.valT2 = 0;
    this.valT3 = 0;
    this.valPJU = 0;
    this.pjuPwm1023 = 0;
    this.ldrRaw = 0;
    this.ldrHardwareRaw = 0;

    this.isManualOverride = false;
    this.lastEventReason = 'Inisialisasi siklus U-S Hijau';
    this.lastPublishedCommand = null;
    this.lastPublishedAt = null;

    this.corridors = parseIrPayload('1:1:1:1:1:1:1:1:1');
  }

  /**
   * Menghubungkan controller ke Socket.io dan MQTT client serta memulai timer non-blocking.
   */
  init({ io = null, mqttClient = null, commandTopic = null, dashboardStateProvider = null, autoStart = true } = {}) {
    if (io) this.io = io;
    if (mqttClient) this.mqttClient = mqttClient;
    if (commandTopic) this.commandTopic = commandTopic;
    if (typeof dashboardStateProvider === 'function') {
      this.dashboardStateProvider = dashboardStateProvider;
    }

    if (autoStart) {
      this.start();
    }

    // Pastikan perintah awal dipublish saat broker sudah siap
    this.publishIfChanged(true);
    return this;
  }

  setMqttClient(mqttClient) {
    this.mqttClient = mqttClient;
  }

  setIo(io) {
    this.io = io;
  }

  start() {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => {
      this.tick();
    }, 1000);
    if (typeof this.tickInterval.unref === 'function') {
      this.tickInterval.unref();
    }
    console.log('🚦 Adaptive Traffic Controller aktif (interval 1 detik non-blocking)');
  }

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  /**
   * Memproses payload telemetri MQTT { ir, ldr, distOut, distIn } tanpa memblokir event loop.
   */
  processTelemetry(payload, { broadcast = true } = {}) {
    if (!payload || typeof payload !== 'object') return this.getStatus();

    if (payload.ir !== undefined) {
      this.corridors = parseIrPayload(payload.ir);
    }

    if (payload.ldr !== undefined) {
      const normalizedLdr = normalizeLdrValue(payload.ldr);
      const pju = computePjuState(normalizedLdr);
      this.ldrRaw = normalizedLdr;
      this.ldrHardwareRaw = Number(payload.ldr) || 0;
      if (!this.isManualOverride && this.valPJU !== pju.valPJU) {
        this.valPJU = pju.valPJU;
        this.pjuPwm1023 = pju.pjuPwm1023;
        this.lastEventReason = `PJU otomatis ${this.valPJU === 1 ? 'MENYALA TERANG' : 'MATI'} (Lux: ${this.ldrRaw})`;
      } else if (!this.isManualOverride) {
        this.pjuPwm1023 = pju.pjuPwm1023;
      }
    }

    if (!this.isManualOverride) {
      this.evaluateAdaptiveExtension();
    }

    this.publishIfChanged();
    if (broadcast) {
      this.broadcastStatus();
    }
    return this.getStatus();
  }

  /**
   * Perpanjangan otomatis jika koridor yang sedang hijau padat (>= 3 kendaraan), maksimal 1x per siklus.
   */
  evaluateAdaptiveExtension() {
    if (this.hasExtendedThisCycle) return false;

    if (this.phase === 'US_GREEN' && this.corridors.usVehicles >= TRAFFIC_CONSTANTS.CONGESTION_THRESHOLD_VEHICLES) {
      const extra = TRAFFIC_CONSTANTS.EXTENDED_GREEN_SECONDS - TRAFFIC_CONSTANTS.STANDARD_GREEN_SECONDS;
      this.remainingSeconds += extra;
      this.phaseTotalSeconds = TRAFFIC_CONSTANTS.EXTENDED_GREEN_SECONDS;
      this.hasExtendedThisCycle = true;
      this.lastEventReason = `Perpanjangan U-S ke 18 detik (${this.corridors.usVehicles} kendaraan terdeteksi)`;
      return true;
    }

    if (this.phase === 'TB_GREEN' && this.corridors.tbVehicles >= TRAFFIC_CONSTANTS.CONGESTION_THRESHOLD_VEHICLES) {
      const extra = TRAFFIC_CONSTANTS.EXTENDED_GREEN_SECONDS - TRAFFIC_CONSTANTS.STANDARD_GREEN_SECONDS;
      this.remainingSeconds += extra;
      this.phaseTotalSeconds = TRAFFIC_CONSTANTS.EXTENDED_GREEN_SECONDS;
      this.hasExtendedThisCycle = true;
      this.lastEventReason = `Perpanjangan T-B ke 18 detik (${this.corridors.tbVehicles} kendaraan terdeteksi)`;
      return true;
    }

    return false;
  }

  /**
   * Satu detak timer 1 detik state machine.
   */
  tick() {
    if (this.isManualOverride) {
      this.broadcastStatus();
      return this.getStatus();
    }

    // Evaluasi kondisi kosong saat fase hijau
    if (this.phase === 'US_GREEN' || this.phase === 'TB_GREEN') {
      const isUsGreen = this.phase === 'US_GREEN';
      const activeVehicles = isUsGreen ? this.corridors.usVehicles : this.corridors.tbVehicles;
      const oppositeVehicles = isUsGreen ? this.corridors.tbVehicles : this.corridors.usVehicles;

      if (activeVehicles === 0) {
        this.emptySeconds += 1;
      } else {
        this.emptySeconds = 0;
      }

      // Potong otomatis jika jalur hijau kosong >= 4 detik & koridor lawan memiliki antrean >= 1
      if (this.emptySeconds >= TRAFFIC_CONSTANTS.EMPTY_CUTOFF_SECONDS && oppositeVehicles >= 1) {
        const nextYellow = isUsGreen ? 'YELLOW_TO_TB' : 'YELLOW_TO_US';
        this.lastEventReason = `Pemotongan hijau dini (${isUsGreen ? 'U-S' : 'T-B'} kosong ${this.emptySeconds}d, lawan antre ${oppositeVehicles})`;
        this.transitionTo(nextYellow, this.lastEventReason);
        this.publishIfChanged();
        this.broadcastStatus();
        return this.getStatus();
      }
    }

    this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);

    if (this.remainingSeconds <= 0) {
      this.advanceToNextPhase();
    }

    this.publishIfChanged();
    this.broadcastStatus();
    return this.getStatus();
  }

  advanceToNextPhase() {
    const order = {
      US_GREEN: 'YELLOW_TO_TB',
      YELLOW_TO_TB: 'TB_GREEN',
      TB_GREEN: 'YELLOW_TO_US',
      YELLOW_TO_US: 'US_GREEN'
    };
    const nextPhase = order[this.phase] || 'US_GREEN';
    this.transitionTo(nextPhase, `Transisi siklus ke ${TRAFFIC_PHASES[nextPhase].label}`);
  }

  transitionTo(phaseKey, reason = null) {
    const config = TRAFFIC_PHASES[phaseKey] || TRAFFIC_PHASES.US_GREEN;
    this.phase = config.key;
    this.valT1 = config.valT1;
    this.valT2 = config.valT2;
    this.valT3 = config.valT3;
    this.remainingSeconds = config.defaultDuration;
    this.phaseTotalSeconds = config.defaultDuration;
    this.hasExtendedThisCycle = false;
    this.emptySeconds = 0;
    this.lastEventReason = reason || `Transisi ke ${config.label}`;

    // Jika langsung padat saat mulai fase hijau, terapkan ekstensi 1x langsung
    if (!this.isManualOverride) {
      this.evaluateAdaptiveExtension();
    }
  }

  /**
   * Mengaktifkan/menonaktifkan mode Manual Override dari REST API / Socket.io Dashboard.
   */
  setManualOverride(input = {}) {
    const enableManual =
      input.mode !== undefined
        ? String(input.mode).toUpperCase() === 'MANUAL'
        : Boolean(input.isManualOverride);

    if (!enableManual) {
      return this.resumeAutoCycle(input.reason || 'Kembali ke mode AUTO adaptif');
    }

    this.isManualOverride = true;

    if (input.phase && TRAFFIC_PHASES[input.phase]) {
      const cfg = TRAFFIC_PHASES[input.phase];
      this.phase = cfg.key;
      this.valT1 = cfg.valT1;
      this.valT2 = cfg.valT2;
      this.valT3 = cfg.valT3;
    } else {
      if (input.valT1 !== undefined) this.valT1 = Number(input.valT1) ? 1 : 0;
      if (input.valT2 !== undefined) this.valT2 = Number(input.valT2) ? 1 : 0;
      if (input.valT3 !== undefined) this.valT3 = Number(input.valT3) ? 1 : 0;
    }

    if (input.valPJU !== undefined) {
      const rawPju = Math.max(0, Math.round(Number(input.valPJU) || 0));
      this.valPJU = rawPju > 0 ? 1 : 0;
      this.pjuPwm1023 = rawPju === 1 ? 1023 : Math.min(1023, rawPju);
    }

    this.lastEventReason = input.reason || `Manual Override aktif (${formatMqttCommand(this.valT1, this.valT2, this.valT3, this.pjuPwm1023)})`;
    this.publishIfChanged(true);
    this.broadcastStatus();
    return this.getStatus();
  }

  resumeAutoCycle(reason = 'Mode AUTO diaktifkan kembali') {
    this.isManualOverride = false;
    const pju = computePjuState(this.ldrRaw);
    this.valPJU = pju.valPJU;
    this.pjuPwm1023 = pju.pjuPwm1023;

    // Pastikan kembali ke fase siklus yang valid jika sebelumnya di-set bebas secara manual
    if (this.valT1 === 1 && this.valT2 === 0 && this.valT3 === 0) {
      this.transitionTo('US_GREEN', reason);
    } else if (this.valT2 === 1 && this.valT1 === 0 && this.valT3 === 0) {
      this.transitionTo('TB_GREEN', reason);
    } else {
      this.transitionTo('US_GREEN', reason);
    }

    this.publishIfChanged(true);
    this.broadcastStatus();
    return this.getStatus();
  }

  /**
   * Publish string perintah persis CMD,<valT1>,<valT2>,<valT3>,<valPJU> ke Mosquitto saat ada perubahan.
   */
  publishIfChanged(force = false) {
    const command = formatMqttCommand(this.valT1, this.valT2, this.valT3, this.valPJU);
    if (!force && command === this.lastPublishedCommand) {
      return false;
    }

    this.lastPublishedCommand = command;
    this.lastPublishedAt = new Date().toISOString();

    if (this.mqttClient && typeof this.mqttClient.publish === 'function') {
      // Hanya publish jika client sudah terkoneksi atau mendukung antrean mqtt.js
      this.mqttClient.publish(this.commandTopic, command, { qos: 0, retain: false });
      console.log(`📤 MQTT [${this.commandTopic}] => ${command} | ${this.lastEventReason}`);
    }

    return true;
  }

  broadcastStatus() {
    const status = this.getStatus();
    if (this.onStateChange) {
      this.onStateChange(status);
    }
    if (this.io) {
      this.io.emit('traffic_light_update', status);
      if (this.dashboardStateProvider) {
        try {
          this.io.emit('smart_city_update', {
            ...this.dashboardStateProvider(),
            trafficControl: status
          });
        } catch {
          // Abaikan jika provider belum siap
        }
      }
    }
  }

  getStatus() {
    const phaseMeta = TRAFFIC_PHASES[this.phase] || TRAFFIC_PHASES.US_GREEN;
    return {
      phase: this.phase,
      phaseLabel: phaseMeta.label,
      activeCorridor: phaseMeta.corridor,
      remainingSeconds: this.remainingSeconds,
      phaseTotalSeconds: this.phaseTotalSeconds,
      hasExtendedThisCycle: this.hasExtendedThisCycle,
      emptySeconds: this.emptySeconds,
      isManualOverride: this.isManualOverride,
      mode: this.isManualOverride ? 'MANUAL' : 'AUTO',
      outputs: {
        valT1: this.valT1,
        valT2: this.valT2,
        valT3: this.valT3,
        valPJU: this.valPJU,
        pjuPwm1023: this.pjuPwm1023
      },
      pjuThreshold: TRAFFIC_CONSTANTS.LDR_PJU_THRESHOLD,
      ldrRaw: this.ldrRaw,
      ldrHardwareRaw: this.ldrHardwareRaw,
      corridors: {
        US: {
          vehicles: this.corridors.usVehicles,
          totalSensors: this.corridors.usTotalSensors,
          densityLevel: this.corridors.usDensityLevel,
          densityPct: this.corridors.usDensityPct
        },
        TB: {
          vehicles: this.corridors.tbVehicles,
          totalSensors: this.corridors.tbTotalSensors,
          densityLevel: this.corridors.tbDensityLevel,
          densityPct: this.corridors.tbDensityPct
        }
      },
      rawBits: this.corridors.rawBits,
      commandTopic: this.commandTopic,
      lastCommand: this.lastPublishedCommand || formatMqttCommand(this.valT1, this.valT2, this.valT3, this.valPJU),
      lastCommandAt: this.lastPublishedAt,
      lastEventReason: this.lastEventReason
    };
  }
}

export const trafficController = new AdaptiveTrafficController();
