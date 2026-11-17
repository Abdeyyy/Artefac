/**
 * Modul 4, 5, 7 & Model Prediksi Arus Lalu Lintas
 * - Decision Tree Classifier (Klasifikasi kondisi & penentuan prioritas fase hijau)
 * - Algoritma Pencarian A* (Pencarian rute optimal di jaringan semantik Simpang Artos)
 * - Expert System Forward Chaining + Certainty Factor (CF)
 * - Hybrid Traffic Flow Predictor (EMA + Regresi Linier + Faktor Jam Sibuk + Decision Tree)
 */

import { DOMAIN_FRAMES, SEMANTIC_NETWORK, EXPERT_RULES } from './knowledgeBase.js';

const LANE_KEYS = ['utara', 'selatan', 'timur', 'barat'];

function getLaneName(key) {
  return DOMAIN_FRAMES.lanes[key]?.nama || key;
}

/**
 * 1. DECISION TREE CLASSIFIER (Modul 4)
 * Mengklasifikasikan rezim lalu lintas & menentukan jalur prioritas + durasi hijau.
 */
export function evaluateTrafficDecisionTree(state, trendSlope = 0) {
  const lanes = state.lanes || { utara: 0, selatan: 0, timur: 0, barat: 0 };
  const entries = LANE_KEYS.map((k) => ({ key: k, name: getLaneName(k), val: Number(lanes[k] || 0) }));
  entries.sort((a, b) => b.val - a.val);

  const busiest = entries[0];
  const quietest = entries[entries.length - 1];
  const avg = entries.reduce((s, e) => s + e.val, 0) / 4;
  const spread = busiest.val - quietest.val;
  const path = [];

  let regime = 'BELUM_ADA_DATA';
  let urgency = 'rendah';
  let recommendedGreenSec = 15;

  // Node Akar Decision Tree: Cek apakah ada data kendaraan
  if (busiest.val === 0 && avg === 0) {
    path.push('Kepadatan Maks = 0% -> Belum ada arus masuk');
    return {
      regime: 'MENUNGGU_DATA',
      urgency: 'netral',
      busiestLane: busiest.key,
      busiestName: busiest.name,
      busiestDensity: 0,
      quietestLane: quietest.key,
      quietestName: quietest.name,
      avgDensity: 0,
      spread: 0,
      recommendedGreenSec: 15,
      decisionPath: path
    };
  }

  // Cabang 1: Kepadatan puncak >= 70%
  if (busiest.val >= 70) {
    path.push(`Kepadatan Maks (${busiest.val}%) >= 70%`);
    if (trendSlope > 1.5 || spread >= 30) {
      path.push(trendSlope > 1.5 ? `Tren naik (+${trendSlope.toFixed(1)})` : `Selisih antar jalur tinggi (${spread}%)`);
      regime = 'MACET_KRITIS';
      urgency = 'tinggi';
      recommendedGreenSec = Math.min(50, Math.round(35 + (busiest.val - 70) * 0.5));
    } else {
      path.push('Tren stabil & distribusi merata');
      regime = 'PADAT_TERKENDALI';
      urgency = 'sedang';
      recommendedGreenSec = Math.min(45, Math.round(30 + (busiest.val - 70) * 0.4));
    }
  }
  // Cabang 2: Kepadatan puncak 30% - 69%
  else if (busiest.val >= 30) {
    path.push(`Kepadatan Maks (${busiest.val}%) di rentang 30–69%`);
    if (avg >= 45 || trendSlope > 2) {
      path.push(`Rata-rata simpang (${avg.toFixed(0)}%) / tren meningkat`);
      regime = 'PADAT_MENINGKAT';
      urgency = 'sedang';
      recommendedGreenSec = Math.round(22 + (busiest.val / 100) * 20);
    } else {
      path.push('Arus mengalir terkendali');
      regime = 'RAMAI_LANCAR';
      urgency = 'rendah';
      recommendedGreenSec = Math.round(18 + (busiest.val / 100) * 18);
    }
  }
  // Cabang 3: Kepadatan puncak < 30%
  else {
    path.push(`Kepadatan Maks (${busiest.val}%) < 30%`);
    regime = 'LENGANG';
    urgency = 'rendah';
    recommendedGreenSec = 15;
  }

  return {
    regime,
    urgency,
    busiestLane: busiest.key,
    busiestName: busiest.name,
    busiestDensity: busiest.val,
    quietestLane: quietest.key,
    quietestName: quietest.name,
    avgDensity: Math.round(avg),
    spread,
    recommendedGreenSec,
    decisionPath: path
  };
}

/**
 * 2. EXPERT SYSTEM FORWARD CHAINING + CERTAINTY FACTOR (Modul 7)
 */
export function runExpertSystem(state, predictionSummary = null) {
  const lanes = state.lanes || { utara: 0, selatan: 0, timur: 0, barat: 0 };
  const entries = LANE_KEYS.map((k) => ({ key: k, name: getLaneName(k), val: Number(lanes[k] || 0) }));
  entries.sort((a, b) => b.val - a.val);

  const maxLane = entries[0];
  const minLane = entries[entries.length - 1];
  const totalDensity = entries.reduce((s, e) => s + e.val, 0);
  const activeKey = state.activeLane || 'utara';

  const context = {
    state,
    maxDensity: maxLane.val,
    maxLaneKey: maxLane.key,
    maxLaneName: maxLane.name,
    minDensity: minLane.val,
    minLaneName: minLane.name,
    spread: maxLane.val - minLane.val,
    totalDensity,
    activeLaneDensity: Number(lanes[activeKey] || 0),
    activeLaneName: getLaneName(activeKey),
    trendSlope: predictionSummary?.overallSlope ?? 0
  };

  const firedRules = [];
  let combinedCF = 0;

  for (const rule of EXPERT_RULES) {
    try {
      if (rule.condition(context)) {
        const diag = rule.diagnosis(context).replace("'trend'", String((context.trendSlope || 0).toFixed(1)));
        const rec = rule.recommendation(context);
        firedRules.push({
          id: rule.id,
          name: rule.name,
          category: rule.category,
          cf: rule.cf,
          diagnosis: diag,
          recommendation: rec
        });
        // Rumus kombinasi Certainty Factor: CF_comb = CF1 + CF2 * (1 - CF1)
        combinedCF = combinedCF === 0 ? rule.cf : combinedCF + rule.cf * (1 - combinedCF);
      }
    } catch {
      // Abaikan rule error
    }
  }

  return {
    firedRules,
    overallConfidence: Number((combinedCF * 100).toFixed(1)),
    context
  };
}

/**
 * 3. ALGORITMA PENCARIAN A* (Modul 5)
 * Mencari rute tercepat dengan bobot jarak + penalti kepadatan sensor live.
 */
function heuristic(nodeA, nodeB) {
  const a = SEMANTIC_NETWORK.nodes[nodeA]?.coord;
  const b = SEMANTIC_NETWORK.nodes[nodeB]?.coord;
  if (!a || !b) return 0;
  const dLat = (a[0] - b[0]) * 11100;
  const dLon = (a[1] - b[1]) * 11100;
  return Math.sqrt(dLat * dLat + dLon * dLon) * 0.25;
}

export function findOptimalRouteAStar(startNode, goalNode, state) {
  if (!SEMANTIC_NETWORK.nodes[startNode] || !SEMANTIC_NETWORK.nodes[goalNode]) {
    return null;
  }

  const openSet = new Set([startNode]);
  const cameFrom = {};
  const gScore = { [startNode]: 0 };
  const fScore = { [startNode]: heuristic(startNode, goalNode) };

  while (openSet.size > 0) {
    let current = null;
    let lowestF = Infinity;
    for (const node of openSet) {
      const f = fScore[node] ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        current = node;
      }
    }

    if (current === goalNode) {
      const path = [current];
      while (cameFrom[current]) {
        current = cameFrom[current];
        path.unshift(current);
      }
      const readablePath = path.map((p) => SEMANTIC_NETWORK.nodes[p].label);
      const usesBypass = path.includes('Jalur_Pakelan') || path.includes('Ringroad_Banyurojo');
      return {
        path,
        readablePath,
        totalCost: Number((gScore[goalNode] || 0).toFixed(1)),
        usesBypass
      };
    }

    openSet.delete(current);
    const outgoing = SEMANTIC_NETWORK.edges.filter((e) => e.from === current);

    for (const edge of outgoing) {
      // Penalti kepadatan live: makin padat jalur, makin tinggi bobot A*
      const liveDensity = edge.laneKey ? Number(state.lanes?.[edge.laneKey] || 0) : 0;
      const congestionPenalty = liveDensity * 0.65;
      const tentativeG = (gScore[current] ?? Infinity) + edge.distanceCost + congestionPenalty;

      if (tentativeG < (gScore[edge.to] ?? Infinity)) {
        cameFrom[edge.to] = current;
        gScore[edge.to] = tentativeG;
        fScore[edge.to] = tentativeG + heuristic(edge.to, goalNode);
        openSet.add(edge.to);
      }
    }
  }

  return null;
}

/**
 * 4. MODEL PREDIKSI ARUS LALU LINTAS (EMA + Regresi Linier + Jam Sibuk + Decision Tree)
 * Memprediksi kepadatan untuk horizon 5, 10, 15, 20, 25 menit ke depan.
 */
function getRushHourBias(date = new Date()) {
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour >= 6.5 && hour <= 8.5) return 0.9;    // Jam berangkat pagi
  if (hour >= 11.75 && hour <= 13.5) return 0.5; // Jam istirahat siang
  if (hour >= 16.5 && hour <= 18.75) return 1.1; // Jam pulang sore
  if (hour >= 22 || hour <= 5) return -0.7;      // Malam / dini hari cenderung turun
  return 0.1;
}

function computeLinearSlopeAndEMA(series) {
  if (!series || series.length === 0) return { slope: 0, ema: 0, variance: 0 };
  const n = series.length;

  // Exponential Moving Average (alpha = 0.4)
  let ema = series[0];
  for (let i = 1; i < n; i++) {
    ema = 0.4 * series[i] + 0.6 * ema;
  }

  if (n < 2) return { slope: 0, ema, variance: 0 };

  // Ordinary Least Squares Linear Regression Slope
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += series[i];
    sumXY += i * series[i];
    sumXX += i * i;
  }
  const denom = n * sumXX - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;

  const mean = sumY / n;
  const variance = series.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;

  return { slope, ema, variance };
}

export function predictTrafficFlow(currentState, historyBuffer = []) {
  const lanes = currentState.lanes || { utara: 0, selatan: 0, timur: 0, barat: 0 };
  const rushBias = getRushHourBias(new Date());
  const horizons = [5, 10, 15, 20, 25];
  const sampleCount = historyBuffer.length;

  const laneStats = {};
  let totalSlope = 0;

  for (const key of LANE_KEYS) {
    const series = historyBuffer.map((h) => Number(h.lanes?.[key] ?? lanes[key] ?? 0));
    if (series.length === 0) series.push(Number(lanes[key] || 0));
    const { slope, ema, variance } = computeLinearSlopeAndEMA(series);

    // Jalur yang sedang lampu hijau cenderung terkuras sedikit lebih cepat dalam jangka dekat
    const greenDrainFactor = currentState.activeLane === key ? -0.45 : 0.25;
    const effectiveSlope = Math.max(-4, Math.min(4, slope * 0.7 + rushBias * 0.3 + greenDrainFactor));

    laneStats[key] = {
      current: Number(lanes[key] || 0),
      ema: Number(ema.toFixed(1)),
      slope: Number(effectiveSlope.toFixed(2)),
      variance: Number(variance.toFixed(1))
    };
    totalSlope += effectiveSlope;
  }

  const avgSlope = totalSlope / 4;
  const hasRealData = LANE_KEYS.some((k) => Number(lanes[k] || 0) > 0) || sampleCount > 1;

  // Bangun prediksi per horizon (5, 10, 15, 20, 25 menit)
  const forecasts = horizons.map((mins, idx) => {
    const stepFactor = mins / 5; // 1..5
    const perLane = {};
    let totalPredicted = 0;

    for (const key of LANE_KEYS) {
      const st = laneStats[key];
      if (!hasRealData) {
        perLane[key] = 0;
        continue;
      }
      // Redaman non-linier agar prediksi jangka menengah tetap realistis (0-100%)
      const dampedStep = Math.sqrt(stepFactor) * 1.4;
      const base = st.current * 0.65 + st.ema * 0.35;
      const val = Math.round(Math.min(100, Math.max(0, base + st.slope * dampedStep)));
      perLane[key] = val;
      totalPredicted += val;
    }

    const avgPredictedDensity = Math.round(totalPredicted / 4);
    // Confidence: lebih tinggi jika banyak sampel riwayat, turun perlahan di horizon jauh
    const baseConf = sampleCount >= 10 ? 91 : sampleCount >= 4 ? 84 : hasRealData ? 76 : 65;
    const avgVar = LANE_KEYS.reduce((s, k) => s + laneStats[k].variance, 0) / 4;
    const variancePenalty = Math.min(10, Math.round(Math.sqrt(avgVar) * 0.35));
    const horizonPenalty = idx * 3;
    const confidence = Math.max(55, Math.min(96, baseConf - variancePenalty - horizonPenalty));

    return {
      minute: `${mins} mnt`,
      minutesAhead: mins,
      predictedVehicles: totalPredicted,
      avgDensity: avgPredictedDensity,
      perLane,
      confidence
    };
  });

  const decisionTree = evaluateTrafficDecisionTree(currentState, avgSlope);

  return {
    modelName: 'Hybrid EMA + Regresi Linier + Decision Tree',
    hasRealData,
    sampleCount,
    overallSlope: Number(avgSlope.toFixed(2)),
    trendLabel: !hasRealData ? 'menunggu data' : avgSlope > 0.6 ? 'meningkat' : avgSlope < -0.6 ? 'menurun' : 'stabil',
    laneStats,
    decisionTree,
    forecasts,
    generatedAt: new Date().toISOString()
  };
}

