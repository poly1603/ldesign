/**
 * Word Viewer 核心类
 */

import { EventEmitter } from '../utils/event';
import { ParserModule } from '../modules/parser';
import { ViewerModule } from '../modules/viewer';
import { EditorModule } from '../modules/editor';
import { ExporterModule } from '../modules/exporter';
import {
  ViewerOptions,
  DocumentSource,
  SearchResult,
  TextFormat,
  DocumentInfo,
  PageInfo,
  ExportOptions,
  InsertImageOptions,
  EventType,
  EventCallback,
  EditState,
  SelectionRange,
} from './types';
import { DEFAULT_OPTIONS, ERROR_CODES, ZOOM_RANGE } from './constants';
import { clearElement } from '../utils/dom';

export class WordViewer extends EventEmitter {
  private container: HTMLElement;
  private options: Required<ViewerOptions>;
  private parser: ParserModule;
  private viewer: ViewerModule;
  private editor: EditorModule | null = null;
  private exporter: ExporterModule;
  private documentBuffer: ArrayBuffer | null = null;
  private documentInfo: DocumentInfo | null = null;
  private isDestroyed: boolean = false;

  constructor(container: HTMLElement | string, options?: ViewerOptions) {
    super();

    // 获取容器元素
    if (typeof container === 'string') {
      const element = document.querySelector<HTMLElement>(container);
      if (!element) {
        throw new Error(`容器元素未找到: ${container}`);
      }
      this.container = element;
    } else {
      this.container = container;
    }

    // 合并选项
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
      container: this.container,
    } as Required<ViewerOptions>;

    // 初始化模块
    this.parser = new ParserModule(this);
    this.viewer = new ViewerModule(this);
    this.exporter = new ExporterModule(this);

    if (this.options.editable) {
      this.editor = new EditorModule(this);
    }

    // 初始化容器
    this.initContainer();
  }

  /**
   * 初始化容器
   */
  private initContainer(): void {
    this.container.classList.add('word-viewer-container');
    this.container.setAttribute('data-theme', this.options.theme);
  }

  /**
   * 从文件加载文档
   */
  async loadFile(file: File): Promise<void> {
    this.checkDestroyed();
    try {
      this.emit('progress', { loaded: 0, total: 100, percentage: 0 });
      
      const buffer = await this.parser.parseFile(file);
      this.documentBuffer = buffer;
      
      this.emit('progress', { loaded: 50, total: 100, percentage: 50 });
      
      await this.viewer.render(buffer);
      
      this.emit('progress', { loaded: 100, total: 100, percentage: 100 });
      this.emit('loaded', { source: file });
      
      // 提取文档信息
      this.documentInfo = await this.parser.extractDocumentInfo(buffer);
    } catch (error) {
      const errorInfo = {
        code: ERROR_CODES.LOAD_FAILED,
        message: error instanceof Error ? error.message : '加载文件失败',
        details: error,
      };
      this.emit('error', errorInfo);
      throw error;
    }
  }

  /**
   * 从 URL 加载文档
   */
  async loadUrl(url: string): Promise<void> {
    this.checkDestroyed();
    try {
      this.emit('progress', { loaded: 0, total: 100, percentage: 0 });
      
      const buffer = await this.parser.parseUrl(url);
      this.documentBuffer = buffer;
      
      this.emit('progress', { loaded: 50, total: 100, percentage: 50 });
      
      await this.viewer.render(buffer);
      
      this.emit('progress', { loaded: 100, total: 100, percentage: 100 });
      this.emit('loaded', { source: url });
      
      this.documentInfo = await this.parser.extractDocumentInfo(buffer);
    } catch (error) {
      const errorInfo = {
        code: ERROR_CODES.NETWORK_ERROR,
        message: error instanceof Error ? error.message : '加载 URL 失败',
        details: error,
      };
      this.emit('error', errorInfo);
      throw error;
    }
  }

  /**
   * 从 ArrayBuffer 加载文档
   */
  async loadBuffer(buffer: ArrayBuffer): Promise<void> {
    this.checkDestroyed();
    try {
      this.documentBuffer = buffer;
      await this.viewer.render(buffer);
      this.emit('loaded', { source: 'buffer' });
      this.documentInfo = await this.parser.extractDocumentInfo(buffer);
    } catch (error) {
      const errorInfo = {
        code: ERROR_CODES.RENDER_FAILED,
        message: error instanceof Error ? error.message : '渲染文档失败',
        details: error,
      };
      this.emit('error', errorInfo);
      throw error;
    }
  }

  /**
   * 设置缩放级别
   */
  setZoom(level: number): void {
    this.checkDestroyed();
    const clampedLevel = Math.max(
      ZOOM_RANGE.MIN,
      Math.min(ZOOM_RANGE.MAX, level)
    );
    this.viewer.setZoom(clampedLevel);
    this.emit('zoom', clampedLevel);
  }

  /**
   * 获取当前缩放级别
   */
  getZoom(): number {
    return this.viewer.getZoom();
  }

  /**
   * 跳转到指定页
   */
  goToPage(page: number): void {
    this.checkDestroyed();
    this.viewer.goToPage(page);
    this.emit('page-change', this.getPageInfo());
  }

  /**
   * 获取页面信息
   */
  getPageInfo(): PageInfo {
    return this.viewer.getPageInfo();
  }

  /**
   * 搜索文本
   */
  search(keyword: string): SearchResult[] {
    this.checkDestroyed();
    return this.viewer.search(keyword);
  }

  /**
   * 启用编辑模式
   */
  enableEdit(): void {
    this.checkDestroyed();
    if (!this.editor) {
      this.editor = new EditorModule(this);
    }
    this.editor.enable();
    this.emit('edit-start');
  }

  /**
   * 禁用编辑模式
   */
  disableEdit(): void {
    this.checkDestroyed();
    if (this.editor) {
      this.editor.disable();
      this.emit('edit-end');
    }
  }

  /**
   * 插入文本
   */
  insertText(text: string, position?: number): void {
    this.checkDestroyed();
    this.ensureEditor();
    this.editor!.insertText(text, position);
    this.emit('changed');
  }

  /**
   * 插入图片
   */
  insertImage(image: File | Blob, options?: InsertImageOptions): void {
    this.checkDestroyed();
    this.ensureEditor();
    this.editor!.insertImage(image, options);
    this.emit('changed');
  }

  /**
   * 应用文本格式
   */
  applyFormat(format: TextFormat): void {
    this.checkDestroyed();
    this.ensureEditor();
    this.editor!.applyFormat(format);
    this.emit('changed');
  }

  /**
   * 获取选中的文本
   */
  getSelection(): SelectionRange | null {
    this.checkDestroyed();
    if (!this.editor) return null;
    return this.editor.getSelection();
  }

  /**
   * 撤销
   */
  undo(): void {
    this.checkDestroyed();
    this.ensureEditor();
    this.editor!.undo();
    this.emit('changed');
  }

  /**
   * 重做
   */
  redo(): void {
    this.checkDestroyed();
    this.ensureEditor();
    this.editor!.redo();
    this.emit('changed');
  }

  /**
   * 获取编辑状态
   */
  getEditState(): EditState {
    if (!this.editor) {
      return {
        isEditing: false,
        isDirty: false,
        canUndo: false,
        canRedo: false,
      };
    }
    return this.editor.getState();
  }

  /**
   * 导出为 PDF
   */
  async exportToPDF(): Promise<Blob> {
    this.checkDestroyed();
    return this.exporter.exportToPDF(this.container);
  }

  /**
   * 导出为 HTML
   */
  exportToHTML(): string {
    this.checkDestroyed();
    return this.exporter.exportToHTML(this.container);
  }

  /**
   * 导出为 DOCX
   */
  async exportToDocx(): Promise<Blob> {
    this.checkDestroyed();
    if (!this.documentBuffer) {
      throw new Error('没有可导出的文档');
    }
    return this.exporter.exportToDocx(this.documentBuffer);
  }

  /**
   * 导出文档
   */
  async export(options: ExportOptions): Promise<Blob | string> {
    this.checkDestroyed();
    switch (options.format) {
      case 'pdf':
        return this.exportToPDF();
      case 'html':
        return this.exportToHTML();
      case 'docx':
        return this.exportToDocx();
      case 'txt':
        return this.exporter.exportToText(this.container);
      default:
        throw new Error(`不支持的导出格式: ${options.format}`);
    }
  }

  /**
   * 获取文档信息
   */
  getDocumentInfo(): DocumentInfo | null {
    return this.documentInfo;
  }

  /**
   * 获取配置选项
   */
  getOptions(): Readonly<Required<ViewerOptions>> {
    return { ...this.options };
  }

  /**
   * 更新配置选项
   */
  updateOptions(options: Partial<ViewerOptions>): void {
    this.checkDestroyed();
    this.options = { ...this.options, ...options } as Required<ViewerOptions>;
    
    // 更新主题
    if (options.theme) {
      this.container.setAttribute('data-theme', options.theme);
    }

    // 更新编辑模式
    if (options.editable !== undefined) {
      if (options.editable && !this.editor) {
        this.enableEdit();
      } else if (!options.editable && this.editor) {
        this.disableEdit();
      }
    }
  }

  /**
   * 获取容器元素
   */
  getContainer(): HTMLElement {
    return this.container;
  }

  /**
   * 确保编辑器已初始化
   */
  private ensureEditor(): void {
    if (!this.editor) {
      throw new Error('编辑器未启用，请先调用 enableEdit()');
    }
  }

  /**
   * 检查是否已销毁
   */
  private checkDestroyed(): void {
    if (this.isDestroyed) {
      throw new Error('WordViewer 已被销毁');
    }
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    if (this.isDestroyed) return;

    // 销毁模块
    this.viewer.destroy();
    if (this.editor) {
      this.editor.destroy();
    }

    // 清空容器
    clearElement(this.container);
    this.container.classList.remove('word-viewer-container');
    this.container.removeAttribute('data-theme');

    // 清除引用
    this.documentBuffer = null;
    this.documentInfo = null;

    // 移除所有事件监听器
    this.removeAllListeners();

    this.isDestroyed = true;
  }
}


