/**
 * Excel Viewer Lit Web Component
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ExcelViewer as CoreViewer } from '@ldesign/excel-viewer-core';
import type {
  ExcelViewerOptions,
  SheetData,
  ExportOptions,
  SearchOptions,
  SearchResult,
  SelectionRange,
} from '@ldesign/excel-viewer-core';

/**
 * Excel Viewer Web Component
 * 
 * @element excel-viewer
 * 
 * @fires load - 文件加载完成事件
 * @fires load-error - 文件加载错误事件
 * @fires cell-change - 单元格变化事件
 * @fires cell-click - 单元格点击事件
 * @fires cell-double-click - 单元格双击事件
 * @fires selection-change - 选择区域变化事件
 * @fires sheet-change - 工作表切换事件
 * @fires error - 错误事件
 * 
 * @example
 * ```html
 * <excel-viewer
 *   file-url="./sample.xlsx"
 *   show-toolbar="true"
 *   allow-edit="true"
 *   lang="zh"
 *   height="600px"
 * ></excel-viewer>
 * ```
 */
@customElement('excel-viewer')
export class ExcelViewerElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 600px;
    }

    .excel-viewer-container {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }

    :host([theme="dark"]) .excel-viewer-container {
      background-color: #1e1e1e;
      color: #ffffff;
    }
  `;

  @query('.excel-viewer-container')
  private container!: HTMLDivElement;

  private viewer: CoreViewer | null = null;

  /** 文件 URL */
  @property({ type: String, attribute: 'file-url' })
  fileUrl?: string;

  /** 是否显示工具栏 */
  @property({ type: Boolean, attribute: 'show-toolbar' })
  showToolbar = true;

  /** 是否显示公式栏 */
  @property({ type: Boolean, attribute: 'show-formula-bar' })
  showFormulaBar = true;

  /** 是否显示表格标签 */
  @property({ type: Boolean, attribute: 'show-sheet-tabs' })
  showSheetTabs = true;

  /** 是否允许编辑 */
  @property({ type: Boolean, attribute: 'allow-edit' })
  allowEdit = true;

  /** 是否允许复制 */
  @property({ type: Boolean, attribute: 'allow-copy' })
  allowCopy = true;

  /** 是否允许粘贴 */
  @property({ type: Boolean, attribute: 'allow-paste' })
  allowPaste = true;

  /** 语言 */
  @property({ type: String })
  lang: 'zh' | 'en' = 'zh';

  /** 主题 */
  @property({ type: String, reflect: true })
  theme: 'light' | 'dark' = 'light';

  /** 容器高度 */
  @property({ type: String })
  height = '600px';

  /** 容器宽度 */
  @property({ type: String })
  width = '100%';

  render() {
    return html`
      <div
        class="excel-viewer-container"
        style="height: ${this.height}; width: ${this.width};"
      ></div>
    `;
  }

  firstUpdated() {
    this.initViewer();
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // 如果 fileUrl 改变，重新加载文件
    if (changedProperties.has('fileUrl') && this.fileUrl && this.viewer) {
      this.loadFile(this.fileUrl);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.destroyViewer();
  }

  /**
   * 初始化查看器
   */
  private initViewer() {
    if (!this.container) return;

    const options: ExcelViewerOptions = {
      container: this.container,
      showToolbar: this.showToolbar,
      showFormulaBar: this.showFormulaBar,
      showSheetTabs: this.showSheetTabs,
      allowEdit: this.allowEdit,
      allowCopy: this.allowCopy,
      allowPaste: this.allowPaste,
      lang: this.lang,
      theme: this.theme,
      hooks: {
        afterLoad: (data) => {
          this.dispatchEvent(
            new CustomEvent('load', {
              detail: { status: 'success', sheets: data },
              bubbles: true,
              composed: true,
            })
          );
        },
        onCellClick: (sheetIndex, row, col, value) => {
          this.dispatchEvent(
            new CustomEvent('cell-click', {
              detail: { sheetIndex, row, col, value },
              bubbles: true,
              composed: true,
            })
          );
        },
        onCellDoubleClick: (sheetIndex, row, col, value) => {
          this.dispatchEvent(
            new CustomEvent('cell-double-click', {
              detail: { sheetIndex, row, col, value },
              bubbles: true,
              composed: true,
            })
          );
        },
        onSelectionChange: (range) => {
          this.dispatchEvent(
            new CustomEvent('selection-change', {
              detail: range,
              bubbles: true,
              composed: true,
            })
          );
        },
        onError: (error) => {
          this.dispatchEvent(
            new CustomEvent('error', {
              detail: error,
              bubbles: true,
              composed: true,
            })
          );
        },
      },
    };

    this.viewer = new CoreViewer(options);

    // 绑定事件
    this.viewer.on('load', (data) => {
      this.dispatchEvent(
        new CustomEvent('load', {
          detail: data,
          bubbles: true,
          composed: true,
        })
      );
    });

    this.viewer.on('loadError', (data) => {
      this.dispatchEvent(
        new CustomEvent('load-error', {
          detail: data.error,
          bubbles: true,
          composed: true,
        })
      );
    });

    this.viewer.on('cellChange', (data) => {
      this.dispatchEvent(
        new CustomEvent('cell-change', {
          detail: data,
          bubbles: true,
          composed: true,
        })
      );
    });

    this.viewer.on('sheetChange', (data) => {
      this.dispatchEvent(
        new CustomEvent('sheet-change', {
          detail: data,
          bubbles: true,
          composed: true,
        })
      );
    });

    // 如果有初始文件 URL，加载它
    if (this.fileUrl) {
      this.loadFile(this.fileUrl);
    }
  }

  /**
   * 加载文件
   */
  async loadFile(file: File | ArrayBuffer | string): Promise<void> {
    if (!this.viewer) {
      throw new Error('Viewer not initialized');
    }
    await this.viewer.loadFile(file);
  }

  /**
   * 获取数据
   */
  getData(): SheetData[] {
    return this.viewer?.getData() || [];
  }

  /**
   * 导出文件
   */
  exportFile(options: ExportOptions): Blob | null {
    return this.viewer?.exportFile(options) || null;
  }

  /**
   * 下载文件
   */
  downloadFile(options: ExportOptions): void {
    this.viewer?.downloadFile(options);
  }

  /**
   * 搜索
   */
  search(options: SearchOptions): SearchResult[] {
    return this.viewer?.search(options) || [];
  }

  /**
   * 获取选中区域
   */
  getSelection(): SelectionRange | null {
    return this.viewer?.getSelection() || null;
  }

  /**
   * 设置单元格值
   */
  setCellValue(row: number, col: number, value: any): void {
    this.viewer?.setCellValue(row, col, value);
  }

  /**
   * 获取单元格值
   */
  getCellValue(row: number, col: number): any {
    return this.viewer?.getCellValue(row, col);
  }

  /**
   * 切换工作表
   */
  setActiveSheet(index: number): void {
    this.viewer?.setActiveSheet(index);
  }

  /**
   * 撤销
   */
  undo(): void {
    this.viewer?.undo();
  }

  /**
   * 重做
   */
  redo(): void {
    this.viewer?.redo();
  }

  /**
   * 刷新
   */
  refresh(): void {
    this.viewer?.refresh();
  }

  /**
   * 销毁查看器
   */
  private destroyViewer(): void {
    if (this.viewer) {
      this.viewer.destroy();
      this.viewer = null;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'excel-viewer': ExcelViewerElement;
  }
}


