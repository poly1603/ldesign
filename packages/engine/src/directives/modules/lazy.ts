/**
 * 懒加载指令
 * 当元素进入视口时触发加载
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
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
  private observers: Map<Element, IntersectionObserver> = new Map()
  private defaultPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f0f0f0"/%3E%3C/svg%3E'
  private defaultError = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ff0000"/%3E%3C/svg%3E'

  constructor() {
    super({
      name: 'lazy',
      description: '懒加载元素，当进入视口时才加载',
      version: '1.0.0',
      category: 'performance',
      tags: ['lazy', 'load', 'performance', 'image'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    // Setup element
    this.setupElement(el, config)

    // Create intersection observer
    const observerOptions: IntersectionObserverInit = {
      threshold: config.threshold ?? 0,
      rootMargin: config.rootMargin ?? '0px',
      root: config.root ?? null,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadElement(el, config, entry)

          if (config.once !== false) {
            observer.unobserve(el)
            this.observers.delete(el)
          }
        }
      })
    }, observerOptions)

    observer.observe(el)
    this.observers.set(el, observer)

    this.log(`Lazy loading directive mounted on element`, el)
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    // Clean up old observer
    const oldObserver = this.observers.get(el)
    if (oldObserver) {
      oldObserver.disconnect()
      this.observers.delete(el)
    }

    // Re-mount with new config
    this.mounted(el, binding)

    this.log(`Lazy loading directive updated on element`, el)
  }

  public unmounted(el: HTMLElement): void {
    const observer = this.observers.get(el)
    if (observer) {
      observer.disconnect()
      this.observers.delete(el)
    }

    // Clean up stored data
    directiveUtils.removeData(el, 'lazy-loaded')
    directiveUtils.removeData(el, 'lazy-loading')
    directiveUtils.removeData(el, 'lazy-error')

    this.log(`Lazy loading directive unmounted from element`, el)
  }

  private setupElement(el: HTMLElement, config: LazyOptions): void {
    const isImage = el.tagName === 'IMG'

    if (isImage && config.placeholder) {
      (el as HTMLImageElement).src = config.placeholder
    } else if (isImage && config.loading) {
      (el as HTMLImageElement).src = config.loading
    } else if (isImage) {
      (el as HTMLImageElement).src = this.defaultPlaceholder
    }

    if (config.loadingClass) {
      el.classList.add(config.loadingClass)
    }

    directiveUtils.storeData(el, 'lazy-loading', true)
  }

  private loadElement(el: HTMLElement, config: LazyOptions, entry: IntersectionObserverEntry): void {
    const isLoaded = directiveUtils.getData(el, 'lazy-loaded')
    if (isLoaded) return

    // Call onEnter callback
    if (config.onEnter) {
      config.onEnter(el, entry)
    }

    // Handle callback
    if (config.callback) {
      config.callback(el, entry)
      directiveUtils.storeData(el, 'lazy-loaded', true)
      this.updateClasses(el, config, 'loaded')
      return
    }

    // Handle image loading
    if (el.tagName === 'IMG' && config.src) {
      this.loadImage(el as HTMLImageElement, config)
    } else {
      // For non-image elements, just mark as loaded
      directiveUtils.storeData(el, 'lazy-loaded', true)
      this.updateClasses(el, config, 'loaded')

      if (config.onLoad) {
        config.onLoad(el)
      }
    }
  }

  private loadImage(img: HTMLImageElement, config: LazyOptions): void {
    if (!config.src) return

    const tempImg = new Image()

    tempImg.onload = () => {
      if (config.src) {
        img.src = config.src
      }
      directiveUtils.storeData(img, 'lazy-loaded', true)
      directiveUtils.removeData(img, 'lazy-loading')
      this.updateClasses(img, config, 'loaded')

      if (config.onLoad) {
        config.onLoad(img)
      }

      this.log(`Image loaded successfully: ${config.src}`)
    }

    tempImg.onerror = (_event) => {
      const error = new Error(`Failed to load image: ${config.src}`)

      if (config.error) {
        img.src = config.error
      } else {
        img.src = this.defaultError
      }

      directiveUtils.storeData(img, 'lazy-error', true)
      directiveUtils.removeData(img, 'lazy-loading')
      this.updateClasses(img, config, 'error')

      if (config.onError) {
        config.onError(img, error)
      }

      this.warn(`Failed to load image: ${config.src}`)
    }

    if (config.src) {
      tempImg.src = config.src
    }
  }

  private updateClasses(el: HTMLElement, config: LazyOptions, state: 'loading' | 'loaded' | 'error'): void {
    // Remove all state classes
    if (config.loadingClass) el.classList.remove(config.loadingClass)
    if (config.loadedClass) el.classList.remove(config.loadedClass)
    if (config.errorClass) el.classList.remove(config.errorClass)

    // Add current state class
    switch (state) {
      case 'loading':
        if (config.loadingClass) el.classList.add(config.loadingClass)
        break
      case 'loaded':
        if (config.loadedClass) el.classList.add(config.loadedClass)
        break
      case 'error':
        if (config.errorClass) el.classList.add(config.errorClass)
        break
    }
  }

  private parseConfig(binding: VueDirectiveBinding): LazyOptions {
    const value = binding.value

    // Handle string as src
    if (typeof value === 'string') {
      return { src: value }
    }

    // Handle object config
    if (typeof value === 'object' && value !== null) {
      return value as LazyOptions
    }

    // Handle function as callback
    if (typeof value === 'function') {
      return { callback: value as (el: HTMLElement, entry: IntersectionObserverEntry) => void }
    }

    return {}
  }

  public getExample(): string {
    return `
<!-- Basic image lazy loading -->
<img v-lazy="'/path/to/image.jpg'" alt="Lazy loaded image">

<!-- With placeholder and error image -->
<img v-lazy="{
  src: '/path/to/image.jpg',
  placeholder: '/path/to/placeholder.jpg',
  error: '/path/to/error.jpg',
  threshold: 0.5,
  rootMargin: '50px'
}" alt="Lazy image with options">

<!-- With callbacks -->
<img v-lazy="{
  src: '/path/to/image.jpg',
  onLoad: (el) => ,
  onError: (el, error) => console.error('Failed!', error),
  loadingClass: 'loading',
  loadedClass: 'loaded',
  errorClass: 'error'
}" alt="Lazy image with callbacks">

<!-- Custom element with callback -->
<div v-lazy="{
  callback: (el, entry) => {
    // Custom lazy loading logic
    el.innerHTML = 'Content loaded!'
  },
  threshold: 1.0,
  once: true
}">
  Loading...
</div>

<style>
.loading { opacity: 0.5; }
.loaded { animation: fadeIn 0.3s; }
.error { border: 2px solid red; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
    `
  }
}

// Export the directive definition
export const vLazy = defineDirective(new LazyDirective())

// Export default for convenience
export default vLazy
