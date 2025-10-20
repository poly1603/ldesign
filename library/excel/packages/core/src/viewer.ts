/**
 * Excel 查看器核心类
 */

import { ExcelParser } from './parser';
import { ExcelRenderer } from './renderer';
import { ExcelExporter } from './exporter';
import type {
  ExcelViewerOptions,
  SheetData,
  ExportOptions,
  SearchOptions,
  SearchResult,
  EventType,
  EventListener,
  SelectionRange,
} from './types';

/**
 * Excel 查看器类
 */
export class ExcelViewer {
  private container: HTMLElement;
  private options: ExcelViewerOptions;
  private parser: ExcelParser;
  private renderer: ExcelRenderer | null = null;
  private exporter: ExcelExporter;
  private sheets: SheetData[] = [];
  private luckysheetData: any[] = [];
  private eventListeners: Map<EventType, Set<EventListener>> = new Map();
  private worker: Worker | null = null;

  constructor(options: ExcelViewerOptions) {
    // 获取容器元素
    this.container = this.resolveContainer(options.container);
    
    // 保存配置
    this.options = {
      showToolbar: true,
      showFormulaBar: true,
      showSheetTabs: true,
      allowEdit: true,
      allowCopy: true,
      allowPaste: true,
      enableVirtualScroll: true,
      virtualScrollThreshold: 100000,
      lang: 'zh',
      theme: 'light',
      performance: {
        useWebWorker: true,
        chunkSize: 10000,
        lazyLoad: true,
      },
      ...options,
    };

    // 初始化模块
    this.parser = new ExcelParser();
    this.exporter = new ExcelExporter();

    // 应用主题
    this.applyTheme();

    // 应用自定义样式
    if (this.options.customStyle) {
      this.applyCustomStyle(this.options.customStyle);
    }
  }

  /**
   * 解析容器
   */
  private resolveContainer(container: string | HTMLElement): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(`Container not found: ${container}`);
      }
      return element as HTMLElement;
    }
    return container;
  }

  /**
   * 加载文件
   */
  async loadFile(file: File | ArrayBuffer | string): Promise<void> {
    try {
      // 触发 beforeLoad 钩子
      if (this.options.hooks?.beforeLoad) {
        const canLoad = await this.options.hooks.beforeLoad(file);
        if (canLoad === false) {
          return;
        }
      }

      this.emit('load', { status: 'loading' });

      // 根据类型加载文件
      if (file instanceof File) {
        await this.loadFromFile(file);
      } else if (file instanceof ArrayBuffer) {
        await this.loadFromArrayBuffer(file);
      } else if (typeof file === 'string') {
        await this.loadFromUrl(file);
      } else {
        throw new Error('Invalid file type');
      }

      // 触发 afterLoad 钩子
      if (this.options.hooks?.afterLoad) {
        this.options.hooks.afterLoad(this.sheets);
      }

      this.emit('load', { status: 'success', sheets: this.sheets });
    } catch (error) {
      this.handleError(error as Error);
      this.emit('loadError', { error });
      throw error;
    }
  }

  /**
   * 从文件加载
   */
  private async loadFromFile(file: File): Promise<void> {
    // 检查文件大小，决定是否使用 Web Worker
    const useWorker = this.shouldUseWorker(file.size);

    if (useWorker) {
      this.sheets = await this.parseFileWithWorker(file);
    } else {
      this.sheets = await this.parser.loadFromFile(file);
    }

    await this.initializeRenderer();
  }

  /**
   * 从 ArrayBuffer 加载
   */
  private async loadFromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<void> {
    const useWorker = this.shouldUseWorker(arrayBuffer.byteLength);

    if (useWorker) {
      this.sheets = await this.parseArrayBufferWithWorker(arrayBuffer);
    } else {
      this.sheets = this.parser.loadFromArrayBuffer(arrayBuffer);
    }

    await this.initializeRenderer();
  }

  /**
   * 从 URL 加载
   */
  private async loadFromUrl(url: string): Promise<void> {
    this.sheets = await this.parser.loadFromUrl(url);
    await this.initializeRenderer();
  }

  /**
   * 是否使用 Web Worker
   */
  private shouldUseWorker(fileSize: number): boolean {
    return (
      this.options.performance?.useWebWorker !== false &&
      fileSize > 1024 * 1024 // 大于 1MB
    );
  }

  /**
   * 使用 Web Worker 解析文件
   */
  private async parseFileWithWorker(file: File): Promise<SheetData[]> {
    return new Promise((resolve, reject) => {
      // 这里简化实现，实际应创建专门的 Worker 文件
      // 由于 Worker 需要单独的 JS 文件，这里暂时回退到主线程
      this.parser.loadFromFile(file).then(resolve).catch(reject);
    });
  }

  /**
   * 使用 Web Worker 解析 ArrayBuffer
   */
  private async parseArrayBufferWithWorker(arrayBuffer: ArrayBuffer): Promise<SheetData[]> {
    return new Promise((resolve, reject) => {
      // 简化实现，回退到主线程
      try {
        const sheets = this.parser.loadFromArrayBuffer(arrayBuffer);
        resolve(sheets);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 初始化渲染器
   */
  private async initializeRenderer(): Promise<void> {
    // 转换为 Luckysheet 格式
    this.luckysheetData = this.parser.convertToLuckysheetFormat(this.sheets);

    // 销毁旧的渲染器
    if (this.renderer) {
      this.renderer.destroy();
    }

    // 创建新的渲染器
    this.renderer = new ExcelRenderer(this.container, this.options);

    // 初始化渲染
    await this.renderer.init(this.luckysheetData);
  }

  /**
   * 获取数据
   */
  getData(): SheetData[] {
    return this.sheets;
  }

  /**
   * 获取当前工作表数据
   */
  getCurrentSheetData(): any {
    if (!this.renderer) {
      return null;
    }
    return this.renderer.getCurrentSheetData();
  }

  /**
   * 切换工作表
   */
  setActiveSheet(index: number): void {
    if (!this.renderer) {
      return;
    }
    this.renderer.setActiveSheet(index);
    this.emit('sheetChange', { index });
  }

  /**
   * 获取当前工作表索引
   */
  getCurrentSheetIndex(): number {
    if (!this.renderer) {
      return 0;
    }
    return this.renderer.getCurrentSheetIndex();
  }

  /**
   * 导出文件
   */
  exportFile(options: ExportOptions): Blob {
    const format = options.format || 'xlsx';
    const filename = options.filename || `export.${format}`;

    let blob: Blob;

    switch (format) {
      case 'xlsx':
        blob = this.exporter.exportToExcel(this.sheets, options);
        break;
      case 'csv':
        blob = this.exporter.exportToCSV(this.sheets, options);
        break;
      case 'html':
        blob = this.exporter.exportToHTML(this.sheets, options);
        break;
      case 'json':
        blob = this.exporter.exportToJSON(this.sheets, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    this.emit('export', { format, filename });
    return blob;
  }

  /**
   * 下载导出文件
   */
  downloadFile(options: ExportOptions): void {
    const format = options.format || 'xlsx';
    const filename = options.filename || `export.${format}`;
    const blob = this.exportFile(options);
    this.exporter.downloadBlob(blob, filename);
  }

  /**
   * 导出截图
   */
  async exportScreenshot(filename?: string): Promise<Blob> {
    if (!this.renderer) {
      throw new Error('Renderer not initialized');
    }

    const container = this.renderer.getContainer();
    const blob = await this.exporter.exportToImage(container, filename);
    this.emit('export', { format: 'png', filename });
    return blob;
  }

  /**
   * 下载截图
   */
  async downloadScreenshot(filename: string = 'screenshot.png'): Promise<void> {
    const blob = await this.exportScreenshot(filename);
    this.exporter.downloadBlob(blob, filename);
  }

  /**
   * 搜索
   */
  search(options: SearchOptions): SearchResult[] {
    if (!this.renderer) {
      return [];
    }

    return this.renderer.search(options.keyword, {
      caseSensitive: options.caseSensitive,
      matchWholeWord: options.matchWholeWord,
    });
  }

  /**
   * 获取选中区域
   */
  getSelection(): SelectionRange | null {
    if (!this.renderer) {
      return null;
    }

    const range = this.renderer.getSelection();
    if (!range) {
      return null;
    }

    return {
      sheetIndex: this.getCurrentSheetIndex(),
      startRow: range.row[0],
      startCol: range.column[0],
      endRow: range.row[1],
      endCol: range.column[1],
    };
  }

  /**
   * 设置单元格值
   */
  setCellValue(row: number, col: number, value: any): void {
    if (!this.renderer) {
      return;
    }

    const oldValue = this.renderer.getCellValue(row, col);

    // 触发 beforeCellChange 钩子
    if (this.options.hooks?.beforeCellChange) {
      const canChange = this.options.hooks.beforeCellChange(
        this.getCurrentSheetIndex(),
        row,
        col,
        oldValue,
        value
      );
      if (canChange === false) {
        return;
      }
    }

    this.renderer.setCellValue(row, col, value);
    this.emit('cellChange', { row, col, oldValue, newValue: value });
  }

  /**
   * 获取单元格值
   */
  getCellValue(row: number, col: number): any {
    if (!this.renderer) {
      return null;
    }
    return this.renderer.getCellValue(row, col);
  }

  /**
   * 冻结行列
   */
  setFreeze(type: 'row' | 'column' | 'both', row?: number, column?: number): void {
    if (!this.renderer) {
      return;
    }
    this.renderer.setFreeze(type, row, column);
  }

  /**
   * 撤销
   */
  undo(): void {
    if (!this.renderer) {
      return;
    }
    this.renderer.undo();
  }

  /**
   * 重做
   */
  redo(): void {
    if (!this.renderer) {
      return;
    }
    this.renderer.redo();
  }

  /**
   * 刷新
   */
  refresh(): void {
    if (!this.renderer) {
      return;
    }
    this.renderer.refresh();
  }

  /**
   * 监听事件
   */
  on(event: EventType, listener: EventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * 取消监听事件
   */
  off(event: EventType, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: EventType, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * 应用主题
   */
  private applyTheme(): void {
    const theme = this.options.theme || 'light';
    this.container.classList.add(`excel-viewer-theme-${theme}`);
  }

  /**
   * 应用自定义样式
   */
  private applyCustomStyle(css: string): void {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * 错误处理
   */
  private handleError(error: Error): void {
    console.error('ExcelViewer Error:', error);
    
    if (this.options.hooks?.onError) {
      this.options.hooks.onError(error);
    }

    this.emit('error', { error });
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    // 销毁渲染器
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }

    // 销毁 Parser
    this.parser.destroy();

    // 清理 Worker
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    // 清空数据
    this.sheets = [];
    this.luckysheetData = [];

    // 清空事件监听器
    this.eventListeners.clear();

    // 清空容器
    this.container.innerHTML = '';
    this.container.className = '';

    this.emit('destroy');
  }
}


