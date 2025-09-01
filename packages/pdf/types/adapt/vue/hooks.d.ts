/**
 * Vue3 PDF预览器Hooks
 * 提供响应式的PDF预览功能
 */
import { type Ref } from 'vue';
import type { PdfInput, PdfViewerConfig, PdfViewerState, PdfDocumentInfo, SearchOptions, SearchResult, ZoomMode, RotationAngle, DownloadOptions, PrintOptions, IPdfViewer } from '../../core/types';
/**
 * PDF预览器Hook选项
 */
export interface UsePdfViewerOptions extends Omit<PdfViewerConfig, 'container'> {
    /** 是否自动加载文档 */
    autoLoad?: boolean;
    /** 初始文档 */
    initialDocument?: PdfInput;
}
/**
 * PDF预览器Hook返回值
 */
export interface UsePdfViewerReturn {
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
}
/**
 * PDF预览器Hook
 */
export declare function usePdfViewer(containerRef: Ref<HTMLElement | null>, options?: UsePdfViewerOptions): UsePdfViewerReturn;
/**
 * PDF搜索Hook
 */
export declare function usePdfSearch(viewer: Ref<IPdfViewer | null>): {
    searchQuery: Ref<string, string>;
    searchResults: Ref<{
        pageNumber: number;
        text: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        matchIndex: number;
        totalMatches: number;
    }[], SearchResult[] | {
        pageNumber: number;
        text: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        matchIndex: number;
        totalMatches: number;
    }[]>;
    currentMatchIndex: Ref<number, number>;
    isSearching: Ref<boolean, boolean>;
    searchOptions: {
        query: string;
        caseSensitive?: boolean | undefined;
        wholeWords?: boolean | undefined;
        highlightAll?: boolean | undefined;
        findPrevious?: boolean | undefined;
    };
    hasResults: import("vue").ComputedRef<boolean>;
    currentMatch: import("vue").ComputedRef<{
        pageNumber: number;
        text: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        matchIndex: number;
        totalMatches: number;
    } | null>;
    search: (query: string) => Promise<void>;
    findNext: () => void;
    findPrevious: () => void;
    clearSearch: () => void;
};
/**
 * PDF缩略图Hook
 */
export declare function usePdfThumbnails(viewer: Ref<IPdfViewer | null>): {
    thumbnails: Ref<Map<number, HTMLCanvasElement> & Omit<Map<number, HTMLCanvasElement>, keyof Map<any, any>>, Map<number, HTMLCanvasElement> | (Map<number, HTMLCanvasElement> & Omit<Map<number, HTMLCanvasElement>, keyof Map<any, any>>)>;
    isGenerating: Ref<boolean, boolean>;
    showThumbnails: Ref<boolean, boolean>;
    generateThumbnails: () => Promise<void>;
    toggleThumbnails: () => void;
};
//# sourceMappingURL=hooks.d.ts.map