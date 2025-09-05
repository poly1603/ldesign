/**
 * Crypto 加密插件配置
 *
 * 为应用提供完整的加密解密功能，包括：
 * - AES/DES/RSA 等多种加密算法
 * - 哈希计算和数字签名
 * - 密钥生成和管理
 * - 编码转换工具
 * - Vue 3 深度集成
 * - 性能优化和缓存
 */

import { createCryptoEnginePlugin } from '@ldesign/crypto/engine'
import type { CryptoEnginePluginOptions } from '@ldesign/crypto/engine'

/**
 * Crypto 插件基础配置
 * 
 * 配置了适合生产环境的加密参数，包括密钥大小、
 * 哈希算法、编码方式等，确保安全性和性能的平衡
 */
const cryptoConfig: CryptoEnginePluginOptions = {
  // 插件基础信息
  name: 'crypto',
  version: '1.0.0',
  description: 'LDesign Crypto Engine Plugin - 提供完整的加密解密功能',
  dependencies: [],

  // 插件行为配置
  autoInstall: true, // 自动安装到 Vue 应用
  enablePerformanceMonitoring: true, // 启用性能监控
  debug: process.env.NODE_ENV === 'development', // 开发模式下启用调试

  // Vue 插件配置
  globalPropertyName: '$crypto', // 全局属性名称
  registerComposables: true, // 注册 Composition API

  // 加密算法配置
  config: {
    // AES 配置 - 使用 256 位密钥提供最高安全性
    defaultAESKeySize: 256,
    
    // RSA 配置 - 使用 2048 位密钥平衡安全性和性能
    defaultRSAKeySize: 2048,
    
    // 哈希算法 - 使用 SHA256 提供良好的安全性
    defaultHashAlgorithm: 'SHA256',
    
    // 编码方式 - 使用 base64 便于传输和存储
    defaultEncoding: 'base64',
  },
}

/**
 * 开发环境专用配置
 * 
 * 在开发模式下启用更多调试功能和性能监控，
 * 帮助开发者了解加密操作的性能特征
 */
const developmentConfig: Partial<CryptoEnginePluginOptions> = {
  debug: false, // 禁用调试模式以减少控制台输出
  enablePerformanceMonitoring: false, // 禁用性能监控以减少控制台输出
  config: {
    ...cryptoConfig.config,
    // 开发环境可以使用更强的 RSA 密钥
    defaultRSAKeySize: 4096,
  },
}

/**
 * 生产环境专用配置
 * 
 * 在生产模式下优化性能，关闭调试功能，
 * 使用平衡的安全参数确保最佳用户体验
 */
const productionConfig: Partial<CryptoEnginePluginOptions> = {
  debug: false,
  enablePerformanceMonitoring: false,
  config: {
    ...cryptoConfig.config,
    // 生产环境使用标准 RSA 密钥大小
    defaultRSAKeySize: 2048,
  },
}

/**
 * 根据环境选择配置
 */
const finalConfig: CryptoEnginePluginOptions = {
  ...cryptoConfig,
  ...(process.env.NODE_ENV === 'development' ? developmentConfig : productionConfig),
}

/**
 * 创建标准化的 Crypto 引擎插件
 *
 * 使用 @ldesign/crypto 包提供的标准插件创建函数，
 * 确保与其他已集成包保持一致的插件创建模式
 */
export const cryptoPlugin = createCryptoEnginePlugin(finalConfig)

/**
 * 导出 Crypto 插件实例
 * 
 * 使用示例：
 * ```typescript
 * import { cryptoPlugin } from './crypto'
 * 
 * // 在 engine 中使用
 * const engine = createAndMountApp(App, '#app', {
 *   plugins: [cryptoPlugin]
 * })
 * 
 * // 在组件中使用
 * import { useCrypto } from '@ldesign/crypto/vue'
 * 
 * const { encryptAES, decryptAES, sha256 } = useCrypto()
 * const encrypted = await encryptAES('Hello World', 'secret-key')
 * const hash = await sha256('Hello World')
 * ```
 * 
 * 全局属性使用：
 * ```typescript
 * // 在 Vue 组件中通过 this.$crypto 访问
 * export default {
 *   methods: {
 *     async handleEncrypt() {
 *       const encrypted = this.$crypto.encrypt.aes('data', 'key')
 *       const hash = this.$crypto.hash.sha256('data')
 *       return { encrypted, hash }
 *     }
 *   }
 * }
 * ```
 */
export default cryptoPlugin

/**
 * 导出配置对象供其他模块使用
 */
export { finalConfig as cryptoConfig }
