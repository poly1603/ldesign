/**
 * 日志解析工具
 * 用于解析日志中的 URL、ANSI 转义序列等
 */

import AnsiToHtml from 'ansi-to-html'

// ANSI 转 HTML 转换器实例（适配白色背景）
const ansiConverter = new AnsiToHtml({
  fg: '#1a1a1a',  // 深色文字
  bg: '#ffffff',  // 白色背景
  newline: false,
  escapeXML: true,
  stream: false,
  colors: {
    0: '#1a1a1a',  // black
    1: '#dd2222',  // red
    2: '#42bd42',  // green
    3: '#f0b80f',  // yellow
    4: '#5e2aa7',  // blue
    5: '#722ed1',  // magenta
    6: '#389938',  // cyan
    7: '#3b3b3b',  // white
    8: '#696969',  // bright black
    9: '#e54848',  // bright red
    10: '#62cb62', // bright green
    11: '#f5c538', // bright yellow
    12: '#8c5ad3', // bright blue
    13: '#a67fdb', // bright magenta
    14: '#62cb62', // bright cyan
    15: '#242424'  // bright white
  }
})

/**
 * URL 正则表达式
 */
const URL_REGEX = /https?:\/\/[^\s\x1b]+/g
const LOCAL_URL_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/
const NETWORK_URL_REGEX = /^https?:\/\/((?:192\.168|10\.|172\.(?:1[6-9]|2\d|3[01]))\.\d+\.\d+):(\d+)/

/**
 * 提取日志中的 URL
 */
export interface ExtractedUrls {
  local: string[]
  network: string[]
  all: string[]
}

export function extractUrls(text: string): ExtractedUrls {
  const urls = text.match(URL_REGEX) || []
  const local: string[] = []
  const network: string[] = []

  urls.forEach(url => {
    // 清理 URL（移除 ANSI 转义序列和尾部的特殊字符）
    let cleanUrl = url.replace(/\x1b\[[0-9;]*m/g, '')
    // 移除尾部的斜杠和其他可能的特殊字符
    cleanUrl = cleanUrl.replace(/[\/\s]+$/, '')

    if (LOCAL_URL_REGEX.test(cleanUrl)) {
      if (!local.includes(cleanUrl)) {
        local.push(cleanUrl)
      }
    } else if (NETWORK_URL_REGEX.test(cleanUrl)) {
      if (!network.includes(cleanUrl)) {
        network.push(cleanUrl)
      }
    }
  })

  return {
    local,
    network,
    all: [...local, ...network]
  }
}

/**
 * 将 ANSI 转义序列转换为 HTML
 */
export function ansiToHtml(text: string): string {
  try {
    return ansiConverter.toHtml(text)
  } catch (error) {
    console.error('ANSI 转换失败:', error)
    // 如果转换失败，移除 ANSI 转义序列
    return text.replace(/\x1b\[[0-9;]*m/g, '')
  }
}

/**
 * 清理 ANSI 转义序列
 */
export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '')
}

/**
 * 检测日志类型
 */
export function detectLogType(text: string): 'info' | 'success' | 'error' | 'warning' {
  const cleanText = stripAnsi(text).toLowerCase()

  if (cleanText.includes('error') || cleanText.includes('failed') || cleanText.includes('✖')) {
    return 'error'
  }

  if (cleanText.includes('warn') || cleanText.includes('warning') || cleanText.includes('⚠')) {
    return 'warning'
  }

  if (cleanText.includes('success') || cleanText.includes('✓') || cleanText.includes('✔')) {
    return 'success'
  }

  return 'info'
}

/**
 * 检测是否包含二维码
 */
export function containsQRCode(text: string): boolean {
  // 检测常见的二维码字符
  const qrChars = ['█', '▀', '▄', '▌', '▐', '░', '▒', '▓', '■', '□']
  return qrChars.some(char => text.includes(char))
}

/**
 * 格式化日志消息
 */
export interface FormattedLog {
  html: string
  plain: string
  type: 'info' | 'success' | 'error' | 'warning'
  urls: ExtractedUrls
  hasQRCode: boolean
}

export function formatLogMessage(text: string): FormattedLog {
  const plain = stripAnsi(text)
  const html = ansiToHtml(text)
  const type = detectLogType(text)
  const urls = extractUrls(text)
  const hasQRCode = containsQRCode(text)

  return {
    html,
    plain,
    type,
    urls,
    hasQRCode
  }
}

