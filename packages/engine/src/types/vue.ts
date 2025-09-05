/**
 * Vue集成类型定义
 * 包含Vue插件、组件等相关类型
 */

import type { App, Component, Directive } from 'vue'
import type { EnhancedEngineConfig } from './config'
import type { Engine } from './engine'

// Vue应用接口
export interface VueApp extends App {
  engine?: Engine
  $engine?: Engine
}

// Vue插件接口
export interface VuePlugin {
  name: string
  version: string
  install: (app: App, options?: VuePluginOptions) => void | Promise<void>
  uninstall?: (app: App) => void
}

// Vue插件选项
export interface VuePluginOptions {
  global?: boolean
  inject?: boolean
  provide?: boolean
  mixins?: boolean
  directives?: boolean
  components?: boolean
  config?: Record<string, unknown>
}

// Vue组件接口
export interface VueComponent {
  name?: string
  engine?: Engine
  $engine?: Engine
  engineConfig?: EnhancedEngineConfig
  engineMethods?: Record<string, (...args: unknown[]) => unknown>
  engineComputed?: Record<string, (...args: unknown[]) => unknown>
  engineWatch?: Record<string, (...args: unknown[]) => unknown>
  // 包含Vue组件的基本属性
  setup?: (...args: unknown[]) => unknown
  render?: (...args: unknown[]) => unknown
  template?: string
  props?: unknown
  emits?: unknown
}

// Vue指令接口
export interface VueDirective {
  name: string
  engine?: Engine
  engineConfig?: Record<string, unknown>
  engineMethods?: Record<string, (...args: unknown[]) => unknown>
  // 包含Vue指令的基本属性
  beforeMount?: (...args: unknown[]) => unknown
  mounted?: (...args: unknown[]) => unknown
  beforeUpdate?: (...args: unknown[]) => unknown
  updated?: (...args: unknown[]) => unknown
  beforeUnmount?: (...args: unknown[]) => unknown
  unmounted?: (...args: unknown[]) => unknown
}

// Vue混入接口
export interface VueMixin {
  name?: string
  engine?: Engine
  engineConfig?: Record<string, unknown>
  engineMethods?: Record<string, (...args: unknown[]) => unknown>
  engineComputed?: Record<string, (...args: unknown[]) => unknown>
  engineWatch?: Record<string, (...args: unknown[]) => unknown>
  engineLifecycle?: Record<string, (...args: unknown[]) => unknown>
}

// Vue组合式API接口
export interface VueComposable {
  name: string
  engine?: Engine
  engineConfig?: Record<string, unknown>
  engineMethods?: Record<string, (...args: unknown[]) => unknown>
  engineComputed?: Record<string, (...args: unknown[]) => unknown>
  engineWatch?: Record<string, (...args: unknown[]) => unknown>
  engineLifecycle?: Record<string, (...args: unknown[]) => unknown>
}

// Vue提供者接口
export interface VueProvider {
  name: string
  engine?: Engine
  engineConfig?: Record<string, unknown>
  provide: (key: string | symbol, value: unknown) => void
  inject: <T>(key: string | symbol, defaultValue?: T) => T
}

// Vue注入器接口
export interface VueInjector {
  name: string
  engine?: Engine
  engineConfig?: Record<string, unknown>
  inject: <T>(key: string | symbol, defaultValue?: T) => T
  has: (key: string | symbol) => boolean
  keys: () => (string | symbol)[]
}

// Vue生命周期钩子
export interface VueLifecycleHooks {
  beforeCreate?: () => void
  created?: () => void
  beforeMount?: () => void
  mounted?: () => void
  beforeUpdate?: () => void
  updated?: () => void
  beforeUnmount?: () => void
  unmounted?: () => void
  errorCaptured?: (
    error: Error,
    instance: Component | null,
    info: string
  ) => boolean | void
  renderTracked?: (event: unknown) => void
  renderTriggered?: (event: unknown) => void
  activated?: () => void
  deactivated?: () => void
  serverPrefetch?: () => Promise<unknown>
}

// Vue响应式接口
export interface VueReactive {
  ref: <T>(value: T) => Ref<T>
  reactive: <T extends object>(target: T) => T
  computed: <T>(getter: () => T) => ComputedRef<T>
  watch: <T>(
    source: T | (() => T),
    callback: (newValue: T, oldValue: T) => void,
    options?: WatchOptions
  ) => StopHandle
  watchEffect: (effect: () => void) => StopHandle
}

// Vue引用类型
export interface Ref<T = unknown> {
  value: T
}

// Vue计算引用类型
export interface ComputedRef<T = unknown> extends Ref<T> {
  readonly value: T
}

// Vue监听选项
export interface WatchOptions {
  immediate?: boolean
  deep?: boolean
  flush?: 'pre' | 'post' | 'sync'
  onTrack?: (event: unknown) => void
  onTrigger?: (event: unknown) => void
}

// Vue停止句柄
export interface StopHandle {
  (): void
}

// Vue应用配置
export interface VueAppConfig {
  name?: string
  version?: string
  engine?: Engine
  engineConfig?: EnhancedEngineConfig
  plugins?: VuePlugin[]
  components?: Record<string, Component>
  directives?: Record<string, Directive>
  mixins?: VueMixin[]
  provide?: Record<string | symbol, unknown>
  globalProperties?: Record<string, unknown>
  config?: Record<string, unknown>
}

// Vue组件配置
export interface VueComponentConfig {
  name?: string
  engine?: Engine
  engineConfig?: EnhancedEngineConfig
  props?: Record<string, unknown>
  emits?: string[]
  slots?: Record<string, unknown>
  attrs?: Record<string, unknown>
  listeners?: Record<string, (...args: unknown[]) => unknown>
  parent?: Component
  root?: Component
  children?: Component[]
  refs?: Record<string, Component | HTMLElement>
  el?: HTMLElement
  $el?: HTMLElement
  $options?: Record<string, unknown>
  $parent?: Component
  $root?: Component
  $children?: Component[]
  $refs?: Record<string, Component | HTMLElement>
  $attrs?: Record<string, unknown>
  $listeners?: Record<string, (...args: unknown[]) => unknown>
  $slots?: Record<string, unknown>
  $scopedSlots?: Record<string, unknown>
  $isServer?: boolean
  $ssrContext?: unknown
  $vnode?: unknown
  $nextTick?: (callback: () => void) => Promise<void>
  $forceUpdate?: () => void
  $destroy?: () => void
  $mount?: (el?: string | HTMLElement) => Component
  $set?: (target: object | Array<unknown>, key: string | number, value: unknown) => void
  $delete?: (target: object | Array<unknown>, key: string | number) => void
  $watch?: (
    expOrFn: string | ((...args: unknown[]) => unknown),
    callback: (...args: unknown[]) => unknown,
    options?: WatchOptions
  ) => (...args: unknown[]) => unknown
  $on?: (event: string, callback: (...args: unknown[]) => unknown) => Component
  $once?: (
    event: string,
    callback: (...args: unknown[]) => unknown
  ) => Component
  $off?: (
    event?: string,
    callback?: (...args: unknown[]) => unknown
  ) => Component
  $emit?: (event: string, ...args: unknown[]) => Component
}

// Vue指令配置
export interface VueDirectiveConfig {
  name: string
  engine?: Engine
  engineConfig?: Record<string, unknown>
  bind?: (el: HTMLElement, binding: DirectiveBinding, vnode: VNode) => void
  inserted?: (el: HTMLElement, binding: DirectiveBinding, vnode: VNode) => void
  update?: (
    el: HTMLElement,
    binding: DirectiveBinding,
    vnode: VNode,
    oldVnode: VNode
  ) => void
  componentUpdated?: (
    el: HTMLElement,
    binding: DirectiveBinding,
    vnode: VNode,
    oldVnode: VNode
  ) => void
  unbind?: (el: HTMLElement, binding: DirectiveBinding, vnode: VNode) => void
}

// Vue指令绑定
export interface DirectiveBinding {
  name: string
  value: unknown
  oldValue: unknown
  expression: string
  arg: string
  modifiers: Record<string, boolean>
  instance: Component
  dir: Directive
}

// Vue虚拟节点
export interface VNode {
  tag?: string
  data?: VNodeData
  children?: VNode[]
  text?: string
  elm?: Node
  ns?: string
  context?: Component
  fnContext?: Component
  fnOptions?: ComponentOptions
  fnScopeId?: string
  key?: string | number
  componentOptions?: VNodeComponentOptions
  componentInstance?: Component
  parent?: VNode
  raw?: boolean
  isStatic?: boolean
  isRootInsert?: boolean
  isComment?: boolean
  isCloned?: boolean
  isOnce?: boolean
  asyncFactory?: (...args: unknown[]) => unknown
  asyncMeta?: unknown
  isAsyncPlaceholder?: boolean
  ssrContext?: unknown
}

// Vue节点数据
export interface VNodeData {
  key?: string | number
  slot?: string
  scopedSlots?: Record<string, unknown>
  ref?: string
  tag?: string
  staticClass?: string
  class?: unknown
  staticStyle?: Record<string, unknown>
  style?: unknown
  props?: Record<string, unknown>
  attrs?: Record<string, unknown>
  domProps?: Record<string, unknown>
  hook?: Record<string, (...args: unknown[]) => unknown>
  on?: Record<
    string,
    ((...args: unknown[]) => unknown) | ((...args: unknown[]) => unknown)[]
  >
  nativeOn?: Record<
    string,
    ((...args: unknown[]) => unknown) | ((...args: unknown[]) => unknown)[]
  >
  transition?: unknown
  show?: boolean
  inlineTemplate?: {
    render: (...args: unknown[]) => unknown
    staticRenderFns: ((...args: unknown[]) => unknown)[]
  }
  directives?: Array<{
    name: string
    value: unknown
    arg: string
    modifiers: Record<string, boolean>
  }>
  keepAlive?: boolean
}

// Vue组件选项
export interface ComponentOptions {
  name?: string
  components?: Record<string, Component>
  directives?: Record<string, Directive>
  filters?: Record<string, (...args: unknown[]) => unknown>
  mixins?: VueMixin[]
  extends?: Component
  provide?: Record<string | symbol, unknown> | ((...args: unknown[]) => unknown)
  inject?:
    | string[]
    | Record<string, string | symbol | { from: string | symbol; default: unknown }>
  model?: {
    prop?: string
    event?: string
  }
  props?: Record<string, unknown>
  data?: Record<string, unknown> | ((...args: unknown[]) => unknown)
  computed?: Record<string, unknown>
  watch?: Record<string, unknown>
  methods?: Record<string, (...args: unknown[]) => unknown>
  template?: string
  render?: (...args: unknown[]) => unknown
  renderError?: (...args: unknown[]) => unknown
  beforeCreate?: (...args: unknown[]) => unknown
  created?: (...args: unknown[]) => unknown
  beforeMount?: (...args: unknown[]) => unknown
  mounted?: (...args: unknown[]) => unknown
  beforeUpdate?: (...args: unknown[]) => unknown
  updated?: (...args: unknown[]) => unknown
  activated?: (...args: unknown[]) => unknown
  deactivated?: (...args: unknown[]) => unknown
  beforeDestroy?: (...args: unknown[]) => unknown
  destroyed?: (...args: unknown[]) => unknown
  errorCaptured?: (...args: unknown[]) => unknown
  serverPrefetch?: (...args: unknown[]) => unknown
  inheritAttrs?: boolean
  comments?: boolean
  delimiters?: [string, string]
  functional?: boolean
  propsData?: Record<string, unknown>
  el?: string | HTMLElement
  _compiled?: boolean
  _isDestroyed?: boolean
  _isBeingDestroyed?: boolean
  _events?: Record<string, ((...args: unknown[]) => unknown)[]>
  _hasHookEvent?: boolean
  _provided?: Record<string | symbol, unknown>
  _watchers?: unknown[]
  _watcherOptions?: unknown
  _watcherCallbacks?: unknown[]
  _data?: Record<string, unknown>
  _computedWatchers?: Record<string, unknown>
  _scope?: unknown
  _c?: (...args: unknown[]) => unknown
  _o?: (...args: unknown[]) => unknown
  _n?: (...args: unknown[]) => unknown
  _s?: (...args: unknown[]) => unknown
  _l?: (...args: unknown[]) => unknown
  _t?: (...args: unknown[]) => unknown
  _q?: (...args: unknown[]) => unknown
  _i?: (...args: unknown[]) => unknown
  _m?: (...args: unknown[]) => unknown
  _f?: (...args: unknown[]) => unknown
  _k?: (...args: unknown[]) => unknown
  _b?: (...args: unknown[]) => unknown
  _v?: (...args: unknown[]) => unknown
  _e?: (...args: unknown[]) => unknown
  _u?: (...args: unknown[]) => unknown
  _g?: (...args: unknown[]) => unknown
  _d?: (...args: unknown[]) => unknown
  _p?: (...args: unknown[]) => unknown
  _z?: (...args: unknown[]) => unknown
  _oe?: (...args: unknown[]) => unknown
}

// Vue节点组件选项
export interface VNodeComponentOptions {
  Ctor: unknown
  propsData?: Record<string, unknown>
  listeners?: Record<string, (...args: unknown[]) => unknown>
  tag?: string
  children?: VNode[]
}
