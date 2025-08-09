declare module 'vue' {
  // 基础类型
  export interface App<HostElement = any> {
    version: string
    config: any
    use<T extends any[]>(plugin: any, ...options: T): this
    mixin(mixin: any): this
    component(name: string): any
    component(name: string, component: any): this
    directive(name: string): any
    directive(name: string, directive: any): this
    mount(rootContainer: HostElement | string): any
    unmount(): void
    provide<T>(key: any, value: T): this
    runWithContext<T>(fn: () => T): T
  }

  export interface PropType<T = any> {
    readonly __propType?: T
  }

  export interface Component<
    Props = {},
    RawBindings = any,
    D = any,
    C extends any = any,
    E extends any = any
  > {
    __isFragment?: never
    __isTeleport?: never
    __isSuspense?: never
    __isKeepAlive?: never
    __isBaseTransition?: never
    __isBuiltIn?: never
    __isVue?: never
  }

  export interface VNode<
    HostNode = any,
    HostElement = any,
    ExtraProps = { [key: string]: any }
  > {
    __v_isVNode: true
    type: any
    props: any
    key: string | number | symbol | null
    ref: any
    children: any
  }

  // 响应式 API
  export function ref<T>(value?: T): { value: T | undefined }
  export function computed<T>(getter: () => T): { readonly value: T }
  export function inject<T>(key: any, defaultValue?: T): T | undefined

  // 组件 API
  export function defineComponent(options: any): any
  export function h(type: any, props?: any, children?: any): VNode

  // 生命周期
  export function onMounted(hook: () => void): void
  export function onUnmounted(hook: () => void): void

  // 工具
  export function nextTick(fn?: () => void): Promise<void>

  // 异步组件
  export function defineAsyncComponent(source: any): any

  // 内置组件
  export const Suspense: any
  export const KeepAlive: any
  export const Transition: any
}
