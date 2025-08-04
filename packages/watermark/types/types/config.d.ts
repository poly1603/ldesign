import { ResponsiveConfig } from './responsive.js';
import { SecurityConfig } from './security.js';
import { AnimationConfig } from './animation.js';

/**
 * 水印配置相关类型定义
 */
interface WatermarkStyle {
    /** 字体大小 */
    fontSize?: number;
    /** 字体系列 */
    fontFamily?: string;
    /** 字体粗细 */
    fontWeight?: string | number;
    /** 文字颜色 */
    color?: string;
    /** 透明度 0-1 */
    opacity?: number;
    /** 旋转角度 */
    rotate?: number;
    /** 文字阴影 */
    textShadow?: string;
    /** 背景色 */
    backgroundColor?: string;
    /** 边框 */
    border?: string;
    /** 内边距 */
    padding?: number | string;
    /** 圆角 */
    borderRadius?: number | string;
}
interface WatermarkLayout {
    /** 水印宽度 */
    width?: number;
    /** 水印高度 */
    height?: number;
    /** 水平间距 */
    gapX?: number;
    /** 垂直间距 */
    gapY?: number;
    /** 水平偏移 */
    offsetX?: number;
    /** 垂直偏移 */
    offsetY?: number;
    /** 行数 */
    rows?: number;
    /** 列数 */
    cols?: number;
    /** 是否自动计算行列数 */
    autoCalculate?: boolean;
}
interface WatermarkImage {
    /** 图片源 */
    src: string;
    /** 图片宽度 */
    width?: number;
    /** 图片高度 */
    height?: number;
    /** 图片透明度 */
    opacity?: number;
    /** 是否保持宽高比 */
    aspectRatio?: boolean;
    /** 图片加载失败时的回调 */
    onError?: (error: Error) => void;
    /** 图片加载成功时的回调 */
    onLoad?: (image: HTMLImageElement) => void;
}
type RenderMode = 'dom' | 'canvas' | 'svg';
type WatermarkContent = string | string[] | HTMLImageElement | WatermarkImage;
interface WatermarkConfig {
    /** 水印内容 */
    content: WatermarkContent;
    /** 容器元素或选择器 */
    container?: HTMLElement | string;
    /** 样式配置 */
    style?: WatermarkStyle;
    /** 布局配置 */
    layout?: WatermarkLayout;
    /** 动画配置 */
    animation?: AnimationConfig;
    /** 安全配置 */
    security?: SecurityConfig;
    /** 响应式配置 */
    responsive?: ResponsiveConfig;
    /** 渲染模式 */
    renderMode?: RenderMode;
    /** 是否启用 */
    enabled?: boolean;
    /** z-index层级 */
    zIndex?: number;
    /** 是否可见 */
    visible?: boolean;
    /** 自定义类名 */
    className?: string;
    /** 自定义样式 */
    customStyle?: Record<string, string>;
    /** 调试模式 */
    debug?: boolean;
}
declare const DEFAULT_WATERMARK_CONFIG: Required<Omit<WatermarkConfig, 'content' | 'container'>>;

export { DEFAULT_WATERMARK_CONFIG };
export type { RenderMode, WatermarkConfig, WatermarkContent, WatermarkImage, WatermarkLayout, WatermarkStyle };
