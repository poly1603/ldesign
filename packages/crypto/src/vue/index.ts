// 重新导出核心功能以便在 Vue 环境中使用
export {
  aes,
  base64,
  decrypt,
  digitalSignature,
  encoding,
  encrypt,
  hash,
  hex,
  hmac,
  keyGenerator,
  rsa,
} from '../core'

// 重新导出类型
export type {
  AESOptions,
  DecryptResult,
  EncodingType,
  EncryptResult,
  HashAlgorithm,
  HashOptions,
  HashResult,
  HMACAlgorithm,
  KeyGenerationOptions,
  RSAKeyPair,
  RSAOptions,
} from '../types'

// Composition API Hooks
export {
  type CryptoActions,
  type CryptoState,
  type HashActions,
  type HashState,
  type SignatureActions,
  type SignatureState,
  useCrypto,
  type UseCryptoReturn,
  useHash,
  type UseHashReturn,
  useSignature,
  type UseSignatureReturn,
} from './composables'

// Vue Plugin
export {
  createCryptoPlugin,
  CryptoPlugin,
  type CryptoPluginOptions,
  type GlobalCrypto,
  installCrypto,
} from './plugin'

// 默认导出插件
export { CryptoPlugin as default } from './plugin'
