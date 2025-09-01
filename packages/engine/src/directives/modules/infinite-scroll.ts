/**
 * 无限滚动指令
 * 当滚动到底部时触发加载更多数据
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective } from '../base/vue-directive-adapter'

export interface InfiniteScrollOptions {
  callback: () => void | Promise<void>
  distance?: number
  delay?: number
  disabled?: boolean
  immediate?: boolean
  direction?: 'vertical' | 'horizontal'
  container?: string | HTMLElement | Window
  throttle?: number
  onLoad?: () => void
  onError?: (error: Error) => void
  loadingClass?: string
}

export class InfiniteScrollDirective extends DirectiveBase {
  constructor() {
    super({
      name: 'infinite-scroll',
      description: '无限滚动指令，滚动到底部时自动加载更多内容',
      version: '1.0.0',
      category: 'interaction',
      tags: ['infinite', 'scroll', 'loading', 'pagination'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    if (!config.callback || typeof config.callback !== 'function') {
      this.warn('infinite-scroll directive requires a callback function')
      return
    }

    // 存储配置
    el._infiniteScrollConfig = config

    // 如果未禁用，绑定滚动事件
    if (!config.disabled) {
      this.bindScrollEvent(el, config)
    }

    // 如果需要立即检查
    if (config.immediate) {
      this.checkAndLoad(el, config)
    }

    this.log('Infinite scroll directive mounted')
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)
    const oldConfig = el._infiniteScrollConfig

    // 更新配置
    el._infiniteScrollConfig = config

    // 如果禁用状态改变，重新绑定事件
    if (oldConfig?.disabled !== config.disabled) {
      this.unbindScrollEvent(el)
      if (!config.disabled) {
        this.bindScrollEvent(el, config)
      }
    }
  }

  public unmounted(el: HTMLElement): void {
    this.unbindScrollEvent(el)
    delete el._infiniteScrollConfig

    this.log('Infinite scroll directive unmounted')
  }

  private parseConfig(binding: VueDirectiveBinding): InfiniteScrollOptions {
    const value = binding.value

    if (typeof value === 'function') {
      return {
        callback: value,
        distance: 100,
        delay: 200,
        disabled: false,
        immediate: false,
        direction: 'vertical',
        container: window,
        throttle: 100,
      }
    }

    if (typeof value === 'object' && value !== null) {
      return {
        callback: value.callback || value.load,
        distance: value.distance || 100,
        delay: value.delay || 200,
        disabled: value.disabled || false,
        immediate: value.immediate || false,
        direction: value.direction || 'vertical',
        container: value.container || window,
        throttle: value.throttle || 100,
        onLoad: value.onLoad,
        onError: value.onError,
        loadingClass: value.loadingClass || 'infinite-loading',
      }
    }

    return {
      callback: () => {},
      distance: 100,
      delay: 200,
      disabled: false,
      immediate: false,
      direction: 'vertical',
      container: window,
      throttle: 100,
    }
  }

  private bindScrollEvent(
    el: HTMLElement,
    config: InfiniteScrollOptions
  ): void {
    const container = this.getScrollContainer(config.container!)
    const throttledHandler = this.createThrottledHandler(el, config)

    // 存储处理器和容器引用
    el._infiniteScrollHandler = throttledHandler
    el._infiniteScrollContainer = container

    // 绑定滚动事件
    container.addEventListener('scroll', throttledHandler, { passive: true })

    // 如果容器是window，还需要监听resize事件
    if (container === window) {
      window.addEventListener('resize', throttledHandler, { passive: true })
    }
  }

  private unbindScrollEvent(el: HTMLElement): void {
    const handler = el._infiniteScrollHandler
    const container = el._infiniteScrollContainer

    if (handler && container) {
      container.removeEventListener('scroll', handler)

      if (container === window) {
        window.removeEventListener('resize', handler)
      }
    }

    // 清理定时器
    if (el._infiniteScrollTimer) {
      clearTimeout(el._infiniteScrollTimer)
      delete el._infiniteScrollTimer
    }

    delete el._infiniteScrollHandler
    delete el._infiniteScrollContainer
  }

  private getScrollContainer(
    container: string | HTMLElement | Window
  ): HTMLElement | Window {
    if (container === window || !container) {
      return window
    }

    if (typeof container === 'string') {
      const element = document.querySelector(container)
      return (element as HTMLElement) || window
    }

    return container as HTMLElement
  }

  private createThrottledHandler(
    el: HTMLElement,
    config: InfiniteScrollOptions
  ): EventListener {
    let lastTime = 0

    return () => {
      const now = Date.now()

      if (now - lastTime < config.throttle!) {
        return
      }

      lastTime = now

      // 延迟检查
      if (el._infiniteScrollTimer) {
        clearTimeout(el._infiniteScrollTimer)
      }

      el._infiniteScrollTimer = window.setTimeout(() => {
        this.checkAndLoad(el, config)
      }, config.delay)
    }
  }

  private checkAndLoad(el: HTMLElement, config: InfiniteScrollOptions): void {
    // 如果已经在加载中，跳过
    if (el._infiniteScrollLoading) {
      return
    }

    // 检查是否需要加载
    if (this.shouldLoad(el, config)) {
      this.loadMore(el, config)
    }
  }

  private shouldLoad(el: HTMLElement, config: InfiniteScrollOptions): boolean {
    const container = el._infiniteScrollContainer
    if (!container) return false

    let scrollTop: number
    let scrollHeight: number
    let clientHeight: number

    if (container === window) {
      scrollTop = window.pageYOffset || document.documentElement.scrollTop
      scrollHeight = document.documentElement.scrollHeight
      clientHeight = window.innerHeight
    } else {
      const containerEl = container as HTMLElement
      scrollTop = containerEl.scrollTop
      scrollHeight = containerEl.scrollHeight
      clientHeight = containerEl.clientHeight
    }

    // 根据方向计算
    if (config.direction === 'vertical') {
      const distanceToBottom = scrollHeight - scrollTop - clientHeight
      return distanceToBottom <= config.distance!
    } else {
      // 水平滚动逻辑
      let scrollLeft: number
      let scrollWidth: number
      let clientWidth: number

      if (container === window) {
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
        scrollWidth = document.documentElement.scrollWidth
        clientWidth = window.innerWidth
      } else {
        const containerEl = container as HTMLElement
        scrollLeft = containerEl.scrollLeft
        scrollWidth = containerEl.scrollWidth
        clientWidth = containerEl.clientWidth
      }

      const distanceToRight = scrollWidth - scrollLeft - clientWidth
      return distanceToRight <= config.distance!
    }
  }

  private async loadMore(
    el: HTMLElement,
    config: InfiniteScrollOptions
  ): Promise<void> {
    // 设置加载状态
    el._infiniteScrollLoading = true

    // 添加加载样式
    if (config.loadingClass) {
      this.addClass(el, config.loadingClass)
    }

    try {
      // 执行回调
      await config.callback()

      // 触发加载完成回调
      config.onLoad?.()

      this.log('Infinite scroll load completed')
    } catch (error) {
      // 触发错误回调
      config.onError?.(error as Error)

      this.error_log('Infinite scroll load error:', error)
    } finally {
      // 清除加载状态
      el._infiniteScrollLoading = false

      // 移除加载样式
      if (config.loadingClass) {
        this.removeClass(el, config.loadingClass)
      }
    }
  }
}

// 创建Vue指令
export const vInfiniteScroll = defineDirective('infinite-scroll', {
  mounted(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = new InfiniteScrollDirective()
    directive.mounted(el, binding)

    if (!el._engineDirectives) {
      el._engineDirectives = new Map()
    }
    el._engineDirectives.set('infinite-scroll', directive)
  },

  updated(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = el._engineDirectives?.get(
      'infinite-scroll'
    ) as unknown as InfiniteScrollDirective
    if (directive) {
      directive.updated(el, binding)
    }
  },

  unmounted(el: HTMLElement) {
    const directive = el._engineDirectives?.get(
      'infinite-scroll'
    ) as unknown as InfiniteScrollDirective
    if (directive) {
      directive.unmounted(el)
      el._engineDirectives?.delete('infinite-scroll')
    }
  },
})

// 扩展HTMLElement类型
declare global {
  interface HTMLElement {
    _infiniteScrollConfig?: InfiniteScrollOptions
    _infiniteScrollHandler?: EventListener
    _infiniteScrollContainer?: HTMLElement | Window
    _infiniteScrollTimer?: number
    _infiniteScrollLoading?: boolean
  }
}

// 导出指令实例
export const infiniteScrollDirective = new InfiniteScrollDirective()

// 使用示例
/*
<template>
  <!-- 基础用法 -->
  <div v-infinite-scroll="loadMore" style="height: 400px; overflow-y: auto;">
    <div v-for="item in items" :key="item.id">
      {{ item.content }}
    </div>
  </div>

  <!-- 完整配置 -->
  <div v-infinite-scroll="{
    callback: loadMoreData,
    distance: 50,
    delay: 300,
    disabled: loading,
    immediate: true,
    throttle: 200,
    onLoad: handleLoadComplete,
    onError: handleLoadError,
    loadingClass: 'loading-more'
  }" class="scroll-container">
    <div v-for="item in dataList" :key="item.id" class="item">
      {{ item.title }}
    </div>
    <div v-if="loading" class="loading-indicator">
      加载中...
    </div>
  </div>

  <!-- 水平滚动 -->
  <div v-infinite-scroll="{
    callback: loadMoreHorizontal,
    direction: 'horizontal',
    distance: 100
  }" class="horizontal-scroll">
    <div v-for="item in horizontalItems" :key="item.id" class="horizontal-item">
      {{ item.name }}
    </div>
  </div>

  <!-- 指定容器 -->
  <div class="custom-container" style="height: 300px; overflow-y: auto;">
    <div v-infinite-scroll="{
      callback: loadInContainer,
      container: '.custom-container'
    }">
      <div v-for="item in containerItems" :key="item.id">
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([])
const loading = ref(false)
const page = ref(1)

const loadMore = async () => {
  if (loading.value) return

  loading.value = true

  try {
    // 模拟API调用
    const response = await fetch(`/api/items?page=${page.value}`)
    const newItems = await response.json()

    items.value.push(...newItems)
    page.value++
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

const handleLoadComplete = () => {
  console.log('加载完成')
}

const handleLoadError = (error) => {
  console.error('加载错误:', error)
}
</script>

<style>
.loading-more {
  opacity: 0.6;
  pointer-events: none;
}

.loading-indicator {
  text-align: center;
  padding: 20px;
  color: #999;
}

.horizontal-scroll {
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
}

.horizontal-item {
  flex-shrink: 0;
  width: 200px;
  margin-right: 10px;
}
</style>
*/
