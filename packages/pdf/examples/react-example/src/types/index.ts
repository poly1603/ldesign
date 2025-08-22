/**
 * React PDF Viewer 类型定义
 */

// 基础PDF查看器配置
export interface PdfViewerConfig {
  enableCache?: boolean;
  cacheSize?: number;
  enableWebGL?: boolean;
  devicePixelRatio?: number;
}

// 渲染选项
export interface RenderOptions {
  enableWebGL?: boolean;
  devicePixelRatio?: number;
  background?: string;
  transform?: {
    scaleX?: number;
    scaleY?: number;
    offsetX?: number;
    offsetY?: number;
  };
}

// PDF查看器组件Props
export interface PdfViewerProps {
  /** PDF文档源 */
  src?: string | File | ArrayBuffer;
  /** 容器宽度 */
  width?: string | number;
  /** 容器高度 */
  height?: string | number;
  /** 初始页面 */
  initialPage?: number;
  /** 初始缩放级别 */
  initialZoom?: number;
  /** 是否显示控制面板 */
  enableControls?: boolean;
  /** 是否启用搜索功能 */
  enableSearch?: boolean;
  /** 是否启用缓存 */
  enableCache?: boolean;
  /** 缓存大小 */
  cacheSize?: number;
  /** 是否启用WebGL */
  enableWebGL?: boolean;
  /** 渲染选项 */
  renderOptions?: RenderOptions;
  /** 自定义CSS类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 页面变化回调 */
  onPageChange?: (page: number) => void;
  /** 缩放变化回调 */
  onZoomChange?: (zoom: number) => void;
  /** 文档加载成功回调 */
  onLoadSuccess?: (totalPages: number) => void;
  /** 文档加载失败回调 */
  onLoadError?: (error: Error) => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
  /** 加载进度回调 */
  onLoadProgress?: (progress: number) => void;
}

// PDF控制面板Props
export interface PdfControlsProps {
  /** 当前页面 */
  currentPage: number;
  /** 总页数 */
  totalPages: number;
  /** 当前缩放级别 */
  zoomLevel: number;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否禁用控制 */
  disabled?: boolean;
  /** 上一页回调 */
  onPreviousPage: () => void;
  /** 下一页回调 */
  onNextPage: () => void;
  /** 跳转页面回调 */
  onGoToPage: (page: number) => void;
  /** 放大回调 */
  onZoomIn: () => void;
  /** 缩小回调 */
  onZoomOut: () => void;
  /** 适应宽度回调 */
  onFitWidth: () => void;
  /** 搜索回调 */
  onSearch?: (query: string) => void;
  /** 自定义CSS类名 */
  className?: string;
}

// PDF查看器状态
export interface PdfViewerState {
  /** 当前页面 */
  currentPage: number;
  /** 总页数 */
  totalPages: number;
  /** 缩放级别 */
  zoomLevel: number;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 加载进度 */
  loadProgress: number;
  /** 错误信息 */
  error: Error | null;
  /** 是否已加载文档 */
  isDocumentLoaded: boolean;
}

// PDF查看器Hook选项
export interface UsePdfViewerOptions {
  /** 初始配置 */
  config?: PdfViewerConfig;
  /** 初始页面 */
  initialPage?: number;
  /** 初始缩放级别 */
  initialZoom?: number;
  /** 页面变化回调 */
  onPageChange?: (page: number) => void;
  /** 缩放变化回调 */
  onZoomChange?: (zoom: number) => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
}

// PDF查看器Hook返回值
export interface UsePdfViewerReturn {
  /** 当前状态 */
  state: PdfViewerState;
  /** 加载PDF */
  loadPdf: (src: string | File | ArrayBuffer) => Promise<void>;
  /** 下一页 */
  nextPage: () => Promise<boolean>;
  /** 上一页 */
  previousPage: () => Promise<boolean>;
  /** 跳转到指定页面 */
  goToPage: (page: number) => Promise<boolean>;
  /** 放大 */
  zoomIn: () => Promise<void>;
  /** 缩小 */
  zoomOut: () => Promise<void>;
  /** 设置缩放级别 */
  setZoom: (zoom: number) => Promise<void>;
  /** 适应宽度 */
  fitWidth: () => Promise<void>;
  /** 搜索文本 */
  search: (query: string) => Promise<SearchResult[]>;
  /** 设置配置 */
  setConfig: (config: Partial<PdfViewerConfig>) => void;
  /** 重置状态 */
  reset: () => void;
}

// 搜索结果
export interface SearchResult {
  /** 页面号 */
  pageNumber: number;
  /** 匹配的文本 */
  text: string;
  /** 文本在页面中的位置 */
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// 错误类型
export interface PdfError extends Error {
  /** 错误代码 */
  code?: string;
  /** 错误详情 */
  details?: any;
}

// 文件上传Props
export interface FileUploadProps {
  /** 接受的文件类型 */
  accept?: string;
  /** 是否允许多选 */
  multiple?: boolean;
  /** 最大文件大小（字节） */
  maxSize?: number;
  /** 文件选择回调 */
  onFileSelect: (file: File) => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
  /** 自定义CSS类名 */
  className?: string;
  /** 按钮文本 */
  buttonText?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

// 加载指示器Props
export interface LoadingIndicatorProps {
  /** 是否显示 */
  visible: boolean;
  /** 加载进度 (0-100) */
  progress?: number;
  /** 加载文本 */
  text?: string;
  /** 自定义CSS类名 */
  className?: string;
}

// 错误边界Props
export interface ErrorBoundaryProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 错误回退组件 */
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  /** 错误回调 */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// 工具栏Props
export interface ToolbarProps {
  /** 工具栏项目 */
  items: ToolbarItem[];
  /** 自定义CSS类名 */
  className?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

// 工具栏项目
export interface ToolbarItem {
  /** 项目ID */
  id: string;
  /** 项目类型 */
  type: 'button' | 'separator' | 'input' | 'select';
  /** 显示文本 */
  label?: string;
  /** 图标 */
  icon?: React.ReactNode;
  /** 点击回调 */
  onClick?: () => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否激活 */
  active?: boolean;
  /** 工具提示 */
  tooltip?: string;
}

// 主题配置
export interface ThemeConfig {
  /** 主色调 */
  primaryColor?: string;
  /** 次要色调 */
  secondaryColor?: string;
  /** 背景色 */
  backgroundColor?: string;
  /** 文本色 */
  textColor?: string;
  /** 边框色 */
  borderColor?: string;
  /** 阴影 */
  boxShadow?: string;
  /** 圆角 */
  borderRadius?: string;
}