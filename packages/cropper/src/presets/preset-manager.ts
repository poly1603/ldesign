/**
 * @file 预设配置管理器
 * @description 管理常用的预设配置
 */

import { EventEmitter } from '@/core/event-emitter'
import type { CropperOptions } from '@/types'

/**
 * 预设配置
 */
export interface PresetConfig {
  /** 预设名称 */
  name: string
  /** 预设显示名称 */
  displayName: string
  /** 预设描述 */
  description: string
  /** 预设图标 */
  icon?: string
  /** 预设分类 */
  category: string
  /** 配置选项 */
  options: Partial<CropperOptions>
  /** 是否为内置预设 */
  builtin: boolean
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
}

/**
 * 预设分类
 */
export interface PresetCategory {
  /** 分类名称 */
  name: string
  /** 分类显示名称 */
  displayName: string
  /** 分类描述 */
  description: string
  /** 分类图标 */
  icon?: string
}

/**
 * 预设管理器类
 */
export class PresetManager extends EventEmitter {
  /** 预设配置映射 */
  private presets: Map<string, PresetConfig> = new Map()

  /** 预设分类映射 */
  private categories: Map<string, PresetCategory> = new Map()

  /**
   * 构造函数
   */
  constructor() {
    super()

    // 初始化内置分类
    this.initBuiltinCategories()

    // 初始化内置预设
    this.initBuiltinPresets()
  }

  /**
   * 初始化内置分类
   */
  private initBuiltinCategories(): void {
    this.categories.set('social', {
      name: 'social',
      displayName: '社交媒体',
      description: '适用于各种社交媒体平台的预设',
      icon: '📱'
    })

    this.categories.set('document', {
      name: 'document',
      displayName: '文档处理',
      description: '适用于文档和证件照片的预设',
      icon: '📄'
    })

    this.categories.set('print', {
      name: 'print',
      displayName: '打印输出',
      description: '适用于打印输出的预设',
      icon: '🖨️'
    })

    this.categories.set('web', {
      name: 'web',
      displayName: '网页设计',
      description: '适用于网页设计的预设',
      icon: '🌐'
    })

    this.categories.set('photography', {
      name: 'photography',
      displayName: '摄影创作',
      description: '适用于摄影创作的预设',
      icon: '📸'
    })
  }

  /**
   * 初始化内置预设
   */
  private initBuiltinPresets(): void {
    const now = Date.now()

    // 社交媒体预设
    this.presets.set('instagram-square', {
      name: 'instagram-square',
      displayName: 'Instagram 正方形',
      description: 'Instagram 帖子的标准正方形格式 (1:1)',
      category: 'social',
      options: {
        aspectRatio: 1,
        cropShape: 'rectangle',
        minWidth: 400,
        minHeight: 400,
        quality: 0.9,
        format: 'image/jpeg'
      },
      builtin: true,
      createdAt: now,
      updatedAt: now
    })

    this.presets.set('instagram-story', {
      name: 'instagram-story',
      displayName: 'Instagram 故事',
      description: 'Instagram 故事的垂直格式 (9:16)',
      category: 'social',
      options: {
        aspectRatio: 9 / 16,
        cropShape: 'rectangle',
        minWidth: 720,
        minHeight: 1280,
        quality: 0.9,
        format: 'image/jpeg'
      },
      builtin: true,
      createdAt: now,
      updatedAt: now
    })

    this.presets.set('facebook-cover', {
      name: 'facebook-cover',
      displayName: 'Facebook 封面',
      description: 'Facebook 页面封面图片格式 (16:9)',
      category: 'social',
      options: {
        aspectRatio: 16 / 9,
        cropShape: 'rectangle',
        minWidth: 820,
        minHeight: 462,
        quality: 0.9,
        format: 'image/jpeg'
      },
      builtin: true,
      createdAt: now,
      updatedAt: now
    })

    this.presets.set('twitter-header', {
      name: 'twitter-header',
      displayName: 'Twitter 头部',
      description: 'Twitter 个人资料头部图片格式 (3:1)',
      category: 'social',
      options: {
        aspectRatio: 3,
        cropShape: 'rectangle',
        minWidth: 1500,
        minHeight: 500,
        quality: 0.9,
        format: 'image/jpeg'
      },
      builtin: true,
      createdAt: now,
      updatedAt: now
    })

    // 文档处理预设
    this.presets.set('id-photo', {
      name: 'id-photo',
      displayName: '证件照',
      description: '标准证件照格式 (3:4)',
      category: 'document',
      options: {
        aspectRatio: 3 / 4,
        cropShape: 'rectangle',
        minWidth: 300,
        minHeight: 400,
        quality: 0.95,
        format: 'image/jpeg',
        backgroundColor: '#ffffff'
      },
      builtin: true,
      createdAt: now,
      updatedAt: now
    })

    this.presets.set('passport-photo', {
      name: 'passport-photo',
      displayName: '护照照片',
      description: '护照照片标准格式 (1:1)',
      category: 'document',
      options: {
        aspectRatio: 1,
        cropShape: 'rectangle',
        minWidth: 600,
        minHeight: 600,
        quality: 0.95,
        format: 'image/jpeg',
        backgroundColor: '#ffffff'
      },
      builtin: true,
      createdAt: now,
      updatedAt: now
    })

    // 打印输出预设
    this.presets.set('print-4x6', {
      name: 'print-4x6',
      displayName: '4x6 英寸打印',
      description: '标准 4x6 英寸照片打印格式 (3:2)',
      category: 'print',
      options: {
        aspectRatio: 3 / 2,
        cropShape: 'rectangle',
        minWidth: 1200,
        minHeight: 800,
        quality: 0.95,
        format: 'image/jpeg'
      },
      builtin: true,
      createdAt: now,
      updatedAt: now
    })

    this.presets.set('print-a4', {
      name: 'print-a4',
      displayName: 'A4 纸张',
      description: 'A4 纸张比例格式 (√2:1)',
      category: 'print',
      options: {
        aspectRatio: Math.sqrt(2),
        cropShape: 'rectangle',
        minWidth: 2480,
        minHeight: 3508,
        quality: 0.95,
        format: 'image/jpeg'
      },
      builtin: true,
      createdAt: now,
      updatedAt: now
    })

    // 网页设计预设
    this.presets.set('web-banner', {
      name: 'web-banner',
      displayName: '网页横幅',
      description: '网页横幅标准格式 (5:1)',
      category: 'web',
      options: {
        aspectRatio: 5,
        cropShape: 'rectangle',
        minWidth: 1200,
        minHeight: 240,
        quality: 0.85,
        format: 'image/jpeg'
      },
      builtin: true,
      createdAt: now,
      updatedAt: now
    })

    this.presets.set('web-thumbnail', {
      name: 'web-thumbnail',
      displayName: '网页缩略图',
      description: '网页缩略图标准格式 (16:9)',
      category: 'web',
      options: {
        aspectRatio: 16 / 9,
        cropShape: 'rectangle',
        minWidth: 320,
        minHeight: 180,
        quality: 0.8,
        format: 'image/jpeg'
      },
      builtin: true,
      createdAt: now,
      updatedAt: now
    })

    // 摄影创作预设
    this.presets.set('photo-square', {
      name: 'photo-square',
      displayName: '正方形构图',
      description: '经典正方形构图 (1:1)',
      category: 'photography',
      options: {
        aspectRatio: 1,
        cropShape: 'rectangle',
        showGrid: true,
        gridLines: 3,
        quality: 0.95,
        format: 'image/jpeg'
      },
      builtin: true,
      createdAt: now,
      updatedAt: now
    })

    this.presets.set('photo-golden-ratio', {
      name: 'photo-golden-ratio',
      displayName: '黄金比例',
      description: '黄金比例构图 (1.618:1)',
      category: 'photography',
      options: {
        aspectRatio: 1.618,
        cropShape: 'rectangle',
        showGrid: true,
        showCenterLines: true,
        quality: 0.95,
        format: 'image/jpeg'
      },
      builtin: true,
      createdAt: now,
      updatedAt: now
    })

    this.presets.set('avatar-circle', {
      name: 'avatar-circle',
      displayName: '圆形头像',
      description: '圆形头像格式',
      category: 'social',
      options: {
        aspectRatio: 1,
        cropShape: 'circle',
        minWidth: 200,
        minHeight: 200,
        quality: 0.9,
        format: 'image/png',
        backgroundColor: 'transparent'
      },
      builtin: true,
      createdAt: now,
      updatedAt: now
    })
  }

  /**
   * 获取所有预设
   */
  getAllPresets(): PresetConfig[] {
    return Array.from(this.presets.values())
  }

  /**
   * 根据分类获取预设
   * @param category 分类名称
   */
  getPresetsByCategory(category: string): PresetConfig[] {
    return Array.from(this.presets.values()).filter(preset => preset.category === category)
  }

  /**
   * 获取预设配置
   * @param name 预设名称
   */
  getPreset(name: string): PresetConfig | undefined {
    return this.presets.get(name)
  }

  /**
   * 添加自定义预设
   * @param preset 预设配置
   */
  addPreset(preset: Omit<PresetConfig, 'builtin' | 'createdAt' | 'updatedAt'>): void {
    const now = Date.now()
    const fullPreset: PresetConfig = {
      ...preset,
      builtin: false,
      createdAt: now,
      updatedAt: now
    }

    this.presets.set(preset.name, fullPreset)
    this.emit('presetAdded', fullPreset)
  }

  /**
   * 更新预设配置
   * @param name 预设名称
   * @param updates 更新内容
   */
  updatePreset(name: string, updates: Partial<Omit<PresetConfig, 'name' | 'builtin' | 'createdAt'>>): void {
    const preset = this.presets.get(name)
    if (!preset) {
      throw new Error(`Preset not found: ${name}`)
    }

    if (preset.builtin) {
      throw new Error(`Cannot update builtin preset: ${name}`)
    }

    const updatedPreset: PresetConfig = {
      ...preset,
      ...updates,
      updatedAt: Date.now()
    }

    this.presets.set(name, updatedPreset)
    this.emit('presetUpdated', updatedPreset)
  }

  /**
   * 删除预设
   * @param name 预设名称
   */
  deletePreset(name: string): void {
    const preset = this.presets.get(name)
    if (!preset) {
      throw new Error(`Preset not found: ${name}`)
    }

    if (preset.builtin) {
      throw new Error(`Cannot delete builtin preset: ${name}`)
    }

    this.presets.delete(name)
    this.emit('presetDeleted', preset)
  }

  /**
   * 获取所有分类
   */
  getAllCategories(): PresetCategory[] {
    return Array.from(this.categories.values())
  }

  /**
   * 添加分类
   * @param category 分类配置
   */
  addCategory(category: PresetCategory): void {
    this.categories.set(category.name, category)
    this.emit('categoryAdded', category)
  }

  /**
   * 搜索预设
   * @param query 搜索关键词
   */
  searchPresets(query: string): PresetConfig[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.presets.values()).filter(preset =>
      preset.displayName.toLowerCase().includes(lowerQuery) ||
      preset.description.toLowerCase().includes(lowerQuery) ||
      preset.category.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * 导出预设
   * @param name 预设名称
   */
  exportPreset(name: string): string | null {
    const preset = this.presets.get(name)
    if (!preset) return null

    return JSON.stringify(preset, null, 2)
  }

  /**
   * 导入预设
   * @param presetJson 预设JSON字符串
   */
  importPreset(presetJson: string): void {
    try {
      const preset = JSON.parse(presetJson) as PresetConfig
      // 确保不是内置预设
      preset.builtin = false
      preset.updatedAt = Date.now()
      
      this.presets.set(preset.name, preset)
      this.emit('presetImported', preset)
    } catch (error) {
      throw new Error('Invalid preset JSON format')
    }
  }

  /**
   * 批量导出预设
   * @param names 预设名称数组，不提供则导出所有自定义预设
   */
  exportPresets(names?: string[]): string {
    let presetsToExport: PresetConfig[]

    if (names) {
      presetsToExport = names.map(name => this.presets.get(name)).filter(Boolean) as PresetConfig[]
    } else {
      presetsToExport = Array.from(this.presets.values()).filter(preset => !preset.builtin)
    }

    return JSON.stringify(presetsToExport, null, 2)
  }

  /**
   * 批量导入预设
   * @param presetsJson 预设数组JSON字符串
   */
  importPresets(presetsJson: string): void {
    try {
      const presets = JSON.parse(presetsJson) as PresetConfig[]
      const importedPresets: PresetConfig[] = []

      for (const preset of presets) {
        // 确保不是内置预设
        preset.builtin = false
        preset.updatedAt = Date.now()
        
        this.presets.set(preset.name, preset)
        importedPresets.push(preset)
      }

      this.emit('presetsImported', importedPresets)
    } catch (error) {
      throw new Error('Invalid presets JSON format')
    }
  }

  /**
   * 销毁预设管理器
   */
  destroy(): void {
    this.removeAllListeners()
    this.presets.clear()
    this.categories.clear()
  }
}
