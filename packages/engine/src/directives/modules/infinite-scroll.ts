/**
 * 无限滚动指令
 * 当滚动到底部时触发加载更多数据
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective, directiveUtils } from '../base/vue-directive-adapter'

export interface InfiniteScrollOptions {
  callback?: () => void | Promise<void>
  distance?: number
  disabled?: boolean
  immediate?: boolean
  container?: string | HTMLElement
  delay?: number
}

export class InfiniteScrollDirective extends DirectiveBase {
  constructor() {
    super({
      name: 'infinite-scroll',
      description: '无限滚动加载更多数据',
      version: '1.0.0',
      category: 'interaction',
      tags: ['infinite', 'scroll', 'load-more', 'pagination'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    if (!config.callback || typeof config.callback !== 'function') {
      this.warn('Infinite scroll directive requires a callback function')
      return
    }

    const distance = config.distance ?? 100
    const delay = config.delay ?? 200
    const container = this.getContainer(el, config.container)

    let isLoading = false
    let timeoutId: NodeJS.Timeout | null = null

    const handleScroll = async () => {
      if (config.disabled || isLoading) return

      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null // 释放引用
      }

      // Debounce the scroll handler
      timeoutId = setTimeout(async () => {
        const scrollTop = container === window ?
          window.pageYOffset || document.documentElement.scrollTop :
          (container as HTMLElement).scrollTop

        const scrollHeight = container === window ?
          document.documentElement.scrollHeight :
          (container as HTMLElement).scrollHeight

        const clientHeight = container === window ?
          window.innerHeight :
          (container as HTMLElement).clientHeight

        if (scrollTop + clientHeight >= scrollHeight - distance) {
          isLoading = true
          try {
            if (config.callback) {
              await config.callback()
            }
          } catch (error) {
            this.warn('Error in infinite scroll callback:', error)
          } finally {
            isLoading = false
          }
        }
        timeoutId = null // 清理引用
      }, delay)
    }

    // Store handler and container for cleanup
    directiveUtils.storeData(el, 'infinite-scroll-handler', handleScroll)
    directiveUtils.storeData(el, 'infinite-scroll-container', container)
    directiveUtils.storeData(el, 'infinite-scroll-timeout', timeoutId)

    // Add scroll listener
    container.addEventListener('scroll', handleScroll, { passive: true })

    // Execute immediately if specified
    if (config.immediate) {
      handleScroll()
    }

    this.log('Infinite scroll directive mounted', el)
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    // Clean up old listener
    this.cleanup(el)

    // Re-mount with new config
    this.mounted(el, binding)

    this.log('Infinite scroll directive updated', el)
  }

  public unmounted(el: HTMLElement): void {
    this.cleanup(el)
    this.log('Infinite scroll directive unmounted', el)
  }

  private cleanup(el: HTMLElement): void {
    const handler = directiveUtils.getData(el, 'infinite-scroll-handler')
    const container = directiveUtils.getData(el, 'infinite-scroll-container')
    const timeout = directiveUtils.getData(el, 'infinite-scroll-timeout')

    // 清理事件监听器
    if (handler && container) {
      const typedContainer = container as HTMLElement | Window
      typedContainer.removeEventListener('scroll', handler as EventListener)
    }

    // 清理定时器
    if (timeout) {
      clearTimeout(timeout as NodeJS.Timeout)
    }

    // 清理存储的数据，避免内存泄漏
    directiveUtils.removeData(el, 'infinite-scroll-handler')
    directiveUtils.removeData(el, 'infinite-scroll-container')
    directiveUtils.removeData(el, 'infinite-scroll-timeout')
    
    // 清理元素的引用
    if (el && typeof el === 'object') {
      (el as any).__infiniteScroll = null
    }
  }

  private getContainer(el: HTMLElement, container?: string | HTMLElement): HTMLElement | Window {
    if (!container) {
      return window
    }

    if (typeof container === 'string') {
      const containerEl = document.querySelector(container) as HTMLElement
      return containerEl || window
    }

    return container
  }

  private parseConfig(binding: VueDirectiveBinding): InfiniteScrollOptions {
    const value = binding.value

    if (typeof value === 'function') {
      return { callback: value as () => void | Promise<void> }
    }

    if (typeof value === 'object' && value !== null) {
      return value as InfiniteScrollOptions
    }

    return {}
  }

  public getExample(): string {
    return `
<!-- Basic infinite scroll -->
<div v-infinite-scroll="loadMore" class="list-container">
  <div v-for="item in items" :key="item.id" class="list-item">
    {{ item.name }}
  </div>
  <div v-if="loading" class="loading">Loading...</div>
</div>

<!-- With options -->
<div v-infinite-scroll="{
  callback: loadMoreData,
  distance: 200,
  delay: 300,
  immediate: true
}" class="scroll-container">
  <article v-for="post in posts" :key="post.id">
    {{ post.title }}
  </article>
</div>

<!-- Custom container -->
<div class="wrapper">
  <div 
    v-infinite-scroll="{
      callback: fetchMore,
      container: '.scroll-area',
      disabled: isDisabled
    }"
    class="scroll-area"
    style="height: 500px; overflow-y: auto;"
  >
    <div v-for="n in count" :key="n">
      Item {{ n }}
    </div>
  </div>
</div>

<script setup>
import { ref } from 'vue'

const items = ref([])
const loading = ref(false)
const hasMore = ref(true)

const loadMore = async () => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  try {
    const response = await fetch('/api/items?page=' + nextPage)
    const data = await response.json()
    items.value.push(...data.items)
    hasMore.value = data.hasMore
  } finally {
    loading.value = false
  }
}
</script>
    `
  }
}

// Export the directive definition
export const vInfiniteScroll = defineDirective(new InfiniteScrollDirective())

// Export default for convenience
export default vInfiniteScroll
