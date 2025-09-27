/**
 * Document Renderer
 * 
 * Renders Delta operations to DOM elements and manages DOM synchronization.
 */

import type { Delta as IDelta } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Render options
 */
export interface RenderOptions {
  className?: string;
  sanitize?: boolean;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

/**
 * Default render options
 */
const DEFAULT_OPTIONS: RenderOptions = {
  className: 'enhanced-rich-editor__content',
  sanitize: true,
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 's', 'span', 'div',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ],
  allowedAttributes: {
    '*': ['class', 'style'],
    'a': ['href', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height'],
    'span': ['style'],
    'div': ['style']
  }
};

/**
 * Document renderer implementation
 */
export class DocumentRenderer {
  private options: RenderOptions;

  constructor(options: Partial<RenderOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Render Delta to HTML string
   */
  renderToHTML(delta: IDelta): string {
    const elements = this.renderToElements(delta);
    return elements.map(el => el.outerHTML).join('');
  }

  /**
   * Render Delta to DOM elements
   */
  renderToElements(delta: IDelta): HTMLElement[] {
    const elements: HTMLElement[] = [];
    let currentParagraph: HTMLElement | null = null;
    let currentText = '';
    let currentAttributes: Record<string, any> = {};

    const flushText = () => {
      if (currentText) {
        const textNode = this.createTextElement(currentText, currentAttributes);
        if (currentParagraph) {
          currentParagraph.appendChild(textNode);
        } else {
          // Create a paragraph if none exists
          currentParagraph = this.createElement('p');
          currentParagraph.appendChild(textNode);
          elements.push(currentParagraph);
        }
        currentText = '';
        currentAttributes = {};
      }
    };

    const flushParagraph = () => {
      flushText();
      if (currentParagraph) {
        // Ensure paragraph has content
        if (currentParagraph.children.length === 0) {
          currentParagraph.appendChild(this.createElement('br'));
        }
        currentParagraph = null;
      }
    };

    for (const op of delta.ops) {
      if (typeof op.insert === 'string') {
        const text = op.insert;
        const lines = text.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          if (i > 0) {
            // New line - flush current paragraph and start new one
            flushParagraph();
            currentParagraph = this.createElement('p');
            elements.push(currentParagraph);
          }
          
          if (lines[i]) {
            currentText += lines[i];
            currentAttributes = op.attributes || {};
          }
        }
      } else if (typeof op.insert === 'object') {
        // Handle embeds (images, etc.)
        flushText();
        const embed = this.createEmbedElement(op.insert, op.attributes);
        if (embed) {
          if (!currentParagraph) {
            currentParagraph = this.createElement('p');
            elements.push(currentParagraph);
          }
          currentParagraph.appendChild(embed);
        }
      }
    }

    // Flush any remaining content
    flushParagraph();

    // Ensure we have at least one paragraph
    if (elements.length === 0) {
      const emptyParagraph = this.createElement('p');
      emptyParagraph.appendChild(this.createElement('br'));
      elements.push(emptyParagraph);
    }

    return elements;
  }

  /**
   * Render Delta to a container element
   */
  renderToContainer(delta: IDelta, container: HTMLElement): void {
    // Clear container
    container.innerHTML = '';
    
    // Add class if specified
    if (this.options.className) {
      container.classList.add(this.options.className);
    }

    // Render elements
    const elements = this.renderToElements(delta);
    elements.forEach(el => container.appendChild(el));
  }

  /**
   * Create a text element with formatting
   */
  private createTextElement(text: string, attributes: Record<string, any> = {}): HTMLElement | Text {
    if (!attributes || Object.keys(attributes).length === 0) {
      return document.createTextNode(text);
    }

    let element: HTMLElement = document.createElement('span');
    element.textContent = text;

    // Apply formatting attributes
    if (attributes.bold) {
      const strong = document.createElement('strong');
      strong.appendChild(element);
      element = strong;
    }

    if (attributes.italic) {
      const em = document.createElement('em');
      em.appendChild(element);
      element = em;
    }

    if (attributes.underline) {
      const u = document.createElement('u');
      u.appendChild(element);
      element = u;
    }

    if (attributes.strike) {
      const s = document.createElement('s');
      s.appendChild(element);
      element = s;
    }

    // Apply style attributes
    const styles: string[] = [];
    if (attributes.color) {
      styles.push(`color: ${attributes.color}`);
    }
    if (attributes.background) {
      styles.push(`background-color: ${attributes.background}`);
    }
    if (attributes.font) {
      styles.push(`font-family: ${attributes.font}`);
    }
    if (attributes.size) {
      styles.push(`font-size: ${attributes.size}`);
    }

    if (styles.length > 0) {
      element.style.cssText = styles.join('; ');
    }

    return element;
  }

  /**
   * Create an embed element
   */
  private createEmbedElement(embed: Record<string, any>, attributes: Record<string, any> = {}): HTMLElement | null {
    if (embed.image) {
      const img = this.createElement('img') as HTMLImageElement;
      img.src = embed.image;
      if (attributes.alt) img.alt = attributes.alt;
      if (attributes.width) img.width = attributes.width;
      if (attributes.height) img.height = attributes.height;
      return img;
    }

    if (embed.video) {
      const video = this.createElement('video') as HTMLVideoElement;
      video.src = embed.video;
      video.controls = true;
      if (attributes.width) video.width = attributes.width;
      if (attributes.height) video.height = attributes.height;
      return video;
    }

    if (embed.link) {
      const a = this.createElement('a') as HTMLAnchorElement;
      a.href = embed.link;
      a.textContent = attributes.text || embed.link;
      if (attributes.target) a.target = attributes.target;
      return a;
    }

    logger.warn('Unknown embed type:', embed);
    return null;
  }

  /**
   * Create a DOM element with sanitization
   */
  private createElement(tagName: string): HTMLElement {
    if (this.options.sanitize && this.options.allowedTags) {
      if (!this.options.allowedTags.includes(tagName.toLowerCase())) {
        logger.warn(`Tag "${tagName}" is not allowed, using span instead`);
        tagName = 'span';
      }
    }

    return document.createElement(tagName);
  }

  /**
   * Sanitize attributes
   * TODO: Implement attribute sanitization when needed
   */
  // private sanitizeAttributes(_element: HTMLElement, _attributes: Record<string, string>): void {
  //   if (!this.options.sanitize || !this.options.allowedAttributes) {
  //     return;
  //   }

  //   const tagName = _element.tagName.toLowerCase();
  //   const allowedForTag = this.options.allowedAttributes[tagName] || [];
  //   const allowedForAll = this.options.allowedAttributes['*'] || [];
  //   const allowed = [...allowedForTag, ...allowedForAll];

  //   for (const [key, value] of Object.entries(_attributes)) {
  //     if (allowed.includes(key)) {
  //       _element.setAttribute(key, value);
  //     } else {
  //       logger.warn(`Attribute "${key}" is not allowed for tag "${tagName}"`);
  //     }
  //   }
  // }

  /**
   * Update render options
   */
  setOptions(options: Partial<RenderOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get current render options
   */
  getOptions(): RenderOptions {
    return { ...this.options };
  }
}
