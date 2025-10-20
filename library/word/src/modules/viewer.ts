/**
 * 文档查看模块
 */

import { SearchResult, PageInfo } from '../core/types';
import { createElement, clearElement } from '../utils/dom';
import { ZOOM_RANGE } from '../core/constants';
import type { WordViewer } from '../core/WordViewer';

export class ViewerModule {
  private viewer: WordViewer;
  private container: HTMLElement | null = null;
  private contentElement: HTMLElement | null = null;
  private currentZoom: number = 1.0;
  private currentPage: number = 1;
  private totalPages: number = 1;
  private renderedContent: HTMLElement | null = null;

  constructor(viewer: WordViewer) {
    this.viewer = viewer;
    this.initialize();
  }

  /**
   * 初始化查看器
   */
  private initialize(): void {
    const viewerContainer = this.viewer.getContainer();
    
    // 创建内容容器
    this.container = createElement('div', {
      className: 'viewer-container',
    });

    this.contentElement = createElement('div', {
      className: 'viewer-content',
    });

    this.container.appendChild(this.contentElement);
    viewerContainer.appendChild(this.container);

    // 应用初始缩放
    const options = this.viewer.getOptions();
    this.currentZoom = options.initialZoom;
    this.applyZoom();
  }

  /**
   * 渲染文档
   */
  async render(buffer: ArrayBuffer): Promise<void> {
    if (!this.contentElement) {
      throw new Error('内容元素未初始化');
    }

    try {
      // 清空现有内容
      clearElement(this.contentElement);

      const options = this.viewer.getOptions();
      
      // 根据渲染引擎选择不同的渲染方式
      if (options.renderEngine === 'docx-preview' || options.renderEngine === 'auto') {
        await this.renderWithDocxPreview(buffer);
      } else if (options.renderEngine === 'mammoth') {
        await this.renderWithMammoth(buffer);
      }

      // 更新页面信息
      this.updatePageInfo();
    } catch (error) {
      console.error('渲染文档失败:', error);
      this.renderError(error instanceof Error ? error.message : '渲染失败');
      throw error;
    }
  }

  /**
   * 使用 docx-preview 渲染
   */
  private async renderWithDocxPreview(buffer: ArrayBuffer): Promise<void> {
    try {
      // 动态导入 docx-preview
      const { renderAsync } = await import('docx-preview');
      
      if (!this.contentElement) return;

      await renderAsync(buffer, this.contentElement, undefined, {
        className: 'docx-preview-content',
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        ignoreLastRenderedPageBreak: true,
        experimental: true,
        trimXmlDeclaration: true,
        useBase64URL: false,
        useMathMLPolyfill: false,
        renderHeaders: true,
        renderFooters: true,
        renderFootnotes: true,
        renderEndnotes: true,
      });

      this.renderedContent = this.contentElement.firstElementChild as HTMLElement;
    } catch (error) {
      console.error('docx-preview 渲染失败:', error);
      // 降级到 mammoth
      await this.renderWithMammoth(buffer);
    }
  }

  /**
   * 使用 mammoth 渲染
   */
  private async renderWithMammoth(buffer: ArrayBuffer): Promise<void> {
    try {
      // 动态导入 mammoth
      const mammoth = await import('mammoth');
      
      if (!this.contentElement) return;

      const result = await mammoth.convertToHtml(
        { arrayBuffer: buffer },
        {
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Title'] => h1.title:fresh",
          ],
        }
      );

      const contentWrapper = createElement('div', {
        className: 'mammoth-content',
      });
      contentWrapper.innerHTML = result.value;

      this.contentElement.appendChild(contentWrapper);
      this.renderedContent = contentWrapper;

      // 显示警告（如果有）
      if (result.messages.length > 0) {
        console.warn('Mammoth 转换警告:', result.messages);
      }
    } catch (error) {
      console.error('Mammoth 渲染失败:', error);
      throw error;
    }
  }

  /**
   * 渲染错误信息
   */
  private renderError(message: string): void {
    if (!this.contentElement) return;

    const errorElement = createElement('div', {
      className: 'error-message',
      children: [
        createElement('h3', { children: ['加载失败'] }),
        createElement('p', { children: [message] }),
      ],
    });

    clearElement(this.contentElement);
    this.contentElement.appendChild(errorElement);
  }

  /**
   * 设置缩放级别
   */
  setZoom(level: number): void {
    this.currentZoom = Math.max(
      ZOOM_RANGE.MIN,
      Math.min(ZOOM_RANGE.MAX, level)
    );
    this.applyZoom();
  }

  /**
   * 获取当前缩放级别
   */
  getZoom(): number {
    return this.currentZoom;
  }

  /**
   * 应用缩放
   */
  private applyZoom(): void {
    if (this.contentElement) {
      this.contentElement.style.transform = `scale(${this.currentZoom})`;
      this.contentElement.style.transformOrigin = 'top left';
    }
  }

  /**
   * 跳转到指定页
   */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      console.warn(`页码超出范围: ${page}`);
      return;
    }

    this.currentPage = page;

    // 查找对应页面元素并滚动到该位置
    if (this.contentElement) {
      const pages = this.contentElement.querySelectorAll('.docx-wrapper section');
      if (pages.length > 0 && pages[page - 1]) {
        pages[page - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  /**
   * 获取页面信息
   */
  getPageInfo(): PageInfo {
    return {
      current: this.currentPage,
      total: this.totalPages,
    };
  }

  /**
   * 更新页面信息
   */
  private updatePageInfo(): void {
    if (!this.contentElement) return;

    // 尝试计算页数
    const pages = this.contentElement.querySelectorAll('.docx-wrapper section');
    this.totalPages = pages.length || 1;
  }

  /**
   * 搜索文本
   */
  search(keyword: string): SearchResult[] {
    const results: SearchResult[] = [];

    if (!this.contentElement || !keyword) {
      return results;
    }

    const text = this.contentElement.textContent || '';
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();

    let index = 0;
    let position = lowerText.indexOf(lowerKeyword, index);

    while (position !== -1) {
      // 获取上下文
      const contextStart = Math.max(0, position - 50);
      const contextEnd = Math.min(text.length, position + keyword.length + 50);
      const context = text.substring(contextStart, contextEnd);

      results.push({
        pageNumber: this.currentPage, // 简化处理，实际应该计算真实页码
        position,
        text: keyword,
        context: `...${context}...`,
      });

      index = position + keyword.length;
      position = lowerText.indexOf(lowerKeyword, index);
    }

    return results;
  }

  /**
   * 高亮搜索结果
   */
  highlightSearch(keyword: string): void {
    if (!this.contentElement || !keyword) return;

    // 移除之前的高亮
    this.clearHighlight();

    // 添加新的高亮
    const walker = document.createTreeWalker(
      this.contentElement,
      NodeFilter.SHOW_TEXT,
      null
    );

    const nodesToReplace: { node: Node; parent: Node }[] = [];
    let node: Node | null;

    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.toLowerCase().includes(keyword.toLowerCase())) {
        nodesToReplace.push({ node, parent: node.parentNode! });
      }
    }

    nodesToReplace.forEach(({ node, parent }) => {
      const text = node.textContent!;
      const regex = new RegExp(`(${keyword})`, 'gi');
      const html = text.replace(regex, '<mark class="word-viewer-highlight">$1</mark>');
      
      const span = document.createElement('span');
      span.innerHTML = html;
      parent.replaceChild(span, node);
    });
  }

  /**
   * 清除高亮
   */
  clearHighlight(): void {
    if (!this.contentElement) return;

    const highlights = this.contentElement.querySelectorAll('.word-viewer-highlight');
    highlights.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
      }
    });
  }

  /**
   * 销毁查看器
   */
  destroy(): void {
    this.clearHighlight();
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.contentElement = null;
    this.renderedContent = null;
  }
}



