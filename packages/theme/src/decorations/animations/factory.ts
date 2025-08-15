/**
 * @ldesign/theme - 动画工厂
 *
 * 提供动画效果的统一创建接口
 */

import type { AnimationConfig, AnimationType } from '../../core/types'
import { BaseAnimation } from './base'
import { FallingAnimation } from './falling'
import { FloatingAnimation } from './floating'
import { SparklingAnimation } from './sparkling'

/**
 * 动画构造函数类型
 */
type AnimationConstructor = new (config: AnimationConfig) => BaseAnimation

/**
 * 动画注册表
 */
const animationRegistry = new Map<string, AnimationConstructor>([
  // 下落动画
  ['falling', FallingAnimation],
  ['snowfall', FallingAnimation],
  ['coin-fall', FallingAnimation],
  ['petal-fall', FallingAnimation],
  ['rain', FallingAnimation],

  // 漂浮动画
  ['floating', FloatingAnimation],
  ['ghost-float', FloatingAnimation],
  ['balloon-float', FloatingAnimation],
  ['cloud-float', FloatingAnimation],
  ['underwater-float', FloatingAnimation],

  // 闪烁动画
  ['sparkling', SparklingAnimation],
  ['star-sparkle', SparklingAnimation],
  ['neon-flicker', SparklingAnimation],
  ['magic-sparkle', SparklingAnimation],
  ['breathing-light', SparklingAnimation],
  ['glow', SparklingAnimation],
  ['twinkle', SparklingAnimation],
])

/**
 * 动画工厂类
 */
export class AnimationFactory {
  /**
   * 创建动画
   */
  static create(
    config: AnimationConfig,
    elements: HTMLElement[]
  ): BaseAnimation {
    // 首先尝试根据动画名称查找
    let Constructor = animationRegistry.get(config.name)

    // 如果没找到，根据动画特征推断
    if (!Constructor) {
      Constructor = this.inferAnimationType(config)
    }

    // 如果还是没找到，使用默认动画
    if (!Constructor) {
      Constructor = FallingAnimation // 默认使用下落动画
    }

    const animation = new Constructor(config)
    animation.setElements(elements)

    return animation
  }

  /**
   * 批量创建动画
   */
  static createMultiple(
    configs: AnimationConfig[],
    elementsMap: Map<string, HTMLElement[]>
  ): BaseAnimation[] {
    return configs.map(config => {
      const elements = elementsMap.get(config.name) || []
      return this.create(config, elements)
    })
  }

  /**
   * 注册动画类型
   */
  static register(name: string, constructor: AnimationConstructor): void {
    animationRegistry.set(name, constructor)
  }

  /**
   * 注销动画类型
   */
  static unregister(name: string): void {
    animationRegistry.delete(name)
  }

  /**
   * 检查是否支持某种动画类型
   */
  static isSupported(name: string): boolean {
    return animationRegistry.has(name)
  }

  /**
   * 获取所有支持的动画类型
   */
  static getSupportedTypes(): string[] {
    return Array.from(animationRegistry.keys())
  }

  /**
   * 根据配置推断动画类型
   */
  private static inferAnimationType(
    config: AnimationConfig
  ): AnimationConstructor | undefined {
    const name = config.name.toLowerCase()

    // 下落动画关键词
    if (
      name.includes('fall') ||
      name.includes('drop') ||
      name.includes('rain') ||
      name.includes('snow') ||
      name.includes('coin') ||
      name.includes('petal')
    ) {
      return FallingAnimation
    }

    // 漂浮动画关键词
    if (
      name.includes('float') ||
      name.includes('drift') ||
      name.includes('hover') ||
      name.includes('ghost') ||
      name.includes('balloon') ||
      name.includes('cloud')
    ) {
      return FloatingAnimation
    }

    // 闪烁动画关键词
    if (
      name.includes('sparkle') ||
      name.includes('glow') ||
      name.includes('twinkle') ||
      name.includes('flicker') ||
      name.includes('shine') ||
      name.includes('blink')
    ) {
      return SparklingAnimation
    }

    // 根据关键帧分析
    if (config.keyframes && config.keyframes.length > 0) {
      const hasTranslateY = config.keyframes.some(kf =>
        Object.keys(kf.properties).some(
          prop => prop.includes('translateY') || prop.includes('transform')
        )
      )

      const hasOpacity = config.keyframes.some(kf =>
        Object.keys(kf.properties).includes('opacity')
      )

      const hasFilter = config.keyframes.some(kf =>
        Object.keys(kf.properties).includes('filter')
      )

      if (hasTranslateY && !hasOpacity) {
        return FallingAnimation
      }

      if (hasTranslateY && hasOpacity && !hasFilter) {
        return FloatingAnimation
      }

      if (hasOpacity || hasFilter) {
        return SparklingAnimation
      }
    }

    return undefined
  }

  /**
   * 创建预设动画组合
   */
  static createPreset(
    preset: 'christmas' | 'spring-festival' | 'halloween' | 'celebration',
    elements: HTMLElement[],
    options: {
      intensity?: 'light' | 'medium' | 'heavy'
      duration?: number
    } = {}
  ): BaseAnimation[] {
    const { intensity = 'medium', duration = 5000 } = options

    switch (preset) {
      case 'christmas':
        return this.createChristmasAnimations(elements, { intensity, duration })

      case 'spring-festival':
        return this.createSpringFestivalAnimations(elements, {
          intensity,
          duration,
        })

      case 'halloween':
        return this.createHalloweenAnimations(elements, { intensity, duration })

      case 'celebration':
        return this.createCelebrationAnimations(elements, {
          intensity,
          duration,
        })

      default:
        return []
    }
  }

  /**
   * 创建圣诞节动画
   */
  private static createChristmasAnimations(
    elements: HTMLElement[],
    options: any
  ): BaseAnimation[] {
    const animations: BaseAnimation[] = []
    const { intensity, duration } = options

    // 雪花下落动画
    const snowfallConfig: AnimationConfig = {
      name: 'christmas-snowfall',
      type: 'js',
      duration:
        duration *
        (intensity === 'light' ? 1.5 : intensity === 'heavy' ? 0.7 : 1),
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'translateY(-20px) rotate(0deg)',
            opacity: 0,
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'translateY(100vh) rotate(360deg)',
            opacity: 0,
          },
        },
      ],
      performance: {
        useGPU: true,
        willChange: ['transform', 'opacity'],
        transform3d: true,
      },
    }

    animations.push(
      FallingAnimation.createSnowfall(elements, {
        duration: snowfallConfig.duration,
        intensity: intensity as any,
      })
    )

    return animations
  }

  /**
   * 创建春节动画
   */
  private static createSpringFestivalAnimations(
    elements: HTMLElement[],
    options: any
  ): BaseAnimation[] {
    const animations: BaseAnimation[] = []

    // 灯笼发光动画
    const glowConfig: AnimationConfig = {
      name: 'lantern-glow',
      type: 'css',
      duration: 2000,
      iterations: 'infinite',
      direction: 'alternate',
      keyframes: [
        {
          offset: 0,
          properties: {
            filter: 'drop-shadow(0 0 5px #F59E0B)',
          },
        },
        {
          offset: 1,
          properties: {
            filter:
              'drop-shadow(0 0 20px #F59E0B) drop-shadow(0 0 30px #DC2626)',
          },
        },
      ],
    }

    animations.push(this.create(glowConfig, elements))

    return animations
  }

  /**
   * 创建万圣节动画
   */
  private static createHalloweenAnimations(
    elements: HTMLElement[],
    options: any
  ): BaseAnimation[] {
    const animations: BaseAnimation[] = []

    // 幽灵漂浮动画
    animations.push(
      FloatingAnimation.createGhostFloat(elements, {
        amplitude: 15,
        opacity: true,
      })
    )

    return animations
  }

  /**
   * 创建庆祝动画
   */
  private static createCelebrationAnimations(
    elements: HTMLElement[],
    options: any
  ): BaseAnimation[] {
    const animations: BaseAnimation[] = []

    // 星光闪烁动画
    animations.push(
      SparklingAnimation.createStarSparkle(elements, {
        intensity: 'intense',
        color: '#FFD700',
      })
    )

    return animations
  }

  /**
   * 创建自定义动画序列
   */
  static createSequence(
    sequence: Array<{
      config: AnimationConfig
      elements: HTMLElement[]
      delay?: number
    }>
  ): BaseAnimation[] {
    const animations: BaseAnimation[] = []

    sequence.forEach(({ config, elements, delay = 0 }) => {
      const animation = this.create(config, elements)

      if (delay > 0) {
        setTimeout(() => {
          animation.start()
        }, delay)
      }

      animations.push(animation)
    })

    return animations
  }

  /**
   * 创建响应式动画
   */
  static createResponsive(
    config: AnimationConfig,
    elements: HTMLElement[],
    breakpoints: {
      mobile?: Partial<AnimationConfig>
      tablet?: Partial<AnimationConfig>
      desktop?: Partial<AnimationConfig>
    }
  ): BaseAnimation {
    const screenWidth = window.innerWidth
    let responsiveConfig = { ...config }

    if (screenWidth < 768 && breakpoints.mobile) {
      responsiveConfig = { ...responsiveConfig, ...breakpoints.mobile }
    } else if (screenWidth < 1024 && breakpoints.tablet) {
      responsiveConfig = { ...responsiveConfig, ...breakpoints.tablet }
    } else if (breakpoints.desktop) {
      responsiveConfig = { ...responsiveConfig, ...breakpoints.desktop }
    }

    return this.create(responsiveConfig, elements)
  }

  /**
   * 创建性能优化的动画
   */
  static createOptimized(
    config: AnimationConfig,
    elements: HTMLElement[],
    options: {
      reduceMotion?: boolean
      lowPowerMode?: boolean
      maxElements?: number
    } = {}
  ): BaseAnimation {
    const {
      reduceMotion = false,
      lowPowerMode = false,
      maxElements = 50,
    } = options

    let optimizedConfig = { ...config }
    let optimizedElements = elements

    // 减少动画效果
    if (reduceMotion) {
      optimizedConfig.duration = (optimizedConfig.duration || 1000) * 2
      optimizedConfig.iterations = 1
    }

    // 低功耗模式
    if (lowPowerMode) {
      optimizedConfig.type = 'css' // 优先使用CSS动画
      optimizedElements = elements.slice(
        0,
        Math.min(elements.length, maxElements)
      )
    }

    // 限制元素数量
    if (elements.length > maxElements) {
      optimizedElements = elements.slice(0, maxElements)
    }

    return this.create(optimizedConfig, optimizedElements)
  }
}
