/**
 * PDF查看器核心类
 */

import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { EventEmitter } from '../utils/EventEmitter';
import { DocumentManager } from './DocumentManager';
import { PageRenderer } from './PageRenderer';
import { CacheManager } from '../utils/CacheManager';
import type {
  PDFViewerConfig,
  PDFViewerAPI,
  PDFSource,
  ScaleMode,
  DocumentInfo,
  PageInfo,
  SearchResult,
  SearchConfig,
  OutlineItem,
  PrintConfig,
  ExportOptions,
  PDFPlugin,
  PDFEventHandlers,
} from '../types';

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Partial<PDFViewerConfig> = {
  scale: 'auto',
  quality: 'medium',
  layout: 'continuous',
  initialPage: 1,
  virtualScroll: true,
  enableTextSelection: true,
  enableAnnotations: true,
  cache: {
    enabled: true,
    maxPages: 50,
    strategy: 'lru',
    preloadPages: 3,
  },
  render: {
    dpi: 96,
    canvasOptimization: true,
    useWorker: true,
    timeout: 30000,
    maxConcurrent: 3,
  },
  search: {
    caseSensitive: false,
    wholeWords: false,
    regex: false,
    highlightColor: 'rgba(255, 255, 0, 0.3)',
    currentMatchColor: 'rgba(255, 165, 0, 0.5)',
  },
  thumbnail: {
    enabled: true,
    width: 150,
    height: 200,
    quality: 'low',
    lazyLoad: true,
  },
  print: {
    dpi: 300,
    showDialog: true,
    orientation: 'portrait',
  },
};

/**
 * PDF查看器类
 */
export class PDFViewer extends EventEmitter<PDFEventHandlers> implements PDFViewerAPI {
  private _config: PDFViewerConfig;
  private _container: HTMLElement | null = null;
  private _documentManager: DocumentManager;
  private _pageRenderer: PageRenderer;
  private _cacheManager: CacheManager;
  private _currentPage: number = 1;
  private _scale: number = 1;
  private _rotation: number = 0;
  private _plugins: PDFPlugin[] = [];
  private _destroyed: boolean = false;

  constructor(config: PDFViewerConfig = {}) {
    super();

    // 合并配置
    this._config = this._mergeConfig(config);

    // 初始化容器
    this._initContainer();

    // 初始化管理器
    this._documentManager = new DocumentManager(this._config);
    this._pageRenderer = new PageRenderer(this._config);
    this._cacheManager = new CacheManager(this._config.cache || {});

    // 设置Worker路径
    if (this._config.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = this._config.workerSrc;
    }

    // 绑定事件
    this._bindEvents();

    // 安装插件
    if (this._config.plugins) {
      this._config.plugins.forEach((plugin) => this.use(plugin));
    }

    // 初始化事件监听器
    if (this._config.on) {
      Object.entries(this._config.on).forEach(([event, handler]) => {
        if (handler) {
          this.on(event as keyof PDFEventHandlers, handler as any);
        }
      });
    }
  }

  /**
   * 加载PDF文档
   */
  async load(source: PDFSource): Promise<void> {
    if (this._destroyed) {
      throw new Error('PDFViewer已被销毁');
    }

    try {
      this.emit('loadStart', source);

      // 调用插件钩子
      await this._callPluginHook('beforeLoad', source);

      // 加载文档
      const doc = await this._documentManager.load(source, (progress) => {
        this.emit('loadProgress', progress);
      });

      // 设置初始页码
      this._currentPage = Math.min(
        this._config.initialPage || 1,
        doc.numPages
      );

      // 调用插件钩子
      await this._callPluginHook('afterLoad', doc);

      // 获取文档信息
      const info = await this._getDocumentInfo();
      this.emit('loadComplete', info);

      // 渲染初始页面
      await this._renderCurrentPage();
    } catch (error) {
      this.emit('loadError', error as Error);
      throw error;
    }
  }

  /**
   * 跳转到指定页
   */
  goToPage(pageNumber: number): void {
    const totalPages = this.totalPages;
    if (pageNumber < 1 || pageNumber > totalPages) {
      throw new Error(`页码超出范围: ${pageNumber} (1-${totalPages})`);
    }

    if (pageNumber !== this._currentPage) {
      this._currentPage = pageNumber;
      this.emit('pageChange', pageNumber);
      this._renderCurrentPage();
    }
  }

  /**
   * 下一页
   */
  nextPage(): void {
    if (this._currentPage < this.totalPages) {
      this.goToPage(this._currentPage + 1);
    }
  }

  /**
   * 上一页
   */
  previousPage(): void {
    if (this._currentPage > 1) {
      this.goToPage(this._currentPage - 1);
    }
  }

  /**
   * 设置缩放
   */
  setScale(scale: ScaleMode): void {
    let newScale: number;

    if (typeof scale === 'number') {
      newScale = scale;
    } else {
      // 根据模式计算缩放比例
      newScale = this._calculateScale(scale);
    }

    if (newScale !== this._scale) {
      this._scale = newScale;
      this.emit('scaleChange', newScale);
      this.refresh();
    }
  }

  /**
   * 放大
   */
  zoomIn(step: number = 0.1): void {
    this.setScale(this._scale + step);
  }

  /**
   * 缩小
   */
  zoomOut(step: number = 0.1): void {
    this.setScale(Math.max(0.1, this._scale - step));
  }

  /**
   * 旋转页面
   */
  rotate(angle: number): void {
    this._rotation = (this._rotation + angle) % 360;
    this.refresh();
  }

  /**
   * 搜索文本
   */
  async search(
    query: string,
    options?: Partial<SearchConfig>
  ): Promise<SearchResult[]> {
    if (!this.document) {
      throw new Error('文档未加载');
    }

    const searchOptions = { ...this._config.search, ...options };
    const results: SearchResult[] = [];

    try {
      for (let i = 1; i <= this.totalPages; i++) {
        const page = await this.document.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(' ');

        let searchText = text;
        let searchQuery = query;

        if (!searchOptions.caseSensitive) {
          searchText = text.toLowerCase();
          searchQuery = query.toLowerCase();
        }

        let index = 0;
        let matchCount = 0;

        while (true) {
          index = searchText.indexOf(searchQuery, index);
          if (index === -1) break;

          // 检查全词匹配
          if (searchOptions.wholeWords) {
            const before = index > 0 ? searchText[index - 1] : ' ';
            const after =
              index + searchQuery.length < searchText.length
                ? searchText[index + searchQuery.length]
                : ' ';

            if (!/\s/.test(before) || !/\s/.test(after)) {
              index++;
              continue;
            }
          }

          matchCount++;

          // 获取上下文
          const contextStart = Math.max(0, index - 50);
          const contextEnd = Math.min(text.length, index + searchQuery.length + 50);
          const context = text.substring(contextStart, contextEnd);

          results.push({
            pageNumber: i,
            text: text.substring(index, index + searchQuery.length),
            index,
            matchCount,
            context,
          });

          index += searchQuery.length;
        }
      }

      this.emit('searchComplete', results);
      return results;
    } catch (error) {
      throw new Error(`搜索失败: ${(error as Error).message}`);
    }
  }

  /**
   * 获取文档信息
   */
  getDocumentInfo(): DocumentInfo | null {
    if (!this.document) return null;

    return {
      title: '',
      numPages: this.totalPages,
    };
  }

  /**
   * 获取页面信息
   */
  getPageInfo(pageNumber?: number): PageInfo | null {
    const page = pageNumber || this._currentPage;

    if (page < 1 || page > this.totalPages) {
      return null;
    }

    // 这里需要异步获取页面，简化处理
    return {
      pageNumber: page,
      width: 0,
      height: 0,
      rotation: this._rotation,
      scale: this._scale,
    };
  }

  /**
   * 获取大纲
   */
  async getOutline(): Promise<OutlineItem[]> {
    if (!this.document) {
      throw new Error('文档未加载');
    }

    const outline = await this.document.getOutline();
    if (!outline) return [];

    return this._parseOutline(outline);
  }

  /**
   * 获取缩略图
   */
  async getThumbnail(pageNumber: number): Promise<HTMLCanvasElement> {
    if (!this.document) {
      throw new Error('文档未加载');
    }

    if (pageNumber < 1 || pageNumber > this.totalPages) {
      throw new Error(`页码超出范围: ${pageNumber}`);
    }

    const page = await this.document.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 0.2 });

    const canvas = document.createElement('canvas');
    canvas.width = this._config.thumbnail?.width || 150;
    canvas.height = this._config.thumbnail?.height || 200;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('无法创建Canvas上下文');
    }

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    return canvas;
  }

  /**
   * 打印
   */
  async print(options?: Partial<PrintConfig>): Promise<void> {
    if (!this.document) {
      throw new Error('文档未加载');
    }

    const printOptions = { ...this._config.print, ...options };

    // 这里简化处理，实际应该创建打印iframe
    if (printOptions.showDialog) {
      window.print();
    }
  }

  /**
   * 下载
   */
  download(filename?: string): void {
    if (!this._documentManager.document) {
      throw new Error('文档未加载');
    }

    this._documentManager.document.getData().then((data) => {
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'document.pdf';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  /**
   * 导出
   */
  async export(options?: ExportOptions): Promise<Blob> {
    if (!this.document) {
      throw new Error('文档未加载');
    }

    const format = options?.format || 'pdf';

    if (format === 'pdf') {
      const data = await this.document.getData();
      return new Blob([data], { type: 'application/pdf' });
    }

    throw new Error(`不支持的导出格式: ${format}`);
  }

  /**
   * 获取选中文本
   */
  getSelectedText(): string {
    return window.getSelection()?.toString() || '';
  }

  /**
   * 刷新渲染
   */
  refresh(): void {
    this._renderCurrentPage();
  }

  /**
   * 销毁实例
   */
  async destroy(): Promise<void> {
    if (this._destroyed) return;

    // 调用插件钩子
    await this._callPluginHook('beforeDestroy');

    // 卸载插件
    this._plugins.forEach((plugin) => {
      if (plugin.uninstall) {
        plugin.uninstall();
      }
    });

    // 清理资源
    this._documentManager.destroy();
    this._pageRenderer.destroy();
    this._cacheManager.clear();

    // 清理容器
    if (this._container) {
      this._container.innerHTML = '';
    }

    this._destroyed = true;
    this.emit('destroy');
    this.removeAllListeners();
  }

  /**
   * 注册插件
   */
  use(plugin: PDFPlugin): void {
    if (this._plugins.some((p) => p.name === plugin.name)) {
      console.warn(`插件已存在: ${plugin.name}`);
      return;
    }

    this._plugins.push(plugin);

    if (plugin.install) {
      plugin.install(this);
    }
  }

  /**
   * 配置
   */
  get config(): PDFViewerConfig {
    return this._config;
  }

  /**
   * 当前页码
   */
  get currentPage(): number {
    return this._currentPage;
  }

  /**
   * 总页数
   */
  get totalPages(): number {
    return this._documentManager.document?.numPages || 0;
  }

  /**
   * 当前缩放比例
   */
  get scale(): number {
    return this._scale;
  }

  /**
   * PDF文档对象
   */
  get document(): PDFDocumentProxy | null {
    return this._documentManager.document;
  }

  /**
   * 合并配置
   */
  private _mergeConfig(config: PDFViewerConfig): PDFViewerConfig {
    return {
      ...DEFAULT_CONFIG,
      ...config,
      cache: { ...DEFAULT_CONFIG.cache, ...config.cache },
      render: { ...DEFAULT_CONFIG.render, ...config.render },
      search: { ...DEFAULT_CONFIG.search, ...config.search },
      thumbnail: { ...DEFAULT_CONFIG.thumbnail, ...config.thumbnail },
      print: { ...DEFAULT_CONFIG.print, ...config.print },
    };
  }

  /**
   * 初始化容器
   */
  private _initContainer(): void {
    if (this._config.container) {
      if (typeof this._config.container === 'string') {
        const el = document.querySelector(this._config.container);
        if (!el) {
          throw new Error(`容器不存在: ${this._config.container}`);
        }
        this._container = el as HTMLElement;
      } else {
        this._container = this._config.container;
      }
    }
  }

  /**
   * 绑定事件
   */
  private _bindEvents(): void {
    // 这里可以添加DOM事件监听
  }

  /**
   * 获取文档信息
   */
  private async _getDocumentInfo(): Promise<DocumentInfo> {
    if (!this.document) {
      throw new Error('文档未加载');
    }

    const metadata = await this.document.getMetadata();
    const info = metadata.info as any;

    return {
      title: info.Title,
      author: info.Author,
      subject: info.Subject,
      keywords: info.Keywords,
      creator: info.Creator,
      producer: info.Producer,
      creationDate: info.CreationDate ? new Date(info.CreationDate) : undefined,
      modificationDate: info.ModDate ? new Date(info.ModDate) : undefined,
      numPages: this.document.numPages,
      pdfVersion: (metadata as any).pdfFormatVersion,
    };
  }

  /**
   * 渲染当前页面
   */
  private async _renderCurrentPage(): Promise<void> {
    if (!this.document || !this._container) return;

    try {
      this.emit('renderStart', this._currentPage);

      const page = await this.document.getPage(this._currentPage);

      // 调用插件钩子
      await this._callPluginHook('beforeRender', page);

      const canvas = await this._pageRenderer.render(page, this._scale, this._rotation);

      // 清空容器并添加canvas
      this._container.innerHTML = '';
      this._container.appendChild(canvas);

      // 调用插件钩子
      await this._callPluginHook('afterRender', page, canvas);

      this.emit('renderComplete', this._currentPage);
    } catch (error) {
      this.emit('renderError', this._currentPage, error as Error);
      throw error;
    }
  }

  /**
   * 计算缩放比例
   */
  private _calculateScale(mode: ScaleMode): number {
    if (typeof mode === 'number') return mode;

    // 简化处理，实际应该根据容器大小和页面大小计算
    switch (mode) {
      case 'auto':
        return 1;
      case 'page-fit':
        return 1;
      case 'page-width':
        return 1;
      case 'page-height':
        return 1;
      default:
        return 1;
    }
  }

  /**
   * 解析大纲
   */
  private _parseOutline(outline: any[]): OutlineItem[] {
    return outline.map((item) => ({
      title: item.title,
      pageNumber: item.dest ? 1 : 0, // 简化处理
      children: item.items ? this._parseOutline(item.items) : undefined,
    }));
  }

  /**
   * 调用插件钩子
   */
  private async _callPluginHook(
    hookName: keyof NonNullable<PDFPlugin['hooks']>,
    ...args: any[]
  ): Promise<void> {
    for (const plugin of this._plugins) {
      const hook = plugin.hooks?.[hookName];
      if (hook) {
        await (hook as any)(...args);
      }
    }
  }
}
