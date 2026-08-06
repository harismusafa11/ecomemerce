import crypto from 'crypto';

interface ResponseLike {
  setHeader(name: string, value: string): void;
  status(code: number): { json(body: any): any };
}

const SECURITY_SALT = process.env.SECURITY_SALT;
if (!SECURITY_SALT) {
  throw new Error('SECURITY_SALT environment variable is required');
}

const TOKEN_COOKIE = 'tp_token';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function hashPassword(password: string): string {
  if (!password) return '';
  return crypto.pbkdf2Sync(password, SECURITY_SALT!, 600000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  const computed = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
}

export function sanitizeUser(user: any) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

export function setSecurityHeaders(res: ResponseLike) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
}

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function generateAuthToken(userId: number): string {
  const expires = Date.now() + TOKEN_TTL_MS;
  const payload = `${userId}.${expires}`;
  const encoded = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', SECURITY_SALT!).update(payload).digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifyAuthToken(token: string): { userId: number; expires: number } | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, signature] = parts;
    const payload = Buffer.from(encoded, 'base64url').toString();
    const expected = crypto.createHmac('sha256', SECURITY_SALT!).update(payload).digest('base64url');
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    const dotIndex = payload.indexOf('.');
    if (dotIndex <= 0) return null;
    const userId = Number(payload.slice(0, dotIndex));
    const expires = Number(payload.slice(dotIndex + 1));
    if (!Number.isFinite(userId) || !Number.isFinite(expires) || userId <= 0) return null;
    if (Date.now() > expires) return null;
    return { userId, expires };
  } catch {
    return null;
  }
}

export function setAuthCookie(res: ResponseLike, token: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', `${TOKEN_COOKIE}=${token}; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=${TOKEN_TTL_MS / 1000}`);
}

export function clearAuthCookie(res: ResponseLike) {
  res.setHeader('Set-Cookie', `${TOKEN_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
}

export function getTokenFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim().split('='));
  const tokenCookie = cookies.find(([name]) => name === TOKEN_COOKIE);
  return tokenCookie ? decodeURIComponent(tokenCookie[1] || '') : null;
}

export function safeErrorResponse(res: ResponseLike, statusCode: number, clientMessage: string, internalError?: any) {
  if (internalError) {
    console.error(`[SECURITY API ERROR ${statusCode}]`, clientMessage, internalError instanceof Error ? internalError.message : internalError);
  }
  return res.status(statusCode).json({
    error: clientMessage,
    status: statusCode
  });
}

export function sanitizeInput(input: string, maxLength: number = 500): string {
  if (!input) return '';
  return String(input)
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, maxLength);
}

export function isValidPassword(password: string): { valid: boolean; message: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password wajib diisi' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password minimal 8 karakter' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung huruf besar' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung huruf kecil' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung angka' };
  }
  return { valid: true, message: '' };
}
