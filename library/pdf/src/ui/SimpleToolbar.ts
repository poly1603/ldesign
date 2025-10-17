import { EventEmitter } from '../core/EventEmitter';
import { PDFViewer } from '../core/PDFViewer';

export interface SimpleToolbarOptions {
  viewer: PDFViewer;
  container: HTMLElement;
  showSearch?: boolean;
  showDownload?: boolean;
  showPrint?: boolean;
  showRotate?: boolean;
  showZoom?: boolean;
}

/**
 * 简化的PDF工具栏 - 只包含核心功能
 */
export class SimpleToolbar extends EventEmitter {
  private viewer: PDFViewer;
  private container: HTMLElement;
  private toolbar: HTMLElement | null = null;
  private pageInput: HTMLInputElement | null = null;
  private pageCountSpan: HTMLSpanElement | null = null;
  private zoomSelect: HTMLSelectElement | null = null;
  private searchBox: HTMLElement | null = null;
  private searchInput: HTMLInputElement | null = null;
  private options: SimpleToolbarOptions;

  constructor(options: SimpleToolbarOptions) {
    super();
    this.viewer = options.viewer;
    this.container = options.container;
    this.options = {
      showSearch: true,
      showDownload: true,
      showPrint: true,
      showRotate: true,
      showZoom: true,
      ...options
    };
    
    this.init();
  }

  /**
   * 初始化工具栏
   */
  private init(): void {
    this.createToolbar();
    this.bindEvents();
    this.setupViewerListeners();
  }

  /**
   * 创建工具栏
   */
  private createToolbar(): void {
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'simple-pdf-toolbar';
    
    // 创建工具栏内容
    this.toolbar.innerHTML = `
      <div class="toolbar-group">
        <!-- 页面导航 -->
        <button class="toolbar-btn" id="prevPage" title="上一页">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <div class="page-controls">
          <input type="number" class="page-input" id="pageInput" min="1" value="1">
          <span class="page-separator">/</span>
          <span class="page-count" id="pageCount">1</span>
        </div>
        
        <button class="toolbar-btn" id="nextPage" title="下一页">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      <div class="toolbar-separator"></div>
      
      <!-- 视图模式切换 -->
      <div class="toolbar-group">
        <button class="toolbar-btn" id="togglePageMode" title="切换视图模式">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" id="pageModeIcon">
            <!-- 单页图标 -->
            <rect x="7" y="4" width="10" height="16" stroke="currentColor" stroke-width="2" rx="1"/>
          </svg>
        </button>
      </div>
      
      <div class="toolbar-separator"></div>
      
      ${this.options.showZoom ? `
      <div class="toolbar-group">
        <!-- 缩放控制 -->
        <button class="toolbar-btn" id="zoomOut" title="缩小">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M8 11h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <select class="zoom-select" id="zoomSelect">
          <option value="auto">自动</option>
          <option value="page">适应页面</option>
          <option value="width">适应宽度</option>
          <option value="50">50%</option>
          <option value="75">75%</option>
          <option value="100">100%</option>
          <option value="125">125%</option>
          <option value="150" selected>150%</option>
          <option value="200">200%</option>
          <option value="300">300%</option>
        </select>
        
        <button class="toolbar-btn" id="zoomIn" title="放大">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M11 8v6M8 11h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      ` : ''}
      
      ${this.options.showRotate ? `
      <div class="toolbar-separator"></div>
      
      <div class="toolbar-group">
        <!-- 旋转 -->
        <button class="toolbar-btn" id="rotateLeft" title="逆时针旋转">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 4V2L8 6l4 4V8c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" fill="currentColor"/>
          </svg>
        </button>
        
        <button class="toolbar-btn" id="rotateRight" title="顺时针旋转">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 4V2l4 4-4 4V8c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      ` : ''}
      
      <div class="toolbar-spacer"></div>
      
      <div class="toolbar-group">
        <!-- 功能按钮 -->
        ${this.options.showSearch ? `
        <button class="toolbar-btn" id="searchBtn" title="搜索">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        ` : ''}
        
        ${this.options.showPrint ? `
        <button class="toolbar-btn" id="printBtn" title="打印">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 9V2h12v7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <rect x="6" y="14" width="12" height="8" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        ` : ''}
        
        ${this.options.showDownload ? `
        <button class="toolbar-btn" id="downloadBtn" title="下载">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        ` : ''}
      </div>
    `;

    // 创建搜索框
    if (this.options.showSearch) {
      this.createSearchBox();
    }

    // 添加样式
    this.addStyles();

    // 添加到容器
    this.container.appendChild(this.toolbar);
  }

  /**
   * 创建搜索框
   */
  private createSearchBox(): void {
    this.searchBox = document.createElement('div');
    this.searchBox.className = 'pdf-search-box';
    this.searchBox.style.display = 'none';
    this.searchBox.innerHTML = `
      <input type="text" class="search-input" placeholder="输入搜索内容..." id="searchInput">
      <button class="search-btn" id="searchPrev" title="上一个">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
      <button class="search-btn" id="searchNext" title="下一个">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
      <span class="search-results" id="searchResults"></span>
      <button class="search-btn" id="searchClose" title="关闭">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    `;

    this.toolbar?.appendChild(this.searchBox);
  }

  /**
   * 添加样式
   */
  private addStyles(): void {
    const styleId = 'simple-toolbar-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .simple-pdf-toolbar {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        background: #ffffff;
        border-bottom: 1px solid #e0e0e0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        user-select: none;
        position: relative;
        min-height: 48px;
      }
      
      .toolbar-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .toolbar-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: 1px solid transparent;
        border-radius: 4px;
        background: transparent;
        cursor: pointer;
        transition: all 0.2s;
        color: #333;
      }
      
      .toolbar-btn:hover {
        background: #f0f0f0;
        border-color: #d0d0d0;
      }
      
      .toolbar-btn:active {
        background: #e0e0e0;
        transform: scale(0.95);
      }
      
      .toolbar-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .page-controls {
        display: flex;
        align-items: center;
        gap: 4px;
        margin: 0 8px;
      }
      
      .page-input {
        width: 50px;
        height: 32px;
        padding: 4px 8px;
        border: 1px solid #d0d0d0;
        border-radius: 4px;
        text-align: center;
        font-size: 14px;
      }
      
      .page-input:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
      }
      
      .page-separator {
        color: #999;
        font-size: 14px;
      }
      
      .page-count {
        color: #666;
        font-size: 14px;
        min-width: 30px;
      }
      
      .toolbar-separator {
        width: 1px;
        height: 24px;
        background: #e0e0e0;
        margin: 0 12px;
      }
      
      .toolbar-spacer {
        flex: 1;
      }
      
      .zoom-select {
        height: 32px;
        padding: 4px 8px;
        border: 1px solid #d0d0d0;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        background: white;
      }
      
      .zoom-select:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
      }
      
      /* 搜索框样式 */
      .pdf-search-box {
        position: absolute;
        top: 100%;
        right: 16px;
        margin-top: 8px;
        padding: 8px;
        background: white;
        border: 1px solid #d0d0d0;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 1000;
      }
      
      .search-input {
        width: 200px;
        height: 32px;
        padding: 4px 8px;
        border: 1px solid #d0d0d0;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .search-input:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
      }
      
      .search-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: 1px solid #d0d0d0;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .search-btn:hover {
        background: #f0f0f0;
      }
      
      .search-results {
        font-size: 12px;
        color: #666;
        white-space: nowrap;
      }
      
      @media (max-width: 768px) {
        .simple-pdf-toolbar {
          flex-wrap: wrap;
          padding: 8px;
        }
        
        .toolbar-separator {
          display: none;
        }
        
        .toolbar-spacer {
          display: none;
        }
        
        .pdf-search-box {
          position: fixed;
          top: 60px;
          right: 8px;
          left: 8px;
          width: auto;
        }
        
        .search-input {
          flex: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.toolbar) return;

    // 获取元素
    this.pageInput = this.toolbar.querySelector('#pageInput') as HTMLInputElement;
    this.pageCountSpan = this.toolbar.querySelector('#pageCount') as HTMLSpanElement;
    this.zoomSelect = this.toolbar.querySelector('#zoomSelect') as HTMLSelectElement;
    this.searchInput = this.toolbar.querySelector('#searchInput') as HTMLInputElement;

    // 页面导航
    this.toolbar.querySelector('#prevPage')?.addEventListener('click', () => {
      this.viewer.previousPage();
    });

    this.toolbar.querySelector('#nextPage')?.addEventListener('click', () => {
      this.viewer.nextPage();
    });

    // 页码输入
    this.pageInput?.addEventListener('change', (e) => {
      const pageNum = parseInt((e.target as HTMLInputElement).value);
      this.viewer.goToPage(pageNum);
    });

    this.pageInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const pageNum = parseInt((e.target as HTMLInputElement).value);
        this.viewer.goToPage(pageNum);
      }
    });

    // 缩放控制
    if (this.options.showZoom) {
      this.toolbar.querySelector('#zoomIn')?.addEventListener('click', () => {
        this.viewer.zoomIn();
      });

      this.toolbar.querySelector('#zoomOut')?.addEventListener('click', () => {
        this.viewer.zoomOut();
      });

      this.zoomSelect?.addEventListener('change', (e) => {
        const value = (e.target as HTMLSelectElement).value;
        switch (value) {
          case 'auto':
            this.viewer.resetZoom();
            break;
          case 'page':
            this.viewer.fitToPage();
            break;
          case 'width':
            this.viewer.fitToWidth();
            break;
          default:
            const scale = parseInt(value) / 100;
            this.viewer.setZoom(scale);
        }
      });
    }

    // 旋转
    if (this.options.showRotate) {
      this.toolbar.querySelector('#rotateLeft')?.addEventListener('click', () => {
        this.viewer.rotate(-90);
      });

      this.toolbar.querySelector('#rotateRight')?.addEventListener('click', () => {
        this.viewer.rotate(90);
      });
    }

    // 功能按钮
    if (this.options.showSearch) {
      this.toolbar.querySelector('#searchBtn')?.addEventListener('click', () => {
        this.toggleSearch();
      });

      this.toolbar.querySelector('#searchClose')?.addEventListener('click', () => {
        this.closeSearch();
      });

      this.searchInput?.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          this.performSearch();
        } else if (e.key === 'Escape') {
          this.closeSearch();
        }
      });

      this.toolbar.querySelector('#searchNext')?.addEventListener('click', () => {
        this.performSearch();
      });

      this.toolbar.querySelector('#searchPrev')?.addEventListener('click', () => {
        this.performSearch(true);
      });
    }

    if (this.options.showPrint) {
      this.toolbar.querySelector('#printBtn')?.addEventListener('click', () => {
        this.viewer.print();
      });
    }

    if (this.options.showDownload) {
      this.toolbar.querySelector('#downloadBtn')?.addEventListener('click', () => {
        this.viewer.download();
      });
    }
    
    // 页面模式切换
    const togglePageModeBtn = this.toolbar.querySelector('#togglePageMode');
    const pageModeIcon = this.toolbar.querySelector('#pageModeIcon');
    
    if (togglePageModeBtn && pageModeIcon) {
      togglePageModeBtn.addEventListener('click', () => {
        const currentMode = this.viewer.getPageMode();
        const newMode = currentMode === 'single' ? 'continuous' : 'single';
        this.viewer.setPageMode(newMode);
        
        // 更新图标和提示
        if (newMode === 'continuous') {
          (togglePageModeBtn as HTMLButtonElement).title = '切换到单页视图';
          pageModeIcon.innerHTML = `
            <!-- 连续页面图标 -->
            <rect x="7" y="2" width="10" height="7" stroke="currentColor" stroke-width="1.5" rx="1"/>
            <rect x="7" y="11" width="10" height="7" stroke="currentColor" stroke-width="1.5" rx="1"/>
            <rect x="7" y="20" width="10" height="2" stroke="currentColor" stroke-width="1.5" rx="1"/>
          `;
        } else {
          (togglePageModeBtn as HTMLButtonElement).title = '切换到连续视图';
          pageModeIcon.innerHTML = `
            <!-- 单页图标 -->
            <rect x="7" y="4" width="10" height="16" stroke="currentColor" stroke-width="2" rx="1"/>
          `;
        }
      });
    }
  }

  /**
   * 设置查看器监听器
   */
  private setupViewerListeners(): void {
    // 文档加载
    this.viewer.on('document-loaded', (data: any) => {
      if (this.pageCountSpan) {
        this.pageCountSpan.textContent = data.numPages.toString();
      }
      if (this.pageInput) {
        this.pageInput.max = data.numPages.toString();
      }
    });

    // 页面改变 - 同时监听两种事件名以确保兼容性
    const updatePageNumber = (pageNum: number) => {
      if (this.pageInput) {
        this.pageInput.value = pageNum.toString();
      }
    };
    
    this.viewer.on('page-change', updatePageNumber);
    this.viewer.on('page-changed', updatePageNumber);
    this.viewer.on('page-rendered', (data: any) => {
      if (this.pageInput && data.pageNumber) {
        this.pageInput.value = data.pageNumber.toString();
      }
    });

    // 缩放改变
    this.viewer.on('zoom-changed', (scale: number) => {
      if (this.zoomSelect) {
        const percentage = Math.round(scale * 100);
        const option = this.zoomSelect.querySelector(`option[value="${percentage}"]`);
        if (option) {
          this.zoomSelect.value = percentage.toString();
        } else {
          this.zoomSelect.value = 'auto';
        }
      }
    });
  }

  /**
   * 切换搜索框
   */
  private toggleSearch(): void {
    if (!this.searchBox) return;

    if (this.searchBox.style.display === 'none') {
      this.searchBox.style.display = 'flex';
      this.searchInput?.focus();
    } else {
      this.closeSearch();
    }
  }

  /**
   * 关闭搜索框
   */
  private closeSearch(): void {
    if (!this.searchBox) return;
    
    this.searchBox.style.display = 'none';
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    
    const resultsSpan = this.toolbar?.querySelector('#searchResults') as HTMLElement;
    if (resultsSpan) {
      resultsSpan.textContent = '';
    }
  }

  /**
   * 执行搜索
   */
  private async performSearch(backward: boolean = false): Promise<void> {
    if (!this.searchInput) return;
    
    const query = this.searchInput.value.trim();
    if (!query) return;

    const results = await this.viewer.searchText(query);
    
    const resultsSpan = this.toolbar?.querySelector('#searchResults') as HTMLElement;
    if (resultsSpan) {
      if (results.length > 0) {
        resultsSpan.textContent = `找到 ${results.length} 个结果`;
        // 跳转到第一个结果
        if (results[0]) {
          this.viewer.goToPage(results[0].pageNumber);
        }
      } else {
        resultsSpan.textContent = '未找到结果';
      }
    }
  }

  /**
   * 更新工具栏状态
   */
  updateState(): void {
    const state = this.viewer.getState();
    
    if (this.pageInput) {
      this.pageInput.value = state.currentPage.toString();
    }
    
    if (this.pageCountSpan) {
      this.pageCountSpan.textContent = state.totalPages.toString();
    }

    // 禁用/启用导航按钮
    const prevBtn = this.toolbar?.querySelector('#prevPage') as HTMLButtonElement;
    const nextBtn = this.toolbar?.querySelector('#nextPage') as HTMLButtonElement;
    
    if (prevBtn) {
      prevBtn.disabled = state.currentPage <= 1;
    }
    
    if (nextBtn) {
      nextBtn.disabled = state.currentPage >= state.totalPages;
    }
  }

  /**
   * 销毁工具栏
   */
  destroy(): void {
    if (this.toolbar) {
      this.toolbar.remove();
      this.toolbar = null;
    }
    
    this.pageInput = null;
    this.pageCountSpan = null;
    this.zoomSelect = null;
    this.searchInput = null;
    this.searchBox = null;
    
    this.removeAllListeners();
  }
}