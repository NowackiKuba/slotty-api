import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const VERSION_PREFIX = 'enc:v1:';

@Injectable()
export class IntegrationTokenCipherService {
  private readonly key: Buffer;

  constructor(config: ConfigService) {
    this.key = this.parseKey(
      config.getOrThrow<string>('INTEGRATION_TOKEN_ENCRYPTION_KEY'),
    );
  }

  encrypt(value: string | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return `${VERSION_PREFIX}${iv.toString('base64url')}:${authTag.toString('base64url')}:${encrypted.toString('base64url')}`;
  }

  decrypt(value: string | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (!value.startsWith(VERSION_PREFIX)) {
      return value;
    }

    const payload = value.slice(VERSION_PREFIX.length);
    const [ivEncoded, authTagEncoded, ciphertextEncoded] = payload.split(':');

    if (!ivEncoded || !authTagEncoded || !ciphertextEncoded) {
      throw new Error('Invalid encrypted integration token payload');
    }

    const decipher = createDecipheriv(
      ALGORITHM,
      this.key,
      Buffer.from(ivEncoded, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(authTagEncoded, 'base64url'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(ciphertextEncoded, 'base64url')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  private parseKey(raw: string): Buffer {
    const trimmed = raw.trim();

    if (/^[0-9a-f]{64}$/i.test(trimmed)) {
      return Buffer.from(trimmed, 'hex');
    }

    const decoded = Buffer.from(trimmed, 'base64');

    if (decoded.length !== 32) {
      throw new Error(
        'INTEGRATION_TOKEN_ENCRYPTION_KEY must be 32 bytes (base64) or 64 hex chars',
      );
    }

    return decoded;
  }
}
