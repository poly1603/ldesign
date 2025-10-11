/**
 * 缓动函数库
 * 提供丰富的动画缓动函数
 */

/**
 * 缓动函数类型
 */
export type EasingFunction = (t: number) => number

/**
 * 线性缓动
 */
export const linear: EasingFunction = (t: number) => t

/**
 * 二次缓动
 */
export const easeInQuad: EasingFunction = (t: number) => t * t
export const easeOutQuad: EasingFunction = (t: number) => t * (2 - t)
export const easeInOutQuad: EasingFunction = (t: number) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

/**
 * 三次缓动
 */
export const easeInCubic: EasingFunction = (t: number) => t * t * t
export const easeOutCubic: EasingFunction = (t: number) => (--t) * t * t + 1
export const easeInOutCubic: EasingFunction = (t: number) =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1

/**
 * 四次缓动
 */
export const easeInQuart: EasingFunction = (t: number) => t * t * t * t
export const easeOutQuart: EasingFunction = (t: number) => 1 - (--t) * t * t * t
export const easeInOutQuart: EasingFunction = (t: number) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t

/**
 * 五次缓动
 */
export const easeInQuint: EasingFunction = (t: number) => t * t * t * t * t
export const easeOutQuint: EasingFunction = (t: number) => 1 + (--t) * t * t * t * t
export const easeInOutQuint: EasingFunction = (t: number) =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t

/**
 * 正弦缓动
 */
export const easeInSine: EasingFunction = (t: number) =>
  1 - Math.cos((t * Math.PI) / 2)
export const easeOutSine: EasingFunction = (t: number) =>
  Math.sin((t * Math.PI) / 2)
export const easeInOutSine: EasingFunction = (t: number) =>
  -(Math.cos(Math.PI * t) - 1) / 2

/**
 * 指数缓动
 */
export const easeInExpo: EasingFunction = (t: number) =>
  t === 0 ? 0 : Math.pow(2, 10 * t - 10)
export const easeOutExpo: EasingFunction = (t: number) =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
export const easeInOutExpo: EasingFunction = (t: number) => {
  if (t === 0) return 0
  if (t === 1) return 1
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2
}

/**
 * 圆形缓动
 */
export const easeInCirc: EasingFunction = (t: number) =>
  1 - Math.sqrt(1 - t * t)
export const easeOutCirc: EasingFunction = (t: number) =>
  Math.sqrt(1 - (t - 1) * (t - 1))
export const easeInOutCirc: EasingFunction = (t: number) =>
  t < 0.5
    ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
    : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2

/**
 * 回弹缓动
 */
export const easeInBack: EasingFunction = (t: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return c3 * t * t * t - c1 * t * t
}
export const easeOutBack: EasingFunction = (t: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
export const easeInOutBack: EasingFunction = (t: number) => {
  const c1 = 1.70158
  const c2 = c1 * 1.525
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
}

/**
 * 弹性缓动
 */
export const easeInElastic: EasingFunction = (t: number) => {
  const c4 = (2 * Math.PI) / 3
  return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
}
export const easeOutElastic: EasingFunction = (t: number) => {
  const c4 = (2 * Math.PI) / 3
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}
export const easeInOutElastic: EasingFunction = (t: number) => {
  const c5 = (2 * Math.PI) / 4.5
  return t === 0
    ? 0
    : t === 1
      ? 1
      : t < 0.5
        ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
        : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1
}

/**
 * 弹跳缓动
 */
export const easeOutBounce: EasingFunction = (t: number) => {
  const n1 = 7.5625
  const d1 = 2.75

  if (t < 1 / d1) {
    return n1 * t * t
  }
  else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75
  }
  else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375
  }
  else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  }
}
export const easeInBounce: EasingFunction = (t: number) =>
  1 - easeOutBounce(1 - t)
export const easeInOutBounce: EasingFunction = (t: number) =>
  t < 0.5
    ? (1 - easeOutBounce(1 - 2 * t)) / 2
    : (1 + easeOutBounce(2 * t - 1)) / 2

/**
 * 所有缓动函数集合
 */
export const easingFunctions = {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInBack,
  easeOutBack,
  easeInOutBack,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce,
} as const

/**
 * 缓动函数名称类型
 */
export type EasingName = keyof typeof easingFunctions

/**
 * 获取缓动函数
 */
export function getEasingFunction(name: EasingName | EasingFunction): EasingFunction {
  if (typeof name === 'function') {
    return name
  }
  return easingFunctions[name] || linear
}

/**
 * 创建贝塞尔曲线缓动函数
 */
export function createBezierEasing(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): EasingFunction {
  // 简化的贝塞尔曲线实现
  return (t: number) => {
    // 使用牛顿法求解
    let currentT = t
    for (let i = 0; i < 4; i++) {
      const currentX = bezier(currentT, x1, x2)
      const currentSlope = bezierSlope(currentT, x1, x2)
      if (currentSlope === 0) return bezier(currentT, y1, y2)
      const newT = currentT - (currentX - t) / currentSlope
      currentT = newT
    }
    return bezier(currentT, y1, y2)
  }
}

function bezier(t: number, a: number, b: number): number {
  return 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t
}

function bezierSlope(t: number, a: number, b: number): number {
  return 3 * (1 - t) * (1 - t) * a + 6 * (1 - t) * t * (b - a) + 3 * t * t * (1 - b)
}

/**
 * 创建步进缓动函数
 */
export function createStepsEasing(steps: number): EasingFunction {
  return (t: number) => Math.floor(t * steps) / steps
}
