import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

export class EnhancedPDFViewer {
  private container: HTMLElement;
  private pdfDoc: any;
  private currentPage: number = 1;
  private scale: number = 1.5;
  
  constructor(container: HTMLElement) {
    this.container = container;
    // 配置 worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  async loadPDF(url: string) {
    try {
      // 加载PDF文档
      this.pdfDoc = await pdfjsLib.getDocument(url).promise;
      await this.renderPage(this.currentPage);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  }

  async renderPage(pageNum: number) {
    const page = await this.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: this.scale });

    // 清空容器
    this.container.innerHTML = '';

    // 创建画布容器
    const pageContainer = document.createElement('div');
    pageContainer.className = 'pdf-page-container';
    pageContainer.style.position = 'relative';
    pageContainer.style.width = `${viewport.width}px`;
    pageContainer.style.height = `${viewport.height}px`;
    this.container.appendChild(pageContainer);

    // 渲染Canvas层（显示PDF内容）
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    pageContainer.appendChild(canvas);

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    // 创建文本层（支持选择和复制）
    const textLayerDiv = document.createElement('div');
    textLayerDiv.className = 'textLayer';
    textLayerDiv.style.position = 'absolute';
    textLayerDiv.style.left = '0';
    textLayerDiv.style.top = '0';
    textLayerDiv.style.right = '0';
    textLayerDiv.style.bottom = '0';
    textLayerDiv.style.overflow = 'hidden';
    textLayerDiv.style.lineHeight = '1';
    pageContainer.appendChild(textLayerDiv);

    // 获取文本内容
    const textContent = await page.getTextContent();
    
    // 渲染文本层
    pdfjsLib.renderTextLayer({
      textContent: textContent,
      container: textLayerDiv,
      viewport: viewport,
      textDivs: []
    });
  }

  // 页面导航方法
  async nextPage() {
    if (this.currentPage < this.pdfDoc.numPages) {
      this.currentPage++;
      await this.renderPage(this.currentPage);
    }
  }

  async prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      await this.renderPage(this.currentPage);
    }
  }

  // 缩放方法
  async zoomIn() {
    this.scale += 0.2;
    await this.renderPage(this.currentPage);
  }

  async zoomOut() {
    if (this.scale > 0.5) {
      this.scale -= 0.2;
      await this.renderPage(this.currentPage);
    }
  }
}