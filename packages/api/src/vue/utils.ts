/**
 * 简单的 IntersectionObserver 工具
 *
 * @param target 观察的目标元素 Ref
 * @param onIntersect 进入可视区域时触发的回调
 * @param options 观察选项
 * @returns stop 函数用于停止观察
 */
import type { Ref } from 'vue'
import { onUnmounted, watch } from 'vue'

export interface UseIntersectionOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number
}

export function useIntersectionObserver(
  target: Ref<Element | null>,
  onIntersect: (entry: IntersectionObserverEntry) => void,
  options: UseIntersectionOptions = {},
) {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return { stop: () => {} }
  }

  const root = options.root ?? null
  const rootMargin = options.rootMargin ?? '0px'
  const threshold = options.threshold ?? 0

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => entry.isIntersecting && onIntersect(entry))
  }, { root, rootMargin, threshold })

  const start = () => {
    const el = target.value
    if (el) observer.observe(el)
  }

  start()
  const stopWatch = watch(target, (el, old) => {
    if (old) observer.unobserve(old)
    if (el) observer.observe(el)
  })

  onUnmounted(() => {
    observer.disconnect()
    stopWatch()
  })

  return { stop: () => { observer.disconnect(); stopWatch() } }
}

