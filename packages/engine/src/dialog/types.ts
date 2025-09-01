/**
 * Dialog弹窗系统类型定义
 */

export type DialogType = 'alert' | 'confirm' | 'prompt' | 'custom'
export type DialogAnimation = 'fade' | 'zoom' | 'slide' | 'none'
export type DialogButtonType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'

export interface DialogConfig {
  id?: string
  type?: DialogType
  title?: string
  content?: string
  html?: boolean
  width?: string | number
  height?: string | number
  modal?: boolean
  closable?: boolean
  maskClosable?: boolean
  escClosable?: boolean
  draggable?: boolean
  resizable?: boolean
  centered?: boolean
  zIndex?: number
  customClass?: string
  showMask?: boolean
  maskStyle?: Record<string, string>
  bodyStyle?: Record<string, string>
  headerStyle?: Record<string, string>
  footerStyle?: Record<string, string>
  animation?: DialogAnimation
  animationDuration?: number
  buttons?: DialogButtonConfig[]
  onOpen?: () => void
  onClose?: (result?: any) => void
  onCancel?: () => void
  onConfirm?: (result?: any) => void
  beforeClose?: (result?: any) => boolean | Promise<boolean>
}

export interface DialogButtonConfig {
  text: string
  type?: DialogButtonType
  disabled?: boolean
  loading?: boolean
  autofocus?: boolean
  onClick?: (dialog: DialogInstance) => void | Promise<void>
}

export interface DialogPosition {
  top?: string | number
  left?: string | number
  right?: string | number
  bottom?: string | number
}

export interface DialogSize {
  width?: string | number
  height?: string | number
  minWidth?: string | number
  minHeight?: string | number
  maxWidth?: string | number
  maxHeight?: string | number
}

export interface DialogTheme {
  background?: string
  borderRadius?: string
  boxShadow?: string
  headerBackground?: string
  headerBorderBottom?: string
  footerBackground?: string
  footerBorderTop?: string
  maskBackground?: string
}

export interface DialogInstance {
  id: string
  options: DialogConfig
  element: HTMLElement
  maskElement?: HTMLElement
  visible: boolean
  zIndex: number
  result?: any
  open: () => Promise<void>
  close: (result?: any) => Promise<void>
  update: (options: Partial<DialogConfig>) => void
  destroy: () => void
  focus: () => void
  blur: () => void
  center: () => void
  setPosition: (position: DialogPosition) => void
  setSize: (size: DialogSize) => void
}

export interface DialogAPI {
  open: (options: DialogConfig) => Promise<DialogInstance>
  alert: (content: string, options?: Partial<DialogConfig>) => Promise<void>
  confirm: (
    content: string,
    options?: Partial<DialogConfig>
  ) => Promise<boolean>
  prompt: (
    content: string,
    defaultValue?: string,
    options?: Partial<DialogConfig>
  ) => Promise<string | null>
  close: (id: string, result?: any) => Promise<boolean>
  closeAll: () => Promise<void>
  getById: (id: string) => DialogInstance | null
  getAll: () => DialogInstance[]
  getVisible: () => DialogInstance[]
  config: (options: DialogGlobalConfig) => void
}

export interface DialogGlobalConfig {
  zIndexBase?: number
  zIndexStep?: number
  defaultAnimation?: DialogAnimation
  defaultAnimationDuration?: number
  maxDialogs?: number
  escapeKeyClose?: boolean
  clickMaskClose?: boolean
  theme?: DialogTheme
}

// Dialog事件类型
export interface DialogEvents {
  'dialog:open': { instance: DialogInstance }
  'dialog:close': { instance: DialogInstance; result?: any }
  'dialog:cancel': { instance: DialogInstance }
  'dialog:confirm': { instance: DialogInstance; result?: any }
  'dialog:resize': { instance: DialogInstance; size: DialogSize }
  'dialog:move': { instance: DialogInstance; position: DialogPosition }
  'dialog:focus': { instance: DialogInstance }
  'dialog:blur': { instance: DialogInstance }
}

// Dialog插件接口
export interface DialogPlugin {
  name: string
  install: (dialogAPI: DialogAPI) => void
  uninstall?: (dialogAPI: DialogAPI) => void
}

// Dialog中间件
export type DialogMiddleware = (
  options: DialogConfig,
  next: (options: DialogConfig) => Promise<DialogInstance>
) => Promise<DialogInstance>

// Dialog过滤器
export type DialogFilter = (options: DialogConfig) => boolean

// Dialog转换器
export type DialogTransformer = (options: DialogConfig) => DialogConfig

// Dialog验证器
export interface DialogValidator {
  validate: (options: DialogConfig) => {
    valid: boolean
    errors: string[]
  }
}

// Dialog渲染器接口
export interface DialogRenderer {
  render: (options: DialogConfig) => HTMLElement
  renderHeader: (options: DialogConfig) => HTMLElement | null
  renderBody: (options: DialogConfig) => HTMLElement
  renderFooter: (options: DialogConfig) => HTMLElement | null
  update: (element: HTMLElement, options: DialogConfig) => void
  destroy: (element: HTMLElement) => void
}

// Dialog动画控制器接口
export interface DialogAnimationController {
  enter: (
    element: HTMLElement,
    animation: DialogAnimation,
    duration: number
  ) => Promise<void>
  leave: (
    element: HTMLElement,
    animation: DialogAnimation,
    duration: number
  ) => Promise<void>
  getAnimationClasses: (animation: DialogAnimation) => {
    enter: string
    enterActive: string
    leave: string
    leaveActive: string
  }
}

// Dialog位置管理器接口
export interface DialogPositionManager {
  center: (element: HTMLElement) => void
  setPosition: (element: HTMLElement, position: DialogPosition) => void
  getPosition: (element: HTMLElement) => DialogPosition
  constrainToViewport: (element: HTMLElement) => void
}

// Dialog层级管理器接口
export interface DialogZIndexManager {
  getNext: () => number
  getCurrent: () => number
  reset: () => void
  reserve: (count: number) => number[]
}

// Dialog拖拽控制器接口
export interface DialogDragController {
  enable: (dialog: DialogInstance) => void
  disable: (dialog: DialogInstance) => void
  isEnabled: (dialog: DialogInstance) => boolean
}

// Dialog调整大小控制器接口
export interface DialogResizeController {
  enable: (dialog: DialogInstance) => void
  disable: (dialog: DialogInstance) => void
  isEnabled: (dialog: DialogInstance) => boolean
  setMinSize: (dialog: DialogInstance, size: DialogSize) => void
  setMaxSize: (dialog: DialogInstance, size: DialogSize) => void
}

// Dialog焦点管理器接口
export interface DialogFocusManager {
  trap: (dialog: DialogInstance) => void
  release: (dialog: DialogInstance) => void
  focus: (dialog: DialogInstance) => void
  blur: (dialog: DialogInstance) => void
  getFirstFocusable: (element: HTMLElement) => HTMLElement | null
  getLastFocusable: (element: HTMLElement) => HTMLElement | null
}

// Dialog键盘控制器接口
export interface DialogKeyboardController {
  bind: (dialog: DialogInstance) => void
  unbind: (dialog: DialogInstance) => void
  handleEscape: (dialog: DialogInstance) => void
  handleEnter: (dialog: DialogInstance) => void
  handleTab: (dialog: DialogInstance, event: KeyboardEvent) => void
}

// Dialog可访问性接口
export interface DialogAccessibility {
  setAriaAttributes: (dialog: DialogInstance) => void
  announceOpen: (dialog: DialogInstance) => void
  announceClose: (dialog: DialogInstance) => void
  setRole: (element: HTMLElement, role: string) => void
  setAriaLabel: (element: HTMLElement, label: string) => void
  setAriaDescribedBy: (element: HTMLElement, id: string) => void
}

// Dialog生命周期钩子
export interface DialogLifecycleHooks {
  beforeCreate?: (options: DialogConfig) => DialogConfig | false
  created?: (instance: DialogInstance) => void
  beforeMount?: (instance: DialogInstance) => void
  mounted?: (instance: DialogInstance) => void
  beforeUpdate?: (instance: DialogInstance, newOptions: DialogConfig) => void
  updated?: (instance: DialogInstance, oldOptions: DialogConfig) => void
  beforeDestroy?: (instance: DialogInstance) => void
  destroyed?: (instance: DialogInstance) => void
  beforeOpen?: (instance: DialogInstance) => void
  opened?: (instance: DialogInstance) => void
  beforeClose?: (
    instance: DialogInstance,
    result?: any
  ) => boolean | Promise<boolean>
  closed?: (instance: DialogInstance, result?: any) => void
}

// Dialog配置构建器
export interface DialogConfigBuilder {
  type: (type: DialogType) => DialogConfigBuilder
  title: (title: string) => DialogConfigBuilder
  content: (content: string) => DialogConfigBuilder
  html: (html: boolean) => DialogConfigBuilder
  size: (
    width: string | number,
    height?: string | number
  ) => DialogConfigBuilder
  width: (width: string | number) => DialogConfigBuilder
  height: (height: string | number) => DialogConfigBuilder
  modal: (modal: boolean) => DialogConfigBuilder
  closable: (closable: boolean) => DialogConfigBuilder
  maskClosable: (maskClosable: boolean) => DialogConfigBuilder
  draggable: (draggable: boolean) => DialogConfigBuilder
  resizable: (resizable: boolean) => DialogConfigBuilder
  centered: (centered: boolean) => DialogConfigBuilder
  animation: (
    animation: DialogAnimation,
    duration?: number
  ) => DialogConfigBuilder
  customClass: (className: string) => DialogConfigBuilder
  button: (
    text: string,
    type?: DialogButtonType,
    onClick?: (dialog: DialogInstance) => void
  ) => DialogConfigBuilder
  buttons: (buttons: DialogButtonConfig[]) => DialogConfigBuilder
  onOpen: (callback: () => void) => DialogConfigBuilder
  onClose: (callback: (result?: any) => void) => DialogConfigBuilder
  beforeClose: (
    callback: (result?: any) => boolean | Promise<boolean>
  ) => DialogConfigBuilder
  build: () => DialogConfig
}

// Dialog工厂接口
export interface DialogFactory {
  create: (type: DialogType, options: Partial<DialogConfig>) => DialogInstance
  createAlert: (
    content: string,
    options?: Partial<DialogConfig>
  ) => DialogInstance
  createConfirm: (
    content: string,
    options?: Partial<DialogConfig>
  ) => DialogInstance
  createPrompt: (
    content: string,
    defaultValue?: string,
    options?: Partial<DialogConfig>
  ) => DialogInstance
  createCustom: (options: DialogConfig) => DialogInstance
}

// Dialog服务接口
export interface DialogService extends DialogAPI {
  use: (plugin: DialogPlugin) => void
  addMiddleware: (middleware: DialogMiddleware) => void
  addFilter: (filter: DialogFilter) => void
  addTransformer: (transformer: DialogTransformer) => void
  setValidator: (validator: DialogValidator) => void
  setRenderer: (renderer: DialogRenderer) => void
  setAnimationController: (controller: DialogAnimationController) => void
  setPositionManager: (manager: DialogPositionManager) => void
  setZIndexManager: (manager: DialogZIndexManager) => void
  setDragController: (controller: DialogDragController) => void
  setResizeController: (controller: DialogResizeController) => void
  setFocusManager: (manager: DialogFocusManager) => void
  setKeyboardController: (controller: DialogKeyboardController) => void
  setAccessibility: (accessibility: DialogAccessibility) => void
  on: <K extends keyof DialogEvents>(
    event: K,
    callback: (data: DialogEvents[K]) => void
  ) => void
  off: <K extends keyof DialogEvents>(
    event: K,
    callback: (data: DialogEvents[K]) => void
  ) => void
  emit: <K extends keyof DialogEvents>(event: K, data: DialogEvents[K]) => void
}

// Dialog队列接口
export interface DialogQueue {
  enqueue: (options: DialogConfig) => void
  dequeue: () => DialogConfig | null
  peek: () => DialogConfig | null
  size: () => number
  clear: () => void
  process: () => Promise<void>
}

// Dialog统计接口
export interface DialogStats {
  totalOpened: number
  totalClosed: number
  currentVisible: number
  averageOpenDuration: number
  typeStats: Record<DialogType, number>
  animationStats: Record<DialogAnimation, number>
}

// Dialog性能监控接口
export interface DialogPerformance {
  startTiming: (id: string, operation: string) => void
  endTiming: (id: string, operation: string) => number
  getMetrics: () => {
    averageRenderTime: number
    averageAnimationTime: number
    averageOpenTime: number
    averageCloseTime: number
    memoryUsage: number
  }
}

// Dialog错误处理接口
export interface DialogErrorHandler {
  handleError: (
    error: Error,
    context: {
      instance?: DialogInstance
      operation: string
      options?: DialogConfig
    }
  ) => void
  onError: (callback: (error: Error, context: any) => void) => void
}
