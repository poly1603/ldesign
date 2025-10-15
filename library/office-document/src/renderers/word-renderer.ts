import { renderAsync } from 'docx-preview';
import type { IDocumentRenderer, DocumentMetadata, ViewerOptions } from '../types';

/**
 * Word Document Renderer
 * Uses docx-preview for high-fidelity rendering with styles and formatting
 */
export class WordRenderer implements IDocumentRenderer {
 private container: HTMLElement | null = null;
 private contentElement: HTMLElement | null = null;
 private currentData: ArrayBuffer | null = null;
 private options: ViewerOptions | null = null;

 /**
  * Render Word document
  */
 async render(container: HTMLElement, data: ArrayBuffer, options: ViewerOptions): Promise<void> {
  this.container = container;
  this.currentData = data;
  this.options = options;

  try {
   // Clear container
   container.innerHTML = '';

   // Create content wrapper
   const wrapper = document.createElement('div');
   wrapper.className = 'word-viewer-wrapper';

   // Create content area
   this.contentElement = document.createElement('div');
   this.contentElement.className = 'word-viewer-content docx-preview-container';

   // Render DOCX using docx-preview with high-fidelity styling
   await renderAsync(data, this.contentElement, undefined, {
    className: 'docx-content',
    inWrapper: true,
    ignoreWidth: false,
    ignoreHeight: false,
    ignoreFonts: false,
    breakPages: options.word?.pageView === 'single',
    ignoreLastRenderedPageBreak: false,
    experimental: false,
    trimXmlDeclaration: true,
    debug: false,
    renderHeaders: true,
    renderFooters: true,
    renderFootnotes: true,
    renderEndnotes: true,
    renderComments: false
   });

   // Add page view mode
   if (options.word?.pageView === 'single') {
    this.contentElement.classList.add('page-view-single');
   } else {
    this.contentElement.classList.add('page-view-continuous');
   }

   wrapper.appendChild(this.contentElement);
   container.appendChild(wrapper);

   // Call onLoad callback
   options.onLoad?.();
  } catch (error) {
   const err = error instanceof Error ? error : new Error('Failed to render Word document');
   options.onError?.(err);
   throw err;
  }
 }

 /**
  * Get document metadata
  */
 async getMetadata(data: ArrayBuffer): Promise<DocumentMetadata> {
  try {
   // Extract text content for word count
   const JSZip = (await import('jszip')).default;
   const zip = await JSZip.loadAsync(data);
   
   // Try to read document.xml for content
   const docXml = await zip.file('word/document.xml')?.async('string');
   
   if (docXml) {
    // Simple text extraction from XML
    const textMatches = docXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    const text = textMatches.map(match => match.replace(/<\/?w:t[^>]*>/g, '')).join(' ');
    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const pageCount = Math.ceil(wordCount / 250);

    return {
     wordCount,
     pageCount,
     title: 'Word Document'
    };
   }

   return {
    title: 'Word Document'
   };
  } catch (error) {
   console.error('Failed to extract metadata:', error);
   return {
    title: 'Word Document'
   };
  }
 }

 /**
  * Export document to different formats
  */
 async export(format: 'pdf' | 'html' | 'text'): Promise<Blob> {
  if (!this.currentData || !this.contentElement) {
   throw new Error('No document loaded');
  }

  switch (format) {
   case 'html':
    const htmlContent = this.contentElement.innerHTML;
    return new Blob([htmlContent], { type: 'text/html' });

   case 'text':
    const textContent = this.contentElement.textContent || '';
    return new Blob([textContent], { type: 'text/plain' });

   case 'pdf':
    throw new Error('PDF export not yet implemented. Please use browser print to PDF feature.');

   default:
    throw new Error(`Unsupported export format: ${format}`);
  }
 }

 /**
  * Destroy renderer and clean up
  */
 destroy(): void {
  if (this.container) {
   this.container.innerHTML = '';
  }
  this.container = null;
  this.contentElement = null;
  this.currentData = null;
  this.options = null;
 }
}
