/**
 * 缓动函数模块
 *
 * @description
 * 提供各种缓动函数，用于动画和过渡效果。
 * 这些函数遵循标准的缓动函数接口，可用于自定义动画实现。
 *
 * 参考自: https://github.com/bameyrick/js-easing-functions/blob/master/src/index.ts
 * 更多缓动函数可参考: https://easings.net/
 */

/**
 * 缓动函数接口
 *
 * @param current - 当前时间（0 到 duration 之间）
 * @param start - 起始值
 * @param end - 结束值
 * @param duration - 动画持续时间
 * @returns 当前时间点的插值结果
 */
export interface EasingFunction {
  (current: number, start: number, end: number, duration: number): number
}

/**
 * 线性缓动函数
 *
 * @description 匀速运动，没有加速或减速
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 *
 * @example
 * ```typescript
 * // 创建一个从 0 到 100 的线性动画，持续 1000ms
 * const value = linear(500, 0, 100, 1000) // 返回 50
 * ```
 */
export const linear: EasingFunction = (current, start, end, duration) => {
  const change = end - start
  const offset = (change * current) / duration
  return offset + start
}

/**
 * 三次方缓入缓出函数
 *
 * @description 开始和结束时缓慢，中间加速
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 *
 * @example
 * ```typescript
 * // 创建一个平滑的缓入缓出动画
 * const value = easeInOutCubic(500, 0, 100, 1000)
 * ```
 */
export const easeInOutCubic: EasingFunction = (current, start, end, duration) => {
  const change = (end - start) / 2
  let time = current / (duration / 2)
  if (time < 1) {
    return change * time * time * time + start
  }
  time -= 2

  return change * (time * time * time + 2) + start
}

/**
 * 二次方缓入函数
 *
 * @description 开始时缓慢，然后加速
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export const easeInQuad: EasingFunction = (current, start, end, duration) => {
  const change = end - start
  const time = current / duration
  return change * time * time + start
}

/**
 * 二次方缓出函数
 *
 * @description 开始时快速，然后减速
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export const easeOutQuad: EasingFunction = (current, start, end, duration) => {
  const change = end - start
  const time = current / duration
  return -change * time * (time - 2) + start
}

/**
 * 二次方缓入缓出函数
 *
 * @description 开始和结束时缓慢，中间加速
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export const easeInOutQuad: EasingFunction = (current, start, end, duration) => {
  const change = end - start
  let time = current / (duration / 2)
  if (time < 1) {
    return change / 2 * time * time + start
  }
  time--
  return -change / 2 * (time * (time - 2) - 1) + start
}

/**
 * 三次方缓入函数
 *
 * @description 开始时非常缓慢，然后快速加速
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export const easeInCubic: EasingFunction = (current, start, end, duration) => {
  const change = end - start
  const time = current / duration
  return change * time * time * time + start
}

/**
 * 三次方缓出函数
 *
 * @description 开始时快速，然后缓慢减速
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export const easeOutCubic: EasingFunction = (current, start, end, duration) => {
  const change = end - start
  const time = current / duration - 1
  return change * (time * time * time + 1) + start
}

/**
 * 弹性缓入函数
 *
 * @description 开始时有弹性效果，然后加速
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export const easeInElastic: EasingFunction = (current, start, end, duration) => {
  if (current === 0) return start
  if ((current /= duration) === 1) return start + end

  const period = duration * 0.3
  const amplitude = end
  const s = period / 4

  return -(amplitude * Math.pow(2, 10 * (current -= 1)) * Math.sin((current * duration - s) * (2 * Math.PI) / period)) + start
}

/**
 * 弹性缓出函数
 *
 * @description 快速到达目标，然后有弹性效果
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export const easeOutElastic: EasingFunction = (current, start, end, duration) => {
  if (current === 0) return start
  if ((current /= duration) === 1) return start + end

  const period = duration * 0.3
  const amplitude = end
  const s = period / 4

  return amplitude * Math.pow(2, -10 * current) * Math.sin((current * duration - s) * (2 * Math.PI) / period) + end + start
}

/**
 * 回弹缓出函数
 *
 * @description 超过目标值然后回弹到目标位置
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export const easeOutBack: EasingFunction = (current, start, end, duration) => {
  const s = 1.70158
  const time = current / duration - 1
  return end * (time * time * ((s + 1) * time + s) + 1) + start
}

/**
 * 回弹缓入函数
 *
 * @description 先向后移动，然后加速向前
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export const easeInBack: EasingFunction = (current, start, end, duration) => {
  const s = 1.70158
  const time = current / duration
  return end * time * time * ((s + 1) * time - s) + start
}

/**
 * 弹跳缓出函数
 *
 * @description 模拟球弹跳的效果
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export const easeOutBounce: EasingFunction = (current, start, end, duration) => {
  let time = current / duration
  if (time < (1 / 2.75)) {
    return end * (7.5625 * time * time) + start
  } else if (time < (2 / 2.75)) {
    return end * (7.5625 * (time -= (1.5 / 2.75)) * time + 0.75) + start
  } else if (time < (2.5 / 2.75)) {
    return end * (7.5625 * (time -= (2.25 / 2.75)) * time + 0.9375) + start
  } else {
    return end * (7.5625 * (time -= (2.625 / 2.75)) * time + 0.984375) + start
  }
}

/**
 * 缓动函数集合
 *
 * @description 包含所有可用的缓动函数，便于统一管理和使用
 */
export const easingFunctions = {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInElastic,
  easeOutElastic,
  easeInBack,
  easeOutBack,
  easeOutBounce,
} as const

/**
 * 缓动函数名称类型
 */
export type EasingName = keyof typeof easingFunctions

/**
 * 根据名称获取缓动函数
 *
 * @param name - 缓动函数名称
 * @returns 对应的缓动函数
 *
 * @example
 * ```typescript
 * const easingFn = getEasingFunction('easeInOutCubic')
 * const value = easingFn(500, 0, 100, 1000)
 * ```
 */
export function getEasingFunction(name: EasingName): EasingFunction {
  return easingFunctions[name]
}

/**
 * 创建动画帧函数
 *
 * @param from - 起始值
 * @param to - 结束值
 * @param duration - 持续时间（毫秒）
 * @param easing - 缓动函数名称或函数
 * @param onUpdate - 更新回调函数
 * @param onComplete - 完成回调函数（可选）
 * @returns 取消动画的函数
 *
 * @example
 * ```typescript
 * const cancelAnimation = animate(0, 100, 1000, 'easeInOutCubic', (value) => {
 *   element.style.left = `${value}px`
 * }, () => {
 *   
 * })
 *
 * // 如需取消动画
 * // cancelAnimation()
 * ```
 */
export function animate(
  from: number,
  to: number,
  duration: number,
  easing: EasingName | EasingFunction,
  onUpdate: (value: number) => void,
  onComplete?: () => void
): () => void {
  const easingFn = typeof easing === 'string' ? getEasingFunction(easing) : easing
  const startTime = Date.now()
  let animationId: number

  function frame() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed, duration)

    const value = easingFn(progress, from, to, duration)
    onUpdate(value)

    if (progress < duration) {
      animationId = requestAnimationFrame(frame)
    } else {
      onComplete?.()
    }
  }

  animationId = requestAnimationFrame(frame)

  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }
}
