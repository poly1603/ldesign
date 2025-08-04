/**
 * Vue3 集成相关类型定义
 */

import type { Ref, ComputedRef } from 'vue'
import type { WatermarkConfig, WatermarkInstance } from '../types'

// useWatermark Hook 选项
export interface UseWatermarkOptions {
  /** 是否立即创建水印 */
  immediate?: boolean
  /** 是否启用安全防护 */
  enableSecurity?: boolean
  /** 是否启用响应式 */
  enableResponsive?: boolean
  /** 容器元素引用 */
  container?: Ref<HTMLElement | undefined>
}

// useWatermark Hook 返回值
export interface UseWatermarkReturn {
  /** 水印实例 */
  instance: Ref<WatermarkInstance | null>
  /** 是否正在加载 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 是否已创建 */
  isCreated: ComputedRef<boolean>
  /** 创建水印 */
  create: (config: Partial<WatermarkConfig>) => Promise<void>
  /** 更新水印 */
  update: (config: Partial<WatermarkConfig>) => Promise<void>
  /** 销毁水印 */
  destroy: () => Promise<void>
  /** 暂停水印 */
  pause: () => Promise<void>
  /** 恢复水印 */
  resume: () => Promise<void>
  /** 清除错误 */
  clearError: () => void
}

// Watermark 组件 Props
export interface WatermarkComponentProps {
  /** 水印配置 */
  config?: Partial<WatermarkConfig>
  /** 水印内容 */
  content?: string | string[]
  /** 是否启用安全防护 */
  security?: boolean
  /** 是否启用响应式 */
  responsive?: boolean
  /** 是否立即创建 */
  immediate?: boolean
  /** 样式配置 */
  style?: WatermarkConfig['style']
  /** 布局配置 */
  layout?: WatermarkConfig['layout']
  /** 动画配置 */
  animation?: WatermarkConfig['animation']
}

// WatermarkProvider 组件 Props
export interface WatermarkProviderProps {
  /** 全局水印配置 */
  config?: Partial<WatermarkConfig>
  /** 是否启用全局安全防护 */
  globalSecurity?: boolean
  /** 是否启用全局响应式 */
  globalResponsive?: boolean
  /** 全局样式配置 */
  globalStyle?: WatermarkConfig['style']
  /** 全局布局配置 */
  globalLayout?: WatermarkConfig['layout']
}

// v-watermark 指令值类型
export type WatermarkDirectiveValue = 
  | string 
  | string[] 
  | Partial<WatermarkConfig>

// v-watermark 指令修饰符
export interface WatermarkDirectiveModifiers {
  /** 启用安全模式 */
  secure?: boolean
  /** 启用响应式 */
  responsive?: boolean
  /** 立即创建 */
  immediate?: boolean
  /** 使用Canvas渲染 */
  canvas?: boolean
  /** 使用SVG渲染 */
  svg?: boolean
}

// Vue插件选项
export interface WatermarkPluginOptions {
  /** 全局配置 */
  globalConfig?: Partial<WatermarkConfig>
  /** 组件名称前缀 */
  componentPrefix?: string
  /** 指令名称 */
  directiveName?: string
  /** 是否注册全局组件 */
  registerComponents?: boolean
  /** 是否注册指令 */
  registerDirective?: boolean
  /** 是否注册全局方法 */
  registerGlobalMethods?: boolean
}

// Provider 注入的上下文类型
export interface WatermarkProviderContext {
  /** 全局配置 */
  globalConfig: ComputedRef<Partial<WatermarkConfig>>
  /** 合并配置的方法 */
  mergeConfig: (localConfig: Partial<WatermarkConfig>) => WatermarkConfig
  /** 是否启用全局安全 */
  globalSecurity: ComputedRef<boolean>
  /** 是否启用全局响应式 */
  globalResponsive: ComputedRef<boolean>
}

// 组件事件类型
export interface WatermarkComponentEvents {
  /** 水印创建完成 */
  created: [instance: WatermarkInstance]
  /** 水印更新完成 */
  updated: [instance: WatermarkInstance]
  /** 水印销毁完成 */
  destroyed: [instanceId: string]
  /** 发生错误 */
  error: [error: Error]
  /** 安全违规 */
  securityViolation: [violation: any]
}