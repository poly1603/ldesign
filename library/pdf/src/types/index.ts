/**
 * @ldesign/pdf - 功能强大的PDF阅读器插件
 * 类型定义文件
 */

import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

/**
 * PDF文档加载来源
 */
export type PDFSource = string | ArrayBuffer | Uint8Array | URL;

/**
 * 缩放模式
 */
export type ScaleMode = 'auto' | 'page-fit' | 'page-width' | 'page-height' | number;

/**
 * 渲染质量
 */
export type RenderQuality = 'low' | 'medium' | 'high' | 'ultra';

/**
 * 页面布局模式
 */
export type LayoutMode = 'single' | 'continuous' | 'double' | 'book';

/**
 * PDF查看器配置
 */
export interface PDFViewerConfig {
  /** 容器元素 */
  container?: HTMLElement | string;

  /** 初始缩放比例 */
  scale?: ScaleMode;

  /** 渲染质量 */
  quality?: RenderQuality;

  /** 页面布局模式 */
  layout?: LayoutMode;

  /** 初始页码 */
  initialPage?: number;

  /** 是否启用虚拟滚动 */
  virtualScroll?: boolean;

  /** 缓存配置 */
  cache?: CacheConfig;

  /** 渲染配置 */
  render?: RenderConfig;

  /** 搜索配置 */
  search?: SearchConfig;

  /** 缩略图配置 */
  thumbnail?: ThumbnailConfig;

  /** 打印配置 */
  print?: PrintConfig;

  /** 自定义工作线程路径 */
  workerSrc?: string;

  /** 是否启用文本选择 */
  enableTextSelection?: boolean;

  /** 是否启用注释 */
  enableAnnotations?: boolean;

  /** 插件列表 */
  plugins?: PDFPlugin[];

  /** 事件监听器 */
  on?: Partial<PDFEventHandlers>;
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enabled?: boolean;

  /** 最大缓存页面数 */
  maxPages?: number;

  /** 缓存策略 */
  strategy?: 'lru' | 'fifo' | 'lfu';

  /** 预加载页面数量 */
  preloadPages?: number;
}

/**
 * 渲染配置
 */
export interface RenderConfig {
  /** 渲染DPI */
  dpi?: number;

  /** 是否启用Canvas优化 */
  canvasOptimization?: boolean;

  /** 是否使用Web Worker */
  useWorker?: boolean;

  /** 渲染超时时间(ms) */
  timeout?: number;

  /** 最大并发渲染数 */
  maxConcurrent?: number;
}

/**
 * 搜索配置
 */
export interface SearchConfig {
  /** 是否区分大小写 */
  caseSensitive?: boolean;

  /** 是否全词匹配 */
  wholeWords?: boolean;

  /** 是否支持正则表达式 */
  regex?: boolean;

  /** 高亮颜色 */
  highlightColor?: string;

  /** 当前匹配颜色 */
  currentMatchColor?: string;
}

/**
 * 缩略图配置
 */
export interface ThumbnailConfig {
  /** 是否启用缩略图 */
  enabled?: boolean;

  /** 缩略图宽度 */
  width?: number;

  /** 缩略图高度 */
  height?: number;

  /** 缩略图质量 */
  quality?: RenderQuality;

  /** 是否懒加载 */
  lazyLoad?: boolean;
}

/**
 * 打印配置
 */
export interface PrintConfig {
  /** 打印DPI */
  dpi?: number;

  /** 是否显示打印对话框 */
  showDialog?: boolean;

  /** 打印方向 */
  orientation?: 'portrait' | 'landscape';
}

/**
 * 页面信息
 */
export interface PageInfo {
  /** 页码（从1开始） */
  pageNumber: number;

  /** 页面宽度 */
  width: number;

  /** 页面高度 */
  height: number;

  /** 旋转角度 */
  rotation: number;

  /** 缩放比例 */
  scale: number;
}

/**
 * 文档信息
 */
export interface DocumentInfo {
  /** 标题 */
  title?: string;

  /** 作者 */
  author?: string;

  /** 主题 */
  subject?: string;

  /** 关键词 */
  keywords?: string;

  /** 创建者 */
  creator?: string;

  /** 生成器 */
  producer?: string;

  /** 创建日期 */
  creationDate?: Date;

  /** 修改日期 */
  modificationDate?: Date;

  /** 总页数 */
  numPages: number;

  /** 文件大小（字节） */
  fileSize?: number;

  /** PDF版本 */
  pdfVersion?: string;
}

/**
 * 搜索结果
 */
export interface SearchResult {
  /** 页码 */
  pageNumber: number;

  /** 匹配文本 */
  text: string;

  /** 匹配索引 */
  index: number;

  /** 匹配数量 */
  matchCount: number;

  /** 上下文 */
  context?: string;
}

/**
 * 书签/大纲项
 */
export interface OutlineItem {
  /** 标题 */
  title: string;

  /** 目标页码 */
  pageNumber: number;

  /** 子项 */
  children?: OutlineItem[];

  /** 是否展开 */
  expanded?: boolean;
}

/**
 * 插件接口
 */
export interface PDFPlugin {
  /** 插件名称 */
  name: string;

  /** 插件版本 */
  version?: string;

  /** 初始化 */
  install?(viewer: any): void;

  /** 卸载 */
  uninstall?(): void;

  /** 生命周期钩子 */
  hooks?: {
    beforeLoad?: (source: PDFSource) => void | Promise<void>;
    afterLoad?: (doc: PDFDocumentProxy) => void | Promise<void>;
    beforeRender?: (page: PDFPageProxy) => void | Promise<void>;
    afterRender?: (page: PDFPageProxy, canvas: HTMLCanvasElement) => void | Promise<void>;
    beforeDestroy?: () => void | Promise<void>;
  };
}

/**
 * 事件处理器
 */
export interface PDFEventHandlers {
  /** 文档加载开始 */
  loadStart: (source: PDFSource) => void;

  /** 文档加载进度 */
  loadProgress: (progress: number) => void;

  /** 文档加载完成 */
  loadComplete: (info: DocumentInfo) => void;

  /** 文档加载失败 */
  loadError: (error: Error) => void;

  /** 页面切换 */
  pageChange: (pageNumber: number) => void;

  /** 缩放改变 */
  scaleChange: (scale: number) => void;

  /** 页面渲染开始 */
  renderStart: (pageNumber: number) => void;

  /** 页面渲染完成 */
  renderComplete: (pageNumber: number) => void;

  /** 页面渲染失败 */
  renderError: (pageNumber: number, error: Error) => void;

  /** 搜索完成 */
  searchComplete: (results: SearchResult[]) => void;

  /** 文本选择 */
  textSelect: (text: string) => void;

  /** 销毁 */
  destroy: () => void;
}

/**
 * 渲染任务
 */
export interface RenderTask {
  /** 页码 */
  pageNumber: number;

  /** 页面代理对象 */
  page: PDFPageProxy;

  /** Canvas元素 */
  canvas: HTMLCanvasElement;

  /** 缩放比例 */
  scale: number;

  /** 旋转角度 */
  rotation: number;

  /** 优先级 */
  priority: number;

  /** 取消函数 */
  cancel?: () => void;

  /** Promise */
  promise: Promise<void>;
}

/**
 * 虚拟滚动项
 */
export interface VirtualScrollItem {
  /** 索引 */
  index: number;

  /** 偏移量 */
  offset: number;

  /** 高度 */
  height: number;

  /** 是否可见 */
  visible: boolean;
}

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 导出格式 */
  format?: 'pdf' | 'png' | 'jpeg';

  /** 导出质量 (0-1) */
  quality?: number;

  /** 页面范围 */
  pages?: number[] | 'all' | 'current';

  /** 文件名 */
  filename?: string;
}

/**
 * PDF查看器API
 */
export interface PDFViewerAPI {
  /** 加载PDF */
  load(source: PDFSource): Promise<void>;

  /** 跳转到指定页 */
  goToPage(pageNumber: number): void;

  /** 下一页 */
  nextPage(): void;

  /** 上一页 */
  previousPage(): void;

  /** 设置缩放 */
  setScale(scale: ScaleMode): void;

  /** 放大 */
  zoomIn(step?: number): void;

  /** 缩小 */
  zoomOut(step?: number): void;

  /** 旋转页面 */
  rotate(angle: number): void;

  /** 搜索文本 */
  search(query: string, options?: Partial<SearchConfig>): Promise<SearchResult[]>;

  /** 获取文档信息 */
  getDocumentInfo(): DocumentInfo | null;

  /** 获取页面信息 */
  getPageInfo(pageNumber?: number): PageInfo | null;

  /** 获取大纲 */
  getOutline(): Promise<OutlineItem[]>;

  /** 获取缩略图 */
  getThumbnail(pageNumber: number): Promise<HTMLCanvasElement>;

  /** 打印 */
  print(options?: Partial<PrintConfig>): Promise<void>;

  /** 下载 */
  download(filename?: string): void;

  /** 导出 */
  export(options?: ExportOptions): Promise<Blob>;

  /** 获取选中文本 */
  getSelectedText(): string;

  /** 刷新渲染 */
  refresh(): void;

  /** 销毁实例 */
  destroy(): void;

  /** 注册插件 */
  use(plugin: PDFPlugin): void;

  /** 监听事件 */
  on<K extends keyof PDFEventHandlers>(event: K, handler: PDFEventHandlers[K]): void;

  /** 取消监听 */
  off<K extends keyof PDFEventHandlers>(event: K, handler: PDFEventHandlers[K]): void;

  /** 触发事件 */
  emit<K extends keyof PDFEventHandlers>(event: K, ...args: Parameters<PDFEventHandlers[K]>): void;

  /** 当前配置 */
  readonly config: PDFViewerConfig;

  /** 当前页码 */
  readonly currentPage: number;

  /** 总页数 */
  readonly totalPages: number;

  /** 当前缩放比例 */
  readonly scale: number;

  /** PDF文档对象 */
  readonly document: PDFDocumentProxy | null;
}
