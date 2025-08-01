import { Encrypt, Decrypt, Hash, HMAC, KeyGenerator, DigitalSignature } from './crypto.js';
export { aes } from '../algorithms/aes.js';
export { rsa } from '../algorithms/rsa.js';
export { AESOptions, DecryptResult, EncodingType, EncryptResult, HMACAlgorithm, HashAlgorithm, HashOptions, HashResult, KeyGenerationOptions, RSAKeyPair, RSAOptions } from '../types/index.js';
export { base64, encoding, hex } from '../algorithms/encoding.js';

declare const encrypt: Encrypt;
declare const decrypt: Decrypt;
declare const hash: Hash;
declare const hmac: HMAC;
declare const keyGenerator: KeyGenerator;
declare const digitalSignature: DigitalSignature;

export { Decrypt, DigitalSignature, Encrypt, HMAC, Hash, KeyGenerator, decrypt, digitalSignature, encrypt, hash, hmac, keyGenerator };
