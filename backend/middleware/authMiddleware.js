import { verifyToken } from '../services/authService.js';

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Sesi telah kedaluwarsa atau token tidak valid. Silakan login ulang.'
    });
  }

  req.user = decoded;
  next();
};

