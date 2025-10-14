/**
 * PDF Library - Core Functions with Thumbnails
 * PDF库 - 包含缩略图功能
 */

// 导入组件
import { PDFViewer } from './core/PDFViewer';
import { SimpleToolbar } from './ui/SimpleToolbar';
import { SidebarManager } from './ui/SidebarManager';
import { EventEmitter } from './core/EventEmitter';

// 重新导出组件
export { PDFViewer } from './core/PDFViewer';
export type { PDFViewerOptions, ViewerState } from './core/PDFViewer';

// UI组件
export { SimpleToolbar } from './ui/SimpleToolbar';
export type { SimpleToolbarOptions } from './ui/SimpleToolbar';
export { SidebarManager } from './ui/SidebarManager';

// 事件发射器
export { EventEmitter } from './core/EventEmitter';

// 类型定义
export * from './types';

/**
 * 快速创建PDF查看器的便捷函数
 */
export function createPDFViewer(
  container: HTMLElement,
  pdfUrl: string,
  options?: {
    showToolbar?: boolean;
    toolbarContainer?: HTMLElement;
    initialScale?: number;
    fitMode?: 'width' | 'height' | 'page' | 'auto';
    enableSearch?: boolean;
    enableDownload?: boolean;
    enablePrint?: boolean;
  }
): { viewer: PDFViewer; toolbar?: SimpleToolbar } {
  // 创建查看器容器
  const viewerContainer = document.createElement('div');
  viewerContainer.style.cssText = 'width: 100%; height: 100%; position: relative;';
  
  // 创建工具栏容器
  let toolbarContainer: HTMLElement | null = null;
  let toolbar: SimpleToolbar | undefined;
  
  if (options?.showToolbar !== false) {
    toolbarContainer = options?.toolbarContainer || document.createElement('div');
    if (!options?.toolbarContainer) {
      container.appendChild(toolbarContainer);
    }
  }
  
  // 添加查看器容器
  container.appendChild(viewerContainer);
  
  // 创建PDF查看器
  const viewer = new PDFViewer({
    container: viewerContainer,
    pdfUrl,
    initialScale: options?.initialScale || 1.5,
    fitMode: options?.fitMode || 'auto',
    enableSearch: options?.enableSearch !== false,
    enableDownload: options?.enableDownload !== false,
    enablePrint: options?.enablePrint !== false
  });
  
  // 创建工具栏
  if (toolbarContainer) {
    toolbar = new SimpleToolbar({
      viewer,
      container: toolbarContainer,
      showSearch: options?.enableSearch !== false,
      showDownload: options?.enableDownload !== false,
      showPrint: options?.enablePrint !== false
    });
  }
  
  return { viewer, toolbar };
}

/**
 * 默认导出 - 用于快速集成
 */
export default {
  PDFViewer,
  SimpleToolbar,
  createPDFViewer,
  version: '2.0.0'
};

/**
 * 全局变量 - 用于非模块化使用
 */
if (typeof window !== 'undefined') {
  (window as any).PDFViewerLib = {
    createPDFViewer,
    PDFViewer,
    SimpleToolbar,
    version: '2.0.0'
  };
}
