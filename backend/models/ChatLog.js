import mongoose from 'mongoose';

const chatLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  userQuery: {
    type: String,
    required: true,
    trim: true
  },
  aiResponse: {
    type: String,
    required: true
  },
  intentDetected: {
    type: String,
    enum: ['TRAFFIC_QUERY', 'LAMP_QUERY', 'BIN_QUERY', 'GENERAL_ANALYSIS', 'UNKNOWN'],
    default: 'GENERAL_ANALYSIS'
  },
  matchedLane: {
    type: String,
    enum: ['utara', 'selatan', 'timur', 'barat', null],
    default: null
  },
  // Snapshot state RAM saat user bertanya (untuk keperluan debugging/audit AI)
  snapshotState: {
    lanes: {
      utara: Number,
      selatan: Number,
      timur: Number,
      barat: Number
    },
    activeLane: String,
    binDensity: Number
  }
}, {
  timestamps: true
});

export const ChatLog = mongoose.model('ChatLog', chatLogSchema);

