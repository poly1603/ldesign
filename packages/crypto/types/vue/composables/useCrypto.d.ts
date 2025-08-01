import { Ref } from 'vue';
import { EncryptResult, DecryptResult, AESOptions, RSAOptions, RSAKeyPair } from '../../types/index.js';
import { encrypt, decrypt, keyGenerator } from '../../core/index.js';

/**
 * 加密状态接口
 */
interface CryptoState {
    isEncrypting: Ref<boolean>;
    isDecrypting: Ref<boolean>;
    lastError: Ref<string | null>;
    lastResult: Ref<EncryptResult | DecryptResult | null>;
}
/**
 * 加密操作接口
 */
interface CryptoActions {
    encryptAES: (data: string, key: string, options?: AESOptions) => Promise<EncryptResult>;
    decryptAES: (encryptedData: string | EncryptResult, key: string, options?: AESOptions) => Promise<DecryptResult>;
    encryptRSA: (data: string, publicKey: string, options?: RSAOptions) => Promise<EncryptResult>;
    decryptRSA: (encryptedData: string | EncryptResult, privateKey: string, options?: RSAOptions) => Promise<DecryptResult>;
    encodeBase64: (data: string) => Promise<string>;
    decodeBase64: (encodedData: string) => Promise<string>;
    encodeHex: (data: string) => Promise<string>;
    decodeHex: (encodedData: string) => Promise<string>;
    generateRSAKeyPair: (keySize?: number) => Promise<RSAKeyPair>;
    generateKey: (length?: number) => Promise<string>;
    generateSalt: (length?: number) => Promise<string>;
    generateIV: (length?: number) => Promise<string>;
    clearError: () => void;
    reset: () => void;
}
/**
 * useCrypto 返回类型
 */
interface UseCryptoReturn extends CryptoState, CryptoActions {
    encrypt: typeof encrypt;
    decrypt: typeof decrypt;
    keyGenerator: typeof keyGenerator;
}
/**
 * 加密 Composition API Hook
 */
declare function useCrypto(): UseCryptoReturn;

export { useCrypto };
export type { CryptoActions, CryptoState, UseCryptoReturn };
