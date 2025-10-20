/**
 * AES 加密器单例模式优化
 * 避免重复创建实例，提升性能
 */

import { AESEncryptor } from './aes'

/**
 * AES 加密器单例管理
 */
class AESEncryptorSingleton {
  private static instance: AESEncryptor | null = null

  /**
   * 获取单例实例
   */
  static getInstance(): AESEncryptor {
    if (!this.instance) {
      this.instance = new AESEncryptor()
    }
    return this.instance
  }

  /**
   * 重置单例（主要用于测试）
   */
  static resetInstance(): void {
    this.instance = null
  }
}

/**
 * 导出优化后的 AES 加密函数
 */
export const aesOptimized = {
  encrypt: AESEncryptorSingleton.getInstance().encrypt.bind(
    AESEncryptorSingleton.getInstance(),
  ),
  decrypt: AESEncryptorSingleton.getInstance().decrypt.bind(
    AESEncryptorSingleton.getInstance(),
  ),
  generateKey: async (length: number = 32): Promise<string> => {
    // 使用 RandomUtils 生成密钥（动态导入）
    const { RandomUtils } = await import('../utils')
    return RandomUtils.generateKey(length)
  },
}

