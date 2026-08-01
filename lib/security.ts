import type { VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const SECURITY_SALT = process.env.SECURITY_SALT || 'tapak_pamungkas_auth_salt_v1_2026';

/**
 * Securely hash password using PBKDF2 with SHA-512
 */
export function hashPassword(password: string): string {
    if (!password) return '';
    return crypto.pbkdf2Sync(password, SECURITY_SALT, 10000, 64, 'sha512').toString('hex');
}

/**
 * Verify password against stored hash with legacy plaintext fallback support
 */
export function verifyPassword(password: string, storedHash: string): boolean {
    if (!password || !storedHash) return false;
    // Support legacy plaintext password match for existing seed users
    if (password === storedHash) return true;
    
    const computed = hashPassword(password);
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
}

/**
 * Strip sensitive fields like password before returning user object to client
 */
export function sanitizeUser(user: any) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
}

/**
 * Apply robust HTTP Security Headers to prevent clickjacking, MIME-sniffing, XSS
 */
export function setSecurityHeaders(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
}

/**
 * Sanitize email input
 */
export function isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Safely format error message without leaking internal database schemas or stacktraces
 */
export function safeErrorResponse(res: VercelResponse, statusCode: number, clientMessage: string, internalError?: any) {
    if (internalError) {
        console.error(`[SECURITY API ERROR ${statusCode}]`, clientMessage, internalError);
    }
    return res.status(statusCode).json({
        error: clientMessage,
        status: statusCode
    });
}
