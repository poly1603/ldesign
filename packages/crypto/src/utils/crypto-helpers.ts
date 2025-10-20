/**
 * Crypto Helper Functions
 * 提供类型安全的加密工具函数
 */

import CryptoJS from 'crypto-js'

/**
 * CryptoJS加密配置接口
 */
export interface CryptoJSConfig {
  mode: unknown
  padding?: unknown
  iv?: unknown
}

/**
 * 安全地获取CryptoJS加密模式
 * @param mode 模式名称
 * @returns CryptoJS模式对象
 */
export function getCryptoJSMode(mode: string): unknown {
  const modeMap: Record<string, unknown> = {
    CBC: CryptoJS.mode.CBC,
    CFB: CryptoJS.mode.CFB,
    CTR: CryptoJS.mode.CTR,
    OFB: CryptoJS.mode.OFB,
    ECB: CryptoJS.mode.ECB,
  }
  return modeMap[mode.toUpperCase()] || CryptoJS.mode.CBC
}

/**
 * 安全地获取CryptoJS填充方式
 * @param padding 填充方式名称
 * @returns CryptoJS填充对象
 */
export function getCryptoJSPadding(padding: string): unknown {
  const paddingMap: Record<string, unknown> = {
    Pkcs7: CryptoJS.pad.Pkcs7,
    AnsiX923: CryptoJS.pad.AnsiX923,
    Iso10126: CryptoJS.pad.Iso10126,
    Iso97971: CryptoJS.pad.Iso97971,
    ZeroPadding: CryptoJS.pad.ZeroPadding,
    NoPadding: CryptoJS.pad.NoPadding,
  }
  return paddingMap[padding] || CryptoJS.pad.Pkcs7
}

/**
 * 创建类型安全的加密配置
 * @param options 配置选项
 * @param options.mode 加密模式
 * @param options.padding 填充方式
 * @param options.iv 初始化向量
 * @returns CryptoJS配置对象
 */
export function createCryptoJSConfig(options: {
  mode?: string
  padding?: string
  iv?: string
}): CryptoJSConfig {
  const config: CryptoJSConfig = {
    mode: getCryptoJSMode(options.mode || 'CBC'),
  }

  if (options.padding) {
    config.padding = getCryptoJSPadding(options.padding)
  }

  if (options.iv && options.mode !== 'ECB') {
    config.iv = CryptoJS.enc.Utf8.parse(options.iv)
  }

  return config
}

/**
 * 安全地提取错误消息
 * @param error 未知类型的错误
 * @returns 错误消息字符串
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return String(error)
}
