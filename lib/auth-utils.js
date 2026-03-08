import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a random verification token
 */
export function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate token expiry time (24 hours from now)
 */
export function generateTokenExpiry() {
    return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
}
