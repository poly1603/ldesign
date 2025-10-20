/**
 * 性能优化工具函数
 * 减少主线程工作，提升响应性
 */

/**
 * 防抖函数 - 延迟执行
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args)
      timeoutId = null
    }, wait)
  }
}

/**
 * 节流函数 - 限制执行频率
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * requestAnimationFrame 节流
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (rafId) return

    rafId = requestAnimationFrame(() => {
      func.apply(this, args)
      rafId = null
    })
  }
}

/**
 * 延迟执行 - 使用 requestIdleCallback
 */
export function runWhenIdle(callback: IdleRequestCallback, options?: IdleRequestOptions) {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(callback, options)
  } else {
    return setTimeout(callback, 1)
  }
}

/**
 * 分片执行 - 将大任务分成小块
 */
export async function chunk<T>(
  items: T[],
  processor: (item: T, index: number) => void | Promise<void>,
  chunkSize: number = 10
): Promise<void> {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunkItems = items.slice(i, i + chunkSize)

    // 处理当前块
    await Promise.all(
      chunkItems.map((item, index) => processor(item, i + index))
    )

    // 让出主线程
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

/**
 * 懒加载图片观察器
 */
export function createLazyImageObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute('data-src')
          }
        }
      })
    },
    {
      rootMargin: '50px',
      threshold: 0.01
    }
  )
}

/**
 * 预加载关键资源
 */
export function preloadResource(href: string, as: string) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = href
  document.head.appendChild(link)
}

/**
 * 预连接到域名
 */
export function preconnect(url: string, crossorigin: boolean = false) {
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = url
  if (crossorigin) {
    link.crossOrigin = 'anonymous'
  }
  document.head.appendChild(link)
}

/**
 * 内存优化 - 清理未使用的对象
 */
export function clearUnusedMemory() {
  // 清理性能条目
  if (typeof performance !== 'undefined' && performance.clearResourceTimings) {
    performance.clearResourceTimings()
  }

  // 清理标记和测量
  if (typeof performance !== 'undefined' && performance.clearMarks) {
    performance.clearMarks()
    performance.clearMeasures?.()
  }
}

/**
 * 使用 Web Worker 执行计算密集型任务
 */
export function runInWorker<T>(
  fn: (...args: any[]) => T,
  ...args: any[]
): Promise<T> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([`
      self.onmessage = function(e) {
        try {
          const fn = ${fn.toString()};
          const result = fn(...e.data);
          self.postMessage({ result });
        } catch (error) {
          self.postMessage({ error: error.message });
        }
      }
    `], { type: 'application/javascript' })

    const worker = new Worker(URL.createObjectURL(blob))

    worker.onmessage = (e) => {
      if (e.data.error) {
        reject(new Error(e.data.error))
      } else {
        resolve(e.data.result)
      }
      worker.terminate()
      URL.revokeObjectURL(blob.toString())
    }

    worker.onerror = (error) => {
      reject(error)
      worker.terminate()
    }

    worker.postMessage(args)
  })
}












