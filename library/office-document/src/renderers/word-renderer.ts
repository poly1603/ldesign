import mammoth from 'mammoth';
import type { IDocumentRenderer, DocumentMetadata, ViewerOptions } from '../types';

/**
 * Word Document Renderer
 * Uses mammoth.js to convert DOCX files to HTML
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
   this.contentElement.className = 'word-viewer-content';

   // Convert DOCX to HTML using mammoth
   const result = await mammoth.convertToHtml(
    { arrayBuffer: data },
    {
     styleMap: [
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Heading 4'] => h4:fresh",
      "p[style-name='Heading 5'] => h5:fresh",
      "p[style-name='Heading 6'] => h6:fresh",
      "p[style-name='Code'] => pre:fresh",
      "p[style-name='Quote'] => blockquote:fresh"
     ],
     convertImage: mammoth.images.imgElement((image) => {
      return image.read('base64').then((imageBuffer) => {
       return {
        src: `data:${image.contentType};base64,${imageBuffer}`
       };
      });
     })
    }
   );

   // Set HTML content
   this.contentElement.innerHTML = result.value;

   // Add page view mode
   if (options.word?.pageView === 'single') {
    this.contentElement.classList.add('page-view-single');
   } else {
    this.contentElement.classList.add('page-view-continuous');
   }

   // Show warnings if any
   if (result.messages && result.messages.length > 0) {
    console.warn('Word rendering warnings:', result.messages);
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
   // Extract raw text to count words
   const result = await mammoth.extractRawText({ arrayBuffer: data });
   const text = result.value;

   // Count words (simple word count by splitting on whitespace)
   const wordCount = text.trim().split(/\s+/).length;

   // Count pages (estimate based on word count, ~250 words per page)
   const pageCount = Math.ceil(wordCount / 250);

   return {
    wordCount,
    pageCount,
    title: 'Word Document',
    // Note: mammoth.js doesn't provide built-in metadata extraction
    // For more detailed metadata, you would need to parse the DOCX XML directly
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
  if (!this.currentData) {
   throw new Error('No document loaded');
  }

  switch (format) {
   case 'html':
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer: this.currentData });
    return new Blob([htmlResult.value], { type: 'text/html' });

   case 'text':
    const textResult = await mammoth.extractRawText({ arrayBuffer: this.currentData });
    return new Blob([textResult.value], { type: 'text/plain' });

   case 'pdf':
    // PDF export would require additional libraries like jsPDF
    // For now, we convert to HTML and let the browser print to PDF
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
