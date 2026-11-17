import express from 'express';
import {
  loginUser,
  getCurrentUser,
  logoutUser
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.get('/me', requireAuth, getCurrentUser);
router.post('/logout', logoutUser);

export default router;
