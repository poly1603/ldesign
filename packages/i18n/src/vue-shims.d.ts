declare module 'vue' {
  // 基础类型
  export interface App<HostElement = unknown> {
    version: string
    config: Record<string, unknown>
    use: <T extends unknown[]>(plugin: unknown, ...options: T) => this
    mixin: (mixin: Record<string, unknown>) => this
    component: {
      (name: string): unknown
      (name: string, component: unknown): this
    }
    directive: {
      (name: string): unknown
      (name: string, directive: unknown): this
    }
    mount: (rootContainer: HostElement | string) => unknown
    unmount: () => void
    provide: <T>(key: unknown, value: T) => this
    runWithContext: <T>(fn: () => T) => T
  }

  export interface PropType<T = unknown> {
    readonly __propType?: T
  }

  export interface Component<
    Props = Record<string, unknown>,
    RawBindings = unknown,
    D = unknown,
    C = unknown,
    E = unknown
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
    HostNode = unknown,
    HostElement = unknown,
    ExtraProps = Record<string, unknown>
  > {
    __v_isVNode: true
    type: unknown
    props: unknown
    key: string | number | symbol | null
    ref: unknown
    children: unknown
  }

  // 响应式 API
  export const ref: <T>(value?: T) => { value: T | undefined }
  export const computed: <T>(getter: () => T) => { readonly value: T }
  export const inject: <T>(key: unknown, defaultValue?: T) => T | undefined

  // 组件 API
  export const defineComponent: (options: Record<string, unknown>) => unknown
  export const h: (type: unknown, props?: unknown, children?: unknown) => VNode

  // 生命周期
  export const onMounted: (hook: () => void) => void
  export const onUnmounted: (hook: () => void) => void

  // 工具
  export const nextTick: (fn?: () => void) => Promise<void>

  // 异步组件
  export const defineAsyncComponent: (source: unknown) => unknown

  // 内置组件
  export const Suspense: unknown
  export const KeepAlive: unknown
  export const Transition: unknown
}
