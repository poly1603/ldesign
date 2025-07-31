import { Encrypt, Decrypt, Hash, HMAC, KeyGenerator, DigitalSignature } from './crypto.js';
export { aes, base64, encoding, hex, rsa } from '@/algorithms';
export { AESOptions, DecryptResult, EncodingType, EncryptResult, HMACAlgorithm, HashAlgorithm, HashOptions, HashResult, KeyGenerationOptions, RSAKeyPair, RSAOptions } from '@/types';

declare const encrypt: Encrypt;
declare const decrypt: Decrypt;
declare const hash: Hash;
declare const hmac: HMAC;
declare const keyGenerator: KeyGenerator;
declare const digitalSignature: DigitalSignature;

export { Decrypt, DigitalSignature, Encrypt, HMAC, Hash, KeyGenerator, decrypt, digitalSignature, encrypt, hash, hmac, keyGenerator };
