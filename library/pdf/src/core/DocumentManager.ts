/**
 * 文档管理器
 */

import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFDocumentLoadingTask } from 'pdfjs-dist';
import type { PDFViewerConfig, PDFSource } from '../types';

export class DocumentManager {
  private _config: PDFViewerConfig;
  private _document: PDFDocumentProxy | null = null;
  private _loadingTask: PDFDocumentLoadingTask | null = null;

  constructor(config: PDFViewerConfig) {
    this._config = config;
  }

  /**
   * 加载文档
   */
  async load(
    source: PDFSource,
    onProgress?: (progress: number) => void
  ): Promise<PDFDocumentProxy> {
    // 取消之前的加载任务
    if (this._loadingTask) {
      this._loadingTask.destroy();
      this._loadingTask = null;
    }

    // 销毁之前的文档
    if (this._document) {
      await this._document.destroy();
      this._document = null;
    }

    try {
      // 准备加载参数
      const loadingTask = pdfjsLib.getDocument(this._getLoadParams(source));

      this._loadingTask = loadingTask;

      // 监听进度
      if (onProgress) {
        loadingTask.onProgress = (progressData: any) => {
          const progress = progressData.loaded / progressData.total;
          onProgress(progress);
        };
      }

      // 加载文档
      const doc = await loadingTask.promise;
      this._document = doc;
      this._loadingTask = null;

      return doc;
    } catch (error) {
      this._loadingTask = null;
      throw new Error(`PDF加载失败: ${(error as Error).message}`);
    }
  }

  /**
   * 获取文档
   */
  get document(): PDFDocumentProxy | null {
    return this._document;
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this._loadingTask) {
      this._loadingTask.destroy();
      this._loadingTask = null;
    }

    if (this._document) {
      this._document.destroy();
      this._document = null;
    }
  }

  /**
   * 获取加载参数
   */
  private _getLoadParams(source: PDFSource): any {
    const params: any = {};

    if (typeof source === 'string') {
      params.url = source;
    } else if (source instanceof ArrayBuffer) {
      params.data = new Uint8Array(source);
    } else if (source instanceof Uint8Array) {
      params.data = source;
    } else if (source instanceof URL) {
      params.url = source.toString();
    }

    // 添加其他配置
    if (this._config.workerSrc) {
      params.workerSrc = this._config.workerSrc;
    }

    return params;
  }
}
