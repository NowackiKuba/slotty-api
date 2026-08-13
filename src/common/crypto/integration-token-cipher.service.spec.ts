import { ConfigService } from '@nestjs/config';
import { IntegrationTokenCipherService } from './integration-token-cipher.service';

describe('IntegrationTokenCipherService', () => {
  const key = Buffer.alloc(32, 7).toString('base64');

  function createCipher(): IntegrationTokenCipherService {
    const config = {
      getOrThrow: (name: string) => {
        if (name === 'INTEGRATION_TOKEN_ENCRYPTION_KEY') {
          return key;
        }

        throw new Error(`Missing config ${name}`);
      },
    } as ConfigService;

    return new IntegrationTokenCipherService(config);
  }

  it('encrypts and decrypts integration tokens', () => {
    const cipher = createCipher();
    const plaintext = 'super-secret-oauth-token';

    const encrypted = cipher.encrypt(plaintext);

    expect(encrypted).toMatch(/^enc:v1:/);
    expect(encrypted).not.toEqual(plaintext);
    expect(cipher.decrypt(encrypted)).toBe(plaintext);
  });

  it('returns legacy plaintext values unchanged', () => {
    const cipher = createCipher();

    expect(cipher.decrypt('legacy-plaintext-token')).toBe(
      'legacy-plaintext-token',
    );
  });

  it('round-trips null values', () => {
    const cipher = createCipher();

    expect(cipher.encrypt(null)).toBeNull();
    expect(cipher.decrypt(null)).toBeNull();
  });
});
