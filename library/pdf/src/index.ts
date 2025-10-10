/**
 * @ldesign/pdf - 功能强大的PDF阅读器插件
 * 主入口文件
 */

// 核心类
export { PDFViewer } from './core/PDFViewer';
export { DocumentManager } from './core/DocumentManager';
export { PageRenderer } from './core/PageRenderer';

// 工具类
export { EventEmitter } from './utils/EventEmitter';
export { CacheManager } from './utils/CacheManager';

// Vue 3 适配器
export * from './adapters/vue';

// 类型导出
export type * from './types';

// 默认导出
export { PDFViewer as default } from './core/PDFViewer';
