/**
 * v-intersect 指令
 * 在元素进入可视区域时触发回调，支持 once/delay/options 配置。
 *
 * 使用示例：
 * <div v-intersect="() => loadMore()" />
 * <div v-intersect="{ callback: () => loadMore(), once: true, delay: 100, options: { rootMargin: '0px 0px 100px 0px' } }" />
 */
import type { Directive } from 'vue'

interface IntersectValue {
  callback: (entry: IntersectionObserverEntry) => void
  options?: { root?: Element | null, rootMargin?: string, threshold?: number }
  once?: boolean
  delay?: number
}

export const vIntersect: Directive<HTMLElement, ((entry: IntersectionObserverEntry) => void) | IntersectValue> = {
  mounted(el, binding) {
    const val = binding.value as IntersectValue | ((e: IntersectionObserverEntry) => void)
    const cb = typeof val === 'function' ? val : val?.callback
    const opts = typeof val === 'object' && 'options' in (val || {}) ? (val as IntersectValue).options : undefined
    const once = typeof val === 'object' && 'once' in (val || {}) ? (val as IntersectValue).once : false
    const delay = typeof val === 'object' && 'delay' in (val || {}) ? (val as IntersectValue).delay : 0
    if (!cb)
      return

    const root = opts?.root ?? null
    const rootMargin = opts?.rootMargin ?? '0px'
    const threshold = opts?.threshold ?? 0

    const handler = (entry: IntersectionObserverEntry) => {
      const run = () => cb(entry)
      if (delay && delay > 0) {
        setTimeout(run, delay)
      }
      else {
        run()
      }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          handler(entry)
          if (once) {
            observer.disconnect()
          }
        }
      })
    }, { root, rootMargin, threshold })

    ;(el as any).__io__ = observer
    observer.observe(el)
  },
  unmounted(el) {
    const obs: IntersectionObserver | undefined = (el as any).__io__
    obs?.disconnect()
    delete (el as any).__io__
  },
}
