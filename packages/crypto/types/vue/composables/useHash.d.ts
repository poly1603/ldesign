import { HashOptions, HashAlgorithm } from '../../types/index.js';
import { Ref } from 'vue';
import { hash, hmac } from '../../core/index.js';

/**
 * 哈希状态接口
 */
interface HashState {
    isHashing: Ref<boolean>;
    lastError: Ref<string | null>;
    lastHash: Ref<string | null>;
}
/**
 * 哈希操作接口
 */
interface HashActions {
    md5: (data: string, options?: HashOptions) => Promise<string>;
    sha1: (data: string, options?: HashOptions) => Promise<string>;
    sha224: (data: string, options?: HashOptions) => Promise<string>;
    sha256: (data: string, options?: HashOptions) => Promise<string>;
    sha384: (data: string, options?: HashOptions) => Promise<string>;
    sha512: (data: string, options?: HashOptions) => Promise<string>;
    hashData: (data: string, algorithm?: HashAlgorithm, options?: HashOptions) => Promise<string>;
    verify: (data: string, expectedHash: string, algorithm?: HashAlgorithm, options?: HashOptions) => Promise<boolean>;
    hmacMd5: (data: string, key: string, options?: HashOptions) => Promise<string>;
    hmacSha1: (data: string, key: string, options?: HashOptions) => Promise<string>;
    hmacSha256: (data: string, key: string, options?: HashOptions) => Promise<string>;
    hmacSha384: (data: string, key: string, options?: HashOptions) => Promise<string>;
    hmacSha512: (data: string, key: string, options?: HashOptions) => Promise<string>;
    hmacData: (data: string, key: string, algorithm?: HashAlgorithm, options?: HashOptions) => Promise<string>;
    verifyHmac: (data: string, key: string, expectedHmac: string, algorithm?: HashAlgorithm, options?: HashOptions) => Promise<boolean>;
    hashMultiple: (dataList: string[], algorithm?: HashAlgorithm, options?: HashOptions) => Promise<string[]>;
    hashFile: (fileContent: string, algorithm?: HashAlgorithm, options?: HashOptions) => Promise<string>;
    clearError: () => void;
    reset: () => void;
}
/**
 * useHash 返回类型
 */
interface UseHashReturn extends HashState, HashActions {
    hash: typeof hash;
    hmac: typeof hmac;
    isLoading: Ref<boolean>;
}
/**
 * 哈希 Composition API Hook
 */
declare function useHash(): UseHashReturn;

export { useHash };
export type { HashActions, HashState, UseHashReturn };
