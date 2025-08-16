/**
 * @ldesign/theme - 装饰元素工厂
 *
 * 提供装饰元素的统一创建接口
 */

import type { DecorationConfig, DecorationType } from '../core/types'
import type { BaseDecoration } from './elements/base'
import { FireworkDecoration } from './elements/firework'
import { LanternDecoration } from './elements/lantern'
import { SnowflakeDecoration } from './elements/snowflake'

/**
 * 装饰元素构造函数类型
 */
type DecorationConstructor = new (
  config: DecorationConfig,
  container: HTMLElement
) => BaseDecoration

/**
 * 装饰元素注册表
 */
const decorationRegistry = new Map<
  DecorationType | string,
  DecorationConstructor
>([
  ['snowflake', SnowflakeDecoration],
  ['lantern', LanternDecoration],
  ['firework', FireworkDecoration],
  // 通用类型映射
  ['svg', SnowflakeDecoration], // 默认使用雪花装饰
  ['image', SnowflakeDecoration],
  ['icon', SnowflakeDecoration],
  ['pattern', SnowflakeDecoration],
  ['particle', FireworkDecoration],
])

/**
 * 装饰元素工厂类
 */
export class DecorationFactory {
  /**
   * 创建装饰元素
   */
  static create(
    config: DecorationConfig,
    container: HTMLElement
  ): BaseDecoration {
    // 首先尝试根据装饰名称查找
    let Constructor = decorationRegistry.get(config.name)

    // 如果没找到，根据类型查找
    if (!Constructor) {
      Constructor = decorationRegistry.get(config.type)
    }

    // 如果还是没找到，使用默认装饰
    if (!Constructor) {
      Constructor = this.getDefaultDecoration(config)
    }

    return new Constructor(config, container)
  }

  /**
   * 批量创建装饰元素
   */
  static createMultiple(
    configs: DecorationConfig[],
    container: HTMLElement
  ): BaseDecoration[] {
    return configs.map(config => this.create(config, container))
  }

  /**
   * 注册装饰元素类型
   */
  static register(type: string, constructor: DecorationConstructor): void {
    decorationRegistry.set(type, constructor)
  }

  /**
   * 注销装饰元素类型
   */
  static unregister(type: string): void {
    decorationRegistry.delete(type)
  }

  /**
   * 检查是否支持某种装饰类型
   */
  static isSupported(type: string): boolean {
    return decorationRegistry.has(type)
  }

  /**
   * 获取所有支持的装饰类型
   */
  static getSupportedTypes(): string[] {
    return Array.from(decorationRegistry.keys())
  }

  /**
   * 根据配置获取默认装饰类型
   */
  private static getDefaultDecoration(
    config: DecorationConfig
  ): DecorationConstructor {
    // 根据配置特征智能选择装饰类型
    if (config.name.includes('snow') || config.name.includes('flake')) {
      return SnowflakeDecoration
    }

    if (config.name.includes('lantern') || config.name.includes('lamp')) {
      return LanternDecoration
    }

    if (config.name.includes('firework') || config.name.includes('burst')) {
      return FireworkDecoration
    }

    // 根据动画类型推断
    if (
      config.animation?.includes('fall') ||
      config.animation?.includes('snow')
    ) {
      return SnowflakeDecoration
    }

    if (
      config.animation?.includes('swing') ||
      config.animation?.includes('glow')
    ) {
      return LanternDecoration
    }

    if (
      config.animation?.includes('burst') ||
      config.animation?.includes('explode')
    ) {
      return FireworkDecoration
    }

    // 默认使用雪花装饰
    return SnowflakeDecoration
  }

  /**
   * 创建预设装饰组合
   */
  static createPreset(
    preset: 'christmas' | 'spring-festival' | 'halloween' | 'celebration',
    container: HTMLElement,
    options: {
      intensity?: 'light' | 'medium' | 'heavy'
      interactive?: boolean
      responsive?: boolean
    } = {}
  ): BaseDecoration[] {
    const {
      intensity = 'medium',
      interactive = true,
      responsive = true,
    } = options

    switch (preset) {
      case 'christmas':
        return this.createChristmasDecorations(container, {
          intensity,
          interactive,
          responsive,
        })

      case 'spring-festival':
        return this.createSpringFestivalDecorations(container, {
          intensity,
          interactive,
          responsive,
        })

      case 'halloween':
        return this.createHalloweenDecorations(container, {
          intensity,
          interactive,
          responsive,
        })

      case 'celebration':
        return this.createCelebrationDecorations(container, {
          intensity,
          interactive,
          responsive,
        })

      default:
        return []
    }
  }

  /**
   * 创建圣诞节装饰
   */
  private static createChristmasDecorations(
    container: HTMLElement,
    options: any
  ): BaseDecoration[] {
    const decorations: BaseDecoration[] = []
    const { intensity, interactive, responsive } = options

    // 雪花数量根据强度调整
    const snowflakeCount =
      intensity === 'light' ? 10 : intensity === 'heavy' ? 30 : 20

    // 创建雪花
    for (let i = 0; i < snowflakeCount; i++) {
      const config: DecorationConfig = {
        id: `christmas-snowflake-${i}`,
        name: `圣诞雪花${i + 1}`,
        type: 'svg',
        src: '/assets/christmas/snowflake.svg',
        position: {
          type: 'fixed',
          position: {
            x: `${Math.random() * 100}%`,
            y: '-20px',
          },
          anchor: 'top-left',
        },
        style: {
          size: {
            width: 15 + Math.random() * 15,
            height: 15 + Math.random() * 15,
          },
          opacity: 0.6 + Math.random() * 0.3,
          zIndex: 1000 - i,
        },
        animation: 'snowfall',
        interactive,
        responsive,
      }

      decorations.push(this.create(config, container))
    }

    return decorations
  }

  /**
   * 创建春节装饰
   */
  private static createSpringFestivalDecorations(
    container: HTMLElement,
    options: any
  ): BaseDecoration[] {
    const decorations: BaseDecoration[] = []
    const { interactive, responsive } = options

    // 创建灯笼对
    const lanternConfigs: DecorationConfig[] = [
      {
        id: 'spring-lantern-left',
        name: '春节左灯笼',
        type: 'svg',
        src: '/assets/spring-festival/red-lantern.svg',
        position: {
          type: 'fixed',
          position: { x: '5%', y: '10%' },
          anchor: 'top-left',
        },
        style: {
          size: { width: '60px', height: '80px' },
          opacity: 0.9,
          zIndex: 1001,
        },
        animation: 'lantern-swing',
        interactive,
        responsive,
      },
      {
        id: 'spring-lantern-right',
        name: '春节右灯笼',
        type: 'svg',
        src: '/assets/spring-festival/red-lantern.svg',
        position: {
          type: 'fixed',
          position: { x: '95%', y: '10%' },
          anchor: 'top-right',
        },
        style: {
          size: { width: '60px', height: '80px' },
          opacity: 0.9,
          zIndex: 1001,
        },
        animation: 'lantern-swing-reverse',
        interactive,
        responsive,
      },
    ]

    lanternConfigs.forEach(config => {
      decorations.push(this.create(config, container))
    })

    // 创建烟花
    const fireworkConfig: DecorationConfig = {
      id: 'spring-firework',
      name: '春节烟花',
      type: 'svg',
      src: '/assets/spring-festival/firework.svg',
      position: {
        type: 'fixed',
        position: { x: '50%', y: '30%' },
        anchor: 'center',
      },
      style: {
        size: { width: '40px', height: '40px' },
        opacity: 0,
        zIndex: 1000,
      },
      animation: 'firework-burst',
      interactive: false,
      responsive,
    }

    decorations.push(this.create(fireworkConfig, container))

    return decorations
  }

  /**
   * 创建万圣节装饰
   */
  private static createHalloweenDecorations(
    _container: HTMLElement,
    _options: any
  ): BaseDecoration[] {
    const decorations: BaseDecoration[] = []
    // 这里可以添加万圣节特有的装饰元素
    // 暂时返回空数组
    return decorations
  }

  /**
   * 创建庆祝装饰
   */
  private static createCelebrationDecorations(
    container: HTMLElement,
    options: any
  ): BaseDecoration[] {
    const decorations: BaseDecoration[] = []
    const { intensity, interactive, responsive } = options

    // 烟花数量根据强度调整
    const fireworkCount =
      intensity === 'light' ? 3 : intensity === 'heavy' ? 8 : 5

    // 创建烟花
    for (let i = 0; i < fireworkCount; i++) {
      const config: DecorationConfig = {
        id: `celebration-firework-${i}`,
        name: `庆祝烟花${i + 1}`,
        type: 'svg',
        src: '/assets/celebration/firework.svg',
        position: {
          type: 'fixed',
          position: {
            x: `${20 + Math.random() * 60}%`,
            y: `${20 + Math.random() * 40}%`,
          },
          anchor: 'center',
        },
        style: {
          size: {
            width: 30 + Math.random() * 20,
            height: 30 + Math.random() * 20,
          },
          opacity: 0,
          zIndex: 1000 - i,
        },
        animation: 'firework-burst',
        interactive,
        responsive,
      }

      decorations.push(this.create(config, container))
    }

    return decorations
  }

  /**
   * 创建自定义装饰组合
   */
  static createCustom(
    template: {
      type: string
      count: number
      baseConfig: Partial<DecorationConfig>
      variations?: Partial<DecorationConfig>[]
    },
    container: HTMLElement
  ): BaseDecoration[] {
    const decorations: BaseDecoration[] = []
    const { type, count, baseConfig, variations = [] } = template

    for (let i = 0; i < count; i++) {
      const variation = variations[i % variations.length] || {}

      const config: DecorationConfig = {
        id: `custom-${type}-${i}`,
        name: `自定义${type}${i + 1}`,
        type: type as any,
        src: '',
        position: {
          type: 'fixed',
          position: { x: '50%', y: '50%' },
          anchor: 'center',
        },
        style: {
          size: { width: '40px', height: '40px' },
          opacity: 1,
          zIndex: 1000,
        },
        interactive: false,
        responsive: true,
        ...baseConfig,
        ...variation,
      }

      decorations.push(this.create(config, container))
    }

    return decorations
  }
}
