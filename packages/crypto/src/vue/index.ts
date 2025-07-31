// Composition API Hooks
export {
  useCrypto,
  useHash,
  useSignature,
  type UseCryptoReturn,
  type UseHashReturn,
  type UseSignatureReturn,
  type CryptoState,
  type CryptoActions,
  type HashState,
  type HashActions,
  type SignatureState,
  type SignatureActions,
} from './composables'

// Vue Plugin
export {
  CryptoPlugin,
  installCrypto,
  createCryptoPlugin,
  type CryptoPluginOptions,
  type GlobalCrypto,
} from './plugin'

// 重新导出核心功能以便在 Vue 环境中使用
export {
  encrypt,
  decrypt,
  hash,
  hmac,
  keyGenerator,
  digitalSignature,
  aes,
  rsa,
  encoding,
  base64,
  hex,
} from '../core'

// 重新导出类型
export type {
  AESOptions,
  RSAOptions,
  RSAKeyPair,
  HashAlgorithm,
  HashOptions,
  HashResult,
  HMACAlgorithm,
  EncodingType,
  EncryptResult,
  DecryptResult,
  KeyGenerationOptions,
} from '../types'

// 默认导出插件
export { CryptoPlugin as default } from './plugin'
