import * as crypto from 'crypto';

/**
 * Utility class for data encryption and decryption
 * Uses AES-256-CBC encryption for sensitive data
 */
export class EncryptionUtil {
  private static readonly algorithm = 'aes-256-cbc';
  private static readonly keyLength = 32;
  private static readonly ivLength = 16;

  /**
   * Encrypt sensitive data
   * @param text - Plain text to encrypt
   * @param key - Encryption key (32 characters)
   * @returns Encrypted string in format: iv:encryptedData
   */
  static encrypt(text: string, key: string): string {
    try {
      const keyBuffer = this.generateKey(key);
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, keyBuffer, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt encrypted data
   * @param encryptedText - Encrypted text in format: iv:encryptedData
   * @param key - Decryption key (32 characters)
   * @returns Decrypted plain text
   */
  static decrypt(encryptedText: string, key: string): string {
    try {
      const keyBuffer = this.generateKey(key);
      const parts = encryptedText.split(':');
      
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted text format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedData = parts[1];
      
      const decipher = crypto.createDecipheriv(this.algorithm, keyBuffer, iv);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generate a consistent key buffer from string key
   */
  private static generateKey(key: string): Buffer {
    return crypto.createHash('sha256').update(key).digest();
  }

  /**
   * Hash sensitive data (one-way)
   */
  static hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}