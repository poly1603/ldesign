import * as vue_jsx_runtime from 'vue/jsx-runtime';
import * as vue from 'vue';
import { PropType, Ref, App } from 'vue';

/**
 * PDF预览器核心类型定义
 * 定义了PDF预览器的所有核心接口和类型
 */

/**
 * PDF文档输入类型
 * 支持多种输入方式：URL、File对象、ArrayBuffer等
 */
type PdfInput = string | File | ArrayBuffer | Uint8Array;
/**
 * PDF页面渲染模式
 */
type RenderMode = 'canvas' | 'svg' | 'text';
/**
 * 缩放模式
 */
type ZoomMode = 'fit-width' | 'fit-page' | 'auto' | 'custom';
/**
 * 旋转角度（以度为单位）
 */
type RotationAngle = 0 | 90 | 180 | 270;
/**
 * PDF页面信息
 */
interface PdfPageInfo {
    /** 页面编号（从1开始） */
    pageNumber: number;
    /** 页面宽度 */
    width: number;
    /** 页面高度 */
    height: number;
    /** 旋转角度 */
    rotation: RotationAngle;
    /** 页面视口 */
    viewport: {
        width: number;
        height: number;
        scale: number;
        rotation: RotationAngle;
    };
}
/**
 * PDF文档信息
 */
interface PdfDocumentInfo {
    /** 文档标题 */
    title?: string;
    /** 作者 */
    author?: string;
    /** 主题 */
    subject?: string;
    /** 关键词 */
    keywords?: string;
    /** 创建者 */
    creator?: string;
    /** 生产者 */
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
 * 渲染选项
 */
interface RenderOptions {
    /** 渲染模式 */
    mode?: RenderMode;
    /** 缩放比例 */
    scale?: number;
    /** 旋转角度 */
    rotation?: RotationAngle;
    /** 是否启用文本选择 */
    enableTextSelection?: boolean;
    /** 是否启用注释 */
    enableAnnotations?: boolean;
    /** 背景颜色 */
    backgroundColor?: string;
    /** 是否使用高质量渲染 */
    useHighQuality?: boolean;
}
/**
 * 搜索选项
 */
interface SearchOptions {
    /** 搜索关键词 */
    query: string;
    /** 是否区分大小写 */
    caseSensitive?: boolean;
    /** 是否全词匹配 */
    wholeWords?: boolean;
    /** 是否高亮显示 */
    highlightAll?: boolean;
    /** 搜索方向 */
    findPrevious?: boolean;
}
/**
 * 搜索结果
 */
interface SearchResult {
    /** 匹配的页面编号 */
    pageNumber: number;
    /** 匹配的文本 */
    text: string;
    /** 匹配位置 */
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** 匹配索引 */
    matchIndex: number;
    /** 总匹配数 */
    totalMatches: number;
}
/**
 * 打印选项
 */
interface PrintOptions {
    /** 打印页面范围 */
    pageRange?: string;
    /** 是否适应页面 */
    fitToPage?: boolean;
    /** 打印质量 */
    quality?: 'draft' | 'normal' | 'high';
    /** 是否显示打印对话框 */
    showDialog?: boolean;
}
/**
 * 下载选项
 */
interface DownloadOptions {
    /** 文件名 */
    filename?: string;
    /** 是否保存为副本 */
    saveAsCopy?: boolean;
}
/**
 * PDF预览器配置
 */
interface PdfViewerConfig {
    /** 容器元素 */
    container: HTMLElement;
    /** 初始缩放比例 */
    initialScale?: number;
    /** 初始页面 */
    initialPage?: number;
    /** 缩放模式 */
    zoomMode?: ZoomMode;
    /** 渲染选项 */
    renderOptions?: RenderOptions;
    /** 是否启用工具栏 */
    enableToolbar?: boolean;
    /** 是否启用侧边栏 */
    enableSidebar?: boolean;
    /** 是否启用搜索 */
    enableSearch?: boolean;
    /** 是否启用缩略图 */
    enableThumbnails?: boolean;
    /** 是否启用全屏 */
    enableFullscreen?: boolean;
    /** 是否启用下载 */
    enableDownload?: boolean;
    /** 是否启用打印 */
    enablePrint?: boolean;
    /** 自定义样式 */
    customStyles?: Record<string, string>;
    /** 本地化配置 */
    locale?: string;
}
/**
 * 事件类型
 */
interface PdfViewerEvents {
    /** 文档加载完成 */
    documentLoaded: (info: PdfDocumentInfo) => void;
    /** 页面变化 */
    pageChanged: (pageNumber: number, pageInfo: PdfPageInfo) => void;
    /** 缩放变化 */
    zoomChanged: (scale: number, zoomMode: ZoomMode) => void;
    /** 旋转变化 */
    rotationChanged: (rotation: RotationAngle) => void;
    /** 搜索结果 */
    searchResult: (results: SearchResult[]) => void;
    /** 错误事件 */
    error: (error: Error) => void;
    /** 加载进度 */
    loadProgress: (progress: number) => void;
    /** 渲染完成 */
    renderComplete: (pageNumber: number) => void;
}
/**
 * PDF预览器状态
 */
interface PdfViewerState {
    /** 是否已加载文档 */
    isDocumentLoaded: boolean;
    /** 当前页面编号 */
    currentPage: number;
    /** 总页数 */
    totalPages: number;
    /** 当前缩放比例 */
    currentScale: number;
    /** 当前缩放模式 */
    currentZoomMode: ZoomMode;
    /** 当前旋转角度 */
    currentRotation: RotationAngle;
    /** 是否正在加载 */
    isLoading: boolean;
    /** 是否全屏模式 */
    isFullscreen: boolean;
    /** 搜索状态 */
    searchState: {
        isSearching: boolean;
        query: string;
        currentMatch: number;
        totalMatches: number;
    };
}
/**
 * PDF预览器核心接口
 */
interface IPdfViewer {
    /** 加载PDF文档 */
    loadDocument(input: PdfInput): Promise<void>;
    /** 跳转到指定页面 */
    goToPage(pageNumber: number): Promise<void>;
    /** 上一页 */
    previousPage(): Promise<void>;
    /** 下一页 */
    nextPage(): Promise<void>;
    /** 设置缩放比例 */
    setZoom(scale: number): void;
    /** 设置缩放模式 */
    setZoomMode(mode: ZoomMode): void;
    /** 放大 */
    zoomIn(): void;
    /** 缩小 */
    zoomOut(): void;
    /** 旋转页面 */
    rotate(angle: RotationAngle): void;
    /** 搜索文本 */
    search(options: SearchOptions): Promise<SearchResult[]>;
    /** 进入全屏 */
    enterFullscreen(): void;
    /** 退出全屏 */
    exitFullscreen(): void;
    /** 下载PDF */
    download(options?: DownloadOptions): void;
    /** 打印PDF */
    print(options?: PrintOptions): void;
    /** 获取当前状态 */
    getState(): PdfViewerState;
    /** 获取文档信息 */
    getDocumentInfo(): PdfDocumentInfo | null;
    /** 销毁预览器 */
    destroy(): void;
    /** 事件订阅 */
    on<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void;
    off<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void;
    once<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void;
}

declare const _default$1: vue.DefineComponent<vue.ExtractPropTypes<{
    /** PDF文档输入 */
    src: {
        type: PropType<PdfInput>;
        required: true;
    };
    /** 初始缩放比例 */
    initialScale: {
        type: NumberConstructor;
        default: number;
    };
    /** 初始页面 */
    initialPage: {
        type: NumberConstructor;
        default: number;
    };
    /** 缩放模式 */
    zoomMode: {
        type: PropType<ZoomMode>;
        default: string;
    };
    /** 是否启用工具栏 */
    enableToolbar: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 是否启用侧边栏 */
    enableSidebar: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 是否启用搜索 */
    enableSearch: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 是否启用缩略图 */
    enableThumbnails: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 是否启用全屏 */
    enableFullscreen: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 是否启用下载 */
    enableDownload: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 是否启用打印 */
    enablePrint: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 自定义样式 */
    customStyles: {
        type: PropType<Record<string, string>>;
        default: () => {};
    };
    /** 本地化配置 */
    locale: {
        type: StringConstructor;
        default: string;
    };
}>, () => vue_jsx_runtime.JSX.Element, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, ("documentLoaded" | "pageChanged" | "zoomChanged" | "rotationChanged" | "searchResult" | "error" | "loadProgress" | "renderComplete")[], "documentLoaded" | "pageChanged" | "zoomChanged" | "rotationChanged" | "searchResult" | "error" | "loadProgress" | "renderComplete", vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    /** PDF文档输入 */
    src: {
        type: PropType<PdfInput>;
        required: true;
    };
    /** 初始缩放比例 */
    initialScale: {
        type: NumberConstructor;
        default: number;
    };
    /** 初始页面 */
    initialPage: {
        type: NumberConstructor;
        default: number;
    };
    /** 缩放模式 */
    zoomMode: {
        type: PropType<ZoomMode>;
        default: string;
    };
    /** 是否启用工具栏 */
    enableToolbar: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 是否启用侧边栏 */
    enableSidebar: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 是否启用搜索 */
    enableSearch: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 是否启用缩略图 */
    enableThumbnails: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 是否启用全屏 */
    enableFullscreen: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 是否启用下载 */
    enableDownload: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 是否启用打印 */
    enablePrint: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 自定义样式 */
    customStyles: {
        type: PropType<Record<string, string>>;
        default: () => {};
    };
    /** 本地化配置 */
    locale: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    onDocumentLoaded?: ((...args: any[]) => any) | undefined;
    onPageChanged?: ((...args: any[]) => any) | undefined;
    onZoomChanged?: ((...args: any[]) => any) | undefined;
    onRotationChanged?: ((...args: any[]) => any) | undefined;
    onSearchResult?: ((...args: any[]) => any) | undefined;
    onError?: ((...args: any[]) => any) | undefined;
    onLoadProgress?: ((...args: any[]) => any) | undefined;
    onRenderComplete?: ((...args: any[]) => any) | undefined;
}>, {
    initialScale: number;
    initialPage: number;
    zoomMode: ZoomMode;
    enableToolbar: boolean;
    enableSidebar: boolean;
    enableSearch: boolean;
    enableThumbnails: boolean;
    enableFullscreen: boolean;
    enableDownload: boolean;
    enablePrint: boolean;
    customStyles: Record<string, string>;
    locale: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

/**
 * Vue3 PDF预览器Hooks
 * 提供响应式的PDF预览功能
 */

/**
 * PDF预览器Hook选项
 */
interface UsePdfViewerOptions extends Omit<PdfViewerConfig, 'container'> {
    /** 是否自动加载文档 */
    autoLoad?: boolean;
    /** 初始文档 */
    initialDocument?: PdfInput;
}
/**
 * PDF预览器Hook返回值
 */
interface UsePdfViewerReturn {
    state: Ref<PdfViewerState>;
    documentInfo: Ref<PdfDocumentInfo | null>;
    isLoading: Ref<boolean>;
    error: Ref<Error | null>;
    canGoPrevious: Ref<boolean>;
    canGoNext: Ref<boolean>;
    progress: Ref<number>;
    loadDocument: (input: PdfInput) => Promise<void>;
    goToPage: (pageNumber: number) => Promise<void>;
    previousPage: () => Promise<void>;
    nextPage: () => Promise<void>;
    setZoom: (scale: number) => void;
    setZoomMode: (mode: ZoomMode) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    rotate: (angle: RotationAngle) => void;
    search: (options: SearchOptions) => Promise<SearchResult[]>;
    enterFullscreen: () => void;
    exitFullscreen: () => void;
    download: (options?: DownloadOptions) => void;
    print: (options?: PrintOptions) => void;
    destroy: () => void;
    viewer: Ref<IPdfViewer | null>;
    getDocument: () => Promise<any>;
    getDocumentInfo: () => any;
}
/**
 * PDF预览器Hook
 */
declare function usePdfViewer(containerRef: Ref<HTMLElement | null>, options?: UsePdfViewerOptions): UsePdfViewerReturn;
/**
 * PDF搜索Hook
 */
declare function usePdfSearch(viewer: Ref<IPdfViewer | null>): {
    searchQuery: any;
    searchResults: any;
    currentMatchIndex: any;
    isSearching: any;
    searchOptions: any;
    hasResults: any;
    currentMatch: any;
    search: (query: string) => Promise<void>;
    findNext: () => void;
    findPrevious: () => void;
    clearSearch: () => void;
};
/**
 * PDF缩略图Hook
 */
declare function usePdfThumbnails(viewer: Ref<IPdfViewer | null>): {
    thumbnails: any;
    isGenerating: any;
    showThumbnails: any;
    generateThumbnails: () => Promise<void>;
    toggleThumbnails: () => void;
};

declare function install(app: App): void;
declare const _default: {
    PdfViewer: vue.DefineComponent<vue.ExtractPropTypes<{
        src: {
            type: vue.PropType<PdfInput>;
            required: true;
        };
        initialScale: {
            type: NumberConstructor;
            default: number;
        };
        initialPage: {
            type: NumberConstructor;
            default: number;
        };
        zoomMode: {
            type: vue.PropType<ZoomMode>;
            default: string;
        };
        enableToolbar: {
            type: BooleanConstructor;
            default: boolean;
        };
        enableSidebar: {
            type: BooleanConstructor;
            default: boolean;
        };
        enableSearch: {
            type: BooleanConstructor;
            default: boolean;
        };
        enableThumbnails: {
            type: BooleanConstructor;
            default: boolean;
        };
        enableFullscreen: {
            type: BooleanConstructor;
            default: boolean;
        };
        enableDownload: {
            type: BooleanConstructor;
            default: boolean;
        };
        enablePrint: {
            type: BooleanConstructor;
            default: boolean;
        };
        customStyles: {
            type: vue.PropType<Record<string, string>>;
            default: () => {};
        };
        locale: {
            type: StringConstructor;
            default: string;
        };
    }>, () => vue_jsx_runtime.JSX.Element, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, ("documentLoaded" | "pageChanged" | "zoomChanged" | "rotationChanged" | "searchResult" | "error" | "loadProgress" | "renderComplete")[], "documentLoaded" | "pageChanged" | "zoomChanged" | "rotationChanged" | "searchResult" | "error" | "loadProgress" | "renderComplete", vue.PublicProps, Readonly<vue.ExtractPropTypes<{
        src: {
            type: vue.PropType<PdfInput>;
            required: true;
        };
        initialScale: {
            type: NumberConstructor;
            default: number;
        };
        initialPage: {
            type: NumberConstructor;
            default: number;
        };
        zoomMode: {
            type: vue.PropType<ZoomMode>;
            default: string;
        };
        enableToolbar: {
            type: BooleanConstructor;
            default: boolean;
        };
        enableSidebar: {
            type: BooleanConstructor;
            default: boolean;
        };
        enableSearch: {
            type: BooleanConstructor;
            default: boolean;
        };
        enableThumbnails: {
            type: BooleanConstructor;
            default: boolean;
        };
        enableFullscreen: {
            type: BooleanConstructor;
            default: boolean;
        };
        enableDownload: {
            type: BooleanConstructor;
            default: boolean;
        };
        enablePrint: {
            type: BooleanConstructor;
            default: boolean;
        };
        customStyles: {
            type: vue.PropType<Record<string, string>>;
            default: () => {};
        };
        locale: {
            type: StringConstructor;
            default: string;
        };
    }>> & Readonly<{
        onDocumentLoaded?: ((...args: any[]) => any) | undefined;
        onPageChanged?: ((...args: any[]) => any) | undefined;
        onZoomChanged?: ((...args: any[]) => any) | undefined;
        onRotationChanged?: ((...args: any[]) => any) | undefined;
        onSearchResult?: ((...args: any[]) => any) | undefined;
        onError?: ((...args: any[]) => any) | undefined;
        onLoadProgress?: ((...args: any[]) => any) | undefined;
        onRenderComplete?: ((...args: any[]) => any) | undefined;
    }>, {
        initialScale: number;
        initialPage: number;
        zoomMode: ZoomMode;
        enableToolbar: boolean;
        enableSidebar: boolean;
        enableSearch: boolean;
        enableThumbnails: boolean;
        enableFullscreen: boolean;
        enableDownload: boolean;
        enablePrint: boolean;
        customStyles: Record<string, string>;
        locale: string;
    }, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
    usePdfViewer: typeof usePdfViewer;
    usePdfSearch: typeof usePdfSearch;
    usePdfThumbnails: typeof usePdfThumbnails;
    install: typeof install;
};

export { _default$1 as PdfViewer, _default as default, install, usePdfSearch, usePdfThumbnails, usePdfViewer };
export type { UsePdfViewerOptions, UsePdfViewerReturn };
