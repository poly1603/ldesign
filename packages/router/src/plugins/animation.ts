/**
 * @ldesign/router 动画插件
 *
 * 提供丰富的路由过渡动画效果
 */

import type { App } from 'vue'
import type { AnimationConfig, AnimationType } from '../components/types'
import type { RouteLocationNormalized, Router } from '../types'

// ==================== 动画配置 ====================

/**
 * 预定义动画配置
 */
export const ANIMATION_PRESETS: Record<AnimationType, AnimationConfig> = {
  fade: {
    type: 'fade',
    duration: 300,
    easing: 'ease-in-out',
    enterClass: 'router-fade-enter',
    enterActiveClass: 'router-fade-enter-active',
    enterToClass: 'router-fade-enter-to',
    leaveClass: 'router-fade-leave',
    leaveActiveClass: 'router-fade-leave-active',
    leaveToClass: 'router-fade-leave-to',
  },
  slide: {
    type: 'slide',
    duration: 400,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    enterClass: 'router-slide-enter',
    enterActiveClass: 'router-slide-enter-active',
    enterToClass: 'router-slide-enter-to',
    leaveClass: 'router-slide-leave',
    leaveActiveClass: 'router-slide-leave-active',
    leaveToClass: 'router-slide-leave-to',
  },
  scale: {
    type: 'scale',
    duration: 350,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    enterClass: 'router-scale-enter',
    enterActiveClass: 'router-scale-enter-active',
    enterToClass: 'router-scale-enter-to',
    leaveClass: 'router-scale-leave',
    leaveActiveClass: 'router-scale-leave-active',
    leaveToClass: 'router-scale-leave-to',
  },
  flip: {
    type: 'flip',
    duration: 600,
    easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    enterClass: 'router-flip-enter',
    enterActiveClass: 'router-flip-enter-active',
    enterToClass: 'router-flip-enter-to',
    leaveClass: 'router-flip-leave',
    leaveActiveClass: 'router-flip-leave-active',
    leaveToClass: 'router-flip-leave-to',
  },
  none: {
    type: 'none',
    duration: 0,
  },
}

// ==================== 动画管理器 ====================

/**
 * 动画管理器
 */
export class AnimationManager {
  private animations = new Map<string, AnimationConfig>()
  private customAnimations = new Map<string, AnimationConfig>()
  // 默认动画类型，用于后续扩展
  // private defaultAnimation: AnimationType = 'fade'

  constructor() {
    // 注册预定义动画
    for (const [name, config] of Object.entries(ANIMATION_PRESETS)) {
      this.animations.set(name, config)
    }
  }

  /**
   * 设置默认动画
   */
  setDefaultAnimation(_animation: AnimationType): void {
    // this.defaultAnimation = animation
    // 暂时注释掉，因为defaultAnimation属性已被注释
  }

  /**
   * 注册自定义动画
   */
  register(name: string, config: AnimationConfig): void {
    this.customAnimations.set(name, config)
    this.animations.set(name, config)
  }

  /**
   * 获取动画配置
   */
  get(name: string): AnimationConfig | undefined {
    return this.animations.get(name)
  }

  /**
   * 获取所有动画名称
   */
  getNames(): string[] {
    return Array.from(this.animations.keys())
  }

  /**
   * 根据路由变化选择动画
   */
  selectAnimation(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): AnimationConfig {
    // 检查路由元信息中的动画配置
    if (to.meta.transition) {
      const config = this.get(to.meta.transition)
      if (config)
        return config
    }

    // 默认动画逻辑
    const toDepth = to.path.split('/').length
    const fromDepth = from.path.split('/').length

    if (toDepth > fromDepth) {
      // 进入子路由，使用滑入动画
      return this.get('slide') || ANIMATION_PRESETS.slide
    }
    else if (toDepth < fromDepth) {
      // 返回父路由，使用滑出动画
      const slideConfig = this.get('slide') || ANIMATION_PRESETS.slide
      return {
        ...slideConfig,
        enterClass: slideConfig.leaveClass || '',
        enterActiveClass: slideConfig.leaveActiveClass || '',
        enterToClass: slideConfig.leaveToClass || '',
        leaveClass: slideConfig.enterClass || '',
        leaveActiveClass: slideConfig.enterActiveClass || '',
        leaveToClass: slideConfig.enterToClass || '',
      }
    }

    // 同级路由，使用淡入淡出
    return this.get('fade') || ANIMATION_PRESETS.fade
  }

  /**
   * 生成 CSS 样式
   */
  generateCSS(): string {
    let css = ''

    // 淡入淡出动画
    css += `
/* 淡入淡出动画 */
.router-fade-enter-active,
.router-fade-leave-active {
  transition: opacity ${ANIMATION_PRESETS.fade.duration}ms ${ANIMATION_PRESETS.fade.easing};
}

.router-fade-enter-from,
.router-fade-leave-to {
  opacity: 0;
}

.router-fade-enter-to,
.router-fade-leave-from {
  opacity: 1;
}
`

    // 滑动动画
    css += `
/* 滑动动画 */
.router-slide-enter-active,
.router-slide-leave-active {
  transition: transform ${ANIMATION_PRESETS.slide.duration}ms ${ANIMATION_PRESETS.slide.easing};
}

.router-slide-enter-from {
  transform: translateX(100%);
}

.router-slide-leave-to {
  transform: translateX(-100%);
}

.router-slide-enter-to,
.router-slide-leave-from {
  transform: translateX(0);
}
`

    // 缩放动画
    css += `
/* 缩放动画 */
.router-scale-enter-active,
.router-scale-leave-active {
  transition: transform ${ANIMATION_PRESETS.scale.duration}ms ${ANIMATION_PRESETS.scale.easing},
              opacity ${ANIMATION_PRESETS.scale.duration}ms ${ANIMATION_PRESETS.scale.easing};
}

.router-scale-enter-from {
  transform: scale(0.8);
  opacity: 0;
}

.router-scale-leave-to {
  transform: scale(1.2);
  opacity: 0;
}

.router-scale-enter-to,
.router-scale-leave-from {
  transform: scale(1);
  opacity: 1;
}
`

    // 翻转动画
    css += `
/* 翻转动画 */
.router-flip-enter-active,
.router-flip-leave-active {
  transition: transform ${ANIMATION_PRESETS.flip.duration}ms ${ANIMATION_PRESETS.flip.easing};
  transform-style: preserve-3d;
}

.router-flip-enter-from {
  transform: rotateY(-90deg);
}

.router-flip-leave-to {
  transform: rotateY(90deg);
}

.router-flip-enter-to,
.router-flip-leave-from {
  transform: rotateY(0deg);
}
`

    // 通用样式
    css += `
/* 通用样式 */
.router-view {
  position: relative;
}

.router-view > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 响应式动画 */
@media (prefers-reduced-motion: reduce) {
  .router-fade-enter-active,
  .router-fade-leave-active,
  .router-slide-enter-active,
  .router-slide-leave-active,
  .router-scale-enter-active,
  .router-scale-leave-active,
  .router-flip-enter-active,
  .router-flip-leave-active {
    transition: none !important;
  }
}
`

    return css
  }

  /**
   * 注入样式到页面
   */
  injectStyles(): void {
    if (typeof document === 'undefined')
      return

    const styleId = 'ldesign-router-animations'
    let styleElement = document.getElementById(styleId) as HTMLStyleElement

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = this.generateCSS()
  }
}

// ==================== 动画插件 ====================

/**
 * 动画插件选项
 */
export interface AnimationPluginOptions {
  /** 默认动画类型 */
  defaultAnimation?: AnimationType
  /** 自定义动画配置 */
  customAnimations?: Record<string, AnimationConfig>
  /** 是否自动注入样式 */
  autoInjectStyles?: boolean
  /** 是否启用智能动画选择 */
  smartSelection?: boolean
}

/**
 * 创建动画插件
 */
export function createAnimationPlugin(options: AnimationPluginOptions = {}) {
  const {
    defaultAnimation = 'fade' as AnimationType,
    customAnimations = {},
    autoInjectStyles = true,
    smartSelection = true,
  } = options

  const manager = new AnimationManager()

  // 设置默认动画
  if (defaultAnimation) {
    manager.setDefaultAnimation(defaultAnimation)
  }

  // 注册自定义动画
  for (const [name, config] of Object.entries(customAnimations)) {
    manager.register(name, config)
  }

  return {
    install(app: App, router: Router) {
      // 注入样式
      if (autoInjectStyles) {
        manager.injectStyles()
      }

      // 提供动画管理器
      app.provide('animationManager', manager)

      // 全局属性
      app.config.globalProperties.$animationManager = manager

      // 路由守卫：自动设置动画
      if (smartSelection) {
        router.beforeEach((to, from, next) => {
          if (!to.meta.transition) {
            const animation = manager.selectAnimation(to, from)
            to.meta.transition = animation.type
          }
          next()
        })
      }
    },
    manager,
  }
}

// ==================== 动画工具函数 ====================

/**
 * 创建自定义动画配置
 */
export function createAnimationConfig(
  config: Partial<AnimationConfig>,
): AnimationConfig {
  return {
    type: 'fade' as AnimationType,
    duration: 300,
    easing: 'ease-in-out',
    ...config,
  }
}

/**
 * 检查是否支持动画
 */
export function supportsAnimations(): boolean {
  if (typeof window === 'undefined')
    return false

  // 检查用户是否禁用了动画
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false
  }

  // 检查 CSS 动画支持
  const testElement = document.createElement('div')
  return 'transition' in testElement.style
}

/**
 * 获取动画持续时间
 */
export function getAnimationDuration(element: Element): number {
  if (typeof window === 'undefined')
    return 0

  const computedStyle = window.getComputedStyle(element)
  const duration
    = computedStyle.transitionDuration || computedStyle.animationDuration

  // 解析持续时间（支持 s 和 ms）
  const match = duration.match(/^([\d.]+)(s|ms)$/)
  if (!match)
    return 0

  const value = Number.parseFloat(match[1] || '0')
  const unit = match[2]

  return unit === 's' ? value * 1000 : value
}

// ==================== 默认导出 ====================

export default {
  createAnimationPlugin,
  AnimationManager,
  ANIMATION_PRESETS,
  createAnimationConfig,
  supportsAnimations,
  getAnimationDuration,
}
