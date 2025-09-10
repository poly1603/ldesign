/**
 * 消息系统类型定义
 */

export type MessageType = 'success' | 'error' | 'warning' | 'info' | 'loading'
export type MessagePosition = 'top' | 'center' | 'bottom'

export interface MessageConfig {
  id?: string
  type?: MessageType
  title?: string
  content: string
  duration?: number
  position?: MessagePosition
  offset?: number
  showClose?: boolean
  html?: boolean
  customClass?: string
  zIndex?: number
  onClose?: () => void
  onClick?: () => void
  onLoad?: () => void
}

export interface MessageTheme {
  background: string
  border: string
  color: string
  iconColor?: string
}

export interface MessageAnimation {
  enter: string
  leave: string
  duration: number
}

export interface MessageGlobalConfig {
  maxCount?: number
  defaultDuration?: number
  defaultPosition?: MessagePosition
  defaultOffset?: number
  zIndex?: number
  gap?: number
  theme?: Partial<Record<MessageType, MessageTheme>>
  animation?: MessageAnimation
}

export interface MessageAPI {
  show: (options: MessageConfig) => MessageInstance
  success: (
    content: string,
    options?: Partial<MessageConfig>
  ) => MessageInstance
  error: (content: string, options?: Partial<MessageConfig>) => MessageInstance
  warning: (
    content: string,
    options?: Partial<MessageConfig>
  ) => MessageInstance
  info: (content: string, options?: Partial<MessageConfig>) => MessageInstance
  loading: (
    content: string,
    options?: Partial<MessageConfig>
  ) => MessageInstance
  close: (id: string) => boolean
  closeAll: () => void
  config: (options: MessageGlobalConfig) => void
}

export interface MessageInstance {
  id: string
  options: MessageConfig
  element: HTMLElement
  timer?: number
  visible: boolean
  close: () => void
  update: (options: Partial<MessageConfig>) => void
}

export interface MessageContainer {
  element: HTMLElement
  instances: Map<string, MessageInstance>
  position: MessagePosition
}

// 消息事件类型
export interface MessageEvents {
  'message:show': { instance: MessageInstance }
  'message:close': { instance: MessageInstance }
  'message:click': { instance: MessageInstance; event: MouseEvent }
  'message:update': { instance: MessageInstance; oldOptions: MessageConfig }
}

// 消息插件接口
export interface MessagePlugin {
  name: string
  install: (messageAPI: MessageAPI) => void
  uninstall?: (messageAPI: MessageAPI) => void
}

// 消息中间件
export type MessageMiddleware = (
  options: MessageConfig,
  next: (options: MessageConfig) => MessageInstance
) => MessageInstance

// 消息过滤器
export type MessageFilter = (options: MessageConfig) => boolean

// 消息转换器
export type MessageTransformer = (options: MessageConfig) => MessageConfig

// 消息验证器
export interface MessageValidator {
  validate: (options: MessageConfig) => {
    valid: boolean
    errors: string[]
  }
}

// 消息存储接口
export interface MessageStorage {
  save: (instance: MessageInstance) => void
  load: (id: string) => MessageInstance | null
  remove: (id: string) => boolean
  clear: () => void
  getAll: () => MessageInstance[]
}

// 消息队列接口
export interface MessageQueue {
  enqueue: (options: MessageConfig) => void
  dequeue: () => MessageConfig | null
  peek: () => MessageConfig | null
  size: () => number
  clear: () => void
}

// 消息统计接口
export interface MessageStats {
  totalShown: number
  totalClosed: number
  currentVisible: number
  averageDuration: number
  typeStats: Record<MessageType, number>
  positionStats: Record<MessagePosition, number>
}

// 消息渲染器接口
export interface MessageRenderer {
  render: (options: MessageConfig) => HTMLElement
  update: (element: HTMLElement, options: MessageConfig) => void
  destroy: (element: HTMLElement) => void
}

// 消息动画控制器接口
export interface MessageAnimationController {
  enter: (element: HTMLElement) => Promise<void>
  leave: (element: HTMLElement) => Promise<void>
  update: (
    element: HTMLElement,
    from: MessageConfig,
    to: MessageConfig
  ) => Promise<void>
}

// 消息位置管理器接口
export interface MessagePositionManager {
  calculate: (
    instance: MessageInstance,
    allInstances: MessageInstance[]
  ) => {
    top?: number
    bottom?: number
    left?: number
    right?: number
  }
  adjust: (instances: MessageInstance[]) => void
}

// 消息主题管理器接口
export interface MessageThemeManager {
  getTheme: (type: MessageType) => MessageTheme
  setTheme: (type: MessageType, theme: MessageTheme) => void
  applyTheme: (element: HTMLElement, type: MessageType) => void
}

// 消息国际化接口
export interface MessageI18n {
  t: (key: string, params?: Record<string, unknown>) => string
  setLocale: (locale: string) => void
  getLocale: () => string
}

// 消息可访问性接口
export interface MessageAccessibility {
  announce: (message: string) => void
  setAriaLabel: (element: HTMLElement, label: string) => void
  setRole: (element: HTMLElement, role: string) => void
  addKeyboardSupport: (element: HTMLElement, instance: MessageInstance) => void
}

// 消息性能监控接口
export interface MessagePerformance {
  startTiming: (id: string) => void
  endTiming: (id: string) => number
  getMetrics: () => {
    averageRenderTime: number
    averageAnimationTime: number
    memoryUsage: number
  }
}

// 消息错误处理接口
export interface MessageErrorHandler {
  handleError: (
    error: Error,
    context: {
      instance?: MessageInstance
      operation: string
      options?: MessageConfig
    }
  ) => void
  onError: (callback: (error: Error, context: unknown) => void) => void
}

// 消息生命周期钩子
export interface MessageLifecycleHooks {
  beforeCreate?: (options: MessageConfig) => MessageConfig | false
  created?: (instance: MessageInstance) => void
  beforeMount?: (instance: MessageInstance) => void
  mounted?: (instance: MessageInstance) => void
  beforeUpdate?: (instance: MessageInstance, newOptions: MessageConfig) => void
  updated?: (instance: MessageInstance, oldOptions: MessageConfig) => void
  beforeDestroy?: (instance: MessageInstance) => void
  destroyed?: (instance: MessageInstance) => void
}

// 消息配置构建器
export interface MessageConfigBuilder {
  type: (type: MessageType) => MessageConfigBuilder
  content: (content: string) => MessageConfigBuilder
  title: (title: string) => MessageConfigBuilder
  duration: (duration: number) => MessageConfigBuilder
  position: (position: MessagePosition) => MessageConfigBuilder
  showClose: (show: boolean) => MessageConfigBuilder
  html: (html: boolean) => MessageConfigBuilder
  customClass: (className: string) => MessageConfigBuilder
  onClick: (callback: () => void) => MessageConfigBuilder
  onClose: (callback: () => void) => MessageConfigBuilder
  build: () => MessageConfig
}

// 消息工厂接口
export interface MessageFactory {
  create: (
    type: MessageType,
    content: string,
    options?: Partial<MessageConfig>
  ) => MessageInstance
  createSuccess: (
    content: string,
    options?: Partial<MessageConfig>
  ) => MessageInstance
  createError: (
    content: string,
    options?: Partial<MessageConfig>
  ) => MessageInstance
  createWarning: (
    content: string,
    options?: Partial<MessageConfig>
  ) => MessageInstance
  createInfo: (
    content: string,
    options?: Partial<MessageConfig>
  ) => MessageInstance
  createLoading: (
    content: string,
    options?: Partial<MessageConfig>
  ) => MessageInstance
}

// 消息服务接口
export interface MessageService extends MessageAPI {
  use: (plugin: MessagePlugin) => void
  addMiddleware: (middleware: MessageMiddleware) => void
  addFilter: (filter: MessageFilter) => void
  addTransformer: (transformer: MessageTransformer) => void
  setValidator: (validator: MessageValidator) => void
  setStorage: (storage: MessageStorage) => void
  setQueue: (queue: MessageQueue) => void
  getStats: () => MessageStats
  on: <K extends keyof MessageEvents>(
    event: K,
    callback: (data: MessageEvents[K]) => void
  ) => void
  off: <K extends keyof MessageEvents>(
    event: K,
    callback: (data: MessageEvents[K]) => void
  ) => void
  emit: <K extends keyof MessageEvents>(
    event: K,
    data: MessageEvents[K]
  ) => void
}
