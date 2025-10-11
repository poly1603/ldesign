/**
 * 懒加载指令
 * 当元素进入视口时触发加载
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { getLogger } from '../../logger/unified-logger'
import { DirectiveBase } from '../base/directive-base'

import { defineDirective, directiveUtils } from '../base/vue-directive-adapter'

export interface LazyOptions {
  callback?: (el: HTMLElement, entry: IntersectionObserverEntry) => void
  src?: string
  placeholder?: string
  error?: string
  loading?: string
  threshold?: number | number[]
  rootMargin?: string
  root?: Element | null
  once?: boolean
  onLoad?: (el: HTMLElement) => void
  onError?: (el: HTMLElement, error: Error) => void
  onEnter?: (el: HTMLElement, entry: IntersectionObserverEntry) => void
  loadingClass?: string
  loadedClass?: string
  errorClass?: string
}

export class LazyDirective extends DirectiveBase {
  private logger = getLogger('LazyDirective')

  private static observer?: IntersectionObserver
  private static observedElements = new WeakMap<HTMLElement, LazyOptions>()

  constructor() {
    super({
      name: 'lazy',
      description: '懒加载指令，元素进入视口时触发加载',
      version: '1.0.0',
      category: 'performance',
      tags: ['lazy', 'loading', 'performance', 'optimization'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    // 存储配置
    LazyDirective.observedElements.set(el, config)

    // 创建或获取观察器
    if (!LazyDirective.observer) {
      LazyDirective.observer = this.createObserver()
    }

    // 设置初始状态
    this.setupInitialState(el, config)

    // 开始观察
    LazyDirective.observer.observe(el)

    this.log('Lazy directive mounted')
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    if (directiveUtils.isValueChanged(binding)) {
      const config = this.parseConfig(binding)
      LazyDirective.observedElements.set(el, config)
    }
  }

  public unmounted(el: HTMLElement): void {
    // 停止观察
    if (LazyDirective.observer) {
      LazyDirective.observer.unobserve(el)
    }

    // 清理配置
    LazyDirective.observedElements.delete(el)

    // 清理类名
    this.removeClass(el, 'lazy-loading')
    this.removeClass(el, 'lazy-loaded')
    this.removeClass(el, 'lazy-error')

    this.log('Lazy directive unmounted')
  }

  private parseConfig(binding: VueDirectiveBinding): LazyOptions {
    const value = binding.value

    if (typeof value === 'function') {
      return { callback: value as (el: HTMLElement, entry: IntersectionObserverEntry) => void }
    }

    if (typeof value === 'string') {
      return { src: value }
    }

    if (typeof value === 'object' && value !== null) {
      const obj = value as Partial<LazyOptions>
      return {
        callback: obj.callback,
        src: obj.src,
        placeholder: obj.placeholder,
        error: obj.error,
        loading: obj.loading,
        threshold: obj.threshold ?? 0.1,
        rootMargin: obj.rootMargin ?? '50px',
        root: obj.root ?? null,
        once: obj.once !== false,
        onLoad: obj.onLoad,
        onError: obj.onError,
        onEnter: obj.onEnter,
        loadingClass: obj.loadingClass || 'lazy-loading',
        loadedClass: obj.loadedClass || 'lazy-loaded',
        errorClass: obj.errorClass || 'lazy-error',
      }
    }

    return {
      threshold: 0.1,
      rootMargin: '50px',
      once: true,
    }
  }

  private createObserver(): IntersectionObserver {
    return new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            const config = LazyDirective.observedElements.get(el)

            if (config) {
              this.handleIntersection(el, entry, config)
            }
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    )
  }

  private setupInitialState(el: HTMLElement, config: LazyOptions): void {
    // 设置占位符
    if (config.placeholder && el instanceof HTMLImageElement) {
      el.src = config.placeholder
    }

    // 添加加载中类名
    if (config.loadingClass) {
      this.addClass(el, config.loadingClass)
    }

    // 存储原始src
    if (config.src && el instanceof HTMLImageElement) {
      el.dataset.lazySrc = config.src
    }
  }

  private async handleIntersection(
    el: HTMLElement,
    entry: IntersectionObserverEntry,
    config: LazyOptions
  ): Promise<void> {
    try {
      // 触发进入回调
      config.onEnter?.(el, entry)

      // 执行自定义回调
      if (config.callback) {
        config.callback(el, entry)
      } else {
        // 默认图片加载逻辑
        await this.loadImage(el, config)
      }

      // 移除加载中类名，添加已加载类名
      if (config.loadingClass) {
        this.removeClass(el, config.loadingClass)
      }
      if (config.loadedClass) {
        this.addClass(el, config.loadedClass)
      }

      // 触发加载完成回调
      config.onLoad?.(el)

      // 如果只加载一次，停止观察
      if (config.once && LazyDirective.observer) {
        LazyDirective.observer.unobserve(el)
      }
    } catch (error) {
      this.handleLoadError(el, config, error as Error)
    }
  }

  private loadImage(el: HTMLElement, config: LazyOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!(el instanceof HTMLImageElement)) {
        resolve()
        return
      }

      const src = config.src || el.dataset.lazySrc
      if (!src) {
        resolve()
        return
      }

      const img = new Image()

      img.onload = () => {
        el.src = src
        resolve()
      }

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`))
      }

      img.src = src
    })
  }

  private handleLoadError(
    el: HTMLElement,
    config: LazyOptions,
    error: Error
  ): void {
    // 移除加载中类名，添加错误类名
    if (config.loadingClass) {
      this.removeClass(el, config.loadingClass)
    }
    if (config.errorClass) {
      this.addClass(el, config.errorClass)
    }

    // 设置错误图片
    if (config.error && el instanceof HTMLImageElement) {
      el.src = config.error
    }

    // 触发错误回调
    config.onError?.(el, error)

    this.error_log('Lazy load error:', error.message)
  }
}

// 创建Vue指令
export const vLazy = defineDirective('lazy', {
  mounted(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = new LazyDirective()
    directive.mounted(el, binding)

    if (!el._engineDirectives) {
      el._engineDirectives = new Map()
    }
    el._engineDirectives.set('lazy', directive)
  },

  updated(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = el._engineDirectives?.get(
      'lazy'
    ) as unknown as LazyDirective
    if (directive) {
      directive.updated(el, binding)
    }
  },

  unmounted(el: HTMLElement) {
    const directive = el._engineDirectives?.get(
      'lazy'
    ) as unknown as LazyDirective
    if (directive) {
      directive.unmounted(el)
      el._engineDirectives?.delete('lazy')
    }
  },
})

// 导出指令实例
export const lazyDirective = new LazyDirective()

// 使用示例
/*
<template>
  <!-- 基础图片懒加载 -->
  <img v-lazy="'/path/to/image.jpg'" alt="懒加载图片">

  <!-- 带占位符的图片懒加载 -->
  <img v-lazy="{
    src: '/path/to/image.jpg',
    placeholder: '/path/to/placeholder.jpg',
    error: '/path/to/error.jpg'
  }" alt="带占位符的懒加载">

  <!-- 自定义回调 -->
  <div v-lazy="{
    callback: handleLazyLoad,
    threshold: 0.5,
    rootMargin: '100px'
  }">
    自定义懒加载内容
  </div>

  <!-- 完整配置 -->
  <img v-lazy="{
    src: '/path/to/image.jpg',
    placeholder: '/path/to/loading.gif',
    error: '/path/to/error.png',
    threshold: [0, 0.25, 0.5, 0.75, 1],
    rootMargin: '50px',
    once: true,
    onLoad: handleImageLoad,
    onError: handleImageError,
    onEnter: handleImageEnter,
    loadingClass: 'image-loading',
    loadedClass: 'image-loaded',
    errorClass: 'image-error'
  }" alt="完整配置懒加载">
</template>

<script setup>
const handleLazyLoad = (el, entry) => {
  this.logger.debug('元素进入视口:', el, entry)
  // 自定义加载逻辑
}

const handleImageLoad = (el) => {
  this.logger.debug('图片加载完成:', el)
}

const handleImageError = (el, error) => {
  this.logger.error('图片加载失败:', el, error)
}

const handleImageEnter = (el, entry) => {
  this.logger.debug('图片进入视口:', el, entry)
}
</script>

<style>
.lazy-loading {
  opacity: 0.5;
  filter: blur(2px);
}

.lazy-loaded {
  opacity: 1;
  filter: none;
  transition: opacity 0.3s, filter 0.3s;
}

.lazy-error {
  opacity: 0.5;
  filter: grayscale(100%);
}
</style>
*/
