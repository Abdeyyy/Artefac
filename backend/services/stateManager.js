/**
 * State Manager Alias for ARTEFAC
 * Menghubungkan secara transparan ke State Service
 */
export {
  getState,
  getLatestState,
  getHistoryBuffer,
  getLatestStateWithPredictions,
  updateState,
  getSnapshotForTelemetry
} from './stateService.js';
