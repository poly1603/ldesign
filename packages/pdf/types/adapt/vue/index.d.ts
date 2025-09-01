/**
 * Vue3 PDF预览器适配器
 * 提供Vue3组件和Hooks
 */
import type { App } from 'vue';
import PdfViewer from './PdfViewer';
import { usePdfViewer, usePdfSearch, usePdfThumbnails } from './hooks';
export { PdfViewer };
export { usePdfViewer, usePdfSearch, usePdfThumbnails };
export type { UsePdfViewerOptions, UsePdfViewerReturn, } from './hooks';
export declare function install(app: App): void;
declare const _default: {
    PdfViewer: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
        src: {
            type: import("vue").PropType<import("../..").PdfInput>;
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
            type: import("vue").PropType<import("../..").ZoomMode>;
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
            type: import("vue").PropType<Record<string, string>>;
            default: () => {};
        };
        locale: {
            type: StringConstructor;
            default: string;
        };
    }>, () => any, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("documentLoaded" | "pageChanged" | "zoomChanged" | "rotationChanged" | "searchResult" | "error" | "loadProgress" | "renderComplete")[], "documentLoaded" | "pageChanged" | "zoomChanged" | "rotationChanged" | "searchResult" | "error" | "loadProgress" | "renderComplete", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
        src: {
            type: import("vue").PropType<import("../..").PdfInput>;
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
            type: import("vue").PropType<import("../..").ZoomMode>;
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
            type: import("vue").PropType<Record<string, string>>;
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
        zoomMode: import("../..").ZoomMode;
        enableToolbar: boolean;
        enableSidebar: boolean;
        enableSearch: boolean;
        enableThumbnails: boolean;
        enableFullscreen: boolean;
        enableDownload: boolean;
        enablePrint: boolean;
        customStyles: Record<string, string>;
        locale: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    usePdfViewer: typeof usePdfViewer;
    usePdfSearch: typeof usePdfSearch;
    usePdfThumbnails: typeof usePdfThumbnails;
    install: typeof install;
};
export default _default;
//# sourceMappingURL=index.d.ts.map