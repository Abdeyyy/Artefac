/**
 * Modul 2 & 3 & 7: Representasi Pengetahuan (Frame, Semantic Network, Rule Base)
 * Basis pengetahuan murni lokal untuk kawasan Simpang Artos, Magelang.
 */

// 1. Frame Representation (Representasi Frame untuk objek domain Simpang Artos)
export const DOMAIN_FRAMES = {
  lanes: {
    utara: {
      id: 'utara',
      nama: 'Magelang',
      jalan: 'Jl. Panglima Besar Sudirman',
      arahTujuan: 'Pusat Kota Magelang / Alun-Alun',
      kapasitasOptimal: 65,
      ambangPadat: 70,
      tetangga: ['timur', 'barat', 'selatan']
    },
    timur: {
      id: 'timur',
      nama: 'Artos',
      jalan: 'Jl. Soekarno Hatta',
      arahTujuan: 'Kawasan Artos / Semarang / Secang',
      kapasitasOptimal: 65,
      ambangPadat: 70,
      tetangga: ['utara', 'selatan', 'barat']
    },
    selatan: {
      id: 'selatan',
      nama: 'Yogyakarta',
      jalan: 'Jl. Magelang - Yogyakarta',
      arahTujuan: 'Mertoyudan / Muntilan / Yogyakarta',
      kapasitasOptimal: 70,
      ambangPadat: 70,
      tetangga: ['utara', 'timur', 'barat']
    },
    barat: {
      id: 'barat',
      nama: 'Purworejo',
      jalan: 'Jl. Jenderal Sarwo Edhi Wibowo (Jalur 215)',
      arahTujuan: 'Salaman / Borobudur / Purworejo',
      kapasitasOptimal: 60,
      ambangPadat: 70,
      tetangga: ['utara', 'timur', 'selatan']
    }
  },
  subsystems: {
    traffic: { nama: 'Kontrol Lampu Adaptif', sensor: 'Inframerah (4 Jalur)', aktuator: 'Traffic Light APILL' },
    lighting: { nama: 'Penerangan Jalan Pintar', sensor: 'LDR Intensitas Cahaya', aktuator: 'Dimmer PWM (0-100%)' },
    waste: { nama: 'Tempat Sampah Pintar', sensor: 'Ultrasonik HC-SR04', aktuator: 'Servo Penutup & Notifikasi' }
  }
};

// 2. Semantic Network (Jaringan Semantik antar node lalu lintas Magelang - Simpang Artos)
export const SEMANTIC_NETWORK = {
  nodes: {
    Magelang: { label: 'Kota Magelang (Utara)', laneKey: 'utara', coord: [-7.5009, 110.2235] },
    Simpang_Artos: { label: 'Simpang Empat Artos', laneKey: null, coord: [-7.5036, 110.2238] },
    Artos_Timur: { label: 'Jl. Soekarno Hatta / Artos (Timur)', laneKey: 'timur', coord: [-7.5015, 110.2253] },
    Yogyakarta: { label: 'Arah Yogyakarta / Mertoyudan (Selatan)', laneKey: 'selatan', coord: [-7.5063, 110.2243] },
    Purworejo: { label: 'Arah Purworejo / Jalur 215 (Barat)', laneKey: 'barat', coord: [-7.5055, 110.2205] },
    Jalur_Pakelan: { label: 'Jalur Alternatif Pakelan', laneKey: null, baseCost: 18, coord: [-7.5010, 110.2215] },
    Ringroad_Banyurojo: { label: 'Lingkar Banyurojo - Mertoyudan', laneKey: null, baseCost: 22, coord: [-7.5050, 110.2270] }
  },
  edges: [
    { from: 'Magelang', to: 'Simpang_Artos', relation: 'menuju_persimpangan', laneKey: 'utara', distanceCost: 10 },
    { from: 'Simpang_Artos', to: 'Magelang', relation: 'keluar_persimpangan', laneKey: 'utara', distanceCost: 10 },

    { from: 'Artos_Timur', to: 'Simpang_Artos', relation: 'menuju_persimpangan', laneKey: 'timur', distanceCost: 10 },
    { from: 'Simpang_Artos', to: 'Artos_Timur', relation: 'keluar_persimpangan', laneKey: 'timur', distanceCost: 10 },

    { from: 'Yogyakarta', to: 'Simpang_Artos', relation: 'menuju_persimpangan', laneKey: 'selatan', distanceCost: 10 },
    { from: 'Simpang_Artos', to: 'Yogyakarta', relation: 'keluar_persimpangan', laneKey: 'selatan', distanceCost: 10 },

    { from: 'Purworejo', to: 'Simpang_Artos', relation: 'menuju_persimpangan', laneKey: 'barat', distanceCost: 10 },
    { from: 'Simpang_Artos', to: 'Purworejo', relation: 'keluar_persimpangan', laneKey: 'barat', distanceCost: 10 },

    // Rute alternatif menghindari kepadatan di pusat Simpang Artos
    { from: 'Magelang', to: 'Jalur_Pakelan', relation: 'alternatif_barat', laneKey: null, distanceCost: 16 },
    { from: 'Jalur_Pakelan', to: 'Purworejo', relation: 'tembus_purworejo', laneKey: null, distanceCost: 15 },
    { from: 'Purworejo', to: 'Jalur_Pakelan', relation: 'tembus_magelang', laneKey: null, distanceCost: 15 },
    { from: 'Jalur_Pakelan', to: 'Magelang', relation: 'alternatif_utara', laneKey: null, distanceCost: 16 },

    { from: 'Artos_Timur', to: 'Ringroad_Banyurojo', relation: 'alternatif_timur', laneKey: null, distanceCost: 18 },
    { from: 'Ringroad_Banyurojo', to: 'Yogyakarta', relation: 'tembus_yogyakarta', laneKey: null, distanceCost: 18 },
    { from: 'Yogyakarta', to: 'Ringroad_Banyurojo', relation: 'alternatif_selatan', laneKey: null, distanceCost: 18 },
    { from: 'Ringroad_Banyurojo', to: 'Artos_Timur', relation: 'tembus_artos', laneKey: null, distanceCost: 18 }
  ]
};

// 3. Expert System Production Rules (IF ... THEN ... dengan Certainty Factor)
export const EXPERT_RULES = [
  {
    id: 'R1',
    name: 'Kemacetan Kritis Jalur Tunggal',
    cf: 0.92,
    category: 'TRAFFIC',
    condition: (ctx) => ctx.maxDensity >= 75,
    diagnosis: (ctx) => `Jalur ${ctx.maxLaneName} mengalami kepadatan kritis (${ctx.maxDensity}%)`,
    recommendation: (ctx) => `Perpanjang durasi hijau jalur ${ctx.maxLaneName} ke ${Math.min(50, Math.round(15 + (ctx.maxDensity / 100) * 35))} detik`
  },
  {
    id: 'R2',
    name: 'Ketidakseimbangan Beban Simpang',
    cf: 0.85,
    category: 'TRAFFIC',
    condition: (ctx) => ctx.spread >= 35 && ctx.maxDensity >= 50,
    diagnosis: (ctx) => `Terjadi penumpukan tidak merata sebesar ${ctx.spread}% antara ${ctx.maxLaneName} dan ${ctx.minLaneName}`,
    recommendation: (ctx) => `Alihkan fase hijau berikutnya ke ${ctx.maxLaneName} agar antrean tidak meluber ke tengah simpang`
  },
  {
    id: 'R3',
    name: 'Prioritas Lampu Belum Optimal',
    cf: 0.80,
    category: 'TRAFFIC',
    condition: (ctx) => ctx.activeLaneDensity + 20 <= ctx.maxDensity && ctx.maxDensity >= 50,
    diagnosis: (ctx) => `Lampu hijau sedang menyala di ${ctx.activeLaneName} (${ctx.activeLaneDensity}%), padahal ${ctx.maxLaneName} jauh lebih padat (${ctx.maxDensity}%)`,
    recommendation: (ctx) => `Segera rotasi fase hijau ke jalur ${ctx.maxLaneName}`
  },
  {
    id: 'R4',
    name: 'Tren Kenaikan Arus Cepat',
    cf: 0.88,
    category: 'PREDICTION',
    condition: (ctx) => ctx.trendSlope >= 2.5,
    diagnosis: () => `Laju pertambahan kendaraan meningkat signifikan (+${'trend'}%/siklus)`,
    recommendation: () => `Siapkan skema waktu hijau adaptif lebih panjang untuk 10–15 menit mendatang`
  },
  {
    id: 'R5',
    name: 'Kapasitas Sampah Penuh',
    cf: 0.95,
    category: 'WASTE',
    condition: (ctx) => ctx.state.binDensity >= 80,
    diagnosis: (ctx) => `Tempat sampah sudah terisi ${ctx.state.binDensity}% (kategori Penuh)`,
    recommendation: () => `Kirim petugas kebersihan ke Simpang Artos dan kunci penutup bila perlu`
  },
  {
    id: 'R6',
    name: 'Penerangan Aktif Efisien',
    cf: 0.82,
    category: 'LIGHTING',
    condition: (ctx) => ctx.state.lampPwm > 30,
    diagnosis: (ctx) => `Penerangan jalan menyala pada daya PWM ${ctx.state.lampPwm}%`,
    recommendation: () => `Pertahankan mode otomatis berbasis sensor LDR agar konsumsi daya tetap efisien`
  },
  {
    id: 'R7',
    name: 'Kondisi Simpang Lancar Terkendali',
    cf: 0.90,
    category: 'TRAFFIC',
    condition: (ctx) => ctx.maxDensity > 0 && ctx.maxDensity < 40,
    diagnosis: (ctx) => `Seluruh jalur terpantau lengang dengan kepadatan maksimal hanya ${ctx.maxDensity}%`,
    recommendation: () => `Gunakan siklus hijau minimum (15–20 detik) agar pergantian antar jalur tetap cepat`
  },
  {
    id: 'R8',
    name: 'Sensor Belum Mengirim Data Aktif',
    cf: 0.98,
    category: 'SYSTEM',
    condition: (ctx) => ctx.totalDensity === 0 && ctx.state.lampPwm === 0 && ctx.state.binDensity === 0,
    diagnosis: () => `Semua nilai sensor masih 0 karena ESP32/MQTT belum mengirimkan paket telemetri terbaru`,
    recommendation: () => `Pastikan perangkat ESP32 atau broker Mosquitto sudah mengirim data ke topik artefac/simpang/artos/telemetry`
  }
];

