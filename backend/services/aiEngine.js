import { DOMAIN_FRAMES } from './knowledgeBase.js';
import { analyzeNLP } from './nlpProcessor.js';
import {
  runExpertSystem,
  findOptimalRouteAStar,
  predictTrafficFlow
} from './aiModels.js';
import {
  searchLocalKnowledge,
  learnNewFact,
  evaluateMathExpression
} from './generalKnowledge.js';

const dialogueSessions = new Map();

function getSession(sessionId = 'default') {
  if (!dialogueSessions.has(sessionId)) {
    dialogueSessions.set(sessionId, {
      userName: null,
      lastIntent: null,
      lastLane: null,
      lastTopic: null,
      turnCount: 0,
      recentQueries: []
    });
  }
  return dialogueSessions.get(sessionId);
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h >= 4 && h < 11) return 'pagi';
  if (h >= 11 && h < 15) return 'siang';
  if (h >= 15 && h < 18) return 'sore';
  return 'malam';
}

function pickVariant(seed, options) {
  return options[Math.abs(seed) % options.length];
}

function mapToSchemaIntent(nlpIntent) {
  switch (nlpIntent) {
    case 'TRAFFIC_STATUS':
    case 'TRAFFIC_PREDICTION':
    case 'ROUTE_SEARCH':
    case 'EXPERT_WHY':
      return 'TRAFFIC_QUERY';
    case 'LAMP_QUERY':
      return 'LAMP_QUERY';
    case 'BIN_QUERY':
      return 'BIN_QUERY';
    case 'GENERAL_ANALYSIS':
    case 'GREETING_CHAT':
    case 'IDENTITY_CAPABILITY':
      return 'GENERAL_ANALYSIS';
    default:
      return 'UNKNOWN';
  }
}

/**
 * NLG Komposisional untuk pertanyaan jalur spesifik (menjawab sesuai tipe pertanyaan)
 */
function composeLaneReply(laneKey, state, questionType, seed) {
  const frame = DOMAIN_FRAMES.lanes[laneKey];
  const density = Number(state.lanes?.[laneKey] || 0);
  const isGreen = state.activeLane === laneKey;

  if (density === 0) {
    if (questionType === 'YES_NO') {
      return `Belum padat kok—sensor di jalur ${frame.nama} masih menunjukkan 0% karena paket data dari ESP32 belum masuk.`;
    }
    return `Saat ini ${frame.jalan} arah ${frame.nama} masih terbaca 0% (menunggu aliran telemetri ESP32), dengan lampu ${isGreen ? 'hijau' : 'merah'}.`;
  }

  const isCongested = density >= 70;
  const isModerate = density >= 30 && density < 70;

  if (questionType === 'YES_NO') {
    const lead = isCongested
      ? `Iya, jalur ${frame.nama} lagi padat di **${density}%**`
      : isModerate
        ? `Lumayan ramai tapi belum macet parah, ${frame.nama} ada di **${density}%**`
        : `Tidak macet kok, arah ${frame.nama} masih lengang di **${density}%**`;
    return `${lead}. Lampu lalu lintasnya sekarang sedang **${isGreen ? `hijau (${state.greenDuration} detik)` : 'merah'}**.`;
  }

  if (questionType === 'NUMERIC') {
    return `Kepadatan di ${frame.nama} (${frame.jalan}) saat ini **${density}%**, dan ${isGreen ? `sedang mendapat lampu hijau selama **${state.greenDuration} detik**` : 'status lampunya sedang merah'}.`;
  }

  return pickVariant(seed, [
    `Di ${frame.jalan} (arah ${frame.nama}), sensor membaca kepadatan **${density}%** dengan lampu **${isGreen ? `hijau (${state.greenDuration} detik)` : 'merah'}**.`,
    `Untuk lajur ${frame.nama}, kondisinya sekarang ${isCongested ? 'padat' : isModerate ? 'ramai lancar' : 'lengang'} di **${density}%**, sementara sinyal lampu lagi **${isGreen ? 'hijau' : 'merah'}**.`
  ]);
}

function handleSpecialCommandsAndMemory(rawText, session, nlp) {
  const trimmed = rawText.trim();

  // 1. Perkenalan nama user: "nama saya Budi" / "panggil aku Dika"
  const nameMatch = trimmed.match(/(?:nama\s+(?:saya|aku|ku)|panggil\s+(?:saya|aku))\s+(?:adalah\s+)?([a-zA-Z]{2,20})/i);
  if (nameMatch) {
    session.userName = nameMatch[1][0].toUpperCase() + nameMatch[1].slice(1).toLowerCase();
    return {
      text: `Salam kenal, **${session.userName}**! Saya RADEN. Mulai sekarang saya ingat nama kamu. Mau ngobrol santai, tanya hal umum, atau cek situasi Simpang Artos?`,
      models: ['NLP', 'Memori Konteks']
    };
  }

  // 2. Mengingat percakapan sebelumnya: "tadi aku tanya apa?" / "siapa namaku?"
  if (/\b(siapa\s+nama\s*(ku|saya)|namaku\s+siapa)\b/i.test(trimmed)) {
    return {
      text: session.userName
        ? `Namamu **${session.userName}** kan? Ingatan sesi saya masih menyimpannya.`
        : `Kamu belum mengenalkan namamu nih. Coba ketik "nama saya ..." supaya saya bisa memanggil namamu.`,
      models: ['NLP', 'Memori Konteks']
    };
  }
  if (/\b(tadi\s+(?:saya|aku)\s+(?:tanya|nanya|bilang)\s+apa)\b/i.test(trimmed)) {
    const prev = session.recentQueries[session.recentQueries.length - 1];
    return {
      text: prev
        ? `Sebelumnya kamu menanyakan: *"${prev}"*.`
        : `Ini masih awal percakapan kita, jadi belum ada pertanyaan sebelumnya di sesi ini.`,
      models: ['NLP', 'Memori Konteks']
    };
  }

  // 3. Mengajar AI (Knowledge Acquisition): "belajar: topik = jawaban" atau "ingat: topik = jawaban"
  const teachMatch = trimmed.match(/^(?:belajar|ajar|ingat(?:\s+ya)?)\s*[:\-]\s*(.+?)\s*=\s*(.+)$/i);
  if (teachMatch) {
    const [, topic, ans] = teachMatch;
    learnNewFact(topic, ans);
    return {
      text: `Siap, pengetahuan baru sudah saya simpan ke memori lokal! Kalau nanti kamu tanya tentang **${topic.trim()}**, saya akan langsung menjawab berdasarkan informasi yang barusan kamu ajarkan.`,
      models: ['NLP', 'Knowledge Acquisition']
    };
  }

  // 4. Evaluasi matematika / konversi angka langsung
  const mathAns = evaluateMathExpression(trimmed);
  if (mathAns) {
    return {
      text: mathAns,
      models: ['NLP', 'Kalkulator Ekspresi']
    };
  }

  // 5. Pencarian Pengetahuan Umum lokal (BM25) jika user bertanya definisi/topik umum
  if (nlp.topIntent === 'GENERAL_QA' || nlp.entities.questionType === 'EXPLANATION') {
    const searchTerms = [...new Set([...nlp.prep.filtered, ...nlp.prep.stemmed, ...nlp.prep.tokens])];
    const hit = searchLocalKnowledge(searchTerms);
    if (hit) {
      session.lastTopic = hit.doc.topic;
      return {
        text: `${hit.doc.answer}`,
        models: ['NLP', 'Knowledge Base (BM25)']
      };
    }
  }

  return null;
}

function composeReply({ nlp, state, prediction, decisionTree, expert, session }) {
  const { topIntent, entities, prep } = nlp;
  const seed = prep.raw.length + session.turnCount + new Date().getSeconds();
  const text = prep.normalized;
  const activeFrame = DOMAIN_FRAMES.lanes[state.activeLane] || DOMAIN_FRAMES.lanes.utara;
  const hasAnyData =
    Object.values(state.lanes || {}).some((v) => v > 0) || state.lampPwm > 0 || state.binDensity > 0;
  const sapaNama = session.userName ? ` ${session.userName}` : '';

  // Cek terlebih dahulu fitur memori, pembelajaran interaktif, matematika, & BM25 general QA
  const special = handleSpecialCommandsAndMemory(prep.raw, session, nlp);
  if (special) return special;

  // 1. Sapaan & basa-basi natural
  if (topIntent === 'GREETING_CHAT') {
    if (text.includes('terima kasih')) {
      return {
        text: pickVariant(seed, [
          `Sama-sama${sapaNama}! Kabari saja kapan pun butuh teman ngobrol atau cek arus lalu lintas.`,
          `Dengan senang hati${sapaNama}! Saya siap kapan saja kalau mau tanya lagi.`
        ]),
        models: ['NLP']
      };
    }
    if (text.includes('kabar')) {
      return {
        text: pickVariant(seed, [
          `Kabar baik${sapaNama}! Otak lokal saya lagi aktif penuh memantau Simpang Artos sekaligus siap diajak diskusi topik AI, IoT, atau hitung-hitungan. Kamu sendiri gimana kabarnya?`,
          `Sehat dan siaga${sapaNama}! Lagi ingin ngobrol santai atau mau cek kondisi jalanan dulu nih?`
        ]),
        models: ['NLP']
      };
    }
    if (text.includes('oke') || text.includes('sip') || text.includes('mantap')) {
      return {
        text: pickVariant(seed, [
          `Siap${sapaNama}! Lanjut kalau ada yang ingin dibahas lagi.`,
          `Oke${sapaNama}, saya tetap standby di sini.`
        ]),
        models: ['NLP']
      };
    }
    const salam = getTimeGreeting();
    return {
      text: `Selamat ${salam}${sapaNama}! Saya RADEN. Kita bisa ngobrol bebas, tanya soal konsep AI/IoT, hitung matematika, atau langsung memantau kondisi dan prediksi arus di Simpang Artos. Lagi pengen bahas apa nih?`,
      models: ['NLP']
    };
  }

  // 2. Identitas & kemampuan RADEN
  if (topIntent === 'IDENTITY_CAPABILITY') {
    return {
      text: `Saya **RADEN**, asisten AI lokal milik ARTEFAC yang berjalan mandiri di server tanpa memanggil API eksternal. Di dalamnya ada **NLP** (normalisasi teks, stemming, cosine similarity), **Knowledge Base (BM25)** untuk tanya-jawab umum & belajar fakta baru dari kamu, **Semantic Network & A\*** untuk mencari rute tercepat, **Decision Tree**, **Expert System** dengan *Certainty Factor*, serta **Prediksi Arus (EMA + Regresi Linier)**.`,
      models: ['NLP', 'Knowledge Representation']
    };
  }

  // 3. Pencarian Rute A*
  if (topIntent === 'ROUTE_SEARCH') {
    const startNode = entities.routeOrigin || 'Magelang';
    const goalNode =
      entities.routeGoal ||
      (startNode === 'Magelang' ? 'Yogyakarta' : startNode === 'Purworejo' ? 'Artos_Timur' : 'Magelang');
    const route = findOptimalRouteAStar(startNode, goalNode, state);
    if (route) {
      const via = route.readablePath.join(' → ');
      return {
        text: `Kalau berangkat dari ${startNode.replace('_', ' ')} ke ${goalNode.replace('_', ' ')}, hasil algoritma A* menyarankan lewat **${via}** (bobot biaya ${route.totalCost}). ${route.usesBypass ? 'Rute ini sengaja memutar lewat jalur alternatif agar terhindar dari kepadatan di titik simpang utama.' : 'Kondisi di simpang utama masih cukup efisien untuk dilewati langsung.'}`,
        models: ['NLP', 'Semantic Network', 'A* Search']
      };
    }
  }

  // 4. Prediksi Arus Lalu Lintas
  if (topIntent === 'TRAFFIC_PREDICTION') {
    if (!prediction.hasRealData) {
      return {
        text: `Model prediksi **${prediction.modelName}** sudah siap jalan, tapi karena ESP32/MQTT belum mengirim data kendaraan (semua masih 0%), tren regresi liniernya belum terbentuk. Begitu paket MQTT masuk, proyeksinya langsung keluar otomatis.`,
        models: ['NLP', 'Prediksi Arus (EMA+Regresi)', 'Decision Tree']
      };
    }
    const targetHorizon = entities.horizonMinutes
      ? prediction.forecasts.reduce((prev, curr) =>
        Math.abs(curr.minutesAhead - entities.horizonMinutes) < Math.abs(prev.minutesAhead - entities.horizonMinutes) ? curr : prev
      )
      : prediction.forecasts[1];
    const laneKey = entities.matchedLane || decisionTree.busiestLane;
    const laneName = DOMAIN_FRAMES.lanes[laneKey]?.nama || laneKey;
    const predVal = targetHorizon.perLane[laneKey];
    const currVal = state.lanes[laneKey];

    return {
      text: `Dari ${prediction.sampleCount} data historis terakhir, tren arus cenderung **${prediction.trendLabel}**. Dalam **${targetHorizon.minutesAhead} menit lagi**, jalur ${laneName} diproyeksikan bergerak dari ${currVal}% ke sekitar **${predVal}%** (keyakinan ${targetHorizon.confidence}%), dengan rekomendasi lampu hijau ${decisionTree.recommendedGreenSec} detik.`,
      models: ['NLP', 'Prediksi Arus (EMA+Regresi)', 'Decision Tree']
    };
  }

  // 5. Expert System ("Kenapa?" & Solusi)
  if (topIntent === 'EXPERT_WHY') {
    const trafficRules = expert.firedRules.filter((r) => r.category !== 'SYSTEM' || !hasAnyData);
    if (trafficRules.length > 0) {
      const topRule = trafficRules[0];
      return {
        text: `Menurut inferensi Expert System (**${topRule.id}: ${topRule.name}**, CF ${Math.round(topRule.cf * 100)}%), ${topRule.diagnosis.toLowerCase()}. Decision Tree menelusuri kondisi: *${decisionTree.decisionPath.join(' → ')}*, sehingga langkah paling tepat adalah: ${topRule.recommendation.toLowerCase()}.`,
        models: ['NLP', 'Decision Tree', 'Expert System']
      };
    }
    return {
      text: `Secara aturan sistem pakar tidak ada hambatan berarti—beban keempat jalur cukup seimbang dengan lampu hijau aktif di ${activeFrame.nama} (${state.greenDuration} detik).`,
      models: ['NLP', 'Expert System']
    };
  }

  // 6. Status Lalu Lintas
  if (topIntent === 'TRAFFIC_STATUS') {
    if (entities.matchedLane) {
      return {
        text: composeLaneReply(entities.matchedLane, state, entities.questionType, seed),
        models: ['NLP', 'Decision Tree']
      };
    }
    if (!hasAnyData) {
      return {
        text: `Keempat arah simpang masih terbaca 0% karena belum ada data masuk dari ESP32 lewat MQTT. Sinyal awal berada di arah ${activeFrame.nama}.`,
        models: ['NLP']
      };
    }
    return {
      text: `Jalur tersibuk sekarang adalah **${decisionTree.busiestName}** (${decisionTree.busiestDensity}%), sedangkan yang paling sepi di **${decisionTree.quietestName}**. Lampu hijau sedang menyala untuk arah **${activeFrame.nama}** selama ${state.greenDuration} detik.`,
      models: ['NLP', 'Decision Tree', 'Prediksi Arus (EMA+Regresi)']
    };
  }

  // 7. Penerangan Jalan
  if (topIntent === 'LAMP_QUERY') {
    const lux = state.lampPwm * 5;
    if (state.lampPwm === 0 && !hasAnyData) {
      return { text: 'Nilai PWM lampu jalan masih 0% karena sensor LDR belum mengirim pembaruan dari ESP32.', models: ['NLP'] };
    }
    return {
      text: state.lampPwm > 30
        ? `Lampu penerangan jalan sekarang **menyala** pada **${state.lampPwm}% PWM** (~${lux} lux) mengikuti sensor LDR.`
        : `Lampu jalan lagi **mati/hemat daya** (${state.lampPwm}% PWM, ~${lux} lux) karena lingkungan masih terang.`,
      models: ['NLP', 'Expert System']
    };
  }

  // 8. Tempat Sampah
  if (topIntent === 'BIN_QUERY') {
    if (state.binDensity === 0 && !hasAnyData) {
      return { text: 'Sensor ultrasonik tempat sampah masih 0% (penutup tertutup) menunggu data pertama dari ESP32.', models: ['NLP'] };
    }
    return {
      text: `Kapasitas tempat sampah saat ini **${state.binDensity}%** dengan tutup dalam keadaan **${state.binStatus === 'OPEN' ? 'terbuka' : 'tertutup'}**—${state.binDensity >= 80 ? 'sudah penuh dan perlu segera diangkut' : state.binDensity >= 50 ? 'sudah lebih dari setengah' : 'masih aman'}.`,
      models: ['NLP', 'Expert System']
    };
  }

  // 9. Ringkasan Umum
  if (topIntent === 'GENERAL_ANALYSIS') {
    if (!hasAnyData) {
      return {
        text: `Semua sistem RADEN sudah aktif, tinggal menunggu kiriman data pertama dari ESP32/MQTT sehingga angka sensor saat ini masih 0%.`,
        models: ['NLP', 'Decision Tree']
      };
    }
    return {
      text: `Kondisi simpang masuk kategori **${decisionTree.regime.replace('_', ' ')}**: arah terpadat di **${decisionTree.busiestName}** (${decisionTree.busiestDensity}%), lampu hijau aktif di **${activeFrame.nama}**, penerangan jalan **${state.lampPwm}% PWM**, dan sampah terisi **${state.binDensity}%**.`,
      models: ['NLP', 'Decision Tree', 'Expert System']
    };
  }

  // 10. Pertanyaan Umum di Luar Topik (coba cari BM25 sekali lagi + respon jujur tanpa template kaku)
  const fallbackHit = searchLocalKnowledge([...new Set([...prep.filtered, ...prep.stemmed, ...prep.tokens])]);
  if (fallbackHit) {
    return {
      text: fallbackHit.doc.answer,
      models: ['NLP', 'Knowledge Base (BM25)']
    };
  }

  // Humor / obrolan santai
  if (/\b(joke|lelucon|lucu|hibur|ngakak)\b/i.test(text)) {
    return {
      text: pickVariant(seed, [
        'Kenapa lampu lalu lintas selalu kelihatan lelah? Soalnya kerjanya gantian merah-kuning-hijau seharian tanpa pernah boleh duduk!',
        'Bedanya sensor IR sama mantan? Sensor IR kalau kendaraan lewat langsung peka, kalau mantan kadang pura-pura tidak lihat.'
      ]),
      models: ['NLP']
    };
  }

  if (/\b(bosan|gabut|capek|pusing|ngantuk)\b/i.test(text)) {
    return {
      text: `Wah, lagi ${prep.filtered[0] || 'kurang semangat'} ya${sapaNama}? Coba ajak saya bahas sesuatu yang seru—misalnya tebak-tebakan, tanya cara kerja algoritma A*, hitung angka cepat, atau ajarkan fakta baru ke saya pakai format \`belajar: topik = jawaban\`.`,
      models: ['NLP', 'Memori Konteks']
    };
  }

  // Respons jujur berbasis topik yang diekstrak NLP (bukan deflection template)
  const topicWords = prep.filtered.slice(0, 4).join(' ');
  return {
    text: topicWords
      ? `Saya menangkap kamu sedang bertanya atau membahas soal **"${topicWords}"**, tetapi sebagai AI lokal tanpa koneksi LLM eksternal, pengetahuan bawaan saya belum menyimpan detail spesifik tentang topik tersebut. Kalau mau, kamu bisa langsung mengajarkannya ke saya dengan mengetik \`belajar: ${topicWords} = <penjelasannya>\`, nanti otomatis saya ingat!`
      : `Maaf, kalimatmu terlalu singkat untuk saya pahami maksudnya. Bisa diperjelas sedikit topik apa yang ingin kamu bahas atau tanyakan?`,
    models: ['NLP', 'Knowledge Acquisition']
  };
}

export const processQuery = (userQuery, state, historyBuffer = [], sessionId = 'default') => {
  const session = getSession(sessionId);
  const nlp = analyzeNLP(userQuery, {
    lastIntent: session.lastIntent,
    lastLane: session.lastLane
  });

  const prediction = predictTrafficFlow(state, historyBuffer);
  const decisionTree = prediction.decisionTree;
  const expert = runExpertSystem(state, prediction);

  const composed = composeReply({
    nlp,
    state,
    prediction,
    decisionTree,
    expert,
    session
  });

  session.turnCount += 1;
  session.recentQueries.push(userQuery);
  if (session.recentQueries.length > 5) session.recentQueries.shift();

  if (!['GENERAL_QA', 'GREETING_CHAT'].includes(nlp.topIntent)) {
    session.lastIntent = nlp.topIntent;
  }
  if (nlp.entities.matchedLane) {
    session.lastLane = nlp.entities.matchedLane;
  }

  return {
    userQuery,
    aiResponse: composed.text,
    intentDetected: mapToSchemaIntent(nlp.topIntent),
    matchedLane: nlp.entities.matchedLane || null,
    snapshotState: {
      lanes: { ...state.lanes },
      activeLane: state.activeLane,
      binDensity: state.binDensity
    },
    aiMeta: {
      nlpIntent: nlp.topIntent,
      confidence: nlp.confidence,
      modelsUsed: composed.models,
      regime: decisionTree.regime,
      expertConfidence: expert.overallConfidence
    }
  };
};
