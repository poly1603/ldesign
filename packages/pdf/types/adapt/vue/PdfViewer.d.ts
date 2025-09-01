/**
 * Vue3 PDF预览器组件
 * 提供完整的PDF预览功能
 */
import { type PropType } from 'vue';
import type { PdfInput, ZoomMode } from '../../core/types';
import './PdfViewer.less';
declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
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
}>, () => any, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("documentLoaded" | "pageChanged" | "zoomChanged" | "rotationChanged" | "searchResult" | "error" | "loadProgress" | "renderComplete")[], "documentLoaded" | "pageChanged" | "zoomChanged" | "rotationChanged" | "searchResult" | "error" | "loadProgress" | "renderComplete", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
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
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
//# sourceMappingURL=PdfViewer.d.ts.map