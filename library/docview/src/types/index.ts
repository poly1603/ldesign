/**
 * 支持的文档类型
 */
export enum DocumentType {
  WORD = 'word',
  EXCEL = 'excel',
  POWERPOINT = 'powerpoint'
}

/**
 * 文档查看器配置选项
 */
export interface DocumentViewerOptions {
  /** 容器元素 */
  container: HTMLElement | string
  /** 是否启用编辑功能 */
  editable?: boolean
  /** 工具栏配置 */
  toolbar?: ToolbarConfig
  /** 主题配置 */
  theme?: ThemeConfig
  /** 回调函数 */
  callbacks?: CallbackConfig
}

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
  /** 是否显示工具栏 */
  show?: boolean
  /** 工具栏位置 */
  position?: 'top' | 'bottom'
  /** 自定义工具栏项 */
  items?: ToolbarItem[]
}

/**
 * 工具栏项
 */
export interface ToolbarItem {
  type: 'button' | 'separator' | 'dropdown'
  id: string
  label?: string
  icon?: string
  action?: () => void
  items?: ToolbarItem[]
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主色调 */
  primaryColor?: string
  /** 背景色 */
  backgroundColor?: string
  /** 文字颜色 */
  textColor?: string
  /** 边框颜色 */
  borderColor?: string
}

/**
 * 回调函数配置
 */
export interface CallbackConfig {
  /** 文档加载完成回调 */
  onLoad?: (document: DocumentInfo) => void
  /** 文档加载错误回调 */
  onError?: (error: Error) => void
  /** 文档内容变化回调 */
  onChange?: (content: any) => void
  /** 保存回调 */
  onSave?: (content: any) => void
}

/**
 * 文档信息
 */
export interface DocumentInfo {
  /** 文档类型 */
  type: DocumentType
  /** 文件名 */
  name: string
  /** 文件大小 */
  size: number
  /** 最后修改时间 */
  lastModified: Date
  /** 页数/工作表数/幻灯片数 */
  pageCount?: number
}

/**
 * 文档内容接口
 */
export interface DocumentContent {
  /** 原始数据 */
  raw: any
  /** HTML 内容 */
  html?: string
  /** 文本内容 */
  text?: string
  /** 元数据 */
  metadata?: Record<string, any>
}

/**
 * 文档查看器实例接口
 */
export interface IDocumentViewer {
  /** 加载文档 */
  loadDocument(file: File | string | ArrayBuffer): Promise<void>
  /** 获取文档内容 */
  getContent(): DocumentContent | null
  /** 保存文档 */
  save(): Promise<Blob>
  /** 销毁实例 */
  destroy(): void
  /** 设置编辑模式 */
  setEditable(editable: boolean): void
  /** 获取文档信息 */
  getDocumentInfo(): DocumentInfo | null
}

/**
 * 错误类型
 */
export class DocumentViewerError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'DocumentViewerError'
  }
}

/**
 * 错误代码
 */
export enum ErrorCode {
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  LOAD_FAILED = 'LOAD_FAILED',
  PARSE_FAILED = 'PARSE_FAILED',
  SAVE_FAILED = 'SAVE_FAILED',
  INVALID_CONTAINER = 'INVALID_CONTAINER'
}
