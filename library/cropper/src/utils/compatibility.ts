/**
 * Browser compatibility utilities
 */

/**
 * Check if browser supports touch events
 */
export function supportsTouchEvents(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    ((window as any).DocumentTouch && document instanceof (window as any).DocumentTouch)
  )
}

/**
 * Check if browser supports pointer events
 */
export function supportsPointerEvents(): boolean {
  return 'PointerEvent' in window
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Check if device is tablet
 */
export function isTablet(): boolean {
  return /(iPad|Android(?!.*Mobile))/i.test(navigator.userAgent)
}

/**
 * Check if device is iOS
 */
export function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/**
 * Check if device is Android
 */
export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent)
}

/**
 * Check if browser supports passive events
 */
export function supportsPassiveEvents(): boolean {
  let passive = false

  try {
    const options = Object.defineProperty({}, 'passive', {
      get() {
        passive = true
        return true
      }
    })

    window.addEventListener('test', null as any, options)
    window.removeEventListener('test', null as any, options)
  } catch (e) {
    // Passive events not supported
  }

  return passive
}

/**
 * Get optimal event listener options
 */
export function getEventListenerOptions(
  passive = true
): boolean | AddEventListenerOptions {
  if (supportsPassiveEvents()) {
    return { passive, capture: false }
  }
  return false
}

/**
 * Check if browser supports ResizeObserver
 */
export function supportsResizeObserver(): boolean {
  return typeof ResizeObserver !== 'undefined'
}

/**
 * Check if browser supports IntersectionObserver
 */
export function supportsIntersectionObserver(): boolean {
  return typeof IntersectionObserver !== 'undefined'
}

/**
 * Check if browser supports requestAnimationFrame
 */
export function supportsRequestAnimationFrame(): boolean {
  return typeof requestAnimationFrame !== 'undefined'
}

/**
 * Request animation frame with fallback
 */
export function raf(callback: FrameRequestCallback): number {
  if (supportsRequestAnimationFrame()) {
    return requestAnimationFrame(callback)
  }
  return window.setTimeout(callback, 16) as unknown as number
}

/**
 * Cancel animation frame with fallback
 */
export function caf(id: number): void {
  if (supportsRequestAnimationFrame()) {
    cancelAnimationFrame(id)
  } else {
    clearTimeout(id)
  }
}

/**
 * Get device pixel ratio
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1
}

/**
 * Check if browser supports WebGL
 */
export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    )
  } catch (e) {
    return false
  }
}
