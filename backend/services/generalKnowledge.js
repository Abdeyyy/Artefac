/**
 * Local General Knowledge Engine + Online Incremental Learning (BM25 / TF-IDF)
 * 100% Lokal tanpa API AI eksternal.
 * Mendukung:
 * 1. Pencarian pengetahuan umum (AI, IoT, Pemrograman, Geografi, Sains) via BM25
 * 2. Kalkulator ekspresi matematika & konversi satuan dasar
 * 3. Akuisisi pengetahuan baru langsung dari percakapan pengguna (persisten ke JSON)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEARNED_FILE = path.join(__dirname, '..', 'data', 'learned_knowledge.json');

const CORE_KNOWLEDGE = [
  // --- Materi Kecerdasan Buatan (AI) ---
  {
    id: 'ai-1',
    topic: 'Kecerdasan Buatan (Artificial Intelligence)',
    keywords: ['kecerdasan', 'buatan', 'ai', 'artificial', 'intelligence', 'agen', 'cerdas'],
    answer: 'Kecerdasan Buatan (AI) adalah cabang ilmu komputer yang membuat mesin mampu meniru kecerdasan manusia seperti memahami bahasa, bernalar, belajar dari data, dan mengambil keputusan. Dalam arsitektur agen cerdas, sistem bekerja lewat siklus Perceive (menangkap input/sensor) → Reason (mengolah pengetahuan) → Act (memberi aksi atau jawaban).'
  },
  {
    id: 'ai-2',
    topic: 'Representasi Pengetahuan (Knowledge Representation)',
    keywords: ['representasi', 'pengetahuan', 'knowledge', 'representation', 'fakta', 'aturan', 'ontologi'],
    answer: 'Representasi Pengetahuan adalah cara menyusun informasi dunia nyata ke dalam struktur yang bisa diproses komputer—seperti logika predikat, aturan produksi (IF–THEN), Semantic Network, dan Frame—supaya mesin bisa menarik kesimpulan secara sistematis.'
  },
  {
    id: 'ai-3',
    topic: 'Semantic Network & Frame',
    keywords: ['semantic', 'network', 'jaringan', 'semantik', 'frame', 'slot', 'node', 'edge', 'relasi'],
    answer: 'Semantic Network merepresentasikan pengetahuan sebagai graf berarah berisi simpul (objek/konsep) dan sisi (relasi seperti "terhubung_ke" atau "is-a"). Sementara Frame mirip objek/tabel berslot yang menyimpan atribut tetap maupun dinamis dari suatu entitas, misalnya atribut jalur jalan atau sensor.'
  },
  {
    id: 'ai-4',
    topic: 'Reasoning (Forward & Backward Chaining)',
    keywords: ['reasoning', 'penalaran', 'forward', 'backward', 'chaining', 'inferensi', 'logika'],
    answer: 'Reasoning atau penalaran dalam AI adalah proses menarik kesimpulan baru dari fakta yang ada. Forward Chaining bergerak dari fakta/data sensor menuju kesimpulan (data-driven), sedangkan Backward Chaining bergerak mundur dari hipotesis/tujuan untuk mencari fakta pendukungnya (goal-driven).'
  },
  {
    id: 'ai-5',
    topic: 'Decision Tree',
    keywords: ['decision', 'tree', 'pohon', 'keputusan', 'klasifikasi', 'entropy', 'gini', 'information', 'gain'],
    answer: 'Decision Tree adalah algoritma pembelajaran terawasi berbentuk pohon bercabang untuk klasifikasi maupun prediksi. Setiap simpul menguji fitur tertentu (misalnya kepadatan ≥ 70% atau tren naik), memilih pemisah terbaik menggunakan Entropy/Information Gain atau Gini Impurity hingga mencapai keputusan di daun pohon.'
  },
  {
    id: 'ai-6',
    topic: 'Algoritma Pencarian (Search Algorithm & A*)',
    keywords: ['algoritma', 'pencarian', 'search', 'bfs', 'dfs', 'a*', 'astar', 'dijkstra', 'heuristik', 'rute'],
    answer: 'Algoritma Pencarian digunakan AI untuk menemukan jalur atau solusi terbaik di dalam ruang keadaan (state space). Ada pencarian buta seperti BFS dan DFS, serta pencarian heuristik seperti Greedy Best-First dan A* yang menghitung f(n) = g(n) + h(n) (biaya nyata + estimasi jarak) untuk menemukan rute paling optimal.'
  },
  {
    id: 'ai-7',
    topic: 'Natural Language Processing (NLP)',
    keywords: ['nlp', 'natural', 'language', 'processing', 'bahasa', 'alami', 'tokenisasi', 'stemming', 'stopword', 'tfidf', 'cosine'],
    answer: 'Natural Language Processing (NLP) memungkinkan komputer memahami dan menghasilkan bahasa manusia. Tahapannya meliputi normalisasi teks, tokenisasi, penghapusan stopword, stemming/lemmatization, ekstraksi fitur (seperti TF-IDF atau Cosine Similarity), hingga sintesis jawaban.'
  },
  {
    id: 'ai-8',
    topic: 'Expert System (Sistem Pakar)',
    keywords: ['expert', 'system', 'sistem', 'pakar', 'certainty', 'factor', 'cf', 'knowledge', 'base'],
    answer: 'Expert System adalah program AI yang meniru cara pengambilan keputusan seorang pakar manusia. Komponennya terdiri dari Knowledge Base (basis aturan), Working Memory (fakta aktif), Inference Engine (mesin penalaran), dan fasilitas penjelasan (mengapa keputusan diambil), sering dilengkapi Certainty Factor (CF) untuk menangani ketidakpastian.'
  },
  {
    id: 'ai-9',
    topic: 'Machine Learning & Regresi Linier / EMA',
    keywords: ['machine', 'learning', 'regresi', 'linier', 'linear', 'regression', 'ema', 'moving', 'average', 'prediksi', 'time', 'series'],
    answer: 'Untuk memprediksi data deret waktu (time-series) seperti arus lalu lintas, kombinasi Exponential Moving Average (EMA) meredam fluktuasi acak sambil memberi bobot lebih besar ke data terbaru, sementara Regresi Linier menghitung kemiringan tren (slope) untuk memproyeksikan nilai beberapa menit ke depan.'
  },

  // --- IoT & Teknologi ARTEFAC ---
  {
    id: 'iot-1',
    topic: 'ESP32 & Mikrokontroler IoT',
    keywords: ['esp32', 'mikrokontroler', 'microcontroller', 'arduino', 'pin', 'gpio', 'wifi', 'bluetooth'],
    answer: 'ESP32 adalah mikrokontroler dual-core berdaya rendah yang sudah dilengkapi Wi-Fi dan Bluetooth bawaan. Di proyek IoT seperti ARTEFAC, ESP32 bertugas membaca data dari sensor IR, ultrasonik, dan LDR lalu mengirimkannya secara real-time melalui protokol MQTT.'
  },
  {
    id: 'iot-2',
    topic: 'MQTT & Broker Mosquitto',
    keywords: ['mqtt', 'mosquitto', 'broker', 'publish', 'subscribe', 'topik', 'topic', 'protokol'],
    answer: 'MQTT adalah protokol komunikasi ringan berbasis pola Publish–Subscribe yang sangat hemat bandwidth untuk perangkat IoT. Perangkat (publisher) mengirim payload JSON ke sebuah topik di broker seperti Mosquitto (port 1883), lalu backend (subscriber) langsung menerimanya dalam hitungan milidetik.'
  },
  {
    id: 'iot-3',
    topic: 'Socket.io & WebSocket',
    keywords: ['socket', 'socketio', 'websocket', 'realtime', 'real', 'time', 'emit', 'stream'],
    answer: 'WebSocket dan Socket.io menjaga koneksi dua arah yang selalu terbuka antara server Node.js dan browser React. Jadi setiap kali broker MQTT mengirim data sensor baru, server langsung memancarkan event ke dashboard tanpa perlu me-refresh halaman.'
  },
  {
    id: 'iot-4',
    topic: 'Sensor Inframerah (IR), Ultrasonik & LDR',
    keywords: ['inframerah', 'ir', 'ultrasonik', 'hcsr04', 'ldr', 'pwm', 'sensor', 'lux'],
    answer: 'Sensor IR mendeteksi halangan/kendaraan yang melintas lewat pantulan cahaya inframerah, sensor ultrasonik mengukur jarak/ketinggian isi tempat sampah memakai gelombang suara pantul, sedangkan LDR (Light Dependent Resistor) membaca tingkat terang cahaya sekitar untuk mengatur kecerahan lampu LED lewat sinyal PWM.'
  },
  {
    id: 'iot-5',
    topic: 'MongoDB & RAM Cache',
    keywords: ['mongodb', 'atlas', 'database', 'nosql', 'mongoose', 'ram', 'cache', 'latency'],
    answer: 'MongoDB adalah database NoSQL berbasis dokumen JSON yang fleksibel untuk menyimpan histori telemetri dan log chat. Dengan menyimpan state terakhir di RAM server dan hanya menulis snapshot ke MongoDB setiap 60 detik, sistem mendapat respons super cepat (<5ms) sekaligus hemat kuota database.'
  },

  // --- Geografi Lokal & Umum ---
  {
    id: 'geo-1',
    topic: 'Simpang Artos & Kabupaten Magelang',
    keywords: ['simpang', 'artos', 'magelang', 'mertoyudan', 'armada', 'town', 'square', 'borobudur', 'jawa', 'tengah'],
    answer: 'Simpang Artos adalah persimpangan strategis di Kecamatan Mertoyudan, Kabupaten Magelang, Jawa Tengah, tepat di depan Armada Town Square (Artos Mall). Simpang ini mempertemukan arus utama dari Kota Magelang (Utara), Jl. Soekarno-Hatta/Artos (Timur), arah Yogyakarta (Selatan), dan jalur arah Purworejo/Borobudur lewat Jl. Sarwo Edhie Wibowo (Barat).'
  },
  {
    id: 'geo-2',
    topic: 'Indonesia (Ibu Kota, Provinsi, Sejarah Singkat)',
    keywords: ['indonesia', 'jakarta', 'ikn', 'nusantara', 'presiden', 'proklamasi', '1945', 'pancasila'],
    answer: 'Indonesia adalah negara kepulauan terbesar di dunia dengan lebih dari 17.000 pulau, bersemboyan Bhinneka Tunggal Ika, dan berlandaskan Pancasila. Kemerdekaan Indonesia diproklamasikan pada 17 Agustus 1945 oleh Soekarno dan Mohammad Hatta.'
  },

  // --- Pemrograman & Sains Umum ---
  {
    id: 'prog-1',
    topic: 'JavaScript, TypeScript & React',
    keywords: ['javascript', 'typescript', 'react', 'nodejs', 'node', 'frontend', 'backend', 'vite'],
    answer: 'JavaScript adalah bahasa pemrograman utama untuk web (baik di browser maupun server lewat Node.js), sedangkan TypeScript menambahkan sistem tipe statis agar bug lebih mudah dicegah sebelum kode dijalankan. React dipakai untuk membangun antarmuka berbasis komponen yang reaktif.'
  },
  {
    id: 'sci-1',
    topic: 'Kenapa Langit Berwarna Biru (Hamburan Rayleigh)',
    keywords: ['langit', 'biru', 'matahari', 'cahaya', 'rayleigh', 'warna', 'sore', 'merah'],
    answer: 'Langit terlihat biru di siang hari karena fenomena hamburan Rayleigh: molekul udara di atmosfer menghamburkan cahaya matahari bergelombang pendek (biru) jauh lebih kuat ke segala arah dibandingkan gelombang panjang (merah). Saat matahari terbit atau terbenam, cahayanya menempuh atmosfer lebih tebal sehingga warna merah dan jingga yang tersisa terlihat dominan.'
  },
  {
    id: 'sci-2',
    topic: 'Fotosintesis Tumbuhan',
    keywords: ['fotosintesis', 'tumbuhan', 'klorofil', 'oksigen', 'karbon', 'dioksida', 'energi'],
    answer: 'Fotosintesis adalah proses tumbuhan hijau mengubah air (H₂O) dan karbon dioksida (CO₂) menggunakan energi cahaya matahari dan klorofil menjadi glukosa (makanan) serta oksigen (O₂) yang kita hirup.'
  }
];

function loadLearnedKnowledge() {
  try {
    if (fs.existsSync(LEARNED_FILE)) {
      const data = JSON.parse(fs.readFileSync(LEARNED_FILE, 'utf-8'));
      return Array.isArray(data) ? data : [];
    }
  } catch {
    // Abaikan jika file belum valid
  }
  return [];
}

function saveLearnedKnowledge(items) {
  try {
    const dir = path.dirname(LEARNED_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LEARNED_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch {
    // Abaikan error tulis file
  }
}

export function learnNewFact(questionOrTopic, answerText) {
  const learned = loadLearnedKnowledge();
  const cleanTokens = questionOrTopic
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const entry = {
    id: `learned-${Date.now()}`,
    topic: questionOrTopic.trim(),
    keywords: [...new Set(cleanTokens)],
    answer: answerText.trim(),
    learnedAt: new Date().toISOString()
  };

  // Update jika topik mirip sudah ada, atau tambah baru
  const idx = learned.findIndex((x) => x.topic.toLowerCase() === entry.topic.toLowerCase());
  if (idx >= 0) learned[idx] = entry;
  else learned.push(entry);

  saveLearnedKnowledge(learned);
  return entry;
}

/**
 * Pencarian BM25 sederhana di seluruh basis pengetahuan lokal + fakta yang diajarkan user
 */
export function searchLocalKnowledge(queryTokens) {
  if (!queryTokens || queryTokens.length === 0) return null;
  const allDocs = [...loadLearnedKnowledge(), ...CORE_KNOWLEDGE];
  const avgDocLen =
    allDocs.reduce((sum, d) => sum + d.keywords.length + d.topic.split(' ').length, 0) / allDocs.length;

  const k1 = 1.5;
  const b = 0.75;
  let bestDoc = null;
  let bestScore = 0;

  for (const doc of allDocs) {
    const topicTerms = doc.topic.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
    const answerTerms = doc.answer.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3);
    const docTerms = [...doc.keywords, ...topicTerms, ...answerTerms];

    const tfMap = {};
    for (const kw of doc.keywords) tfMap[kw] = (tfMap[kw] || 0) + 2.5;
    for (const tp of topicTerms) tfMap[tp] = (tfMap[tp] || 0) + 2.0;
    for (const an of answerTerms) tfMap[an] = (tfMap[an] || 0) + 0.4;

    let score = 0;
    let topicOrKeywordHits = 0;
    const dl = docTerms.length;

    for (const q of queryTokens) {
      const directKeyHit = doc.keywords.some((kw) => kw === q || (q.length >= 4 && (kw.includes(q) || q.includes(kw))));
      const directTopicHit = topicTerms.some((tp) => tp === q || (q.length >= 4 && (tp.includes(q) || q.includes(tp))));
      if (directKeyHit || directTopicHit) {
        topicOrKeywordHits++;
      }

      let tf = tfMap[q] || 0;
      if (tf === 0 && q.length >= 4 && directKeyHit) {
        tf = 1.6;
      }

      if (tf > 0) {
        const df = allDocs.filter((d) =>
          d.keywords.some((kw) => kw === q || (q.length >= 4 && (kw.includes(q) || q.includes(kw))))
        ).length;
        const idf = Math.log(1 + (allDocs.length - df + 0.5) / (df + 0.5));
        const normTf = (tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * dl) / Math.max(1, avgDocLen)));
        score += idf * normTf;
      }
    }

    if (topicOrKeywordHits > 0 && score > bestScore) {
      bestScore = score;
      bestDoc = doc;
    }
  }

  // Ambang minimal relevansi agar tidak salah jawab topik yang tidak berkaitan
  if (bestDoc && bestScore >= 2.1) {
    return { doc: bestDoc, score: Number(bestScore.toFixed(2)) };
  }
  return null;
}

/**
 * Evaluasi ekspresi matematika & konversi satuan aman (tanpa eval sembarangan)
 */
export function evaluateMathExpression(rawText) {
  const lower = rawText.toLowerCase().replace(/,/g, '.');

  // Persentase: misal "25% dari 800"
  const pctMatch = lower.match(/(\d+(?:\.\d+)?)\s*%\s*(?:dari|x|\*)\s*(\d+(?:\.\d+)?)/);
  if (pctMatch) {
    const res = (Number(pctMatch[1]) / 100) * Number(pctMatch[2]);
    return `${pctMatch[1]}% dari ${pctMatch[2]} adalah **${Number(res.toFixed(4))}**.`;
  }

  // Akar kuadrat: misal "akar 144" atau "akar dari 144"
  const sqrtMatch = lower.match(/akar\s*(?:kuadrat\s*)?(?:dari\s*)?(\d+(?:\.\d+)?)/);
  if (sqrtMatch) {
    const val = Number(sqrtMatch[1]);
    return `Akar kuadrat dari ${val} adalah **${Number(Math.sqrt(val).toFixed(4))}**.`;
  }

  // Ekspresi aritmatika standar: misal "12 + 8 * 3" atau "25 x 4"
  const sanitized = lower
    .replace(/\bdikali\b|\bkali\b|\bx\b/g, '*')
    .replace(/\bdibagi\b|\bbagi\b/g, '/')
    .replace(/\bditambah\b|\btambah\b/g, '+')
    .replace(/\bdikurangi\b|\bkurang\b/g, '-');

  const exprMatch = sanitized.match(/(\d+(?:\.\d+)?(?:\s*[\+\-\*\/\%]\s*\d+(?:\.\d+)?)+)/);
  if (exprMatch) {
    const expr = exprMatch[1];
    // Pastikan hanya angka dan operator matematika dasar
    if (/^[\d\s\+\-\*\/\.\%\(\)]+$/.test(expr)) {
      try {
        const result = Function(`"use strict"; return (${expr})`)();
        if (typeof result === 'number' && Number.isFinite(result)) {
          return `Hasil dari \`${expr.trim()}\` adalah **${Number(result.toFixed(4))}**.`;
        }
      } catch {
        // Abaikan jika ekspresi tidak valid
      }
    }
  }

  return null;
}
