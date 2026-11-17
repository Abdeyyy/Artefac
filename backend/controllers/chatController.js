import { getLatestState, getHistoryBuffer } from '../services/stateService.js';
import { processQuery } from '../services/aiEngine.js';
import { ChatLog } from '../models/ChatLog.js';
import mongoose from 'mongoose';

/**
 * POST /api/chat
 * Endpoint percakapan dengan RADEN Pure AI Engine
 */
export const handleChatMessage = async (req, res) => {
  const startTime = process.hrtime();
  const userQuery = req.body.message || req.body.userQuery || '';
  const sessionId = req.body.sessionId || 'default';

  if (!userQuery.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Pertanyaan tidak boleh kosong'
    });
  }

  // 1. Ambil snapshot state RAM + riwayat time-series instan (< 1ms)
  const currentState = getLatestState();
  const historyBuffer = getHistoryBuffer();

  // 2. Proses query dengan RADEN Pure AI Engine
  const result = processQuery(userQuery, currentState, historyBuffer, sessionId);

  // Hitung latensi eksekusi AI Engine
  const diff = process.hrtime(startTime);
  const latencyMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

  // 3. Simpan riwayat chat ke MongoDB Atlas secara asinkron (non-blocking)
  if (mongoose.connection.readyState === 1) {
    ChatLog.create({
      userQuery: result.userQuery,
      aiResponse: result.aiResponse,
      intentDetected: result.intentDetected,
      matchedLane: result.matchedLane,
      snapshotState: result.snapshotState,
      timestamp: new Date()
    }).catch(err => {
      console.error('⚠️ Gagal menyimpan riwayat chat ke MongoDB:', err.message);
    });
  }

  // 4. Kirim respons langsung ke pengguna (latensi sub-5ms)
  return res.json({
    success: true,
    userQuery: result.userQuery,
    aiResponse: result.aiResponse,
    intentDetected: result.intentDetected,
    matchedLane: result.matchedLane,
    aiMeta: result.aiMeta,
    latencyMs: `${latencyMs}ms`,
    timestamp: new Date().toISOString()
  });
};

/**
 * GET /api/chat/history
 * Mengambil histori log percakapan dari MongoDB Atlas
 */
export const getChatHistory = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const logs = await ChatLog.find()
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat percakapan',
      error: error.message
    });
  }
};

