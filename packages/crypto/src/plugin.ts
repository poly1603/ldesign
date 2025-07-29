import type { IEngine, IPlugin } from '@ldesign/engine'
import type { CryptoPluginConfig } from './types'
import { Crypto } from './core/crypto'
import { Hash } from './core/hash'
import { encodeBase64, decodeBase64, generateRandom, deriveKey } from './utils'

/**
 * LDesign Crypto插件
 */
class CryptoPlugin implements IPlugin {
  public readonly name = '@ldesign/crypto'
  public readonly version = '1.0.0'
  public readonly description = 'LDesign加密解密工具包插件'

  private crypto: Crypto
  private hash: Hash
  private config: CryptoPluginConfig

  constructor(config: CryptoPluginConfig = {}) {
    this.config = {
      debug: false,
      ...config
    }
    
    this.crypto = new Crypto()
    this.hash = new Hash()
    
    this.setupDefaultConfig()
  }

  /**
   * 设置默认配置
   */
  private setupDefaultConfig(): void {
    if (this.config.defaultEncryption) {
      this.crypto.setDefaultConfig({
        algorithm: this.config.defaultEncryption,
        outputFormat: this.config.defaultFormat
      })
    }

    if (this.config.defaultHash) {
      this.hash.setDefaultConfig({
        algorithm: this.config.defaultHash,
        outputFormat: this.config.defaultFormat
      })
    }
  }

  /**
   * 安装插件
   */
  async install(engine: IEngine): Promise<void> {
    // 注册加密服务到引擎
    const cryptoService = {
      // 加密解密
      encrypt: this.crypto.encrypt.bind(this.crypto),
      decrypt: this.crypto.decrypt.bind(this.crypto),
      generateKey: this.crypto.generateKey.bind(this.crypto),
      generateIV: this.crypto.generateIV.bind(this.crypto),
      
      // 哈希
      hash: this.hash.hash.bind(this.hash),
      hmac: this.hash.hmac.bind(this.hash),
      md5: this.hash.md5.bind(this.hash),
      sha1: this.hash.sha1.bind(this.hash),
      sha256: this.hash.sha256.bind(this.hash),
      sha512: this.hash.sha512.bind(this.hash),
      verify: this.hash.verify.bind(this.hash),
      verifyHMAC: this.hash.verifyHMAC.bind(this.hash),
      
      // 编码解码
      encodeBase64,
      decodeBase64,
      
      // 工具函数
      generateRandom,
      deriveKey,
      
      // 配置
      getConfig: () => this.config,
      setConfig: (newConfig: Partial<CryptoPluginConfig>) => {
        this.config = { ...this.config, ...newConfig }
        this.setupDefaultConfig()
      }
    }

    // 将服务注册到引擎的全局上下文
    if (engine.app) {
      engine.app.config.globalProperties.$crypto = cryptoService
      engine.app.provide('crypto', cryptoService)
    }

    // 触发插件安装完成事件
    engine.eventBus.emit('crypto:installed', {
      plugin: this,
      service: cryptoService
    })

    if (this.config.debug) {
      console.log('[LDesign Crypto] Plugin installed successfully')
    }
  }

  /**
   * 卸载插件
   */
  async uninstall(engine: IEngine): Promise<void> {
    // 清理全局属性
    if (engine.app) {
      delete engine.app.config.globalProperties.$crypto
    }

    // 触发插件卸载事件
    engine.eventBus.emit('crypto:uninstalled', { plugin: this })

    if (this.config.debug) {
      console.log('[LDesign Crypto] Plugin uninstalled successfully')
    }
  }

  /**
   * 获取加密服务实例
   */
  getCrypto(): Crypto {
    return this.crypto
  }

  /**
   * 获取哈希服务实例
   */
  getHash(): Hash {
    return this.hash
  }
}

/**
 * 创建Crypto插件实例
 */
export function createCryptoPlugin(config?: CryptoPluginConfig): CryptoPlugin {
  return new CryptoPlugin(config)
}

// 默认导出
export default CryptoPlugin