/**
 * 预设管理器
 * 用于管理和应用尺寸预设配置
 */

import type { SizeConfig, SizeMode } from '../types'
import { deepMergeConfig } from '../utils'
import { getSizeConfig } from './presets'

export interface SizePreset {
  /** 预设名称 */
  name: string
  /** 预设描述 */
  description?: string
  /** 预设配置 */
  config: Partial<Record<SizeMode, Partial<SizeConfig>>>
  /** 预设标签 */
  tags?: string[]
  /** 是否为内置预设 */
  builtin?: boolean
}

/**
 * 预设管理器类
 */
export class PresetManager {
  private presets: Map<string, SizePreset> = new Map()
  private activePreset: string | null = null

  constructor() {
    // 注册内置预设
    this.registerBuiltinPresets()
  }

  /**
   * 注册内置预设
   */
  private registerBuiltinPresets(): void {
    // 默认预设
    this.register({
      name: 'default',
      description: '默认尺寸预设',
      config: {},
      builtin: true,
      tags: ['default', 'standard'],
    })

    // 紧凑预设
    this.register({
      name: 'compact',
      description: '紧凑布局预设，适合信息密集型界面',
      config: {
        small: {
          fontSize: {
            xs: '10px',
            sm: '11px',
            base: '12px',
            lg: '13px',
            xl: '14px',
            xxl: '16px',
            h1: '20px',
            h2: '18px',
            h3: '16px',
            h4: '14px',
            h5: '12px',
            h6: '11px',
          },
          spacing: {
            xs: '2px',
            sm: '4px',
            base: '6px',
            lg: '8px',
            xl: '10px',
            xxl: '12px',
          },
        },
        medium: {
          fontSize: {
            xs: '11px',
            sm: '12px',
            base: '14px',
            lg: '15px',
            xl: '16px',
            xxl: '18px',
            h1: '24px',
            h2: '20px',
            h3: '18px',
            h4: '16px',
            h5: '14px',
            h6: '12px',
          },
          spacing: {
            xs: '4px',
            sm: '6px',
            base: '10px',
            lg: '12px',
            xl: '14px',
            xxl: '16px',
          },
        },
      },
      builtin: true,
      tags: ['compact', 'dense'],
    })

    // 舒适预设
    this.register({
      name: 'comfortable',
      description: '舒适阅读预设，适合长时间阅读',
      config: {
        medium: {
          fontSize: {
            xs: '13px',
            sm: '14px',
            base: '17px',
            lg: '19px',
            xl: '21px',
            xxl: '24px',
            h1: '36px',
            h2: '30px',
            h3: '24px',
            h4: '20px',
            h5: '18px',
            h6: '16px',
          },
          spacing: {
            xs: '8px',
            sm: '12px',
            base: '18px',
            lg: '22px',
            xl: '26px',
            xxl: '32px',
          },
        },
        large: {
          fontSize: {
            xs: '14px',
            sm: '16px',
            base: '19px',
            lg: '21px',
            xl: '24px',
            xxl: '28px',
            h1: '42px',
            h2: '36px',
            h3: '28px',
            h4: '24px',
            h5: '20px',
            h6: '18px',
          },
          spacing: {
            xs: '10px',
            sm: '14px',
            base: '22px',
            lg: '26px',
            xl: '30px',
            xxl: '36px',
          },
        },
      },
      builtin: true,
      tags: ['comfortable', 'reading'],
    })

    // 演示模式预设
    this.register({
      name: 'presentation',
      description: '演示模式预设，适合大屏展示',
      config: {
        large: {
          fontSize: {
            xs: '16px',
            sm: '18px',
            base: '22px',
            lg: '26px',
            xl: '30px',
            xxl: '36px',
            h1: '56px',
            h2: '48px',
            h3: '40px',
            h4: '32px',
            h5: '26px',
            h6: '22px',
          },
          spacing: {
            xs: '12px',
            sm: '18px',
            base: '28px',
            lg: '36px',
            xl: '44px',
            xxl: '52px',
          },
        },
        'extra-large': {
          fontSize: {
            xs: '18px',
            sm: '20px',
            base: '26px',
            lg: '30px',
            xl: '36px',
            xxl: '42px',
            h1: '64px',
            h2: '56px',
            h3: '48px',
            h4: '38px',
            h5: '30px',
            h6: '26px',
          },
          spacing: {
            xs: '16px',
            sm: '22px',
            base: '32px',
            lg: '42px',
            xl: '52px',
            xxl: '62px',
          },
        },
      },
      builtin: true,
      tags: ['presentation', 'display'],
    })
  }

  /**
   * 注册预设
   */
  register(preset: SizePreset): void {
    this.presets.set(preset.name, preset)
  }

  /**
   * 注销预设
   */
  unregister(name: string): boolean {
    const preset = this.presets.get(name)
    if (preset?.builtin) {
      console.warn(`Cannot unregister builtin preset: ${name}`)
      return false
    }
    return this.presets.delete(name)
  }

  /**
   * 获取预设
   */
  get(name: string): SizePreset | undefined {
    return this.presets.get(name)
  }

  /**
   * 获取所有预设
   */
  getAll(): SizePreset[] {
    return Array.from(this.presets.values())
  }

  /**
   * 根据标签获取预设
   */
  getByTag(tag: string): SizePreset[] {
    return this.getAll().filter(preset => preset.tags?.includes(tag))
  }

  /**
   * 应用预设
   */
  apply(name: string, mode: SizeMode): SizeConfig {
    const preset = this.presets.get(name)
    if (!preset) {
      throw new Error(`Preset not found: ${name}`)
    }

    this.activePreset = name

    // 获取基础配置
    const baseConfig = getSizeConfig(mode)

    // 获取预设配置
    const presetConfig = preset.config[mode]
    if (!presetConfig) {
      return baseConfig
    }

    // 合并配置
    return deepMergeConfig(baseConfig, presetConfig)
  }

  /**
   * 获取当前激活的预设
   */
  getActive(): string | null {
    return this.activePreset
  }

  /**
   * 检查预设是否存在
   */
  has(name: string): boolean {
    return this.presets.has(name)
  }

  /**
   * 获取预设列表
   */
  list(): string[] {
    return Array.from(this.presets.keys())
  }

  /**
   * 清空自定义预设（保留内置预设）
   */
  clearCustom(): void {
    for (const [name, preset] of this.presets.entries()) {
      if (!preset.builtin) {
        this.presets.delete(name)
      }
    }
  }
}

/**
 * 全局预设管理器实例
 */
export const globalPresetManager = new PresetManager()

