/**
 * Layanan Autentikasi ARTEFAC (Password Hashing scrypt + Signed JWT HMAC-SHA256)
 * Mendukung penyimpanan MongoDB Atlas dengan fallback otomatis ke file JSON lokal.
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

const getJwtSecret = () => process.env.JWT_SECRET || 'artefac-simpang-artos-local-jwt-secret-2026';

// --- Password Hashing (crypto.scryptSync + timingSafeEqual) ---
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, keyHex] = storedHash.split(':');
  const keyBuf = Buffer.from(keyHex, 'hex');
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

// --- Signed JWT (HS256) ---
function base64UrlEncode(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str) {
  const pad = 4 - (str.length % 4);
  const padded = str + (pad < 4 ? '='.repeat(pad) : '');
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
}

export function generateToken(user, expiresInSeconds = 86400) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const nowSec = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: String(user.id || user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      iat: nowSec,
      exp: nowSec + expiresInSeconds
    })
  );
  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', getJwtSecret())
      .update(`${header}.${payload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const decoded = JSON.parse(base64UrlDecode(payload));
    if (decoded.exp && Math.floor(Date.now() / 1000) > decoded.exp) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

// --- Penyimpanan User (MongoDB Atlas / Fallback JSON Lokal) ---
function readLocalUsers() {
  try {
    if (fs.existsSync(LOCAL_USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(LOCAL_USERS_FILE, 'utf-8'));
      return Array.isArray(data) ? data : [];
    }
  } catch {
    // Abaikan jika korup
  }
  return [];
}

function writeLocalUsers(users) {
  const dir = path.dirname(LOCAL_USERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function sanitizeUser(u) {
  return {
    id: String(u._id || u.id),
    name: u.name,
    email: u.email,
    role: u.role
  };
}

export async function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  if (mongoose.connection.readyState === 1) {
    return await User.findOne({ email: normalized });
  }
  const users = readLocalUsers();
  return users.find((u) => u.email === normalized) || null;
}

export async function findUserById(id) {
  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
    const u = await User.findById(id);
    if (u) return sanitizeUser(u);
  }
  const users = readLocalUsers();
  const found = users.find((u) => u.id === id);
  return found ? sanitizeUser(found) : null;
}

export async function createUser({ name, email, password, role = 'Operator' }) {
  const normalized = email.trim().toLowerCase();
  const passwordHash = hashPassword(password);

  if (mongoose.connection.readyState === 1) {
    const created = await User.create({
      name: name.trim(),
      email: normalized,
      passwordHash,
      role
    });
    return sanitizeUser(created);
  }

  const users = readLocalUsers();
  const newUser = {
    id: `usr_${crypto.randomBytes(6).toString('hex')}`,
    name: name.trim(),
    email: normalized,
    passwordHash,
    role,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  writeLocalUsers(users);
  return sanitizeUser(newUser);
}

export async function ensureDefaultUsers() {
  const defaultAccount = {
    name: 'Operator Simpang Artos',
    email: 'texa@ac.id',
    password: 'texaexpo1811',
    role: 'Administrator'
  };

  try {
    // Hapus akun demo lama jika sempat tersimpan
    if (mongoose.connection.readyState === 1) {
      await User.deleteOne({ email: 'operator@artefac.digital' });
    } else {
      const localUsers = readLocalUsers().filter((u) => u.email !== 'operator@artefac.digital');
      writeLocalUsers(localUsers);
    }

    const exists = await findUserByEmail(defaultAccount.email);
    if (!exists) {
      await createUser(defaultAccount);
      console.log(`🔐 Akun operator dibuat: ${defaultAccount.email}`);
    }
  } catch (err) {
    console.warn('⚠️ Gagal menyiapkan akun operator:', err.message);
  }
}

export { sanitizeUser };

