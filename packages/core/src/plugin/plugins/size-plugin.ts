/**
 * 尺寸插件
 * 
 * 提供全局尺寸控制功能,支持动态切换组件尺寸
 * 
 * @module plugins/size
 */

import type { Plugin, PluginContext } from '../../types'

/**
 * 尺寸类型
 */
export type Size = 'mini' | 'small' | 'medium' | 'large' | 'xlarge'

/**
 * 尺寸配置映射
 */
export interface SizeConfig {
  /** 尺寸值映射 (例如: padding, fontSize 等) */
  values?: Record<string, string | number>
  /** CSS类名 */
  className?: string
  /** 描述 */
  description?: string
}

/**
 * 尺寸插件配置
 */
export interface SizePluginConfig {
  /** 可用尺寸列表 */
  sizes: Size[]
  /** 默认尺寸 */
  defaultSize: Size
  /** 尺寸配置映射 (可选,用于自定义尺寸值) */
  sizeConfigs?: Record<Size, SizeConfig>
  /** 是否持久化尺寸选择 */
  persist?: boolean
  /** 持久化存储键 */
  storageKey?: string
  /** 是否自动应用到 document.documentElement */
  autoApply?: boolean
  /** CSS变量前缀 */
  prefix?: string
}

/**
 * 尺寸插件扩展的引擎方法
 */
export interface SizeEngineExtensions {
  /**
   * 设置全局尺寸
   * @param size - 尺寸
   */
  setSize(size: Size): void

  /**
   * 获取当前尺寸
   */
  getSize(): Size

  /**
   * 获取所有可用尺寸
   */
  getAvailableSizes(): Size[]

  /**
   * 获取尺寸配置
   * @param size - 尺寸
   */
  getSizeConfig(size: Size): SizeConfig | undefined

  /**
   * 注册自定义尺寸配置
   * @param size - 尺寸
   * @param config - 尺寸配置
   */
  registerSizeConfig(size: Size, config: SizeConfig): void
}

/**
 * 默认尺寸配置
 */
const DEFAULT_SIZE_CONFIGS: Record<Size, SizeConfig> = {
  mini: {
    values: {
      'font-size': '12px',
      'padding': '4px 8px',
      'height': '24px',
      'border-radius': '2px',
    },
    className: 'size-mini',
    description: 'Extra small size',
  },
  small: {
    values: {
      'font-size': '14px',
      'padding': '6px 12px',
      'height': '32px',
      'border-radius': '4px',
    },
    className: 'size-small',
    description: 'Small size',
  },
  medium: {
    values: {
      'font-size': '16px',
      'padding': '8px 16px',
      'height': '40px',
      'border-radius': '4px',
    },
    className: 'size-medium',
    description: 'Medium size (default)',
  },
  large: {
    values: {
      'font-size': '18px',
      'padding': '10px 20px',
      'height': '48px',
      'border-radius': '6px',
    },
    className: 'size-large',
    description: 'Large size',
  },
  xlarge: {
    values: {
      'font-size': '20px',
      'padding': '12px 24px',
      'height': '56px',
      'border-radius': '8px',
    },
    className: 'size-xlarge',
    description: 'Extra large size',
  },
}

/**
 * 应用尺寸到 DOM
 * @param size - 尺寸
 * @param config - 尺寸配置
 * @param prefix - CSS变量前缀
 * @param oldClassName - 旧的类名
 */
function applySizeToDOM(
  size: Size,
  config: SizeConfig | undefined,
  prefix: string,
  oldClassName?: string
): void {
  const root = document.documentElement

  // 设置数据属性
  root.setAttribute('data-size', size)

  // 应用 CSS 变量
  if (config?.values) {
    Object.entries(config.values).forEach(([key, value]) => {
      const variableName = key.startsWith('--') ? key : `--${prefix}${key}`
      root.style.setProperty(variableName, String(value))
    })
  }

  // 应用类名
  if (oldClassName) {
    root.classList.remove(oldClassName)
  }
  if (config?.className) {
    root.classList.add(config.className)
  }
}

/**
 * 从存储中加载尺寸
 * @param storageKey - 存储键
 * @returns 尺寸
 */
function loadSizeFromStorage(storageKey: string): Size | null {
  try {
    const saved = localStorage.getItem(storageKey)
    return saved as Size | null
  } catch (error) {
    console.warn('[size] Failed to load size from storage:', error)
    return null
  }
}

/**
 * 保存尺寸到存储
 * @param storageKey - 存储键
 * @param size - 尺寸
 */
function saveSizeToStorage(storageKey: string, size: Size): void {
  try {
    localStorage.setItem(storageKey, size)
  } catch (error) {
    console.warn('[size] Failed to save size to storage:', error)
  }
}

/**
 * 创建尺寸插件
 * 
 * @param config - 插件配置
 * @returns 插件对象
 * 
 * @example
 * ```typescript
 * const sizePlugin = createSizePlugin({
 *   defaultSize: 'medium',
 *   sizes: ['small', 'medium', 'large'],
 *   persist: true
 * })
 * 
 * // 在引擎中使用
 * await engine.use(sizePlugin)
 * engine.setSize('large')
 * console.log(engine.getSize()) // 'large'
 * 
 * // 自定义尺寸配置
 * engine.registerSizeConfig('large', {
 *   values: {
 *     'font-size': '20px',
 *     'padding': '12px 24px'
 *   },
 *   className: 'custom-large'
 * })
 * ```
 */
export function createSizePlugin(config: SizePluginConfig): Plugin {
  const {
    sizes,
    defaultSize,
    sizeConfigs = DEFAULT_SIZE_CONFIGS,
    persist = true,
    storageKey = 'app-size',
    autoApply = true,
    prefix = '',
  } = config

  // 验证配置
  if (!sizes.includes(defaultSize)) {
    throw new Error(`Default size "${defaultSize}" not in available sizes: ${sizes.join(', ')}`)
  }

  return {
    name: 'size',
    version: '1.0.0',

    install(context: PluginContext) {
      const { state, events, logger } = context
      const engine = context.engine as any

      // 尝试从存储加载尺寸
      let initialSize = defaultSize
      if (persist && typeof window !== 'undefined') {
        const savedSize = loadSizeFromStorage(storageKey)
        if (savedSize && sizes.includes(savedSize)) {
          initialSize = savedSize
          logger.debug(`[size] Loaded size from storage: ${savedSize}`)
        }
      }

      // 初始化尺寸状态
      state.setState('size', {
        current: initialSize,
        available: sizes,
        configs: { ...sizeConfigs },
        prefix,
      })

      logger.debug(`[size] Plugin installed with size: ${initialSize}`)

      /**
       * 设置全局尺寸
       */
      engine.setSize = (size: Size) => {
        const availableSizes = state.getState('size.available') || []

        if (!availableSizes.includes(size)) {
          logger.warn(`[size] Size "${size}" not available, available sizes:`, availableSizes)
          throw new Error(
            `Size "${size}" not available. Available sizes: ${availableSizes.join(', ')}`
          )
        }

        const oldSize = state.getState('size.current')
        const configs = state.getState('size.configs') || {}
        const oldConfig = configs[oldSize]
        const newConfig = configs[size]

        // 应用尺寸到 DOM
        if (autoApply && typeof document !== 'undefined') {
          applySizeToDOM(size, newConfig, prefix, oldConfig?.className)
        }

        // 更新状态
        state.setState('size.current', size)

        // 持久化
        if (persist && typeof window !== 'undefined') {
          saveSizeToStorage(storageKey, size)
        }

        // 发射事件
        events.emit('size:changed', {
          from: oldSize,
          to: size,
          config: newConfig,
        })

        logger.debug(`[size] Size changed: ${oldSize} -> ${size}`)
      }

      /**
       * 获取当前尺寸
       */
      engine.getSize = (): Size => {
        return state.getState('size.current') || initialSize
      }

      /**
       * 获取所有可用尺寸
       */
      engine.getAvailableSizes = (): Size[] => {
        return state.getState('size.available') || []
      }

      /**
       * 获取尺寸配置
       */
      engine.getSizeConfig = (size: Size): SizeConfig | undefined => {
        const configs = state.getState('size.configs') || {}
        return configs[size]
      }

      /**
       * 注册自定义尺寸配置
       */
      engine.registerSizeConfig = (size: Size, newConfig: SizeConfig) => {
        const configs = state.getState('size.configs') || {}

        if (configs[size]) {
          logger.warn(`[size] Size config for "${size}" already exists, will be overwritten`)
        }

        state.setState(`size.configs.${size}`, newConfig)

        events.emit('size:config-registered', {
          size,
          config: newConfig,
        })

        logger.debug(`[size] Size config registered: ${size}`)
      }

      // 应用初始尺寸
      if (autoApply && typeof document !== 'undefined') {
        applySizeToDOM(initialSize, sizeConfigs[initialSize], prefix)
      }

      // 发射初始化事件
      events.emit('size:initialized', {
        size: initialSize,
        availableSizes: sizes,
      })
    },

    uninstall(context: PluginContext) {
      const { state, logger } = context
      const engine = context.engine as any

      // 清理状态
      state.setState('size', undefined)

      // 移除扩展方法
      delete engine.setSize
      delete engine.getSize
      delete engine.getAvailableSizes
      delete engine.getSizeConfig
      delete engine.registerSizeConfig

      logger.debug('[size] Plugin uninstalled')
    },
  }
}

/**
 * 预设尺寸列表
 */
export const PRESET_SIZES: Size[] = ['mini', 'small', 'medium', 'large', 'xlarge']

/**
 * 常用尺寸组合
 */
export const COMMON_SIZE_SETS = {
  /** 基本三种尺寸 */
  basic: ['small', 'medium', 'large'] as Size[],
  /** 完整五种尺寸 */
  full: ['mini', 'small', 'medium', 'large', 'xlarge'] as Size[],
  /** 紧凑型(去掉最大) */
  compact: ['mini', 'small', 'medium', 'large'] as Size[],
}
