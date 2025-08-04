import { AESOptions, EncryptResult, DecryptResult, RSAKeyPair, RSAOptions, EncodingType } from './types/index.js';
export { AESKeySize, AESMode, EncryptionAlgorithm, HMACAlgorithm, HMACOptions, HashAlgorithm, HashOptions, HashResult, IEncoder, IEncryptor, IHMACer, IHasher, IKeyGenerator, KeyGenerationOptions, RSAKeyFormat } from './types/index.js';
export { AESEncryptor, aes } from './algorithms/aes.js';
export { Encoder, base64, encoding, hex } from './algorithms/encoding.js';
export { HMACHasher, Hasher } from './algorithms/hash.js';
export { RSAEncryptor, rsa } from './algorithms/rsa.js';
export { decrypt, digitalSignature, encrypt, hash, hmac, keyGenerator } from './core/index.js';
import { StringUtils, RandomUtils, ValidationUtils, ErrorUtils } from './utils/index.js';
export { CONSTANTS } from './utils/index.js';
import { Encrypt, Decrypt, Hash, HMAC, KeyGenerator, DigitalSignature } from './core/crypto.js';

declare const cryptoDefault: {
    encrypt: Encrypt;
    decrypt: Decrypt;
    hash: Hash;
    hmac: HMAC;
    keyGenerator: KeyGenerator;
    digitalSignature: DigitalSignature;
    aes: {
        encrypt: (data: string, key: string, options?: AESOptions) => EncryptResult;
        decrypt: (encryptedData: string | EncryptResult, key: string, options?: AESOptions) => DecryptResult;
        encrypt128: (data: string, key: string, options?: Omit<AESOptions, "keySize">) => EncryptResult;
        encrypt192: (data: string, key: string, options?: Omit<AESOptions, "keySize">) => EncryptResult;
        encrypt256: (data: string, key: string, options?: Omit<AESOptions, "keySize">) => EncryptResult;
        decrypt128: (encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, "keySize">) => DecryptResult;
        decrypt192: (encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, "keySize">) => DecryptResult;
        decrypt256: (encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, "keySize">) => DecryptResult;
    };
    rsa: {
        generateKeyPair: (keySize?: number) => RSAKeyPair;
        encrypt: (data: string, publicKey: string, options?: RSAOptions) => EncryptResult;
        decrypt: (encryptedData: string | EncryptResult, privateKey: string, options?: RSAOptions) => DecryptResult;
        sign: (data: string, privateKey: string, algorithm?: string) => string;
        verify: (data: string, signature: string, publicKey: string, algorithm?: string) => boolean;
    };
    encoding: {
        base64: {
            encode: (data: string) => string;
            decode: (encodedData: string) => string;
            encodeUrl: (data: string) => string;
            decodeUrl: (encodedData: string) => string;
        };
        hex: {
            encode: (data: string) => string;
            decode: (encodedData: string) => string;
        };
        encode: (data: string, encoding: EncodingType) => string;
        decode: (encodedData: string, encoding: EncodingType) => string;
    };
    base64: {
        encode: (data: string) => string;
        decode: (encodedData: string) => string;
        encodeUrl: (data: string) => string;
        decodeUrl: (encodedData: string) => string;
    };
    hex: {
        encode: (data: string) => string;
        decode: (encodedData: string) => string;
    };
    utils: {
        StringUtils: typeof StringUtils;
        RandomUtils: typeof RandomUtils;
        ValidationUtils: typeof ValidationUtils;
        ErrorUtils: typeof ErrorUtils;
    };
    constants: {
        readonly AES: {
            readonly KEY_SIZES: readonly [128, 192, 256];
            readonly MODES: readonly ["CBC", "ECB", "CFB", "OFB", "CTR", "GCM"];
            readonly DEFAULT_MODE: "CBC";
            readonly DEFAULT_KEY_SIZE: 256;
            readonly IV_LENGTH: 16;
        };
        readonly RSA: {
            readonly KEY_SIZES: readonly [1024, 2048, 3072, 4096];
            readonly DEFAULT_KEY_SIZE: 2048;
        };
        readonly HASH: {
            readonly ALGORITHMS: readonly ["MD5", "SHA1", "SHA224", "SHA256", "SHA384", "SHA512"];
        };
        readonly HMAC: {
            readonly ALGORITHMS: readonly ["HMAC-MD5", "HMAC-SHA1", "HMAC-SHA256", "HMAC-SHA384", "HMAC-SHA512"];
        };
        readonly ENCODING: {
            readonly TYPES: readonly ["base64", "hex", "utf8"];
            readonly DEFAULT: "hex";
        };
    };
};

export { AESOptions, Decrypt, DecryptResult, DigitalSignature, EncodingType, Encrypt, EncryptResult, ErrorUtils, HMAC, Hash, KeyGenerator, RSAKeyPair, RSAOptions, RandomUtils, StringUtils, ValidationUtils, cryptoDefault as default };
