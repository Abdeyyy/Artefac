/**
 * Modul 6: Natural Language Processing (NLP) Bahasa Indonesia
 * Pipeline: Normalisasi Slang -> Tokenisasi -> Stopword Removal -> Stemming Dasar
 *           -> Ekstraksi Entitas & Tipe Pertanyaan -> Klasifikasi Intent (Cosine Similarity)
 */

const SLANG_MAP = {
  ga: 'tidak', gak: 'tidak', nggak: 'tidak', gk: 'tidak', kagak: 'tidak',
  gmn: 'bagaimana', gimana: 'bagaimana', gmna: 'bagaimana',
  knp: 'kenapa', napa: 'kenapa', mengapa: 'kenapa',
  brp: 'berapa', brpa: 'berapa',
  dr: 'dari', dmn: 'dimana', dmana: 'dimana',
  yg: 'yang', dgn: 'dengan', sm: 'sama', utk: 'untuk', buat: 'untuk',
  skrg: 'sekarang', skr: 'sekarang', skg: 'sekarang',
  bsk: 'besok', ntar: 'nanti', ntr: 'nanti', tar: 'nanti',
  lalin: 'lalu lintas', macetnya: 'macet', padet: 'padat',
  jogja: 'yogyakarta', yogya: 'yogyakarta',
  mgl: 'magelang', pwr: 'purworejo',
  tong: 'sampah', bak: 'sampah',
  pju: 'lampu', cahaya: 'lampu', penerangan: 'lampu',
  makasih: 'terima kasih', mksh: 'terima kasih', trims: 'terima kasih', thanks: 'terima kasih',
  halo: 'halo', hai: 'halo', hi: 'halo', hei: 'halo',
  siapa: 'siapa', km: 'kamu', kmu: 'kamu', lu: 'kamu', lo: 'kamu', anda: 'kamu',
  bisa: 'bisa', apaan: 'apa', ngapain: 'apa',
  mnt: 'menit', mntnya: 'menit',
  aku: 'saya', gw: 'saya', gue: 'saya', aq: 'saya'
};

const STOPWORDS = new Set([
  'yang', 'di', 'ke', 'dan', 'atau', 'ini', 'itu', 'ada', 'aja', 'saja',
  'dong', 'deh', 'sih', 'nih', 'ya', 'kah', 'kok', 'lho', 'pun', 'yaa',
  'tolong', 'coba', 'kira', 'kalau', 'kalo', 'misal', 'bila', 'jika', 'apakah', 'saya', 'kamu'
]);

function stemIndo(word) {
  let w = word;
  w = w.replace(/(nya|lah|kah|tah)$/, '');
  if (w.length > 5) {
    w = w.replace(/(kan|an|i)$/, '');
  }
  if (w.length > 5) {
    w = w.replace(/^(meng|meny|mem|men|me|ber|ter|per|di|ke|se)/, '');
  }
  return w;
}

export function preprocessText(text) {
  const rawLower = text.toLowerCase().replace(/[^\w\s?%+\-*/.=,]/g, ' ').replace(/\s+/g, ' ').trim();
  const cleanWords = text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const normalizedWords = cleanWords.map((w) => SLANG_MAP[w] || w);
  const flatWords = normalizedWords.join(' ').split(' ').filter(Boolean);
  const filtered = flatWords.filter((w) => !STOPWORDS.has(w));
  const stemmed = filtered.map(stemIndo);

  return {
    raw: text,
    rawLower,
    normalized: normalizedWords.join(' '),
    tokens: flatWords,
    filtered,
    stemmed
  };
}

const INTENT_CORPUS = {
  GREETING_CHAT: [
    'halo', 'selamat', 'pagi', 'siang', 'sore', 'malam', 'kabar',
    'terima', 'kasih', 'oke', 'sip', 'mantap', 'baik', 'raden'
  ],
  IDENTITY_CAPABILITY: [
    'siapa', 'namamu', 'raden', 'fungsi', 'bantu', 'model', 'algoritma', 'arsitektur', 'keahlian'
  ],
  TRAFFIC_PREDICTION: [
    'prediksi', 'ramal', 'perkiraan', 'nanti', 'kedepan', 'depan', 'menit',
    'bakal', 'akan', 'tren', 'naik', 'turun', 'potensi', 'jam', 'sibuk'
  ],
  ROUTE_SEARCH: [
    'rute', 'lewat', 'mana', 'alternatif', 'hindar', 'hindari',
    'menuju', 'dari', 'tujuan', 'arah', 'cepat', 'cari'
  ],
  EXPERT_WHY: [
    'kenapa', 'mengapa', 'sebab', 'alasan', 'faktor', 'penyebab',
    'jelaskan', 'analisis', 'diagnosa', 'solusi', 'atasi', 'saran'
  ],
  TRAFFIC_STATUS: [
    'lalu', 'lintas', 'macet', 'padat', 'lancar', 'sepi', 'lengang', 'kendaraan',
    'lampu', 'hijau', 'merah', 'durasi', 'antre', 'antrean', 'simpang', 'artos',
    'utara', 'selatan', 'timur', 'barat', 'magelang', 'yogyakarta', 'purworejo'
  ],
  LAMP_QUERY: [
    'lampu', 'jalan', 'penerangan', 'ldr', 'pwm', 'gelap', 'terang', 'nyala', 'mati', 'listrik', 'daya', 'lux'
  ],
  BIN_QUERY: [
    'sampah', 'penuh', 'kapasitas', 'tutup', 'terbuka', 'tertutup', 'ultrasonik', 'bersih', 'angkut'
  ],
  GENERAL_ANALYSIS: [
    'ringkas', 'ringkasan', 'semua', 'kondisi', 'status', 'laporan', 'rekap', 'pantau', 'keseluruhan'
  ]
};

function cosineSimilarity(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  return intersection / Math.sqrt(setA.size * setB.size);
}

function detectQuestionType(text) {
  if (/\b(apakah|apa\b.*\b(tidak|ya)|ga|tidak)\b/.test(text) && !text.startsWith('apa itu') && !text.startsWith('apa arti')) {
    return 'YES_NO';
  }
  if (/\b(berapa|brp)\b/.test(text)) return 'NUMERIC';
  if (/\b(kenapa|mengapa|sebab|penyebab)\b/.test(text)) return 'CAUSAL';
  if (/\b(bagaimana|cara|solusi|rekomendasi|saran|mending)\b/.test(text)) return 'RECOMMENDATION';
  if (/\b(mana|paling|terpadat|tersepi|banding)\b/.test(text)) return 'COMPARISON';
  if (/\b(apa itu|jelaskan|pengertian|definisi|maksudnya|siapa)\b/.test(text)) return 'EXPLANATION';
  return 'STATEMENT';
}

export function extractEntities(prep, sessionContext = {}) {
  const text = prep.normalized;
  let matchedLane = null;

  if (text.includes('utara') || text.includes('magelang')) matchedLane = 'utara';
  else if (text.includes('selatan') || text.includes('yogyakarta')) matchedLane = 'selatan';
  else if (text.includes('barat') || text.includes('purworejo') || text.includes('215')) matchedLane = 'barat';
  else if (text.includes('timur') || text.includes('soekarno') || text.includes('semarang')) matchedLane = 'timur';

  const nodeAliases = [
    { keys: ['magelang', 'utara'], node: 'Magelang' },
    { keys: ['yogyakarta', 'selatan'], node: 'Yogyakarta' },
    { keys: ['purworejo', 'barat', 'borobudur'], node: 'Purworejo' },
    { keys: ['timur', 'artos', 'semarang', 'soekarno'], node: 'Artos_Timur' }
  ];

  const foundNodes = [];
  for (const alias of nodeAliases) {
    let minIdx = Infinity;
    for (const k of alias.keys) {
      const idx = text.indexOf(k);
      if (idx !== -1 && idx < minIdx) minIdx = idx;
    }
    if (minIdx !== Infinity) {
      foundNodes.push({ node: alias.node, pos: minIdx });
    }
  }
  foundNodes.sort((a, b) => a.pos - b.pos);

  const minMatch = text.match(/(\d+)\s*menit/);
  const horizonMinutes = minMatch ? Number(minMatch[1]) : null;

  const isFollowUp =
    text.includes('sana') ||
    text.includes('situ') ||
    text.includes('terus') ||
    text.includes('selanjutnya') ||
    text.includes('maksudnya') ||
    prep.tokens.length <= 2;

  if (!matchedLane && isFollowUp && sessionContext.lastLane) {
    matchedLane = sessionContext.lastLane;
  }

  return {
    matchedLane,
    routeOrigin: foundNodes.length >= 2 ? foundNodes[0].node : foundNodes.length === 1 ? foundNodes[0].node : null,
    routeGoal: foundNodes.length >= 2 ? foundNodes[1].node : null,
    horizonMinutes,
    isFollowUp,
    questionType: detectQuestionType(text)
  };
}

export function analyzeNLP(userQuery, sessionContext = {}) {
  const prep = preprocessText(userQuery);
  const allTerms = [...new Set([...prep.filtered, ...prep.stemmed, ...prep.tokens])];
  const entities = extractEntities(prep, sessionContext);

  const scores = {};
  for (const [intent, vocab] of Object.entries(INTENT_CORPUS)) {
    let sim = cosineSimilarity(allTerms, vocab);

    if (intent === 'LAMP_QUERY' && prep.normalized.includes('lampu') && !prep.normalized.includes('hijau') && !prep.normalized.includes('merah')) {
      sim += 0.3;
    }
    if (intent === 'TRAFFIC_STATUS' && entities.matchedLane && !prep.normalized.includes('rute') && !prep.normalized.includes('lewat') && !prep.normalized.includes('apa itu')) {
      sim += 0.22;
    }
    if (intent === 'ROUTE_SEARCH' && (entities.routeGoal || prep.normalized.includes('lewat mana') || prep.normalized.includes('rute') || prep.normalized.includes('alternatif'))) {
      sim += 0.35;
    }
    if (intent === 'TRAFFIC_PREDICTION' && (entities.horizonMinutes || prep.normalized.includes('prediksi') || prep.normalized.includes('bakal') || prep.normalized.includes('nanti'))) {
      sim += 0.35;
    }
    if (intent === 'EXPERT_WHY' && (prep.normalized.includes('kenapa') || prep.normalized.includes('solusi') || prep.normalized.includes('penyebab')) && !prep.normalized.includes('langit')) {
      sim += 0.3;
    }

    scores[intent] = Number(sim.toFixed(3));
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  let topIntent = ranked[0][0];
  let topScore = ranked[0][1];

  // Jika menanyakan definisi ("apa itu decision tree", "jelaskan nlp"), arahkan ke GENERAL_QA bukan intent sensor
  if (/^(apa itu|jelaskan|pengertian|definisi|bagaimana cara kerja)\b/.test(prep.normalized) && !entities.matchedLane) {
    topIntent = 'GENERAL_QA';
    topScore = 0.7;
  }

  // Follow-up pendek ke konteks sebelumnya
  if (topScore < 0.14 && sessionContext.lastIntent && entities.isFollowUp) {
    topIntent = sessionContext.lastIntent;
    topScore = 0.45;
  }

  if (topScore < 0.16) {
    topIntent = 'GENERAL_QA';
  }

  return {
    prep,
    entities,
    allTerms,
    topIntent,
    confidence: Math.min(0.99, Number((topScore * 1.4).toFixed(2))),
    scores
  };
}
