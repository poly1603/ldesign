import JSZip from 'jszip';
import type { IDocumentRenderer, DocumentMetadata, ViewerOptions } from '../types';

// Declare the vue-office pptx renderer
declare const VueOfficePptx: any;

/**
 * Enhanced PowerPoint Document Renderer
 * Can use @vue-office/pptx for better rendering or fallback to improved manual parsing
 */
export class EnhancedPowerPointRenderer implements IDocumentRenderer {
  private container: HTMLElement | null = null;
  private currentSlide: number = 0;
  private slideCount: number = 0;
  private currentData: ArrayBuffer | null = null;
  private options: ViewerOptions | null = null;
  private autoPlayInterval: number | null = null;
  private pptxContainer: HTMLElement | null = null;
  private vueOfficeInstance: any = null;

  /**
   * Render PowerPoint document using @vue-office/pptx if available
   */
  async render(container: HTMLElement, data: ArrayBuffer, options: ViewerOptions): Promise<void> {
    this.container = container;
    this.currentData = data;
    this.options = options;

    try {
      // Clear container
      container.innerHTML = '';

      // Try to use @vue-office/pptx first
      const useVueOffice = options.powerpoint?.renderer === 'vue-office' || options.powerpoint?.useVueOffice !== false;
      
      if (useVueOffice) {
        await this.renderWithVueOffice(container, data, options);
      } else {
        await this.renderManually(container, data, options);
      }

      // Call onLoad callback
      options.onLoad?.();
    } catch (error) {
      console.warn('Failed to use @vue-office/pptx, falling back to manual rendering:', error);
      // Fallback to manual rendering
      await this.renderManually(container, data, options);
      options.onLoad?.();
    }
  }

  /**
   * Render using @vue-office/pptx library
   */
  private async renderWithVueOffice(container: HTMLElement, data: ArrayBuffer, options: ViewerOptions): Promise<void> {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'powerpoint-viewer-wrapper';
    wrapper.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
      overflow: auto;
      background: #f5f5f5;
    `;

    // Create container for vue-office
    this.pptxContainer = document.createElement('div');
    this.pptxContainer.id = `pptx-container-${Date.now()}`;
    this.pptxContainer.style.cssText = `
      width: 100%;
      height: 100%;
    `;

    wrapper.appendChild(this.pptxContainer);
    container.appendChild(wrapper);

    // Load @vue-office/pptx library dynamically
    await this.loadVueOfficePptx();

    // Convert ArrayBuffer to Blob URL for vue-office
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    const url = URL.createObjectURL(blob);

    // Initialize vue-office pptx renderer
    if (typeof window !== 'undefined' && (window as any).VueOfficePptx) {
      const VueOfficePptx = (window as any).VueOfficePptx;
      
      // Render the PPTX
      await VueOfficePptx.init({
        container: this.pptxContainer,
        src: url,
        ...options.powerpoint
      });

      // Clean up blob URL after loading
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      throw new Error('@vue-office/pptx not available');
    }
  }

  /**
   * Load @vue-office/pptx library
   */
  private async loadVueOfficePptx(): Promise<void> {
    // Check if already loaded
    if (typeof window !== 'undefined' && (window as any).VueOfficePptx) {
      return;
    }

    // Try multiple loading methods
    try {
      // Method 1: Check if it's already available as a script
      if (typeof window !== 'undefined' && (window as any).VueOfficePptx) {
        return;
      }
      
      // Method 2: Try dynamic import with a catch fallback
      // This will only work if the module is available in the build environment
      try {
        // Use a dynamic string to prevent build-time resolution
        const modulePath = '@vue-office' + '/pptx/lib/index.js';
        const module = await import(/* @vite-ignore */ modulePath);
        if (module.default) {
          (window as any).VueOfficePptx = module.default;
          return;
        }
      } catch (importError) {
        // Module not available in build, continue to CDN fallback
        console.log('Module not available locally, loading from CDN');
      }
      
      // Method 3: Load from CDN
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@vue-office/pptx@latest/lib/index.js';
      
      return new Promise((resolve, reject) => {
        script.onload = () => {
          console.log('@vue-office/pptx loaded from CDN');
          resolve();
        };
        script.onerror = () => {
          console.warn('Failed to load @vue-office/pptx from CDN');
          reject(new Error('Failed to load @vue-office/pptx'));
        };
        document.head.appendChild(script);
      });
    } catch (error) {
      console.warn('Could not load @vue-office/pptx:', error);
      throw new Error('Failed to load @vue-office/pptx library');
    }
  }

  /**
   * Enhanced manual rendering with better style extraction
   */
  private async renderManually(container: HTMLElement, data: ArrayBuffer, options: ViewerOptions): Promise<void> {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'powerpoint-viewer-wrapper';
    wrapper.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
      background: #f5f5f5;
      overflow: auto;
    `;

    // Create content container
    this.pptxContainer = document.createElement('div');
    this.pptxContainer.className = 'pptx-slides-container';
    this.pptxContainer.style.cssText = `
      width: 100%;
      padding: 20px;
      box-sizing: border-box;
    `;

    wrapper.appendChild(this.pptxContainer);
    container.appendChild(wrapper);

    // Parse PPTX using JSZip
    const zip = await JSZip.loadAsync(data);
    
    // Get presentation properties
    const presentationXml = await zip.file('ppt/presentation.xml')?.async('text');
    const slideSize = this.extractSlideSize(presentationXml);
    
    // Get theme and master slides for better styling
    const themeXml = await zip.file('ppt/theme/theme1.xml')?.async('text');
    const theme = this.extractEnhancedTheme(themeXml);
    
    // Get slide master for layouts
    const slideMasterXml = await zip.file('ppt/slideMasters/slideMaster1.xml')?.async('text');
    const slideLayoutsXml: { [key: string]: string } = {};
    
    // Load slide layouts
    const layoutFiles = Object.keys(zip.files).filter(name => 
      name.startsWith('ppt/slideLayouts/') && name.endsWith('.xml')
    );
    
    for (const layoutFile of layoutFiles) {
      const layoutId = layoutFile.match(/slideLayout(\d+)\.xml/)?.[1];
      if (layoutId) {
        slideLayoutsXml[layoutId] = await zip.file(layoutFile)?.async('text') || '';
      }
    }

    // Get all slide files
    const slideFiles = Object.keys(zip.files)
      .filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
        const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
        return numA - numB;
      });

    this.slideCount = slideFiles.length;

    // Add CSS styles for better rendering
    this.addPowerPointStyles(theme);

    // Render each slide
    for (let i = 0; i < slideFiles.length; i++) {
      const slideFile = slideFiles[i];
      const slideXml = await zip.file(slideFile)?.async('text');
      const slideRelXml = await zip.file(slideFile.replace('slides/', 'slides/_rels/').replace('.xml', '.xml.rels'))?.async('text');
      
      if (!slideXml) continue;

      await this.renderEnhancedSlide(
        zip, 
        slideXml, 
        slideRelXml || '', 
        i + 1, 
        slideFiles.length,
        theme,
        slideSize,
        slideLayoutsXml
      );
    }

    // Add navigation controls if enabled
    if (options.powerpoint?.showNavigation !== false && this.slideCount > 1) {
      this.addNavigationControls(wrapper);
    }

    // Setup auto-play if enabled
    if (options.powerpoint?.autoPlay && this.slideCount > 1) {
      this.startAutoPlay(options.powerpoint.autoPlayInterval || 3000);
    }
  }

  /**
   * Extract slide size from presentation
   */
  private extractSlideSize(presentationXml: string | undefined): { width: number; height: number } {
    if (!presentationXml) return { width: 960, height: 540 }; // Default 16:9
    
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(presentationXml, 'text/xml');
      const sldSz = xmlDoc.querySelector('sldSz');
      
      if (sldSz) {
        const cx = parseInt(sldSz.getAttribute('cx') || '12192000') / 12700; // EMUs to pixels
        const cy = parseInt(sldSz.getAttribute('cy') || '6858000') / 12700;
        return { width: cx, height: cy };
      }
    } catch (error) {
      console.warn('Failed to extract slide size:', error);
    }
    
    return { width: 960, height: 540 };
  }

  /**
   * Extract enhanced theme with fonts and color schemes
   */
  private extractEnhancedTheme(themeXml: string | undefined): any {
    const theme: any = {
      colors: {},
      fonts: {
        majorFont: 'Calibri Light',
        minorFont: 'Calibri'
      }
    };
    
    if (!themeXml) return theme;
    
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(themeXml, 'text/xml');
      
      // Extract color scheme
      const clrScheme = xmlDoc.querySelector('clrScheme');
      if (clrScheme) {
        const colorMappings: { [key: string]: string } = {
          'dk1': 'dark1',
          'lt1': 'light1',
          'dk2': 'dark2',
          'lt2': 'light2',
          'accent1': 'accent1',
          'accent2': 'accent2',
          'accent3': 'accent3',
          'accent4': 'accent4',
          'accent5': 'accent5',
          'accent6': 'accent6',
          'hlink': 'hyperlink',
          'folHlink': 'followedHyperlink'
        };
        
        for (const [xmlName, themeName] of Object.entries(colorMappings)) {
          const elem = clrScheme.querySelector(xmlName);
          const srgbClr = elem?.querySelector('srgbClr');
          const sysClr = elem?.querySelector('sysClr');
          
          if (srgbClr) {
            const val = srgbClr.getAttribute('val');
            if (val) theme.colors[themeName] = `#${val}`;
          } else if (sysClr) {
            const val = sysClr.getAttribute('lastClr');
            if (val) theme.colors[themeName] = `#${val}`;
          }
        }
      }
      
      // Extract font scheme
      const fontScheme = xmlDoc.querySelector('fontScheme');
      if (fontScheme) {
        const majorFont = fontScheme.querySelector('majorFont latin');
        const minorFont = fontScheme.querySelector('minorFont latin');
        
        if (majorFont) {
          theme.fonts.majorFont = majorFont.getAttribute('typeface') || 'Calibri Light';
        }
        if (minorFont) {
          theme.fonts.minorFont = minorFont.getAttribute('typeface') || 'Calibri';
        }
      }
    } catch (error) {
      console.warn('Failed to parse theme:', error);
    }
    
    return theme;
  }

  /**
   * Add CSS styles for PowerPoint rendering
   */
  private addPowerPointStyles(theme: any): void {
    const styleId = 'powerpoint-enhanced-styles';
    
    // Remove existing styles if any
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .pptx-slide {
        background: white;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        margin: 0 auto 30px;
        position: relative;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .pptx-slide-content {
        width: 100%;
        height: 100%;
        padding: 5%;
        box-sizing: border-box;
        font-family: '${theme.fonts.minorFont}', 'Calibri', 'Arial', sans-serif;
      }
      
      .pptx-slide h1 {
        font-family: '${theme.fonts.majorFont}', 'Calibri Light', 'Arial', sans-serif;
        color: ${theme.colors.dark1 || '#000000'};
        margin: 0 0 0.5em;
        line-height: 1.2;
      }
      
      .pptx-slide h2 {
        font-family: '${theme.fonts.majorFont}', 'Calibri Light', 'Arial', sans-serif;
        color: ${theme.colors.dark2 || '#404040'};
        margin: 0 0 0.5em;
        line-height: 1.3;
      }
      
      .pptx-slide .bullet-list {
        margin: 0.5em 0;
        padding-left: 1.5em;
      }
      
      .pptx-slide .bullet-item {
        margin: 0.3em 0;
        line-height: 1.6;
        position: relative;
      }
      
      .pptx-slide .bullet-item::before {
        content: '•';
        position: absolute;
        left: -1.2em;
        color: ${theme.colors.accent1 || '#4472C4'};
      }
      
      .pptx-slide .shape-group {
        position: relative;
        width: 100%;
        height: 100%;
      }
      
      .pptx-slide .text-box {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      
      .pptx-slide .slide-number {
        position: absolute;
        bottom: 20px;
        right: 30px;
        font-size: 14px;
        color: #666;
        font-weight: 500;
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Render enhanced slide with better layout and styling
   */
  private async renderEnhancedSlide(
    zip: JSZip,
    slideXml: string,
    slideRelXml: string,
    slideNumber: number,
    totalSlides: number,
    theme: any,
    slideSize: { width: number; height: number },
    slideLayouts: { [key: string]: string }
  ): Promise<void> {
    if (!this.pptxContainer) return;

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(slideXml, 'text/xml');
    
    // Create slide element with proper aspect ratio
    const slideDiv = document.createElement('div');
    slideDiv.className = 'pptx-slide';
    slideDiv.dataset.slideNumber = slideNumber.toString();
    
    // Calculate responsive width while maintaining aspect ratio
    const aspectRatio = slideSize.height / slideSize.width;
    slideDiv.style.cssText = `
      width: 100%;
      max-width: ${slideSize.width}px;
      aspect-ratio: ${slideSize.width} / ${slideSize.height};
    `;
    
    // Create content container
    const slideContent = document.createElement('div');
    slideContent.className = 'pptx-slide-content';
    
    // Check for slide background
    const bg = xmlDoc.querySelector('bg');
    if (bg) {
      const bgStyle = this.extractBackgroundStyle(bg, theme);
      if (bgStyle) {
        slideDiv.style.background = bgStyle;
      }
    }
    
    // Parse and render shapes with enhanced positioning
    const cSld = xmlDoc.querySelector('cSld');
    const spTree = cSld?.querySelector('spTree');
    
    if (spTree) {
      const shapes = spTree.querySelectorAll('sp, pic, graphicFrame');
      const shapeGroup = document.createElement('div');
      shapeGroup.className = 'shape-group';
      
      shapes.forEach(shape => {
        const element = this.renderShape(shape, theme, slideSize);
        if (element) {
          shapeGroup.appendChild(element);
        }
      });
      
      slideContent.appendChild(shapeGroup);
    }
    
    // Add slide number
    const slideNumberDiv = document.createElement('div');
    slideNumberDiv.className = 'slide-number';
    slideNumberDiv.textContent = `${slideNumber} / ${totalSlides}`;
    
    slideDiv.appendChild(slideContent);
    slideDiv.appendChild(slideNumberDiv);
    this.pptxContainer.appendChild(slideDiv);
  }

  /**
   * Extract background style from XML
   */
  private extractBackgroundStyle(bg: Element, theme: any): string | null {
    const solidFill = bg.querySelector('solidFill');
    const gradFill = bg.querySelector('gradFill');
    const blipFill = bg.querySelector('blipFill');
    
    if (solidFill) {
      const color = this.extractColor(solidFill, theme);
      if (color) return color;
    }
    
    if (gradFill) {
      const gradColors: string[] = [];
      const gsLst = gradFill.querySelectorAll('gs');
      
      gsLst.forEach(gs => {
        const color = this.extractColor(gs, theme);
        if (color) gradColors.push(color);
      });
      
      if (gradColors.length > 0) {
        return `linear-gradient(180deg, ${gradColors.join(', ')})`;
      }
    }
    
    return null;
  }

  /**
   * Extract color from XML element
   */
  private extractColor(elem: Element, theme: any): string | null {
    const srgbClr = elem.querySelector('srgbClr');
    const schemeClr = elem.querySelector('schemeClr');
    const scrgbClr = elem.querySelector('scrgbClr');
    
    if (srgbClr) {
      const val = srgbClr.getAttribute('val');
      if (val) return `#${val}`;
    }
    
    if (schemeClr) {
      const scheme = schemeClr.getAttribute('val');
      if (scheme && theme.colors[scheme]) {
        return theme.colors[scheme];
      }
    }
    
    if (scrgbClr) {
      const r = parseInt((parseFloat(scrgbClr.getAttribute('r') || '0') * 255).toString());
      const g = parseInt((parseFloat(scrgbClr.getAttribute('g') || '0') * 255).toString());
      const b = parseInt((parseFloat(scrgbClr.getAttribute('b') || '0') * 255).toString());
      return `rgb(${r}, ${g}, ${b})`;
    }
    
    return null;
  }

  /**
   * Render a shape element
   */
  private renderShape(shape: Element, theme: any, slideSize: { width: number; height: number }): HTMLElement | null {
    const nvSpPr = shape.querySelector('nvSpPr, nvPicPr');
    const spPr = shape.querySelector('spPr');
    const txBody = shape.querySelector('txBody');
    
    if (!txBody) return null;
    
    const textBox = document.createElement('div');
    textBox.className = 'text-box';
    
    // Extract position and size
    if (spPr) {
      const xfrm = spPr.querySelector('xfrm');
      if (xfrm) {
        const off = xfrm.querySelector('off');
        const ext = xfrm.querySelector('ext');
        
        if (off && ext) {
          const x = parseInt(off.getAttribute('x') || '0') / 12700;
          const y = parseInt(off.getAttribute('y') || '0') / 12700;
          const cx = parseInt(ext.getAttribute('cx') || '0') / 12700;
          const cy = parseInt(ext.getAttribute('cy') || '0') / 12700;
          
          textBox.style.cssText = `
            position: absolute;
            left: ${(x / slideSize.width) * 100}%;
            top: ${(y / slideSize.height) * 100}%;
            width: ${(cx / slideSize.width) * 100}%;
            height: ${(cy / slideSize.height) * 100}%;
          `;
        }
      }
    }
    
    // Extract and render text
    const paragraphs = txBody.querySelectorAll('p');
    paragraphs.forEach(p => {
      const pElem = this.renderParagraph(p, theme);
      if (pElem) {
        textBox.appendChild(pElem);
      }
    });
    
    return textBox;
  }

  /**
   * Render a paragraph element
   */
  private renderParagraph(p: Element, theme: any): HTMLElement | null {
    const runs = p.querySelectorAll('r');
    if (runs.length === 0) return null;
    
    const pPr = p.querySelector('pPr');
    const lvl = pPr?.getAttribute('lvl') || '0';
    const isBullet = pPr?.querySelector('buChar') !== null;
    
    const container = document.createElement('div');
    
    if (isBullet) {
      container.className = 'bullet-item';
      container.style.marginLeft = `${parseInt(lvl) * 20}px`;
    }
    
    let fullText = '';
    let fontSize = 18;
    let isBold = false;
    let color = theme.colors.dark1 || '#000000';
    
    runs.forEach(run => {
      const t = run.querySelector('t');
      if (t) {
        fullText += t.textContent || '';
      }
      
      const rPr = run.querySelector('rPr');
      if (rPr) {
        const sz = rPr.getAttribute('sz');
        if (sz) {
          fontSize = parseInt(sz) / 100;
        }
        
        if (rPr.getAttribute('b') === '1') {
          isBold = true;
        }
        
        const runColor = this.extractColor(rPr, theme);
        if (runColor) {
          color = runColor;
        }
      }
    });
    
    if (fullText.trim()) {
      const elem = fontSize > 32 ? document.createElement('h1') : 
                   fontSize > 24 ? document.createElement('h2') :
                   document.createElement('p');
      
      elem.textContent = fullText.trim();
      elem.style.cssText = `
        font-size: ${fontSize}px;
        font-weight: ${isBold ? 'bold' : 'normal'};
        color: ${color};
        margin: 0.2em 0;
      `;
      
      container.appendChild(elem);
      return container;
    }
    
    return null;
  }

  /**
   * Add navigation controls
   */
  private addNavigationControls(wrapper: HTMLElement): void {
    const nav = document.createElement('div');
    nav.className = 'powerpoint-navigation';
    nav.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 15px;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.8);
      padding: 12px 20px;
      border-radius: 50px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'nav-btn prev-slide';
    prevBtn.innerHTML = '←';
    prevBtn.style.cssText = `
      width: 40px;
      height: 40px;
      background: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      font-size: 20px;
      transition: all 0.3s;
    `;
    prevBtn.addEventListener('click', () => this.previousSlide());

    const counter = document.createElement('span');
    counter.className = 'powerpoint-slide-counter';
    counter.textContent = `1 / ${this.slideCount}`;
    counter.style.cssText = `
      color: white;
      line-height: 40px;
      padding: 0 15px;
      font-size: 14px;
      font-weight: 500;
    `;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'nav-btn next-slide';
    nextBtn.innerHTML = '→';
    nextBtn.style.cssText = prevBtn.style.cssText;
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
    const slides = this.pptxContainer.querySelectorAll('.pptx-slide');
    
    if (slides[slideIndex]) {
      slides[slideIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      const zip = await JSZip.loadAsync(data);
      
      // Count slide files
      const slideFiles = Object.keys(zip.files).filter(name =>
        name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
      );

      // Try to get title from core properties
      let title = 'PowerPoint Presentation';
      const coreXml = await zip.file('docProps/core.xml')?.async('text');
      if (coreXml) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(coreXml, 'text/xml');
        const titleElem = xmlDoc.querySelector('title');
        if (titleElem?.textContent) {
          title = titleElem.textContent;
        }
      }

      return {
        title,
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
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>PowerPoint Export</title>
            <style>
              body { font-family: Calibri, Arial, sans-serif; background: #f5f5f5; padding: 20px; }
              ${document.getElementById('powerpoint-enhanced-styles')?.textContent || ''}
            </style>
          </head>
          <body>
            ${this.pptxContainer.innerHTML}
          </body>
          </html>
        `;
        return new Blob([htmlContent], { type: 'text/html' });

      case 'text':
        const textContent = this.pptxContainer.textContent || '';
        return new Blob([textContent], { type: 'text/plain' });

      case 'pdf':
        // For PDF export, we'd need a library like jsPDF
        throw new Error('PDF export requires additional libraries. Please use browser print to PDF feature.');

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Destroy renderer and clean up
   */
  destroy(): void {
    this.stopAutoPlay();

    if (this.vueOfficeInstance) {
      // Cleanup vue-office instance if exists
      if (typeof this.vueOfficeInstance.destroy === 'function') {
        this.vueOfficeInstance.destroy();
      }
      this.vueOfficeInstance = null;
    }

    // Remove styles
    const style = document.getElementById('powerpoint-enhanced-styles');
    if (style) {
      style.remove();
    }

    if (this.container) {
      this.container.innerHTML = '';
    }

    this.container = null;
    this.pptxContainer = null;
    this.currentData = null;
    this.options = null;
  }
}