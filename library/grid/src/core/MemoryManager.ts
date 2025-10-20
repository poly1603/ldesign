/**
 * Memory management for grid instances
 */

import type { GridItem } from '../types'

export class MemoryManager {
  private itemDataMap = new WeakMap<HTMLElement, any>()
  private cleanupCallbacks: Array<() => void> = []
  private cleanupInterval: number | undefined
  private gcThreshold = 100 // items

  constructor(enableAutoCleanup = true) {
    if (enableAutoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * Store data for element
   */
  setData(element: HTMLElement, data: any): void {
    this.itemDataMap.set(element, data)
  }

  /**
   * Get data for element
   */
  getData(element: HTMLElement): any {
    return this.itemDataMap.get(element)
  }

  /**
   * Check if element has data
   */
  hasData(element: HTMLElement): boolean {
    return this.itemDataMap.has(element)
  }

  /**
   * Register cleanup callback
   */
  registerCleanup(callback: () => void): void {
    this.cleanupCallbacks.push(callback)
  }

  /**
   * Run all cleanup callbacks
   */
  cleanup(): void {
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('Error during cleanup:', error)
      }
    })
    this.cleanupCallbacks = []
  }

  /**
   * Start automatic cleanup
   */
  private startAutoCleanup(): void {
    this.cleanupInterval = window.setInterval(() => {
      this.performGC()
    }, 30000) // Every 30 seconds
  }

  /**
   * Perform garbage collection
   */
  private performGC(): void {
    // Run cleanup callbacks
    this.cleanup()

    // Suggest GC if available
    if ('gc' in globalThis) {
      try {
        (globalThis as any).gc()
      } catch (e) {
        // GC not available
      }
    }
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return memory.usedJSHeapSize
    }
    return undefined
  }

  /**
   * Clear all event listeners from element
   */
  clearEventListeners(element: HTMLElement): void {
    const clone = element.cloneNode(true) as HTMLElement
    element.parentNode?.replaceChild(clone, element)
  }

  /**
   * Remove all children from element efficiently
   */
  clearChildren(element: HTMLElement): void {
    while (element.firstChild) {
      element.removeChild(element.firstChild)
    }
  }

  /**
   * Lazy load image
   */
  lazyLoadImage(img: HTMLImageElement, src: string): void {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            img.src = src
            observer.unobserve(img)
          }
        })
      })
      observer.observe(img)
    } else {
      img.src = src
    }
  }

  /**
   * Optimize item for memory
   */
  optimizeItem(item: GridItem): void {
    const element = item.element

    // Remove inline styles that can be in CSS
    const unnecessaryStyles = ['position', 'left', 'top', 'width', 'height']
    unnecessaryStyles.forEach(style => {
      if (element.style[style as any]) {
        element.style.removeProperty(style)
      }
    })

    // Lazy load images
    const images = element.querySelectorAll('img[data-src]')
    images.forEach((img: any) => {
      const src = img.getAttribute('data-src')
      if (src) {
        this.lazyLoadImage(img, src)
      }
    })
  }

  /**
   * Pool for reusing DOM elements
   */
  private elementPool: HTMLElement[] = []

  /**
   * Get element from pool or create new
   */
  getElement(tagName = 'div'): HTMLElement {
    if (this.elementPool.length > 0) {
      return this.elementPool.pop()!
    }
    return document.createElement(tagName)
  }

  /**
   * Return element to pool
   */
  recycleElement(element: HTMLElement): void {
    // Clear element
    this.clearChildren(element)
    element.className = ''
    element.removeAttribute('style')

    // Add to pool
    if (this.elementPool.length < 100) {
      this.elementPool.push(element)
    }
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.cleanup()
    this.elementPool = []
  }
}













