import express from 'express';
import { handleChatMessage, getChatHistory } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', handleChatMessage);
router.get('/history', getChatHistory);

export default router;

