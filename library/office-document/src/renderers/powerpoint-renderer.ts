import pptxjs from 'pptxjs';
import type { IDocumentRenderer, DocumentMetadata, ViewerOptions } from '../types';

/**
 * PowerPoint Document Renderer
 * Uses pptxjs for high-fidelity rendering with styles and layouts
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

   // Render PPTX using pptxjs
   await pptxjs.load(data, this.pptxContainer);

   // Get slide count after rendering
   const slides = this.pptxContainer.querySelectorAll('.slide');
   this.slideCount = slides.length;

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
