import type { Detector } from './types'

/**
 * 浏览器语言检测器实现
 */
export class BrowserDetector implements Detector {
  /**
   * 检测浏览器语言
   * @returns 语言代码数组，按优先级排序
   */
  detect(): string[] {
    const languages: string[] = []

    // 检查是否在浏览器环境中
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return languages
    }

    // 1. 检查 navigator.languages（现代浏览器）
    if (navigator.languages && navigator.languages.length > 0) {
      languages.push(...navigator.languages)
    }

    // 2. 检查 navigator.language（标准属性）
    if (navigator.language) {
      if (!languages.includes(navigator.language)) {
        languages.push(navigator.language)
      }
    }

    // 3. 检查 navigator.userLanguage（IE）
    const userLanguage = (navigator as any).userLanguage
    if (userLanguage && !languages.includes(userLanguage)) {
      languages.push(userLanguage)
    }

    // 4. 检查 navigator.browserLanguage（IE）
    const browserLanguage = (navigator as any).browserLanguage
    if (browserLanguage && !languages.includes(browserLanguage)) {
      languages.push(browserLanguage)
    }

    // 5. 检查 navigator.systemLanguage（IE）
    const systemLanguage = (navigator as any).systemLanguage
    if (systemLanguage && !languages.includes(systemLanguage)) {
      languages.push(systemLanguage)
    }

    // 标准化语言代码并去重
    return this.normalizeLanguages(languages)
  }

  /**
   * 标准化语言代码
   * @param languages 原始语言代码数组
   * @returns 标准化后的语言代码数组
   */
  private normalizeLanguages(languages: string[]): string[] {
    const normalized: string[] = []
    const seen = new Set<string>()

    for (const lang of languages) {
      if (!lang)
        continue

      // 标准化语言代码格式
      const normalizedLang = this.normalizeLanguageCode(lang)

      if (normalizedLang && !seen.has(normalizedLang)) {
        normalized.push(normalizedLang)
        seen.add(normalizedLang)

        // 同时添加主语言代码（如果不同）
        const mainLang = normalizedLang.split('-')[0]
        if (mainLang !== normalizedLang && !seen.has(mainLang)) {
          normalized.push(mainLang)
          seen.add(mainLang)
        }
      }
    }

    return normalized
  }

  /**
   * 标准化单个语言代码
   * @param lang 原始语言代码
   * @returns 标准化后的语言代码
   */
  private normalizeLanguageCode(lang: string): string {
    if (!lang)
      return ''

    // 移除空格并转换为小写
    let normalized = lang.trim().toLowerCase()

    // 处理下划线分隔符（转换为连字符）
    normalized = normalized.replace(/_/g, '-')

    // 验证语言代码格式
    if (!/^[a-z]{2,3}(-[a-z]{2,4})*$/i.test(normalized)) {
      return ''
    }

    // 标准化区域代码为大写
    const parts = normalized.split('-')
    if (parts.length > 1) {
      // 主语言代码保持小写
      const mainLang = parts[0].toLowerCase()
      // 区域代码转换为大写
      const regions = parts.slice(1).map((part) => {
        // 如果是2位字母的区域代码，转换为大写
        if (/^[a-z]{2}$/.test(part)) {
          return part.toUpperCase()
        }
        // 如果是4位字母的脚本代码，首字母大写
        if (/^[a-z]{4}$/.test(part)) {
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        }
        return part
      })

      normalized = [mainLang, ...regions].join('-')
    }

    return normalized
  }

  /**
   * 检查浏览器是否支持特定语言
   * @param locale 语言代码
   * @returns 是否支持
   */
  isSupported(locale: string): boolean {
    const detectedLanguages = this.detect()
    const normalizedLocale = this.normalizeLanguageCode(locale)

    return detectedLanguages.some(lang =>
      lang === normalizedLocale
      || lang.startsWith(`${normalizedLocale}-`)
      || normalizedLocale.startsWith(`${lang}-`),
    )
  }

  /**
   * 获取最佳匹配的语言
   * @param availableLocales 可用的语言代码数组
   * @returns 最佳匹配的语言代码，如果没有匹配则返回 null
   */
  getBestMatch(availableLocales: string[]): string | null {
    const detectedLanguages = this.detect()
    const normalizedAvailable = availableLocales.map(locale =>
      this.normalizeLanguageCode(locale),
    ).filter(Boolean)

    // 精确匹配
    for (const detected of detectedLanguages) {
      if (normalizedAvailable.includes(detected)) {
        return detected
      }
    }

    // 主语言匹配
    for (const detected of detectedLanguages) {
      const mainLang = detected.split('-')[0]
      const match = normalizedAvailable.find(available =>
        available.startsWith(`${mainLang}-`) || available === mainLang,
      )
      if (match) {
        return match
      }
    }

    // 区域匹配
    for (const detected of detectedLanguages) {
      const match = normalizedAvailable.find((available) => {
        const detectedMain = detected.split('-')[0]
        const availableMain = available.split('-')[0]
        return detectedMain === availableMain
      })
      if (match) {
        return match
      }
    }

    return null
  }
}

/**
 * 创建默认的浏览器语言检测器实例
 */
export const browserDetector = new BrowserDetector()

/**
 * 手动语言检测器（用于测试或特殊场景）
 */
export class ManualDetector implements Detector {
  private languages: string[]

  constructor(languages: string[] = ['en']) {
    this.languages = languages
  }

  /**
   * 检测语言（返回预设的语言列表）
   * @returns 语言代码数组
   */
  detect(): string[] {
    return [...this.languages]
  }

  /**
   * 设置语言列表
   * @param languages 语言代码数组
   */
  setLanguages(languages: string[]): void {
    this.languages = [...languages]
  }

  /**
   * 添加语言
   * @param language 语言代码
   */
  addLanguage(language: string): void {
    if (!this.languages.includes(language)) {
      this.languages.push(language)
    }
  }

  /**
   * 移除语言
   * @param language 语言代码
   */
  removeLanguage(language: string): void {
    const index = this.languages.indexOf(language)
    if (index > -1) {
      this.languages.splice(index, 1)
    }
  }
}

/**
 * 创建语言检测器
 * @param type 检测器类型
 * @param options 选项
 * @returns 语言检测器实例
 */
export function createDetector(
  type: 'browser' | 'manual' = 'browser',
  options?: { languages?: string[] },
): Detector {
  switch (type) {
    case 'browser':
      return new BrowserDetector()
    case 'manual':
      return new ManualDetector(options?.languages)
    default:
      return new BrowserDetector()
  }
}
