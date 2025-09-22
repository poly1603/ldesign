// Composition API Hooks
export {
  type CryptoActions,
  type CryptoState,
  useCrypto,
  type UseCryptoReturn,
} from './useCrypto'
export {
  type HashActions,
  type HashState,
  useHash,
  type UseHashReturn,
} from './useHash'
export {
  type SignatureActions,
  type SignatureState,
  useSignature,
  type UseSignatureReturn,
} from './useSignature'

// 便捷的组合式函数
export {
  type EncryptionState,
  type EncryptionActions,
  useEncryption,
  type UseEncryptionReturn,
} from './useEncryption'
export {
  type KeyManagerState,
  type KeyManagerActions,
  useKeyManager,
  type UseKeyManagerReturn,
} from './useKeyManager'
