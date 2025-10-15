import JSZip from 'jszip';
import type { IDocumentRenderer, DocumentMetadata, ViewerOptions } from '../types';

/**
 * PowerPoint Document Renderer
 * Uses JSZip to parse PPTX files and render slides
 */
export class PowerPointRenderer implements IDocumentRenderer {
 private container: HTMLElement | null = null;
 private currentSlide: number = 0;
 private slideCount: number = 0;
 private currentData: ArrayBuffer | null = null;
 private options: ViewerOptions | null = null;
 private slideContainer: HTMLElement | null = null;
 private thumbnailsContainer: HTMLElement | null = null;
 private autoPlayInterval: number | null = null;
 private pptxContainer: HTMLElement | null = null;

 /**
  * Render PowerPoint document
  */
 async render(container: HTMLElement, data: ArrayBuffer, options: ViewerOptions): Promise<void> {
  this.container = container;
  this.currentData = data;
  this.options = options;

  try {
   // Clear container
   container.innerHTML = '';

   // Create wrapper
   const wrapper = document.createElement('div');
   wrapper.className = 'powerpoint-viewer-wrapper';
   wrapper.style.width = '100%';
   wrapper.style.height = '100%';
   wrapper.style.position = 'relative';

   // Create content container for pptxjs
   this.pptxContainer = document.createElement('div');
   this.pptxContainer.className = 'pptxjs-container';
   this.pptxContainer.style.width = '100%';
   this.pptxContainer.style.height = '100%';
   this.pptxContainer.style.overflow = 'auto';

   wrapper.appendChild(this.pptxContainer);
   container.appendChild(wrapper);

   // Parse PPTX using JSZip
   const zip = await JSZip.loadAsync(data);
   
   // Get all slide files
   const slideFiles = Object.keys(zip.files)
    .filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
    .sort((a, b) => {
     const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
     const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
     return numA - numB;
    });

   this.slideCount = slideFiles.length;

   // Render slides
   await this.renderSlides(zip, slideFiles);

   // Get slide elements
   const slides = this.pptxContainer.querySelectorAll('.slide');

   // Add navigation controls if enabled
   if (options.powerpoint?.showNavigation !== false && this.slideCount > 0) {
    this.addNavigationControls(wrapper);
   }

   // Setup auto-play if enabled
   if (options.powerpoint?.autoPlay && this.slideCount > 1) {
    this.startAutoPlay(options.powerpoint.autoPlayInterval || 3000);
   }

   // Call onLoad callback
   options.onLoad?.();
  } catch (error) {
   const err = error instanceof Error ? error : new Error('Failed to render PowerPoint document');
   options.onError?.(err);
   throw err;
  }
 }

 /**
  * Render slides from PPTX
  */
 private async renderSlides(zip: JSZip, slideFiles: string[]): Promise<void> {
  if (!this.pptxContainer) return;

  for (let i = 0; i < slideFiles.length; i++) {
   const slideFile = slideFiles[i];
   const slideXml = await zip.file(slideFile)?.async('text');
   
   if (!slideXml) continue;

   // Create slide element
   const slideDiv = document.createElement('div');
   slideDiv.className = 'slide';
   slideDiv.style.cssText = `
    width: 100%;
    max-width: 960px;
    margin: 20px auto;
    aspect-ratio: 16/9;
    background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 40px;
    box-sizing: border-box;
    position: relative;
   `;

   // Extract text content from XML
   const parser = new DOMParser();
   const xmlDoc = parser.parseFromString(slideXml, 'text/xml');
   const textElements = xmlDoc.getElementsByTagName('a:t');
   
   const slideContent = document.createElement('div');
   slideContent.style.cssText = `
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-size: 18px;
    color: #333;
   `;

   // Add slide number
   const slideNumber = document.createElement('div');
   slideNumber.className = 'slide-number';
   slideNumber.textContent = `Slide ${i + 1}`;
   slideNumber.style.cssText = `
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-size: 12px;
    color: #999;
   `;
   slideDiv.appendChild(slideNumber);

   // Extract and render text
   const texts: string[] = [];
   for (let j = 0; j < textElements.length; j++) {
    const textContent = textElements[j].textContent;
    if (textContent && textContent.trim()) {
     texts.push(textContent.trim());
    }
   }

   if (texts.length > 0) {
    // First text as title
    if (texts[0]) {
     const title = document.createElement('h2');
     title.textContent = texts[0];
     title.style.cssText = `
      font-size: 32px;
      font-weight: bold;
      margin: 0 0 20px 0;
      color: #1a1a1a;
     `;
     slideContent.appendChild(title);
    }

    // Rest as content
    for (let k = 1; k < texts.length; k++) {
     const p = document.createElement('p');
     p.textContent = texts[k];
     p.style.cssText = `
      margin: 10px 0;
      line-height: 1.6;
     `;
     slideContent.appendChild(p);
    }
   } else {
    // No text found
    const placeholder = document.createElement('div');
    placeholder.textContent = 'Slide content not available';
    placeholder.style.cssText = `
     color: #999;
     font-style: italic;
     text-align: center;
     margin-top: 40%;
    `;
    slideContent.appendChild(placeholder);
   }

   slideDiv.appendChild(slideContent);
   this.pptxContainer.appendChild(slideDiv);
  }
 }

 /**
  * Add navigation controls
  */
 private addNavigationControls(wrapper: HTMLElement): void {
  const nav = document.createElement('div');
  nav.className = 'powerpoint-navigation';
  nav.style.cssText = `
   position: absolute;
   bottom: 20px;
   left: 50%;
   transform: translateX(-50%);
   display: flex;
   gap: 10px;
   z-index: 1000;
   background: rgba(0, 0, 0, 0.7);
   padding: 10px;
   border-radius: 8px;
  `;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'nav-btn prev-slide';
  prevBtn.innerHTML = '&larr; Previous';
  prevBtn.style.cssText = `
   padding: 8px 16px;
   background: #fff;
   border: none;
   border-radius: 4px;
   cursor: pointer;
  `;
  prevBtn.addEventListener('click', () => this.previousSlide());

  const counter = document.createElement('span');
  counter.className = 'powerpoint-slide-counter';
  counter.textContent = `1 / ${this.slideCount}`;
  counter.style.cssText = `
   color: white;
   line-height: 32px;
   padding: 0 10px;
  `;

  const nextBtn = document.createElement('button');
  nextBtn.className = 'nav-btn next-slide';
  nextBtn.innerHTML = 'Next &rarr;';
  nextBtn.style.cssText = `
   padding: 8px 16px;
   background: #fff;
   border: none;
   border-radius: 4px;
   cursor: pointer;
  `;
  nextBtn.addEventListener('click', () => this.nextSlide());

  nav.appendChild(prevBtn);
  nav.appendChild(counter);
  nav.appendChild(nextBtn);
  wrapper.appendChild(nav);
 }


 /**
  * Navigate to previous slide
  */
 previousSlide(): void {
  if (this.currentSlide > 0) {
   this.goToSlide(this.currentSlide - 1);
  }
 }

 /**
  * Navigate to next slide
  */
 nextSlide(): void {
  if (this.currentSlide < this.slideCount - 1) {
   this.goToSlide(this.currentSlide + 1);
  } else if (this.options?.powerpoint?.autoPlay) {
   // Loop back to first slide
   this.goToSlide(0);
  }
 }

 /**
  * Navigate to specific slide
  */
 goToSlide(slideIndex: number): void {
  if (!this.pptxContainer || slideIndex < 0 || slideIndex >= this.slideCount) {
   return;
  }

  this.currentSlide = slideIndex;
  const slides = this.pptxContainer.querySelectorAll('.slide');
  
  if (slides[slideIndex]) {
   slides[slideIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Update counter
  const counter = this.container?.querySelector('.powerpoint-slide-counter');
  if (counter) {
   counter.textContent = `${slideIndex + 1} / ${this.slideCount}`;
  }
 }

 /**
  * Start auto-play
  */
 private startAutoPlay(interval: number): void {
  if (this.autoPlayInterval) {
   clearInterval(this.autoPlayInterval);
  }

  this.autoPlayInterval = window.setInterval(() => {
   this.nextSlide();
  }, interval);
 }

 /**
  * Stop auto-play
  */
 private stopAutoPlay(): void {
  if (this.autoPlayInterval) {
   clearInterval(this.autoPlayInterval);
   this.autoPlayInterval = null;
  }
 }

 /**
  * Get document metadata
  */
 async getMetadata(data: ArrayBuffer): Promise<DocumentMetadata> {
  try {
   const JSZip = (await import('jszip')).default;
   const zip = await JSZip.loadAsync(data);
   
   // Count slide files
   const slideFiles = Object.keys(zip.files).filter(name =>
    name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
   );

   return {
    title: 'PowerPoint Presentation',
    pageCount: slideFiles.length
   };
  } catch (error) {
   return {
    title: 'PowerPoint Presentation',
    pageCount: 0
   };
  }
 }

 /**
  * Export document to different formats
  */
 async export(format: 'pdf' | 'html' | 'text'): Promise<Blob> {
  if (!this.pptxContainer) {
   throw new Error('No document loaded');
  }

  switch (format) {
   case 'html':
    const htmlContent = this.pptxContainer.innerHTML;
    return new Blob([htmlContent], { type: 'text/html' });

   case 'text':
    const textContent = this.pptxContainer.textContent || '';
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
  this.stopAutoPlay();

  if (this.container) {
   this.container.innerHTML = '';
  }

  this.container = null;
  this.slideContainer = null;
  this.thumbnailsContainer = null;
  this.pptxContainer = null;
  this.currentData = null;
  this.options = null;
 }
}
