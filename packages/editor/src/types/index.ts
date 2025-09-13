/**
 * 编辑器核心类型定义
 * 定义编辑器的基础类型、接口和枚举
 */

// ==================== 基础类型 ====================

/**
 * 编辑器配置选项
 */
export interface EditorOptions {
  /** 容器元素选择器或DOM元素 */
  container: string | HTMLElement
  /** 初始内容 */
  content?: string
  /** 启用的插件列表 */
  plugins?: string[]
  /** 主题配置 */
  theme?: string | ThemeConfig
  /** 响应式断点配置 */
  breakpoints?: BreakpointConfig
  /** 工具栏配置 */
  toolbar?: ToolbarConfig
  /** 是否只读模式 */
  readonly?: boolean
  /** 是否启用拼写检查 */
  spellcheck?: boolean
  /** 占位符文本 */
  placeholder?: string
  /** 事件回调 */
  onChange?: (content: string) => void
  onSelectionChange?: (selection: Selection) => void
  onFocus?: () => void
  onBlur?: () => void
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string
  /** CSS变量覆盖 */
  variables?: Record<string, string>
  /** 自定义CSS类名 */
  className?: string
}

/**
 * 响应式断点配置
 */
export interface BreakpointConfig {
  /** 手机端断点 */
  mobile: number
  /** 平板端断点 */
  tablet: number
  /** PC端断点 */
  desktop?: number
}

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
  /** 工具栏位置 */
  position: 'top' | 'bottom' | 'floating'
  /** 是否固定 */
  sticky?: boolean
  /** 工具栏项目 */
  items: ToolbarItem[]
  /** 是否可见 */
  visible?: boolean
}

/**
 * 工具栏项目
 */
export type ToolbarItem = string | ToolbarGroup | ToolbarSeparator

/**
 * 工具栏分组
 */
export interface ToolbarGroup {
  type: 'group'
  items: string[]
  label?: string
}

/**
 * 工具栏分隔符
 */
export interface ToolbarSeparator {
  type: 'separator'
}

// ==================== 编辑器状态 ====================

/**
 * 编辑器状态
 */
export interface EditorState {
  /** 文档内容 */
  content: string
  /** 当前选区 */
  selection: Selection | null
  /** 历史记录 */
  history: HistoryState
  /** 是否聚焦 */
  focused: boolean
  /** 是否只读 */
  readonly: boolean
  /** 当前设备类型 */
  deviceType: DeviceType
  /** 插件状态 */
  plugins: Record<string, PluginState>
}

/**
 * 历史记录状态
 */
export interface HistoryState {
  /** 历史记录栈 */
  stack: HistoryEntry[]
  /** 当前位置 */
  index: number
  /** 最大历史记录数 */
  maxSize: number
}

/**
 * 历史记录条目
 */
export interface HistoryEntry {
  /** 内容 */
  content: string
  /** 选区 */
  selection: Selection | null
  /** 时间戳 */
  timestamp: number
}

/**
 * 设备类型
 */
export enum DeviceType {
  Mobile = 'mobile',
  Tablet = 'tablet',
  Desktop = 'desktop'
}

/**
 * 插件状态
 */
export interface PluginState {
  /** 是否启用 */
  enabled: boolean
  /** 插件数据 */
  data?: any
}

// ==================== 选区和范围 ====================

/**
 * 选区信息
 */
export interface Selection {
  /** 起始位置 */
  start: Position
  /** 结束位置 */
  end: Position
  /** 是否折叠 */
  collapsed: boolean
  /** 选中的文本 */
  text: string
  /** 选中的HTML */
  html: string
}

/**
 * 位置信息
 */
export interface Position {
  /** 节点 */
  node: Node
  /** 偏移量 */
  offset: number
}

/**
 * 范围信息
 */
export interface Range {
  /** 起始容器 */
  startContainer: Node
  /** 起始偏移量 */
  startOffset: number
  /** 结束容器 */
  endContainer: Node
  /** 结束偏移量 */
  endOffset: number
  /** 是否折叠 */
  collapsed: boolean
}

// ==================== 命令系统 ====================

/**
 * 命令接口
 */
export interface Command {
  /** 命令名称 */
  name: string
  /** 执行命令 */
  execute: (editor: IEditor, ...args: any[]) => boolean
  /** 是否可以执行 */
  canExecute?: (editor: IEditor, ...args: any[]) => boolean
  /** 是否处于激活状态 */
  isActive?: (editor: IEditor) => boolean
}

/**
 * 命令执行结果
 */
export interface CommandResult {
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
  /** 返回数据 */
  data?: any
}

// ==================== 事件系统 ====================

/**
 * 事件类型
 */
export enum EventType {
  // 内容事件
  ContentChange = 'contentChange',
  BeforeContentChange = 'beforeContentChange',

  // 选区事件
  SelectionChange = 'selectionChange',

  // 焦点事件
  Focus = 'focus',
  Blur = 'blur',

  // 键盘事件
  KeyDown = 'keyDown',
  KeyUp = 'keyUp',
  KeyPress = 'keyPress',

  // 鼠标事件
  MouseDown = 'mouseDown',
  MouseUp = 'mouseUp',
  Click = 'click',

  // 插件事件
  PluginLoaded = 'pluginLoaded',
  PluginUnloaded = 'pluginUnloaded',

  // 生命周期事件
  Init = 'init',
  Destroy = 'destroy',

  // 快捷键事件
  ShortcutExecuted = 'shortcutExecuted',

  // 历史记录事件
  HistoryChange = 'historyChange'
}

/**
 * 事件监听器
 */
export type EventListener<T = any> = (event: EditorEvent<T>) => void

/**
 * 编辑器事件
 */
export interface EditorEvent<T = any> {
  /** 事件类型 */
  type: EventType
  /** 事件数据 */
  data: T
  /** 时间戳 */
  timestamp: number
  /** 是否可以取消 */
  cancelable: boolean
  /** 是否已取消 */
  cancelled: boolean
  /** 取消事件 */
  preventDefault: () => void
}

// ==================== 插件系统 ====================

/**
 * 插件接口
 */
export interface IPlugin {
  /** 插件名称 */
  readonly name: string
  /** 插件版本 */
  readonly version: string
  /** 插件描述 */
  readonly description?: string
  /** 插件依赖 */
  readonly dependencies?: string[]

  /** 初始化插件 */
  init(editor: IEditor): void
  /** 销毁插件 */
  destroy(): void
  /** 获取命令 */
  getCommands?(): Command[]
  /** 获取工具栏项 */
  getToolbarItems?(): ToolbarItem[]
}

/**
 * 插件管理器接口
 */
export interface IPluginManager {
  /** 注册插件 */
  register(plugin: IPlugin): void
  /** 注销插件 */
  unregister(name: string): void
  /** 获取插件 */
  get(name: string): IPlugin | undefined
  /** 获取所有插件 */
  getAll(): IPlugin[]
  /** 启用插件 */
  enable(name: string): void
  /** 禁用插件 */
  disable(name: string): void
  /** 检查插件是否启用 */
  isEnabled(name: string): boolean
  /** 销毁管理器 */
  destroy(): void
}

// ==================== 媒体管理接口 ====================

/**
 * 媒体文件类型
 */
export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'other'

/**
 * 媒体文件信息
 */
export interface MediaFile {
  /** 文件ID */
  id: string
  /** 文件名 */
  name: string
  /** 文件类型 */
  type: MediaType
  /** MIME类型 */
  mimeType: string
  /** 文件大小（字节） */
  size: number
  /** 文件URL */
  url: string
  /** 缩略图URL */
  thumbnailUrl?: string
  /** 上传时间 */
  uploadTime: Date
  /** 文件元数据 */
  metadata?: Record<string, any>
}

/**
 * 上传配置
 */
export interface UploadConfig {
  /** 允许的文件类型 */
  allowedTypes: string[]
  /** 最大文件大小（字节） */
  maxSize: number
  /** 上传URL */
  uploadUrl: string
  /** 请求头 */
  headers?: Record<string, string>
  /** 是否支持多文件上传 */
  multiple?: boolean
}

/**
 * 媒体管理器接口
 */
export interface IMediaManager {
  /** 上传文件 */
  upload(files: File[]): Promise<MediaFile[]>
  /** 获取媒体文件 */
  getMedia(id: string): MediaFile | undefined
  /** 获取所有媒体文件 */
  getAllMedia(): MediaFile[]
  /** 删除媒体文件 */
  deleteMedia(id: string): boolean
  /** 设置上传配置 */
  setUploadConfig(config: UploadConfig): void
  /** 销毁管理器 */
  destroy(): void
}

// ==================== 导入导出接口 ====================

/**
 * 支持的导入导出格式
 */
export type ImportExportFormat = 'html' | 'markdown' | 'text' | 'json' | 'docx' | 'pdf'

/**
 * 导入导出选项
 */
export interface ImportExportOptions {
  /** 格式 */
  format: ImportExportFormat
  /** 是否包含样式 */
  includeStyles?: boolean
  /** 是否包含媒体文件 */
  includeMedia?: boolean
  /** 自定义配置 */
  customOptions?: Record<string, any>
}

/**
 * 导入导出管理器接口
 */
export interface IImportExportManager {
  /** 导入内容 */
  import(data: string | File, options: ImportExportOptions): Promise<string>
  /** 导出内容 */
  export(content: string, options: ImportExportOptions): Promise<string | Blob>
  /** 获取支持的格式 */
  getSupportedFormats(): ImportExportFormat[]
  /** 销毁管理器 */
  destroy(): void
}

// ==================== 快捷键接口 ====================

/**
 * 快捷键定义
 */
export interface Shortcut {
  /** 快捷键组合 */
  key: string
  /** 命令名称 */
  command: string
  /** 描述 */
  description?: string
  /** 是否启用 */
  enabled?: boolean
}

/**
 * 快捷键管理器接口
 */
export interface IShortcutManager {
  /** 注册快捷键 */
  register(shortcut: Shortcut): void
  /** 注销快捷键 */
  unregister(key: string): void
  /** 获取所有快捷键 */
  getAll(): Shortcut[]
  /** 处理键盘事件 */
  handleKeyEvent(event: KeyboardEvent): boolean
  /** 销毁管理器 */
  destroy(): void
}

// ==================== 搜索替换接口 ====================

/**
 * 搜索选项
 */
export interface SearchOptions {
  /** 是否区分大小写 */
  caseSensitive?: boolean
  /** 是否全词匹配 */
  wholeWord?: boolean
  /** 是否使用正则表达式 */
  regex?: boolean
  /** 搜索范围 */
  scope?: 'all' | 'selection'
}

/**
 * 搜索结果
 */
export interface SearchResult {
  /** 匹配的文本 */
  text: string
  /** 开始位置 */
  start: number
  /** 结束位置 */
  end: number
  /** 行号 */
  line: number
  /** 列号 */
  column: number
}

/**
 * 搜索管理器接口
 */
export interface ISearchManager {
  /** 搜索文本 */
  search(query: string, options?: SearchOptions): SearchResult[]
  /** 替换文本 */
  replace(query: string, replacement: string, options?: SearchOptions): number
  /** 替换所有 */
  replaceAll(query: string, replacement: string, options?: SearchOptions): number
  /** 高亮搜索结果 */
  highlight(results: SearchResult[]): void
  /** 清除高亮 */
  clearHighlight(): void
  /** 销毁管理器 */
  destroy(): void
}

// ==================== 编辑器接口 ====================

/**
 * 编辑器核心接口
 */
export interface IEditor {
  /** 编辑器状态 */
  readonly state: EditorState
  /** 插件管理器 */
  readonly plugins: IPluginManager
  /** 命令管理器 */
  readonly commands: ICommandManager
  /** 事件管理器 */
  readonly events: IEventManager
  /** 选区管理器 */
  readonly selection: ISelectionManager
  /** 快捷键管理器 */
  readonly shortcuts?: IShortcutManager
  /** 历史记录管理器 */
  readonly history?: any

  /** 初始化编辑器 */
  init(): void
  /** 销毁编辑器 */
  destroy(): void

  /** 获取内容 */
  getContent(): string
  /** 设置内容 */
  setContent(content: string): void
  /** 插入内容 */
  insertContent(content: string): void

  /** 执行命令 */
  executeCommand(name: string, ...args: any[]): CommandResult

  /** 聚焦编辑器 */
  focus(): void
  /** 失焦编辑器 */
  blur(): void
}

/**
 * 命令管理器接口
 */
export interface ICommandManager {
  /** 注册命令 */
  register(command: Command): void
  /** 注销命令 */
  unregister(name: string): void
  /** 执行命令 */
  execute(name: string, ...args: any[]): CommandResult
  /** 检查命令是否可执行 */
  canExecute(name: string, ...args: any[]): boolean
  /** 检查命令是否激活 */
  isActive(name: string): boolean
  /** 销毁管理器 */
  destroy(): void
}

/**
 * 事件管理器接口
 */
export interface IEventManager {
  /** 监听事件 */
  on<T = any>(type: EventType, listener: EventListener<T>): void
  /** 移除事件监听 */
  off<T = any>(type: EventType, listener: EventListener<T>): void
  /** 触发事件 */
  emit<T = any>(type: EventType, data: T): EditorEvent<T>
  /** 销毁管理器 */
  destroy(): void
}

/**
 * 选区管理器接口
 */
export interface ISelectionManager {
  /** 获取当前选区 */
  getSelection(): Selection | null
  /** 设置选区 */
  setSelection(selection: Selection): void
  /** 获取选区范围 */
  getRange(): Range | null
  /** 设置选区范围 */
  setRange(range: Range): void
  /** 折叠选区 */
  collapse(toStart?: boolean): void
  /** 选择全部 */
  selectAll(): void
  /** 删除选中内容 */
  deleteContents(): void
  /** 销毁管理器 */
  destroy(): void
}
