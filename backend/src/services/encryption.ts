import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 32 bytes for AES-256

export class EncryptionService {
  private key: Buffer;

  constructor() {
    // Auto-generate key if not set (for development/testing only)
    const encryptionKey = process.env.ENCRYPTION_KEY || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('ENCRYPTION_KEY must be set in production');
      }
      console.warn('WARNING: Using auto-generated ENCRYPTION_KEY. Set ENCRYPTION_KEY in production!');
      return 'dev-encryption-key-change-in-production-' + Date.now();
    })();

    // Ensure key is exactly 32 bytes
    this.key = crypto
      .createHash('sha256')
      .update(encryptionKey)
      .digest()
      .slice(0, KEY_LENGTH);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  encryptBuffer(buffer: Buffer): Buffer {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    // Return iv + authTag + encrypted
    return Buffer.concat([iv, authTag, encrypted]);
  }

  decryptBuffer(encryptedBuffer: Buffer): Buffer {
    const iv = encryptedBuffer.slice(0, 16);
    const authTag = encryptedBuffer.slice(16, 32);
    const encrypted = encryptedBuffer.slice(32);

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
  }
}

export const encryptionService = new EncryptionService();

