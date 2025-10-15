import type { IDocumentRenderer, DocumentMetadata, ViewerOptions } from '../types';

/**
 * PowerPoint Document Renderer
 * Currently uses a simplified approach for rendering PPTX files
 * Note: Full PPTX rendering is complex and would require extensive parsing
 */
export class PowerPointRenderer implements IDocumentRenderer {
 private container: HTMLElement | null = null;
 private currentSlide: number = 0;
 private slides: any[] = [];
 private currentData: ArrayBuffer | null = null;
 private options: ViewerOptions | null = null;
 private slideContainer: HTMLElement | null = null;
 private thumbnailsContainer: HTMLElement | null = null;
 private autoPlayInterval: number | null = null;

 /**
  * Render PowerPoint document
  */
 async render(container: HTMLElement, data: ArrayBuffer, options: ViewerOptions): Promise<void> {
  this.container = container;
  this.currentData = data;
  this.options = options;

  try {
   // Parse PPTX file
   await this.parsePPTX(data);

   if (this.slides.length === 0) {
    throw new Error('No slides found in PowerPoint file');
   }

   // Clear container
   container.innerHTML = '';

   // Create wrapper
   const wrapper = document.createElement('div');
   wrapper.className = 'powerpoint-viewer-wrapper';

   // Create main content area
   const mainContent = document.createElement('div');
   mainContent.className = 'powerpoint-main-content';

   // Create slide container
   this.slideContainer = document.createElement('div');
   this.slideContainer.className = 'powerpoint-slide-container';

   // Create navigation if enabled
   if (options.powerpoint?.showNavigation !== false) {
    const nav = this.createNavigation();
    mainContent.appendChild(nav);
   }

   mainContent.appendChild(this.slideContainer);

   // Create slide counter
   const counter = document.createElement('div');
   counter.className = 'powerpoint-slide-counter';
   counter.textContent = `1 / ${this.slides.length}`;
   mainContent.appendChild(counter);

   wrapper.appendChild(mainContent);

   // Create thumbnails if enabled
   if (options.powerpoint?.showThumbnails) {
    this.thumbnailsContainer = this.createThumbnails();
    wrapper.appendChild(this.thumbnailsContainer);
   }

   container.appendChild(wrapper);

   // Render first slide
   this.renderSlide(0);

   // Setup auto-play if enabled
   if (options.powerpoint?.autoPlay) {
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
  * Parse PPTX file (simplified version)
  * Note: Full implementation would require JSZip and XML parsing
  */
 private async parsePPTX(data: ArrayBuffer): Promise<void> {
  // For now, create placeholder slides
  // In a full implementation, you would:
  // 1. Use JSZip to extract PPTX contents
  // 2. Parse XML files in ppt/slides/
  // 3. Extract images from ppt/media/
  // 4. Parse relationships and themes
  // 5. Render slide content with proper formatting

  // Create a placeholder implementation
  // This would be replaced with actual PPTX parsing
  this.slides = [
   {
    title: 'Slide 1',
    content: 'PowerPoint viewer is loading...',
    notes: ''
   }
  ];

  // Attempt to detect slide count from file structure
  // This is a simplified placeholder
  try {
   const JSZip = (await import('jszip')).default;
   const zip = await JSZip.loadAsync(data);

   // Get slide files
   const slideFiles = Object.keys(zip.files).filter(name =>
    name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
   );

   // Parse each slide (simplified)
   this.slides = await Promise.all(
    slideFiles.map(async (filename, index) => {
     const content = await zip.files[filename].async('string');
     return this.parseSlideXML(content, index + 1);
    })
   );
  } catch (error) {
   console.warn('Failed to parse PPTX structure, using fallback:', error);
   // If parsing fails, show a message
   this.slides = [{
    title: 'PowerPoint Viewer',
    content: `
     <div class="pptx-message">
      <h2>PowerPoint Viewer</h2>
      <p>This is a simplified PowerPoint viewer.</p>
      <p>For full PPTX support, additional libraries (jszip, xml2js) need to be installed.</p>
      <p>File size: ${(data.byteLength / 1024).toFixed(2)} KB</p>
     </div>
    `,
    notes: ''
   }];
  }
 }

 /**
  * Parse slide XML content (simplified)
  */
 private parseSlideXML(xml: string, slideNumber: number): any {
  // Extract text content from XML (very simplified)
  const textMatches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
  const texts = textMatches.map(match => {
   const text = match.replace(/<\/?a:t[^>]*>/g, '');
   return text;
  });

  const title = texts[0] || `Slide ${slideNumber}`;
  const content = texts.slice(1).join('<br>');

  return {
   title,
   content: `<h2>${title}</h2><p>${content}</p>`,
   notes: ''
  };
 }

 /**
  * Create navigation controls
  */
 private createNavigation(): HTMLElement {
  const nav = document.createElement('div');
  nav.className = 'powerpoint-navigation';
  nav.innerHTML = `
   <button class="nav-btn prev-slide" title="Previous Slide">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
     <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
   </button>
   <button class="nav-btn next-slide" title="Next Slide">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
     <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
   </button>
  `;

  nav.querySelector('.prev-slide')?.addEventListener('click', () => this.previousSlide());
  nav.querySelector('.next-slide')?.addEventListener('click', () => this.nextSlide());

  return nav;
 }

 /**
  * Create thumbnails
  */
 private createThumbnails(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'powerpoint-thumbnails';

  this.slides.forEach((slide, index) => {
   const thumbnail = document.createElement('div');
   thumbnail.className = 'thumbnail';
   thumbnail.dataset.index = String(index);
   thumbnail.innerHTML = `
    <div class="thumbnail-number">${index + 1}</div>
    <div class="thumbnail-preview">${slide.title}</div>
   `;

   if (index === 0) {
    thumbnail.classList.add('active');
   }

   thumbnail.addEventListener('click', () => this.goToSlide(index));
   container.appendChild(thumbnail);
  });

  return container;
 }

 /**
  * Render a specific slide
  */
 private renderSlide(slideIndex: number): void {
  if (!this.slideContainer || slideIndex < 0 || slideIndex >= this.slides.length) {
   return;
  }

  this.currentSlide = slideIndex;
  const slide = this.slides[slideIndex];

  this.slideContainer.innerHTML = `
   <div class="slide-content">
    ${slide.content}
   </div>
  `;

  // Update counter
  const counter = this.container?.querySelector('.powerpoint-slide-counter');
  if (counter) {
   counter.textContent = `${slideIndex + 1} / ${this.slides.length}`;
  }

  // Update thumbnail active state
  if (this.thumbnailsContainer) {
   const thumbnails = this.thumbnailsContainer.querySelectorAll('.thumbnail');
   thumbnails.forEach((thumb, index) => {
    if (index === slideIndex) {
     thumb.classList.add('active');
    } else {
     thumb.classList.remove('active');
    }
   });
  }
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
  if (this.currentSlide < this.slides.length - 1) {
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
  this.renderSlide(slideIndex);
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
  await this.parsePPTX(data);

  return {
   title: 'PowerPoint Presentation',
   pageCount: this.slides.length
  };
 }

 /**
  * Export document to different formats
  */
 async export(format: 'pdf' | 'html' | 'text'): Promise<Blob> {
  if (this.slides.length === 0) {
   throw new Error('No document loaded');
  }

  switch (format) {
   case 'html':
    const htmlContent = this.slides
     .map((slide, index) => `<div class="slide" data-slide="${index + 1}">${slide.content}</div>`)
     .join('\n');
    return new Blob([htmlContent], { type: 'text/html' });

   case 'text':
    const textContent = this.slides
     .map((slide, index) => `Slide ${index + 1}: ${slide.title}\n${slide.content}\n`)
     .join('\n');
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
  this.slides = [];
  this.currentData = null;
  this.options = null;
 }
}
