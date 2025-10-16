/**
 * 核心类型定义
 */

// 节点类型
export type NodeType = 'doc' | 'paragraph' | 'text' | 'heading' | 'blockquote' |
  'codeBlock' | 'bulletList' | 'orderedList' | 'listItem' | 'taskList' | 'taskItem' |
  'table' | 'tableRow' | 'tableCell' | 'tableHeader' | 'image' | 'horizontalRule'

// 标记类型
export type MarkType = 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'link' | 'textColor' | 'backgroundColor'

// 节点属性
export interface NodeAttrs {
  [key: string]: any
}

// 标记
export interface Mark {
  type: MarkType
  attrs?: NodeAttrs
}

// 节点定义
export interface Node {
  type: NodeType
  attrs?: NodeAttrs
  content?: Node[]
  text?: string
  marks?: Mark[]
}

// 选区位置
export interface Position {
  node: Node
  offset: number
  path: number[]
}

// 选区范围
export interface Range {
  from: number
  to: number
}

// 选区
export interface Selection {
  anchor: number
  head: number
  empty: boolean
}

// 编辑器状态
export interface EditorState {
  doc: Node
  selection: Selection
  [key: string]: any
}

// 命令函数
export type Command = (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean

// 事务
export interface Transaction {
  doc: Node
  selection?: Selection
  steps: TransformStep[]
  meta: Map<string, any>
}

// 变换步骤
export interface TransformStep {
  type: 'replace' | 'addMark' | 'removeMark' | 'setAttrs'
  from?: number
  to?: number
  slice?: any
  mark?: Mark
  attrs?: NodeAttrs
}

// 插件配置
export interface PluginConfig {
  name: string
  commands?: Record<string, Command>
  keys?: Record<string, Command>
  schema?: SchemaSpec
  toolbar?: ToolbarItem[]
  init?: (editor: any) => void
  destroy?: () => void
}

// Schema 规范
export interface SchemaSpec {
  nodes?: Record<string, NodeSpec>
  marks?: Record<string, MarkSpec>
}

// 节点规范
export interface NodeSpec {
  content?: string
  marks?: string
  group?: string
  inline?: boolean
  atom?: boolean
  attrs?: Record<string, AttrSpec>
  parseDOM?: ParseRule[]
  toDOM?: (node: Node) => DOMOutputSpec
}

// 标记规范
export interface MarkSpec {
  attrs?: Record<string, AttrSpec>
  inclusive?: boolean
  excludes?: string
  parseDOM?: ParseRule[]
  toDOM?: (mark: Mark, inline: boolean) => DOMOutputSpec
}

// 属性规范
export interface AttrSpec {
  default?: any
  validate?: (value: any) => boolean
}

// 解析规则
export interface ParseRule {
  tag?: string
  style?: string
  attrs?: NodeAttrs | ((dom: HTMLElement) => NodeAttrs | null)
  getAttrs?: (dom: HTMLElement) => NodeAttrs | null
}

// DOM 输出规范
export type DOMOutputSpec = string | [string, NodeAttrs?, ...DOMOutputSpec[]] | { dom: HTMLElement }

// 工具栏项
export interface ToolbarItem {
  name: string
  title: string
  icon: string
  command: Command | string  // 支持函数或命令名称字符串
  active?: (state: EditorState) => boolean
  disabled?: (state: EditorState) => boolean
}

// 上传进度回调
export interface UploadProgress {
  loaded: number  // 已上传字节数
  total: number   // 总字节数
  percent: number // 百分比 (0-100)
}

// 文件上传处理器
export type UploadHandler = (file: File, onProgress?: (progress: UploadProgress) => void) => Promise<string>

// 编辑器选项
export interface EditorOptions {
  element?: HTMLElement | string
  content?: string | Node
  plugins?: (Plugin | string)[]
  toolbar?: boolean  // false 不创建工具栏，true 或省略则创建
  toolbarItems?: ToolbarItem[]  // 自定义工具栏项
  editable?: boolean
  autofocus?: boolean
  placeholder?: string
  uploadHandler?: UploadHandler  // 文件上传处理器
  onChange?: (content: string) => void
  onUpdate?: (state: EditorState) => void
  onFocus?: () => void
  onBlur?: () => void
}

// 插件接口
export interface Plugin {
  name: string
  config?: PluginConfig  // 使config可选
  install?: (editor: any) => void
  destroy?: () => void
}

// Editor类型
export interface Editor {
  commands: any
  dispatch: any
  plugins: any
  getState: () => EditorState
  [key: string]: any
}

// 键盘事件
export interface KeyboardEvent {
  key: string
  shiftKey?: boolean
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
}
