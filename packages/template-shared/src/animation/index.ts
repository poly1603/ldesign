/**
 * 动画工具模块
 * 跨框架共享的动画函数
 */

/**
 * 缓动函数类型
 */
export type EasingFunction = (t: number) => number

/**
 * 预定义缓动函数
 */
export const EASING_FUNCTIONS: Record<string, EasingFunction> = {
  // 线性
  linear: (t) => t,

  // Quad
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  // Cubic
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // Quart
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,

  // Quint
  easeInQuint: (t) => t * t * t * t * t,
  easeOutQuint: (t) => 1 + (--t) * t * t * t * t,
  easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,

  // Sine
  easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Expo
  easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
  easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t) => {
    if (t === 0) return 0
    if (t === 1) return 1
    return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2
  },

  // Circ
  easeInCirc: (t) => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: (t) => Math.sqrt(1 - (--t) * t),
  easeInOutCirc: (t) => {
    return t < 0.5
      ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
      : (Math.sqrt(1 - (t * 2 - 2) * (t * 2 - 2)) + 1) / 2
  },

  // Elastic
  easeInElastic: (t) => {
    if (t === 0) return 0
    if (t === 1) return 1
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3))
  },
  easeOutElastic: (t) => {
    if (t === 0) return 0
    if (t === 1) return 1
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1
  },
  easeInOutElastic: (t) => {
    if (t === 0) return 0
    if (t === 1) return 1
    const c = (2 * Math.PI) / 4.5
    return t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c)) / 2 + 1
  },

  // Back
  easeInBack: (t) => {
    const c = 1.70158
    return (c + 1) * t * t * t - c * t * t
  },
  easeOutBack: (t) => {
    const c = 1.70158
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)
  },
  easeInOutBack: (t) => {
    const c = 1.70158 * 1.525
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2
  },

  // Bounce
  easeInBounce: (t) => 1 - EASING_FUNCTIONS.easeOutBounce(1 - t),
  easeOutBounce: (t) => {
    const n = 7.5625
    const d = 2.75

    if (t < 1 / d) {
      return n * t * t
    } else if (t < 2 / d) {
      return n * (t -= 1.5 / d) * t + 0.75
    } else if (t < 2.5 / d) {
      return n * (t -= 2.25 / d) * t + 0.9375
    } else {
      return n * (t -= 2.625 / d) * t + 0.984375
    }
  },
  easeInOutBounce: (t) => {
    return t < 0.5
      ? EASING_FUNCTIONS.easeInBounce(t * 2) / 2
      : EASING_FUNCTIONS.easeOutBounce(t * 2 - 1) / 2 + 0.5
  },
}

/**
 * 动画配置
 */
export interface AnimationConfig {
  /** 动画时长（毫秒） */
  duration?: number
  /** 缓动函数 */
  easing?: string | EasingFunction
  /** 延迟（毫秒） */
  delay?: number
  /** 动画结束回调 */
  onComplete?: () => void
  /** 动画更新回调 */
  onUpdate?: (progress: number) => void
  /** 动画开始回调 */
  onStart?: () => void
}

/**
 * 创建动画
 */
export function createAnimation(config: AnimationConfig): {
  start: () => void
  stop: () => void
  pause: () => void
  resume: () => void
} {
  const {
    duration = 300,
    easing = 'easeInOutQuad',
    delay = 0,
    onComplete,
    onUpdate,
    onStart,
  } = config

  let startTime: number | null = null
  let pauseTime: number | null = null
  let animationId: number | null = null
  let isPaused = false
  let isStopped = false

  const easingFn = typeof easing === 'string' ? EASING_FUNCTIONS[easing] : easing

  const animate = (timestamp: number) => {
    if (isStopped) return

    if (startTime === null) {
      startTime = timestamp
      onStart?.()
    }

    const elapsed = timestamp - startTime - (pauseTime || 0)
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easingFn(progress)

    onUpdate?.(easedProgress)

    if (progress < 1 && !isPaused) {
      animationId = requestAnimationFrame(animate)
    } else if (progress >= 1) {
      onComplete?.()
    }
  }

  return {
    start() {
      isStopped = false
      isPaused = false
      startTime = null
      pauseTime = null

      if (delay > 0) {
        setTimeout(() => {
          animationId = requestAnimationFrame(animate)
        }, delay)
      } else {
        animationId = requestAnimationFrame(animate)
      }
    },

    stop() {
      isStopped = true
      if (animationId !== null) {
        cancelAnimationFrame(animationId)
        animationId = null
      }
    },

    pause() {
      if (!isPaused && animationId !== null) {
        isPaused = true
        pauseTime = performance.now()
        cancelAnimationFrame(animationId)
        animationId = null
      }
    },

    resume() {
      if (isPaused) {
        isPaused = false
        animationId = requestAnimationFrame(animate)
      }
    },
  }
}

/**
 * 插值函数
 */
export function interpolate(
  from: number,
  to: number,
  progress: number
): number {
  return from + (to - from) * progress
}

/**
 * 颜色插值
 */
export function interpolateColor(
  from: string,
  to: string,
  progress: number
): string {
  // 解析颜色
  const parseColor = (color: string): [number, number, number] => {
    if (color.startsWith('#')) {
      const hex = color.slice(1)
      if (hex.length === 3) {
        return [
          parseInt(hex[0] + hex[0], 16),
          parseInt(hex[1] + hex[1], 16),
          parseInt(hex[2] + hex[2], 16),
        ]
      }
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ]
    }
    // 简化处理，只支持hex颜色
    return [0, 0, 0]
  }

  const [r1, g1, b1] = parseColor(from)
  const [r2, g2, b2] = parseColor(to)

  const r = Math.round(interpolate(r1, r2, progress))
  const g = Math.round(interpolate(g1, g2, progress))
  const b = Math.round(interpolate(b1, b2, progress))

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * 弹簧动画配置
 */
export interface SpringConfig {
  /** 刚度 */
  stiffness?: number
  /** 阻尼 */
  damping?: number
  /** 质量 */
  mass?: number
  /** 初始速度 */
  velocity?: number
}

/**
 * 弹簧动画
 */
export function spring(
  from: number,
  to: number,
  config: SpringConfig = {}
): (t: number) => number {
  const {
    stiffness = 170,
    damping = 26,
    mass = 1,
    velocity = 0,
  } = config

  const w0 = Math.sqrt(stiffness / mass)
  const zeta = damping / (2 * Math.sqrt(stiffness * mass))
  const wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0
  const a = 1
  const b = zeta < 1 ? (zeta * w0 + velocity) / wd : -velocity + w0

  return (t: number) => {
    if (zeta < 1) {
      // 欠阻尼
      const progress = Math.exp(-t * zeta * w0) * (
        a * Math.cos(wd * t) + b * Math.sin(wd * t)
      )
      return to - (to - from) * progress
    } else {
      // 临界阻尼或过阻尼
      const progress = (a + b * t) * Math.exp(-t * w0)
      return to - (to - from) * progress
    }
  }
}

/**
 * 贝塞尔曲线
 */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): EasingFunction {
  // 简化实现，实际应该用牛顿迭代法
  return (t: number) => {
    const cx = 3 * x1
    const bx = 3 * (x2 - x1) - cx
    const ax = 1 - cx - bx
    const cy = 3 * y1
    const by = 3 * (y2 - y1) - cy
    const ay = 1 - cy - by

    const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t
    const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t

    // 二分查找
    let start = 0
    let end = 1
    let mid = t

    for (let i = 0; i < 10; i++) {
      const x = sampleCurveX(mid)
      if (Math.abs(x - t) < 0.001) break

      if (x < t) {
        start = mid
      } else {
        end = mid
      }
      mid = (start + end) / 2
    }

    return sampleCurveY(mid)
  }
}

export default {}
