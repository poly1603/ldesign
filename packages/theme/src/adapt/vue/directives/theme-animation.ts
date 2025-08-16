/**
 * @ldesign/theme - v-theme-animation 指令
 *
 * 为元素添加主题动画效果
 */

import type { Directive, DirectiveBinding } from 'vue'
import type { AnimationConfig, VThemeAnimationBinding } from '../types'
import { AnimationFactory } from '../../../decorations/animations/factory'

/**
 * 动画实例映射
 */
const animationMap = new WeakMap<HTMLElement, any>()

/**
 * v-theme-animation 指令实现
 */
export const vThemeAnimation: Directive<HTMLElement, VThemeAnimationBinding> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<VThemeAnimationBinding>) {
    createAnimation(el, binding)
  },

  updated(el: HTMLElement, binding: DirectiveBinding<VThemeAnimationBinding>) {
    updateAnimation(el, binding)
  },

  unmounted(el: HTMLElement) {
    removeAnimation(el)
  },
}

/**
 * 创建动画
 */
function createAnimation(
  el: HTMLElement,
  binding: DirectiveBinding<VThemeAnimationBinding>,
) {
  const {
    animation,
    autoplay = true,
    trigger = 'manual',
    once = false,
  } = binding.value

  if (!animation) {
    return
  }

  try {
    let animationConfig: AnimationConfig

    if (typeof animation === 'string') {
      // 字符串类型，创建默认配置
      animationConfig = {
        name: animation,
        type: 'css',
        duration: 1000,
        iterations: 1,
        keyframes: [],
      }
    }
    else {
      // 对象类型，使用提供的配置
      animationConfig = animation
    }

    // 创建动画实例
    const animationInstance = AnimationFactory.create(animationConfig, [el])

    // 存储动画实例
    animationMap.set(el, {
      instance: animationInstance,
      config: binding.value,
      hasPlayed: false,
    })

    // 处理自动播放
    if (autoplay && trigger === 'manual') {
      animationInstance.start()

      if (once) {
        animationMap.get(el)!.hasPlayed = true
      }
    }

    // 设置触发器
    setupTrigger(el, binding, animationInstance)
  }
  catch (error) {
    console.error('[v-theme-animation] Failed to create animation:', error)
  }
}

/**
 * 更新动画
 */
function updateAnimation(
  el: HTMLElement,
  binding: DirectiveBinding<VThemeAnimationBinding>,
) {
  const animationData = animationMap.get(el)

  if (!animationData) {
    // 如果没有动画实例，创建新的
    createAnimation(el, binding)
    return
  }

  const { instance } = animationData
  const { animation } = binding.value

  // 更新动画配置
  if (typeof animation === 'object') {
    instance.updateConfig(animation)
  }

  // 更新配置
  animationData.config = binding.value

  // 重新设置触发器
  setupTrigger(el, binding, instance)
}

/**
 * 移除动画
 */
function removeAnimation(el: HTMLElement) {
  const animationData = animationMap.get(el)

  if (animationData) {
    animationData.instance.destroy()
    animationMap.delete(el)
  }
}

/**
 * 设置动画触发器
 */
function setupTrigger(
  el: HTMLElement,
  binding: DirectiveBinding<VThemeAnimationBinding>,
  animationInstance: any,
) {
  const { trigger = 'manual', once = false } = binding.value
  const animationData = animationMap.get(el)!

  // 清除之前的事件监听器
  el.removeEventListener('mouseenter', handleMouseEnter)
  el.removeEventListener('click', handleClick)

  function handleMouseEnter() {
    if (once && animationData.hasPlayed)
      return

    animationInstance.start()

    if (once) {
      animationData.hasPlayed = true
    }
  }

  function handleClick() {
    if (once && animationData.hasPlayed)
      return

    animationInstance.start()

    if (once) {
      animationData.hasPlayed = true
    }
  }

  function handleVisible() {
    if (once && animationData.hasPlayed)
      return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animationInstance.start()

          if (once) {
            animationData.hasPlayed = true
            observer.disconnect()
          }
        }
      })
    })

    observer.observe(el)

    // 存储观察器以便清理
    animationData.observer = observer
  }

  // 根据触发器类型设置事件监听器
  switch (trigger) {
    case 'hover':
      el.addEventListener('mouseenter', handleMouseEnter)
      break

    case 'click':
      el.addEventListener('click', handleClick)
      break

    case 'visible':
      handleVisible()
      break

    case 'manual':
    default:
      // 手动触发，不设置事件监听器
      break
  }

  // 处理修饰符
  handleModifiers(el, binding, animationInstance)
}

/**
 * 处理指令修饰符
 */
function handleModifiers(
  el: HTMLElement,
  binding: DirectiveBinding<VThemeAnimationBinding>,
  animationInstance: any,
) {
  const { modifiers } = binding

  // .loop 修饰符 - 循环播放
  if (modifiers.loop) {
    const config = animationInstance.getConfig()
    config.iterations = 'infinite'
    animationInstance.updateConfig(config)
  }

  // .reverse 修饰符 - 反向播放
  if (modifiers.reverse) {
    const config = animationInstance.getConfig()
    config.direction = 'reverse'
    animationInstance.updateConfig(config)
  }

  // .alternate 修饰符 - 交替播放
  if (modifiers.alternate) {
    const config = animationInstance.getConfig()
    config.direction = 'alternate'
    animationInstance.updateConfig(config)
  }

  // .slow 修饰符 - 慢速播放
  if (modifiers.slow) {
    const config = animationInstance.getConfig()
    config.duration = (config.duration || 1000) * 2
    animationInstance.updateConfig(config)
  }

  // .fast 修饰符 - 快速播放
  if (modifiers.fast) {
    const config = animationInstance.getConfig()
    config.duration = (config.duration || 1000) / 2
    animationInstance.updateConfig(config)
  }

  // .delay 修饰符 - 延迟播放
  if (modifiers.delay) {
    const delay = Number.parseInt(binding.arg || '1000', 10)
    const config = animationInstance.getConfig()
    config.delay = delay
    animationInstance.updateConfig(config)
  }
}

/**
 * 获取元素的动画实例
 */
export function getElementAnimation(el: HTMLElement) {
  const animationData = animationMap.get(el)
  return animationData?.instance
}

/**
 * 检查元素是否有动画
 */
export function hasElementAnimation(el: HTMLElement): boolean {
  return animationMap.has(el)
}

/**
 * 手动触发元素动画
 */
export function triggerElementAnimation(el: HTMLElement) {
  const animationData = animationMap.get(el)

  if (animationData) {
    const { instance, config } = animationData

    if (config.once && animationData.hasPlayed) {
      return
    }

    instance.start()

    if (config.once) {
      animationData.hasPlayed = true
    }
  }
}

/**
 * 停止元素动画
 */
export function stopElementAnimation(el: HTMLElement) {
  const animationData = animationMap.get(el)

  if (animationData) {
    animationData.instance.stop()
  }
}

/**
 * 暂停元素动画
 */
export function pauseElementAnimation(el: HTMLElement) {
  const animationData = animationMap.get(el)

  if (animationData) {
    animationData.instance.pause()
  }
}

/**
 * 恢复元素动画
 */
export function resumeElementAnimation(el: HTMLElement) {
  const animationData = animationMap.get(el)

  if (animationData) {
    animationData.instance.resume()
  }
}

/**
 * 清除所有动画
 */
export function clearAllAnimations() {
  for (const [el, animationData] of animationMap.entries()) {
    animationData.instance.destroy()

    // 清理观察器
    if (animationData.observer) {
      animationData.observer.disconnect()
    }

    animationMap.delete(el)
  }
}

export default vThemeAnimation
