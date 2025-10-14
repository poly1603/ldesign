/**
 * PowerPoint Document Renderer
 */

import { PowerPointRenderOptions, RenderResult, DocumentInfo } from '../types';
import { createElement, generateId } from '../utils';

export class PowerPointRenderer {
  private container: HTMLElement;
  private options: PowerPointRenderOptions;
  private contentElement: HTMLElement | null = null;
  private currentSlide = 1;
  private totalSlides = 1;
  private slides: any[] = [];
  private autoPlayInterval: NodeJS.Timeout | null = null;

  constructor(container: HTMLElement, options: PowerPointRenderOptions) {
    this.container = container;
    this.options = {
      slideshow: false,
      autoPlay: false,
      slideDuration: 5,
      showNotes: false,
      animations: true,
      thumbnailNav: false,
      ...options
    };
  }

  async render(data: ArrayBuffer): Promise<RenderResult> {
    try {
      // Parse PowerPoint file
      // Note: This is a placeholder implementation
      // In production, you would use a library like pptxjs or officegen
      await this.parsePresentation(data);

      // Create viewer structure
      this.createViewer();

      // Render first slide
      this.renderSlide(0);

      // Setup auto-play if enabled
      if (this.options.autoPlay && this.options.slideshow) {
        this.startAutoPlay();
      }

      // Call onLoad callback
      if (this.options.onLoad) {
        const docInfo: DocumentInfo = {
          type: 'powerpoint',
          name: 'presentation.pptx',
          size: data.byteLength,
          pageCount: this.totalSlides
        };
        this.options.onLoad(docInfo);
      }

      return this.createRenderResult();
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  private async parsePresentation(data: ArrayBuffer): Promise<void> {
    // Placeholder parsing logic
    // In production, integrate with a PowerPoint parsing library
    
    // For demo purposes, create mock slides
    this.slides = [
      {
        title: 'Slide 1',
        content: '<h1>Welcome to PowerPoint Viewer</h1><p>This is the first slide</p>',
        notes: 'Speaker notes for slide 1'
      },
      {
        title: 'Slide 2',
        content: '<h2>Features</h2><ul><li>View presentations</li><li>Navigate slides</li><li>Slideshow mode</li></ul>',
        notes: 'Speaker notes for slide 2'
      },
      {
        title: 'Slide 3',
        content: '<h2>Thank You</h2><p>End of presentation</p>',
        notes: 'Speaker notes for slide 3'
      }
    ];
    
    this.totalSlides = this.slides.length;
  }

  private createViewer(): void {
    // Clear container
    this.container.innerHTML = '';

    // Create wrapper
    const wrapper = createElement('div', {
      className: 'od-ppt-viewer',
      id: generateId('ppt'),
      style: {
        width: typeof this.options.width === 'number'
          ? `${this.options.width}px`
          : this.options.width || '100%',
        height: typeof this.options.height === 'number'
          ? `${this.options.height}px`
          : this.options.height || '600px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: this.options.theme?.background || '#000'
      }
    });

    // Add toolbar if enabled
    if (this.options.toolbar) {
      const toolbar = this.createToolbar();
      wrapper.appendChild(toolbar);
    }

    // Create main layout
    const mainLayout = createElement('div', {
      className: 'od-ppt-main',
      style: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }
    });

    // Add thumbnail navigation if enabled
    if (this.options.thumbnailNav) {
      const thumbnails = this.createThumbnails();
      mainLayout.appendChild(thumbnails);
    }

    // Create slide content area
    this.contentElement = createElement('div', {
      className: 'od-ppt-content',
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'hidden'
      }
    });

    mainLayout.appendChild(this.contentElement);
    wrapper.appendChild(mainLayout);

    // Add notes panel if enabled
    if (this.options.showNotes) {
      const notesPanel = this.createNotesPanel();
      wrapper.appendChild(notesPanel);
    }

    // Add navigation controls
    const controls = this.createNavigationControls();
    wrapper.appendChild(controls);

    // Add custom class if provided
    if (this.options.className) {
      wrapper.classList.add(this.options.className);
    }

    this.container.appendChild(wrapper);
  }

  private createToolbar(): HTMLElement {
    const toolbar = createElement('div', {
      className: 'od-ppt-toolbar',
      style: {
        padding: '10px',
        backgroundColor: this.options.theme?.toolbar?.background || '#2d2d2d',
        color: this.options.theme?.toolbar?.text || '#fff',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }
    });

    const buttons = [
      { id: 'slideshow', text: '▶️', title: 'Start Slideshow', action: () => this.toggleSlideshow() },
      { id: 'prev', text: '◀', title: 'Previous Slide', action: () => this.previousSlide() },
      { id: 'next', text: '▶', title: 'Next Slide', action: () => this.nextSlide() },
      { id: 'fullscreen', text: '⛶', title: 'Fullscreen', action: () => this.toggleFullscreen() },
      { id: 'notes', text: '📝', title: 'Toggle Notes', action: () => this.toggleNotes() },
      { id: 'print', text: '🖨️', title: 'Print', action: () => this.print() }
    ];

    buttons.forEach(btn => {
      const button = createElement('button', {
        className: 'od-toolbar-button',
        textContent: btn.text,
        attributes: { title: btn.title }
      });
      button.onclick = btn.action;
      toolbar.appendChild(button);
    });

    // Add slide counter
    const counter = createElement('span', {
      className: 'od-slide-counter',
      textContent: `${this.currentSlide} / ${this.totalSlides}`,
      style: {
        marginLeft: 'auto',
        fontSize: '14px'
      }
    });
    toolbar.appendChild(counter);

    return toolbar;
  }

  private createThumbnails(): HTMLElement {
    const thumbnailPanel = createElement('div', {
      className: 'od-ppt-thumbnails',
      style: {
        width: '150px',
        overflowY: 'auto',
        backgroundColor: '#1a1a1a',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }
    });

    this.slides.forEach((slide, index) => {
      const thumbnail = createElement('div', {
        className: 'od-thumbnail',
        style: {
          padding: '10px',
          backgroundColor: index === 0 ? '#333' : '#2a2a2a',
          borderRadius: '4px',
          cursor: 'pointer',
          border: index === 0 ? '2px solid #4CAF50' : '2px solid transparent',
          transition: 'all 0.3s'
        }
      });

      const thumbnailContent = createElement('div', {
        innerHTML: `<div style="font-size: 10px; color: #fff;">${index + 1}</div>
                    <div style="font-size: 8px; color: #999; margin-top: 5px;">${slide.title}</div>`,
        style: {
          textAlign: 'center'
        }
      });

      thumbnail.appendChild(thumbnailContent);
      thumbnail.onclick = () => this.goToSlide(index);
      thumbnailPanel.appendChild(thumbnail);
    });

    return thumbnailPanel;
  }

  private createNotesPanel(): HTMLElement {
    const notesPanel = createElement('div', {
      className: 'od-ppt-notes',
      id: 'notes-panel',
      style: {
        height: '100px',
        backgroundColor: '#f5f5f5',
        padding: '15px',
        borderTop: '1px solid #ddd',
        overflow: 'auto',
        display: this.options.showNotes ? 'block' : 'none'
      }
    });

    const notesTitle = createElement('h4', {
      textContent: 'Speaker Notes',
      style: {
        margin: '0 0 10px 0',
        fontSize: '14px',
        color: '#333'
      }
    });

    const notesContent = createElement('div', {
      className: 'od-notes-content',
      textContent: this.slides[0]?.notes || 'No notes for this slide',
      style: {
        fontSize: '13px',
        color: '#666'
      }
    });

    notesPanel.appendChild(notesTitle);
    notesPanel.appendChild(notesContent);

    return notesPanel;
  }

  private createNavigationControls(): HTMLElement {
    const controls = createElement('div', {
      className: 'od-ppt-navigation',
      style: {
        padding: '15px',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        alignItems: 'center'
      }
    });

    const prevBtn = createElement('button', {
      textContent: '◀ Previous',
      className: 'od-nav-button',
      style: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#4CAF50',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px'
      }
    });
    prevBtn.onclick = () => this.previousSlide();

    const slideIndicator = createElement('span', {
      className: 'od-slide-indicator',
      textContent: `Slide ${this.currentSlide} of ${this.totalSlides}`,
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#333'
      }
    });

    const nextBtn = createElement('button', {
      textContent: 'Next ▶',
      className: 'od-nav-button',
      style: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#4CAF50',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px'
      }
    });
    nextBtn.onclick = () => this.nextSlide();

    controls.appendChild(prevBtn);
    controls.appendChild(slideIndicator);
    controls.appendChild(nextBtn);

    return controls;
  }

  private renderSlide(slideIndex: number): void {
    if (!this.contentElement || slideIndex < 0 || slideIndex >= this.slides.length) return;

    const slide = this.slides[slideIndex];
    this.currentSlide = slideIndex + 1;

    // Create slide element
    const slideElement = createElement('div', {
      className: 'od-slide',
      innerHTML: slide.content,
      style: {
        width: '90%',
        maxWidth: '800px',
        aspectRatio: '16/9',
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        animation: this.options.animations ? 'slideIn 0.3s ease-out' : 'none'
      }
    });

    // Clear and add new slide
    this.contentElement.innerHTML = '';
    this.contentElement.appendChild(slideElement);

    // Update UI elements
    this.updateSlideIndicators();
    this.updateNotes(slide.notes);
    this.updateThumbnails();

    // Callback
    if (this.options.onPageChange) {
      this.options.onPageChange(this.currentSlide);
    }
  }

  private updateSlideIndicators(): void {
    const counter = this.container.querySelector('.od-slide-counter');
    if (counter) {
      counter.textContent = `${this.currentSlide} / ${this.totalSlides}`;
    }

    const indicator = this.container.querySelector('.od-slide-indicator');
    if (indicator) {
      indicator.textContent = `Slide ${this.currentSlide} of ${this.totalSlides}`;
    }
  }

  private updateNotes(notes: string): void {
    const notesContent = this.container.querySelector('.od-notes-content');
    if (notesContent) {
      notesContent.textContent = notes || 'No notes for this slide';
    }
  }

  private updateThumbnails(): void {
    const thumbnails = this.container.querySelectorAll('.od-thumbnail');
    thumbnails.forEach((thumb, index) => {
      const isActive = index === this.currentSlide - 1;
      (thumb as HTMLElement).style.backgroundColor = isActive ? '#333' : '#2a2a2a';
      (thumb as HTMLElement).style.border = isActive ? '2px solid #4CAF50' : '2px solid transparent';
    });
  }

  private nextSlide(): void {
    if (this.currentSlide < this.totalSlides) {
      this.renderSlide(this.currentSlide);
    } else if (this.options.slideshow && this.options.autoPlay) {
      this.renderSlide(0); // Loop back to first slide
    }
  }

  private previousSlide(): void {
    if (this.currentSlide > 1) {
      this.renderSlide(this.currentSlide - 2);
    }
  }

  private goToSlide(slideIndex: number): void {
    this.renderSlide(slideIndex);
  }

  private toggleSlideshow(): void {
    this.options.slideshow = !this.options.slideshow;
    
    if (this.options.slideshow) {
      this.enterFullscreen();
      if (this.options.autoPlay) {
        this.startAutoPlay();
      }
    } else {
      this.stopAutoPlay();
    }
  }

  private startAutoPlay(): void {
    this.stopAutoPlay();
    
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, (this.options.slideDuration || 5) * 1000);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  private toggleNotes(): void {
    const notesPanel = this.container.querySelector('#notes-panel') as HTMLElement;
    if (notesPanel) {
      this.options.showNotes = !this.options.showNotes;
      notesPanel.style.display = this.options.showNotes ? 'block' : 'none';
    }
  }

  private toggleFullscreen(): void {
    if (document.fullscreenElement) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  private enterFullscreen(): void {
    const viewer = this.container.querySelector('.od-ppt-viewer') as HTMLElement;
    if (viewer && viewer.requestFullscreen) {
      viewer.requestFullscreen();
    }
  }

  private exitFullscreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  private print(): void {
    window.print();
  }

  private createRenderResult(): RenderResult {
    return {
      destroy: () => this.destroy(),
      refresh: () => this.refresh(),
      goToPage: (page: number) => this.goToSlide(page - 1),
      setZoom: (zoom: number) => this.setZoom(zoom),
      getCurrentPage: () => this.currentSlide,
      getTotalPages: () => this.totalSlides,
      print: () => this.print(),
      enterFullscreen: () => this.enterFullscreen(),
      exitFullscreen: () => this.exitFullscreen()
    };
  }

  private destroy(): void {
    this.stopAutoPlay();
    this.container.innerHTML = '';
    this.contentElement = null;
  }

  private refresh(): void {
    this.renderSlide(this.currentSlide - 1);
  }

  private setZoom(zoom: number): void {
    if (this.contentElement) {
      const slide = this.contentElement.querySelector('.od-slide') as HTMLElement;
      if (slide) {
        slide.style.transform = `scale(${zoom / 100})`;
      }
    }

    if (this.options.onZoomChange) {
      this.options.onZoomChange(zoom);
    }
  }
}