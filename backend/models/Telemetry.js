import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Di-index agar query histori analitis jam sibuk super cepat
  },
  lanes: {
    utara: { type: Number, required: true, min: 0, max: 100 },
    selatan: { type: Number, required: true, min: 0, max: 100 },
    timur: { type: Number, required: true, min: 0, max: 100 },
    barat: { type: Number, required: true, min: 0, max: 100 }
  },
  activeLane: {
    type: String,
    enum: ['utara', 'selatan', 'timur', 'barat'],
    required: true
  },
  greenDuration: {
    type: Number,
    required: true,
    min: 15,
    max: 50
  },
  lampPwm: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  binDensity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  binStatus: {
    type: String,
    enum: ['OPEN', 'CLOSED'],
    default: 'CLOSED'
  }
}, {
  timestamps: true // Otomatis menambahkan createdAt dan updatedAt
});

export const Telemetry = mongoose.model('Telemetry', telemetrySchema);

