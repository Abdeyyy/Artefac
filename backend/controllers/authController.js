import {
  findUserByEmail,
  findUserById,
  verifyPassword,
  generateToken,
  sanitizeUser
} from '../services/authService.js';

/**
 * POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan kata sandi wajib diisi.'
      });
    }

    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({
        success: false,
        message: 'Email atau kata sandi salah.'
      });
    }

    const safeUser = sanitizeUser(user);
    const ttlSeconds = rememberMe ? 7 * 86400 : 86400; // 7 hari atau 24 jam
    const token = generateToken(safeUser, ttlSeconds);

    return res.json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat login.',
      error: error.message
    });
  }
};

/**
 * GET /api/auth/me (memerlukan Bearer token)
 */
export const getCurrentUser = async (req, res) => {
  const user = await findUserById(req.user.sub);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Pengguna tidak ditemukan.'
    });
  }
  return res.json({
    success: true,
    user
  });
};

/**
 * POST /api/auth/logout
 */
export const logoutUser = (req, res) => {
  return res.json({
    success: true,
    message: 'Logout berhasil.'
  });
};
