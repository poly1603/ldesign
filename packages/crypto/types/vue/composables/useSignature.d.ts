import { Ref } from 'vue';
import { digitalSignature } from '../../core/index.js';

/**
 * 数字签名状态接口
 */
interface SignatureState {
    isSigning: Ref<boolean>;
    isVerifying: Ref<boolean>;
    lastError: Ref<string | null>;
    lastSignature: Ref<string | null>;
    lastVerificationResult: Ref<boolean | null>;
}
/**
 * 数字签名操作接口
 */
interface SignatureActions {
    sign: (data: string, privateKey: string, algorithm?: string) => Promise<string>;
    verify: (data: string, signature: string, publicKey: string, algorithm?: string) => Promise<boolean>;
    signMultiple: (dataList: string[], privateKey: string, algorithm?: string) => Promise<string[]>;
    verifyMultiple: (verificationList: Array<{
        data: string;
        signature: string;
        publicKey: string;
        algorithm?: string;
    }>) => Promise<boolean[]>;
    signFile: (fileContent: string, privateKey: string, algorithm?: string) => Promise<string>;
    verifyFile: (fileContent: string, signature: string, publicKey: string, algorithm?: string) => Promise<boolean>;
    clearError: () => void;
    reset: () => void;
}
/**
 * useSignature 返回类型
 */
interface UseSignatureReturn extends SignatureState, SignatureActions {
    digitalSignature: typeof digitalSignature;
    isLoading: Ref<boolean>;
}
/**
 * 数字签名 Composition API Hook
 */
declare function useSignature(): UseSignatureReturn;

export { useSignature };
export type { SignatureActions, SignatureState, UseSignatureReturn };
