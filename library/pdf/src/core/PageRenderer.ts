/**
 * 页面渲染器
 */

import type { PDFPageProxy, PageViewport } from 'pdfjs-dist';
import type { PDFViewerConfig, RenderTask } from '../types';

export class PageRenderer {
  private _config: PDFViewerConfig;
  private _renderingTasks: Map<number, RenderTask> = new Map();
  private _canvasPool: HTMLCanvasElement[] = [];

  constructor(config: PDFViewerConfig) {
    this._config = config;
  }

  /**
   * 渲染页面
   */
  async render(
    page: PDFPageProxy,
    scale: number,
    rotation: number = 0
  ): Promise<HTMLCanvasElement> {
    const pageNumber = page.pageNumber;

    // 取消之前的渲染任务
    this.cancel(pageNumber);

    // 获取或创建canvas
    const canvas = this._getCanvas();
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('无法创建Canvas上下文');
    }

    try {
      // 计算viewport
      const viewport = page.getViewport({ scale, rotation });

      // 设置canvas尺寸
      this._setCanvasSize(canvas, viewport);

      // 创建渲染任务
      const renderContext = {
        canvasContext: context,
        viewport,
      };

      const renderTask = page.render(renderContext);

      // 保存任务
      this._renderingTasks.set(pageNumber, {
        pageNumber,
        page,
        canvas,
        scale,
        rotation,
        priority: 1,
        cancel: () => renderTask.cancel(),
        promise: renderTask.promise,
      });

      // 等待渲染完成
      await renderTask.promise;

      // 移除任务
      this._renderingTasks.delete(pageNumber);

      return canvas;
    } catch (error: any) {
      this._renderingTasks.delete(pageNumber);

      if (error?.name === 'RenderingCancelledException') {
        throw new Error('渲染已取消');
      }

      throw new Error(`渲染失败: ${error.message}`);
    }
  }

  /**
   * 取消渲染
   */
  cancel(pageNumber: number): void {
    const task = this._renderingTasks.get(pageNumber);
    if (task && task.cancel) {
      task.cancel();
      this._renderingTasks.delete(pageNumber);
    }
  }

  /**
   * 取消所有渲染
   */
  cancelAll(): void {
    this._renderingTasks.forEach((task) => {
      if (task.cancel) {
        task.cancel();
      }
    });
    this._renderingTasks.clear();
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.cancelAll();
    this._canvasPool = [];
  }

  /**
   * 获取canvas
   */
  private _getCanvas(): HTMLCanvasElement {
    // 从池中获取或创建新的
    return this._canvasPool.pop() || document.createElement('canvas');
  }

  /**
   * 回收canvas
   */
  private _recycleCanvas(canvas: HTMLCanvasElement): void {
    if (this._canvasPool.length < 10) {
      // 清空canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
      this._canvasPool.push(canvas);
    }
  }

  /**
   * 设置canvas尺寸
   */
  private _setCanvasSize(canvas: HTMLCanvasElement, viewport: PageViewport): void {
    const dpi = this._config.render?.dpi || 96;
    const outputScale = window.devicePixelRatio || 1;

    // 计算实际尺寸
    const scale = (dpi / 96) * outputScale;

    canvas.width = Math.floor(viewport.width * scale);
    canvas.height = Math.floor(viewport.height * scale);

    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    // 缩放上下文以适应DPI
    const context = canvas.getContext('2d');
    if (context && scale !== 1) {
      context.scale(scale, scale);
    }
  }
}
