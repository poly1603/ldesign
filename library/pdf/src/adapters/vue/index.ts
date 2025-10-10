/**
 * Vue 3 适配器
 */

import PDFViewerComponent from './PDFViewer.vue';
import { usePDFViewer } from './usePDFViewer';
import type { App } from 'vue';

export { PDFViewerComponent, usePDFViewer };

/**
 * Vue插件
 */
export const PDFViewerPlugin = {
  install(app: App, options: any = {}) {
    app.component(options.componentName || 'PDFViewer', PDFViewerComponent);
  },
};

export default PDFViewerPlugin;
