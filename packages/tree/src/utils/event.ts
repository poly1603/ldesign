/**
 * 事件处理工具函数
 */

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function (...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  
  return function (...args: Parameters<T>) {
    const now = Date.now()
    
    if (now - lastTime >= wait) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

/**
 * 事件委托
 */
export function delegate(
  container: HTMLElement,
  selector: string,
  event: string,
  handler: (event: Event, target: HTMLElement) => void
): () => void {
  const delegateHandler = (e: Event) => {
    const target = e.target as HTMLElement
    const delegateTarget = target.closest(selector) as HTMLElement
    
    if (delegateTarget && container.contains(delegateTarget)) {
      handler(e, delegateTarget)
    }
  }
  
  container.addEventListener(event, delegateHandler)
  
  return () => {
    container.removeEventListener(event, delegateHandler)
  }
}

/**
 * 一次性事件监听
 */
export function once(
  element: HTMLElement,
  event: string,
  handler: (event: Event) => void
): void {
  const onceHandler = (e: Event) => {
    handler(e)
    element.removeEventListener(event, onceHandler)
  }
  
  element.addEventListener(event, onceHandler)
}

/**
 * 阻止事件冒泡和默认行为
 */
export function stopEvent(event: Event): void {
  event.preventDefault()
  event.stopPropagation()
}
