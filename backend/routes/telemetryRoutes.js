import express from 'express';
import {
  getLatestTelemetry,
  updateTelemetryData,
  getTelemetryHistory,
  getTrafficPredictions,
  getTrafficStatus,
  setTrafficOverride,
  getDeviceHealth
} from '../controllers/telemetryController.js';

const router = express.Router();

router.get('/latest', getLatestTelemetry);
router.post('/update', updateTelemetryData);
router.get('/history', getTelemetryHistory);
router.get('/predictions', getTrafficPredictions);
router.get('/traffic-status', getTrafficStatus);
router.post('/traffic-override', setTrafficOverride);
router.get('/devices', getDeviceHealth);

export default router;

