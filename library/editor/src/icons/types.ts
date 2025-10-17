/**
 * 图标系统类型定义
 */

/**
 * 图标集类型
 */
export type IconSetType = 'lucide' | 'feather' | 'material' | 'custom'

/**
 * 图标样式
 */
export interface IconStyle {
  size?: number | string
  color?: string
  strokeWidth?: number
  fill?: string
  className?: string
}

/**
 * 图标定义
 */
export interface IconDefinition {
  name: string
  svg: string
  viewBox?: string
  category?: IconCategory
  tags?: string[]
  aliases?: string[]
}

/**
 * 图标分类
 */
export enum IconCategory {
  EDITOR = 'editor',
  FORMAT = 'format',
  ACTION = 'action',
  FILE = 'file',
  NAVIGATION = 'navigation',
  MEDIA = 'media',
  ARROW = 'arrow',
  SHAPE = 'shape',
  DEVICE = 'device',
  SOCIAL = 'social',
  OTHER = 'other'
}

/**
 * 图标集
 */
export interface IconSet {
  name: IconSetType
  displayName: string
  version?: string
  author?: string
  license?: string
  icons: Map<string, IconDefinition>
  getIcon(name: string): IconDefinition | null
  getAllIcons(): IconDefinition[]
  getIconsByCategory(category: IconCategory): IconDefinition[]
  searchIcons(query: string): IconDefinition[]
}

/**
 * 图标渲染选项
 */
export interface IconRenderOptions extends IconStyle {
  title?: string
  ariaLabel?: string
  inline?: boolean
  spinning?: boolean
}

/**
 * 图标管理器配置
 */
export interface IconManagerConfig {
  defaultSet?: IconSetType
  defaultStyle?: IconStyle
  customSets?: Map<string, IconSet>
  fallbackIcon?: string
  enableCache?: boolean
}

/**
 * 图标管理器接口
 */
export interface IIconManager {
  // 获取图标
  getIcon(name: string, set?: IconSetType): IconDefinition | null
  
  // 渲染图标
  renderIcon(name: string, options?: IconRenderOptions): string
  
  // 创建图标元素
  createIconElement(name: string, options?: IconRenderOptions): HTMLElement
  
  // 设置默认图标集
  setDefaultIconSet(set: IconSetType): void
  
  // 获取当前图标集
  getCurrentIconSet(): IconSetType
  
  // 注册自定义图标
  registerIcon(name: string, svg: string, set?: IconSetType): void
  
  // 注册图标集
  registerIconSet(set: IconSet): void
  
  // 获取所有可用的图标集
  getAvailableIconSets(): IconSetType[]
  
  // 搜索图标
  searchIcons(query: string, set?: IconSetType): IconDefinition[]
  
  // 获取分类图标
  getIconsByCategory(category: IconCategory, set?: IconSetType): IconDefinition[]
  
  // 批量替换图标
  replaceAllIcons(set: IconSetType): void
}

/**
 * 编辑器常用图标映射
 * 定义编辑器功能与图标名称的映射关系
 */
export interface EditorIconMap {
  // 格式化
  bold: string
  italic: string
  underline: string
  strikethrough: string
  code: string
  subscript: string
  superscript: string
  clearFormat: string
  
  // 标题和段落
  heading: string
  heading1: string
  heading2: string
  heading3: string
  paragraph: string
  blockquote: string
  
  // 列表
  bulletList: string
  orderedList: string
  taskList: string
  indent: string
  outdent: string
  
  // 对齐
  alignLeft: string
  alignCenter: string
  alignRight: string
  alignJustify: string
  
  // 插入
  link: string
  unlink: string
  image: string
  video: string
  table: string
  horizontalRule: string
  emoji: string
  template: string
  
  // 操作
  undo: string
  redo: string
  copy: string
  cut: string
  paste: string
  delete: string
  selectAll: string
  
  // 查找
  search: string
  replace: string
  
  // 视图
  fullscreen: string
  exitFullscreen: string
  preview: string
  sourceCode: string
  
  // 文件
  save: string
  open: string
  'export': string
  'import': string
  print: string
  
  // 工具
  settings: string
  help: string
  info: string
  more: string
  
  // AI
  ai: string
  aiSuggest: string
  aiTranslate: string
  aiImprove: string
  
  // 颜色
  textColor: string
  backgroundColor: string
  colorPicker: string
  
  // 表格
  insertRowAbove: string
  insertRowBelow: string
  insertColumnLeft: string
  insertColumnRight: string
  deleteRow: string
  deleteColumn: string
  deleteTable: string
  mergeCells: string
  splitCell: string
  
  // 箭头
  arrowUp: string
  arrowDown: string
  arrowLeft: string
  arrowRight: string
  chevronUp: string
  chevronDown: string
  chevronLeft: string
  chevronRight: string
  
  // 其他
  close: string
  check: string
  plus: string
  minus: string
  refresh: string
  download: string
  upload: string
  share: string
  lock: string
  unlock: string
  user: string
  calendar: string
  clock: string
  folder: string
  file: string
  tag: string
  bookmark: string
  star: string
  heart: string
  comment: string
  bell: string
  warning: string
  error: string
  success: string
}

/**
 * 图标加载器
 */
export interface IconLoader {
  load(): Promise<Map<string, IconDefinition>>
  loadFromUrl?(url: string): Promise<Map<string, IconDefinition>>
  loadFromString?(data: string): Map<string, IconDefinition>
}