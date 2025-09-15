/**
 * 框架适配器导出文件
 * 提供所有框架适配器的统一导出
 */

// 基础适配器
export { BaseAdapter } from './base'
export type { AdapterState, AdapterEvents, AdapterConfig } from './base'

// Vue适配器
export { VueAdapter, useWebSocket as useVueWebSocket, VueWebSocketPlugin } from './vue'
export type { VueWebSocketState, UseWebSocketReturn as VueUseWebSocketReturn, VueWebSocketPluginOptions } from './vue'

// React适配器
export { ReactAdapter, useWebSocket as useReactWebSocket, useWebSocketMessages } from './react'
export type { UseWebSocketReturn as ReactUseWebSocketReturn } from './react'

// Angular适配器
export { AngularWebSocketService, AngularAdapter } from './angular'
export type { AngularWebSocketConfig } from './angular'

/**
 * 框架检测工具
 * 自动检测当前运行环境中的框架
 */
export class FrameworkDetector {
  /**
   * 检测是否在Vue环境中
   */
  static isVue(): boolean {
    return typeof window !== 'undefined' &&
      (window as any).Vue !== undefined ||
      typeof global !== 'undefined' &&
      (global as any).Vue !== undefined
  }

  /**
   * 检测是否在React环境中
   */
  static isReact(): boolean {
    return typeof window !== 'undefined' &&
      (window as any).React !== undefined ||
      typeof global !== 'undefined' &&
      (global as any).React !== undefined
  }

  /**
   * 检测是否在Angular环境中
   */
  static isAngular(): boolean {
    return typeof window !== 'undefined' &&
      (window as any).ng !== undefined ||
      typeof global !== 'undefined' &&
      (global as any).ng !== undefined
  }

  /**
   * 获取当前框架类型
   */
  static getCurrentFramework(): 'vue' | 'react' | 'angular' | 'unknown' {
    if (this.isVue()) return 'vue'
    if (this.isReact()) return 'react'
    if (this.isAngular()) return 'angular'
    return 'unknown'
  }
}

/**
 * 自动适配器工厂
 * 根据当前环境自动选择合适的适配器
 */
export class AutoAdapterFactory {
  /**
   * 创建适配器
   * @param client WebSocket客户端实例
   * @param config 适配器配置
   * @returns 适配器实例
   */
  static create(client: any, config: AdapterConfig = {}): BaseAdapter {
    const framework = FrameworkDetector.getCurrentFramework()

    switch (framework) {
      case 'vue':
        const { VueAdapter } = require('./vue')
        return new VueAdapter(client, config)

      case 'react':
        const { ReactAdapter } = require('./react')
        return new ReactAdapter(client, config)

      case 'angular':
        const { AngularAdapter } = require('./angular')
        return new AngularAdapter(client, config)

      default:
        return new BaseAdapter(client, config)
    }
  }
}

/**
 * 通用WebSocket Hook
 * 自动检测框架并返回相应的Hook
 */
export function useWebSocket(url: string, config: any = {}, adapterConfig: AdapterConfig = {}) {
  const framework = FrameworkDetector.getCurrentFramework()

  switch (framework) {
    case 'vue':
      const { useWebSocket: useVue } = require('./vue')
      return useVue(url, config, adapterConfig)

    case 'react':
      const { useWebSocket: useReact } = require('./react')
      return useReact(url, config, adapterConfig)

    default:
      throw new Error(`不支持的框架: ${framework}。请使用框架特定的适配器。`)
  }
}


