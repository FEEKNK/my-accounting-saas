import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Hashes a plaintext password using Node.js crypto.scrypt with a cryptographic salt.
 * Output format: `saltHex:derivedKeyHex`
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plaintext password against a stored `salt:derivedKeyHex` hash
 * using constant-time comparison to prevent timing attacks.
 */
export async function verifyPassword(password: string, combinedHash: string): Promise<boolean> {
  try {
    const [salt, storedKeyHex] = combinedHash.split(':');
    if (!salt || !storedKeyHex) return false;

    const storedBuffer = Buffer.from(storedKeyHex, 'hex');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

    if (storedBuffer.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(storedBuffer, derivedKey);
  } catch {
    return false;
  }
}
