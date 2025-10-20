import type { App, Plugin } from 'vue'

import {
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
} from '../../core'

import { useCrypto, useHash, useSignature } from './composables'

/**
 * 插件选项接口
 */
export interface CryptoPluginOptions {
  // 全局属性名称
  globalPropertyName?: string

  // 是否注册全局组合式函数
  registerComposables?: boolean

  // 自定义配置
  config?: {
    // 默认 AES 密钥大小
    defaultAESKeySize?: 128 | 192 | 256

    // 默认 RSA 密钥大小
    defaultRSAKeySize?: 1024 | 2048 | 3072 | 4096

    // 默认哈希算法
    defaultHashAlgorithm?:
      | 'MD5'
      | 'SHA1'
      | 'SHA224'
      | 'SHA256'
      | 'SHA384'
      | 'SHA512'

    // 默认编码类型
    defaultEncoding?: 'base64' | 'hex' | 'utf8'
  }
}

/**
 * 全局 Crypto 实例接口
 */
export interface GlobalCrypto {
  // 核心功能
  encrypt: typeof encrypt
  decrypt: typeof decrypt
  hash: typeof hash
  hmac: typeof hmac
  keyGenerator: typeof keyGenerator
  digitalSignature: typeof digitalSignature

  // 算法实现
  aes: typeof aes
  rsa: typeof rsa
  encoding: typeof encoding
  base64: typeof base64
  hex: typeof hex

  // Composition API
  useCrypto: typeof useCrypto
  useHash: typeof useHash
  useSignature: typeof useSignature
}

// Vue 类型扩展在 types.d.ts 文件中定义

/**
 * 创建全局 Crypto 实例
 */
function createGlobalCrypto(_options?: CryptoPluginOptions): GlobalCrypto {
  return {
    // 核心功能
    encrypt,
    decrypt,
    hash,
    hmac,
    keyGenerator,
    digitalSignature,

    // 算法实现
    aes,
    rsa,
    encoding,
    base64,
    hex,

    // Composition API
    useCrypto,
    useHash,
    useSignature,
  }
}

/**
 * Crypto 插件
 */
export const CryptoPlugin: Plugin = {
  install(app: App, options: CryptoPluginOptions = {}) {
    const {
      globalPropertyName = '$crypto',
      registerComposables = true,
      config = {},
    } = options

    // 创建全局实例
    const globalCrypto = createGlobalCrypto(options)

    // 注册全局属性
    app.config.globalProperties[globalPropertyName] = globalCrypto

    // 提供全局注入
    app.provide('crypto', globalCrypto)
    app.provide('cryptoConfig', config)

    // 注册全局组合式函数（可选）
    if (registerComposables) {
      app.config.globalProperties.$useCrypto = useCrypto
      app.config.globalProperties.$useHash = useHash
      app.config.globalProperties.$useSignature = useSignature
    }

    // 开发模式下的调试信息
    if (
      // eslint-disable-next-line node/prefer-global/process
      typeof process !== 'undefined'
      // eslint-disable-next-line node/prefer-global/process
      && process.env?.NODE_ENV === 'development'
    ) {
       
      console.info('[LDesign Crypto] Plugin installed successfully')
      console.info('[LDesign Crypto] Global property:', globalPropertyName)
      console.info('[LDesign Crypto] Config:', config)
       
    }
  },
}

/**
 * 便捷安装函数
 */
export function installCrypto(app: App, options?: CryptoPluginOptions): void {
  app.use(CryptoPlugin, options)
}

/**
 * 创建 Crypto 插件实例
 */
export function createCryptoPlugin(options?: CryptoPluginOptions): Plugin {
  return {
    install(app: App) {
      app.use(CryptoPlugin, options)
    },
  }
}

// 默认导出插件
export default CryptoPlugin
