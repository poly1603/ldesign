/**
 * 简单模板扫描器
 * 提供快速获取模板组件的工具函数
 */

import type { Component } from 'vue'
import type { DeviceType } from '../types'
import { getRegistry } from '../core/registry'

class SimpleTemplateScanner {
  /**
   * 获取异步组件
   */
  getAsyncComponent(
    category: string,
    device: DeviceType,
    name: string,
  ): Component | null {
    const registry = getRegistry()
    const registration = registry.get(category, device, name)

    if (!registration) {
      console.warn(`[simpleTemplateScanner] Template not found: ${category}/${device}/${name}`)
      return null
    }

    const component = registration.component

    // 如果是函数（异步加载），返回异步组件
    if (typeof component === 'function') {
      return component as Component
    }

    // 如果是直接组件，返回
    return component
  }

  /**
   * 获取同步组件
   */
  getComponent(
    category: string,
    device: DeviceType,
    name: string,
  ): Component | null {
    const registry = getRegistry()
    const registration = registry.get(category, device, name)

    if (!registration) {
      console.warn(`[simpleTemplateScanner] Template not found: ${category}/${device}/${name}`)
      return null
    }

    const component = registration.component

    // 如果是直接组件，返回
    if (typeof component !== 'function') {
      return component
    }

    // 如果是函数，则不支持同步获取
    console.warn(
      `[simpleTemplateScanner] Template ${category}/${device}/${name} is async, use getAsyncComponent instead`,
    )
    return null
  }

  /**
   * 检查模板是否存在
   */
  has(category: string, device: DeviceType, name: string): boolean {
    const registry = getRegistry()
    return registry.has(category, device, name)
  }

  /**
   * 获取模板列表
   */
  list(category?: string, device?: DeviceType) {
    const registry = getRegistry()
    const results = registry.query({ category, device })
    return results.map(r => r.metadata)
  }
}

// 导出单例
export const simpleTemplateScanner = new SimpleTemplateScanner()

// 也导出类，以便需要创建新实例
export { SimpleTemplateScanner }
