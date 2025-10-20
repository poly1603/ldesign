/**
 * Lit Web Component for Word Viewer
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { WordViewer } from '../../core/WordViewer';
import type { ViewerOptions, DocumentSource } from '../../core/types';

@customElement('word-viewer')
export class WordViewerElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 400px;
    }

    .container {
      width: 100%;
      height: 100%;
    }
  `;

  @property({ type: String })
  src?: string;

  @property({ type: Number })
  zoom: number = 1.0;

  @property({ type: Boolean })
  editable: boolean = false;

  @property({ type: String })
  theme: 'light' | 'dark' | 'auto' = 'light';

  @property({ type: Boolean })
  readonly: boolean = false;

  @query('.container')
  private container!: HTMLDivElement;

  private viewer: WordViewer | null = null;
  private _source: DocumentSource | null = null;

  /**
   * 设置文档源
   */
  set source(value: DocumentSource | null) {
    this._source = value;
    if (this.viewer && value) {
      this.loadDocument(value);
    }
  }

  get source(): DocumentSource | null {
    return this._source;
  }

  firstUpdated() {
    this.initViewer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.viewer) {
      this.viewer.destroy();
      this.viewer = null;
    }
  }

  /**
   * 初始化查看器
   */
  private initViewer() {
    if (!this.container) return;

    const options: ViewerOptions = {
      editable: this.editable,
      theme: this.theme,
      initialZoom: this.zoom,
      readOnly: this.readonly,
    };

    this.viewer = new WordViewer(this.container, options);

    // 绑定事件并分发自定义事件
    this.viewer.on('loaded', (data) => {
      this.dispatchEvent(
        new CustomEvent('loaded', { detail: data, bubbles: true, composed: true })
      );
    });

    this.viewer.on('error', (error) => {
      this.dispatchEvent(
        new CustomEvent('error', { detail: error, bubbles: true, composed: true })
      );
    });

    this.viewer.on('changed', () => {
      this.dispatchEvent(
        new CustomEvent('changed', { bubbles: true, composed: true })
      );
    });

    this.viewer.on('zoom', (level) => {
      this.dispatchEvent(
        new CustomEvent('zoom', { detail: level, bubbles: true, composed: true })
      );
    });

    this.viewer.on('page-change', (pageInfo) => {
      this.dispatchEvent(
        new CustomEvent('page-change', {
          detail: pageInfo,
          bubbles: true,
          composed: true,
        })
      );
    });

    // 加载初始文档
    if (this.src) {
      this.viewer.loadUrl(this.src);
    } else if (this._source) {
      this.loadDocument(this._source);
    }
  }

  /**
   * 加载文档
   */
  async loadDocument(source: DocumentSource) {
    if (!this.viewer) return;

    try {
      if (source instanceof File) {
        await this.viewer.loadFile(source);
      } else if (source instanceof Blob) {
        const buffer = await source.arrayBuffer();
        await this.viewer.loadBuffer(buffer);
      } else if (source instanceof ArrayBuffer) {
        await this.viewer.loadBuffer(source);
      } else if (typeof source === 'string') {
        await this.viewer.loadUrl(source);
      }
    } catch (error) {
      console.error('加载文档失败:', error);
    }
  }

  /**
   * 获取查看器实例
   */
  getViewer(): WordViewer | null {
    return this.viewer;
  }

  /**
   * 设置缩放
   */
  setZoom(level: number) {
    if (this.viewer) {
      this.viewer.setZoom(level);
      this.zoom = level;
    }
  }

  /**
   * 启用编辑
   */
  enableEdit() {
    if (this.viewer) {
      this.viewer.enableEdit();
      this.editable = true;
    }
  }

  /**
   * 禁用编辑
   */
  disableEdit() {
    if (this.viewer) {
      this.viewer.disableEdit();
      this.editable = false;
    }
  }

  /**
   * 导出为 PDF
   */
  async exportToPDF(): Promise<Blob | null> {
    if (this.viewer) {
      return await this.viewer.exportToPDF();
    }
    return null;
  }

  /**
   * 导出为 HTML
   */
  exportToHTML(): string | null {
    if (this.viewer) {
      return this.viewer.exportToHTML();
    }
    return null;
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    if (!this.viewer) return;

    if (changedProperties.has('src') && this.src) {
      this.viewer.loadUrl(this.src);
    }

    if (changedProperties.has('zoom')) {
      this.viewer.setZoom(this.zoom);
    }

    if (changedProperties.has('editable')) {
      if (this.editable) {
        this.viewer.enableEdit();
      } else {
        this.viewer.disableEdit();
      }
    }

    if (changedProperties.has('theme')) {
      this.viewer.updateOptions({ theme: this.theme });
    }
  }

  render() {
    return html`<div class="container"></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'word-viewer': WordViewerElement;
  }
}



