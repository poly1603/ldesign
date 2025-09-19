/**
 * TypeScript 类型工具函数
 * 
 * 提供组件库开发中常用的类型工具函数
 */

import type { VNode } from 'vue'

/**
 * 组件类型工具函数
 */

/**
 * 提取组件 Props 类型
 */
export type ExtractComponentProps<T> = T extends { props: infer P } ? P : never

/**
 * 提取组件 Emits 类型
 */
export type ExtractComponentEmits<T> = T extends { emits: infer E } ? E : never

/**
 * 提取组件实例类型
 */
export type ExtractComponentInstance<T> = T extends { __VLS_ctx: infer I } ? I : never

/**
 * 组件 Ref 类型
 */
export type ComponentRef<T> = T extends abstract new (...args: any) => infer I ? I : never

/**
 * 可选属性类型
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 必需属性类型
 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] }

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 深度可选类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 值类型提取
 */
export type ValueOf<T> = T[keyof T]

/**
 * 函数参数类型提取
 */
export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never

/**
 * 函数返回值类型提取
 */
export type ReturnType<F extends Function> = F extends (...args: any[]) => infer R ? R : never

/**
 * 事件处理器类型
 */
export type EventHandler<T extends Event = Event> = (event: T) => void | Promise<void>

/**
 * 异步函数类型
 */
export type AsyncFunction<T extends any[] = any[], R = any> = (...args: T) => Promise<R>

/**
 * 组件插槽类型
 */
export type ComponentSlot<T = any> = (props: T) => VNode | VNode[]

/**
 * 主题相关类型
 */
export type ThemeMode = 'light' | 'dark' | 'auto'
export type ThemeSize = 'small' | 'medium' | 'large'
export type ThemeStatus = 'default' | 'primary' | 'success' | 'warning' | 'error'

/**
 * 响应式断点类型
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>

/**
 * CSS 相关类型
 */
export type CSSProperties = Record<string, string | number>
export type ClassName = string | string[] | Record<string, boolean>
export type StyleValue = string | CSSProperties

