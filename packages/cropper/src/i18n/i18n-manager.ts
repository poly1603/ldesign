/**
 * @file 国际化管理器
 * @description 管理多语言支持和本地化
 */

import { EventEmitter } from '@/core/event-emitter'
import type { I18nConfig } from '@/types'

/**
 * 语言消息映射
 */
export type MessageMap = Record<string, string | MessageMap>

/**
 * 语言包
 */
export interface LanguagePack {
  /** 语言代码 */
  locale: string
  /** 语言名称 */
  name: string
  /** 消息映射 */
  messages: MessageMap
}

/**
 * 插值参数
 */
export type InterpolationParams = Record<string, string | number>

/**
 * 国际化管理器类
 */
export class I18nManager extends EventEmitter {
  /** 当前语言 */
  private currentLocale: string

  /** 回退语言 */
  private fallbackLocale: string

  /** 语言包映射 */
  private languagePacks: Map<string, LanguagePack> = new Map()

  /** 缺失翻译的键 */
  private missingKeys: Set<string> = new Set()

  /**
   * 构造函数
   * @param config 国际化配置
   */
  constructor(config: Partial<I18nConfig> = {}) {
    super()

    this.currentLocale = config.locale || 'zh-CN'
    this.fallbackLocale = config.fallbackLocale || 'en-US'

    // 初始化内置语言包
    this.initBuiltinLanguages()

    // 加载自定义消息
    if (config.messages) {
      this.addMessages(this.currentLocale, config.messages)
    }
  }

  /**
   * 初始化内置语言包
   */
  private initBuiltinLanguages(): void {
    // 中文简体
    this.languagePacks.set('zh-CN', {
      locale: 'zh-CN',
      name: '中文简体',
      messages: {
        toolbar: {
          zoomIn: '放大',
          zoomOut: '缩小',
          rotateLeft: '向左旋转',
          rotateRight: '向右旋转',
          flipHorizontal: '水平翻转',
          flipVertical: '垂直翻转',
          reset: '重置',
          crop: '裁剪',
          cancel: '取消',
          confirm: '确认'
        },
        cropArea: {
          move: '移动裁剪区域',
          resize: '调整大小',
          rotate: '旋转'
        },
        preview: {
          title: '预览',
          dimensions: '尺寸',
          fileSize: '文件大小',
          format: '格式',
          quality: '质量'
        },
        status: {
          loading: '加载中...',
          ready: '就绪',
          cropping: '裁剪中...',
          error: '发生错误',
          success: '操作成功'
        },
        errors: {
          imageLoadFailed: '图片加载失败',
          invalidImageFormat: '不支持的图片格式',
          cropAreaTooSmall: '裁剪区域太小',
          cropAreaTooLarge: '裁剪区域太大',
          networkError: '网络错误',
          unknownError: '未知错误'
        },
        messages: {
          imageLoaded: '图片加载完成',
          cropCompleted: '裁剪完成',
          resetCompleted: '重置完成',
          operationCancelled: '操作已取消'
        }
      }
    })

    // 英文
    this.languagePacks.set('en-US', {
      locale: 'en-US',
      name: 'English',
      messages: {
        toolbar: {
          zoomIn: 'Zoom In',
          zoomOut: 'Zoom Out',
          rotateLeft: 'Rotate Left',
          rotateRight: 'Rotate Right',
          flipHorizontal: 'Flip Horizontal',
          flipVertical: 'Flip Vertical',
          reset: 'Reset',
          crop: 'Crop',
          cancel: 'Cancel',
          confirm: 'Confirm'
        },
        cropArea: {
          move: 'Move crop area',
          resize: 'Resize',
          rotate: 'Rotate'
        },
        preview: {
          title: 'Preview',
          dimensions: 'Dimensions',
          fileSize: 'File Size',
          format: 'Format',
          quality: 'Quality'
        },
        status: {
          loading: 'Loading...',
          ready: 'Ready',
          cropping: 'Cropping...',
          error: 'Error occurred',
          success: 'Operation successful'
        },
        errors: {
          imageLoadFailed: 'Failed to load image',
          invalidImageFormat: 'Unsupported image format',
          cropAreaTooSmall: 'Crop area is too small',
          cropAreaTooLarge: 'Crop area is too large',
          networkError: 'Network error',
          unknownError: 'Unknown error'
        },
        messages: {
          imageLoaded: 'Image loaded successfully',
          cropCompleted: 'Crop completed',
          resetCompleted: 'Reset completed',
          operationCancelled: 'Operation cancelled'
        }
      }
    })

    // 日文
    this.languagePacks.set('ja-JP', {
      locale: 'ja-JP',
      name: '日本語',
      messages: {
        toolbar: {
          zoomIn: '拡大',
          zoomOut: '縮小',
          rotateLeft: '左回転',
          rotateRight: '右回転',
          flipHorizontal: '水平反転',
          flipVertical: '垂直反転',
          reset: 'リセット',
          crop: 'クロップ',
          cancel: 'キャンセル',
          confirm: '確認'
        },
        cropArea: {
          move: 'クロップエリアを移動',
          resize: 'サイズ変更',
          rotate: '回転'
        },
        preview: {
          title: 'プレビュー',
          dimensions: 'サイズ',
          fileSize: 'ファイルサイズ',
          format: 'フォーマット',
          quality: '品質'
        },
        status: {
          loading: '読み込み中...',
          ready: '準備完了',
          cropping: 'クロップ中...',
          error: 'エラーが発生しました',
          success: '操作が成功しました'
        },
        errors: {
          imageLoadFailed: '画像の読み込みに失敗しました',
          invalidImageFormat: 'サポートされていない画像形式です',
          cropAreaTooSmall: 'クロップエリアが小さすぎます',
          cropAreaTooLarge: 'クロップエリアが大きすぎます',
          networkError: 'ネットワークエラー',
          unknownError: '不明なエラー'
        },
        messages: {
          imageLoaded: '画像が正常に読み込まれました',
          cropCompleted: 'クロップが完了しました',
          resetCompleted: 'リセットが完了しました',
          operationCancelled: '操作がキャンセルされました'
        }
      }
    })
  }

  /**
   * 设置当前语言
   * @param locale 语言代码
   */
  setLocale(locale: string): void {
    if (this.currentLocale === locale) return

    const oldLocale = this.currentLocale
    this.currentLocale = locale

    this.emit('localeChange', { oldLocale, newLocale: locale })
  }

  /**
   * 获取当前语言
   */
  getLocale(): string {
    return this.currentLocale
  }

  /**
   * 设置回退语言
   * @param locale 语言代码
   */
  setFallbackLocale(locale: string): void {
    this.fallbackLocale = locale
  }

  /**
   * 获取回退语言
   */
  getFallbackLocale(): string {
    return this.fallbackLocale
  }

  /**
   * 添加语言包
   * @param languagePack 语言包
   */
  addLanguagePack(languagePack: LanguagePack): void {
    this.languagePacks.set(languagePack.locale, languagePack)
    this.emit('languagePackAdded', languagePack)
  }

  /**
   * 添加消息
   * @param locale 语言代码
   * @param messages 消息映射
   */
  addMessages(locale: string, messages: MessageMap): void {
    const existingPack = this.languagePacks.get(locale)
    
    if (existingPack) {
      existingPack.messages = this.mergeMessages(existingPack.messages, messages)
    } else {
      this.languagePacks.set(locale, {
        locale,
        name: locale,
        messages
      })
    }
    
    this.emit('messagesAdded', { locale, messages })
  }

  /**
   * 获取翻译文本
   * @param key 翻译键，支持点号分隔的嵌套键
   * @param params 插值参数
   * @param locale 指定语言，不提供则使用当前语言
   */
  t(key: string, params?: InterpolationParams, locale?: string): string {
    const targetLocale = locale || this.currentLocale
    
    // 尝试从目标语言获取翻译
    let message = this.getMessage(key, targetLocale)
    
    // 如果没有找到，尝试从回退语言获取
    if (message === null && targetLocale !== this.fallbackLocale) {
      message = this.getMessage(key, this.fallbackLocale)
    }
    
    // 如果仍然没有找到，返回键名并记录缺失
    if (message === null) {
      this.missingKeys.add(key)
      this.emit('missingTranslation', { key, locale: targetLocale })
      return key
    }
    
    // 处理插值
    if (params) {
      return this.interpolate(message, params)
    }
    
    return message
  }

  /**
   * 获取消息
   * @param key 消息键
   * @param locale 语言代码
   */
  private getMessage(key: string, locale: string): string | null {
    const languagePack = this.languagePacks.get(locale)
    if (!languagePack) return null

    const keys = key.split('.')
    let current: any = languagePack.messages

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        return null
      }
    }

    return typeof current === 'string' ? current : null
  }

  /**
   * 插值处理
   * @param message 消息模板
   * @param params 参数
   */
  private interpolate(message: string, params: InterpolationParams): string {
    return message.replace(/\{(\w+)\}/g, (match, key) => {
      const value = params[key]
      return value !== undefined ? String(value) : match
    })
  }

  /**
   * 合并消息
   * @param target 目标消息
   * @param source 源消息
   */
  private mergeMessages(target: MessageMap, source: MessageMap): MessageMap {
    const result = { ...target }

    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])) {
          result[key] = this.mergeMessages(result[key] as MessageMap, value)
        } else {
          result[key] = { ...value }
        }
      } else {
        result[key] = value
      }
    }

    return result
  }

  /**
   * 获取可用语言列表
   */
  getAvailableLocales(): LanguagePack[] {
    return Array.from(this.languagePacks.values())
  }

  /**
   * 检查语言是否可用
   * @param locale 语言代码
   */
  hasLocale(locale: string): boolean {
    return this.languagePacks.has(locale)
  }

  /**
   * 获取缺失的翻译键
   */
  getMissingKeys(): string[] {
    return Array.from(this.missingKeys)
  }

  /**
   * 清空缺失的翻译键记录
   */
  clearMissingKeys(): void {
    this.missingKeys.clear()
  }

  /**
   * 导出语言包
   * @param locale 语言代码
   */
  exportLanguagePack(locale: string): string | null {
    const languagePack = this.languagePacks.get(locale)
    if (!languagePack) return null

    return JSON.stringify(languagePack, null, 2)
  }

  /**
   * 导入语言包
   * @param languagePackJson 语言包JSON字符串
   */
  importLanguagePack(languagePackJson: string): void {
    try {
      const languagePack = JSON.parse(languagePackJson) as LanguagePack
      this.addLanguagePack(languagePack)
    } catch (error) {
      throw new Error('Invalid language pack JSON format')
    }
  }

  /**
   * 销毁国际化管理器
   */
  destroy(): void {
    this.removeAllListeners()
    this.languagePacks.clear()
    this.missingKeys.clear()
  }
}
