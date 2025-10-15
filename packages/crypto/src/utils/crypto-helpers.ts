/**
 * Crypto Helper Functions
 * 提供类型安全的加密工具函数
 */

/**
 * CryptoJS加密配置接口
 */
export interface CryptoJSConfig {
  mode: any
  padding?: any
  iv?: any
}

/**
 * 安全地获取CryptoJS加密模式
 * @param mode 模式名称
 * @returns CryptoJS模式对象
 */
export function getCryptoJSMode(mode: string): any {
  const CryptoJSLib = require('crypto-js')
  const modeMap: Record<string, any> = {
    CBC: CryptoJSLib.mode.CBC,
    CFB: CryptoJSLib.mode.CFB,
    CTR: CryptoJSLib.mode.CTR,
    OFB: CryptoJSLib.mode.OFB,
    ECB: CryptoJSLib.mode.ECB,
    GCM: CryptoJSLib.mode.GCM,
  }
  return modeMap[mode.toUpperCase()] || CryptoJSLib.mode.CBC
}

/**
 * 安全地获取CryptoJS填充方式
 * @param padding 填充方式名称
 * @returns CryptoJS填充对象
 */
export function getCryptoJSPadding(padding: string): any {
  const CryptoJSLib = require('crypto-js')
  const paddingMap: Record<string, any> = {
    Pkcs7: CryptoJSLib.pad.Pkcs7,
    AnsiX923: CryptoJSLib.pad.AnsiX923,
    Iso10126: CryptoJSLib.pad.Iso10126,
    Iso97971: CryptoJSLib.pad.Iso97971,
    ZeroPadding: CryptoJSLib.pad.ZeroPadding,
    NoPadding: CryptoJSLib.pad.NoPadding,
  }
  return paddingMap[padding] || CryptoJSLib.pad.Pkcs7
}

/**
 * 创建类型安全的加密配置
 * @param options 配置选项
 * @returns CryptoJS配置对象
 */
export function createCryptoJSConfig(options: {
  mode?: string
  padding?: string
  iv?: string
}): CryptoJSConfig {
  const CryptoJSLib = require('crypto-js')
  const config: CryptoJSConfig = {
    mode: getCryptoJSMode(options.mode || 'CBC'),
  }

  if (options.padding) {
    config.padding = getCryptoJSPadding(options.padding)
  }

  if (options.iv && options.mode !== 'ECB') {
    config.iv = CryptoJSLib.enc.Utf8.parse(options.iv)
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
