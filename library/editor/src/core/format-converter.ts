/**
 * Format Converter
 * 
 * Converts between different document formats (HTML, Markdown, JSON).
 */

import type { Delta as IDelta } from '@/types';
import { Delta } from './delta';
import { logger } from '@/utils/logger';

/**
 * Conversion options
 */
export interface ConversionOptions {
  preserveWhitespace?: boolean;
  sanitizeHtml?: boolean;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

/**
 * Default conversion options
 */
const DEFAULT_OPTIONS: ConversionOptions = {
  preserveWhitespace: false,
  sanitizeHtml: true,
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
    'a': ['href', 'target', 'rel', 'title'],
    'img': ['src', 'alt', 'width', 'height', 'title'],
    'table': ['width', 'border', 'cellpadding', 'cellspacing'],
    'th': ['align', 'valign', 'colspan', 'rowspan'],
    'td': ['align', 'valign', 'colspan', 'rowspan']
  }
};

/**
 * Format converter implementation
 */
export class FormatConverter {
  private options: ConversionOptions;

  constructor(options: Partial<ConversionOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Convert Delta to HTML
   */
  deltaToHtml(delta: IDelta): string {
    let html = '';
    let currentParagraph = '';
    // List state tracking (for future implementation)
    // let inList = false;
    // let listType = '';
    // let listLevel = 0;

    for (const op of delta.ops) {
      if (typeof op.insert === 'string') {
        const text = op.insert;
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
          if (i > 0) {
            // New line - close current paragraph and start new one
            if (currentParagraph) {
              html += this.wrapInParagraph(currentParagraph);
              currentParagraph = '';
            }
          }

          if (lines[i]) {
            const formattedText = this.applyTextFormatting(lines[i], op.attributes);
            currentParagraph += formattedText;
          }
        }
      } else if (typeof op.insert === 'object') {
        // Handle embeds
        if (currentParagraph) {
          html += this.wrapInParagraph(currentParagraph);
          currentParagraph = '';
        }
        html += this.embedToHtml(op.insert, op.attributes);
      }
    }

    // Close any remaining paragraph
    if (currentParagraph) {
      html += this.wrapInParagraph(currentParagraph);
    }

    return html;
  }

  /**
   * Convert HTML to Delta
   */
  htmlToDelta(html: string): Delta {
    const delta = new Delta();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    this.processNode(doc.body, delta);
    
    return delta;
  }

  /**
   * Convert Delta to Markdown
   */
  deltaToMarkdown(delta: IDelta): string {
    let markdown = '';
    let currentLine = '';

    for (const op of delta.ops) {
      if (typeof op.insert === 'string') {
        const text = op.insert;
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
          if (i > 0) {
            // New line
            markdown += currentLine + '\n';
            currentLine = '';
          }

          if (lines[i]) {
            currentLine += this.applyMarkdownFormatting(lines[i], op.attributes);
          }
        }
      } else if (typeof op.insert === 'object') {
        // Handle embeds
        if (currentLine) {
          markdown += currentLine + '\n';
          currentLine = '';
        }
        markdown += this.embedToMarkdown(op.insert, op.attributes) + '\n';
      }
    }

    // Add any remaining line
    if (currentLine) {
      markdown += currentLine;
    }

    return markdown;
  }

  /**
   * Convert Markdown to Delta
   */
  markdownToDelta(markdown: string): Delta {
    const delta = new Delta();
    const lines = markdown.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed) {
        delta.insert('\n');
        continue;
      }

      // Headers
      const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        delta.insert(text).insert('\n', { header: level });
        continue;
      }

      // Lists
      const listMatch = trimmed.match(/^(\s*)([*+-]|\d+\.)\s+(.+)$/);
      if (listMatch) {
        const indent = Math.floor(listMatch[1].length / 2);
        const marker = listMatch[2];
        const text = listMatch[3];
        const listType = /^\d+\./.test(marker) ? 'ordered' : 'bullet';
        
        delta.insert(text).insert('\n', { 
          list: listType,
          indent: indent || undefined 
        });
        continue;
      }

      // Blockquotes
      if (trimmed.startsWith('> ')) {
        const text = trimmed.substring(2);
        delta.insert(text).insert('\n', { blockquote: true });
        continue;
      }

      // Code blocks
      if (trimmed.startsWith('```')) {
        // TODO: Handle code blocks properly
        delta.insert(trimmed).insert('\n', { 'code-block': true });
        continue;
      }

      // Regular paragraph
      const formattedText = this.parseMarkdownInline(trimmed);
      delta.insert(formattedText).insert('\n');
    }

    return delta;
  }

  /**
   * Convert Delta to JSON
   */
  deltaToJson(delta: IDelta): string {
    return JSON.stringify(delta, null, 2);
  }

  /**
   * Convert JSON to Delta
   */
  jsonToDelta(json: string): Delta {
    try {
      const data = JSON.parse(json);
      return new Delta(data.ops || data);
    } catch (error) {
      logger.error('Failed to parse JSON:', error);
      return new Delta();
    }
  }

  /**
   * Apply text formatting to HTML
   */
  private applyTextFormatting(text: string, attributes?: Record<string, any>): string {
    if (!attributes) return this.escapeHtml(text);

    let formatted = this.escapeHtml(text);

    if (attributes.bold) {
      formatted = `<strong>${formatted}</strong>`;
    }
    if (attributes.italic) {
      formatted = `<em>${formatted}</em>`;
    }
    if (attributes.underline) {
      formatted = `<u>${formatted}</u>`;
    }
    if (attributes.strike) {
      formatted = `<s>${formatted}</s>`;
    }
    if (attributes.link) {
      const title = attributes['link-title'] ? ` title="${attributes['link-title']}"` : '';
      const target = attributes['link-target'] ? ` target="${attributes['link-target']}"` : '';
      formatted = `<a href="${attributes.link}"${title}${target}>${formatted}</a>`;
    }

    // Apply styles
    const styles: string[] = [];
    if (attributes.color) styles.push(`color: ${attributes.color}`);
    if (attributes.background) styles.push(`background-color: ${attributes.background}`);
    if (attributes.font) styles.push(`font-family: ${attributes.font}`);
    if (attributes.size) styles.push(`font-size: ${attributes.size}`);

    if (styles.length > 0) {
      formatted = `<span style="${styles.join('; ')}">${formatted}</span>`;
    }

    return formatted;
  }

  /**
   * Apply Markdown formatting
   */
  private applyMarkdownFormatting(text: string, attributes?: Record<string, any>): string {
    if (!attributes) return text;

    let formatted = text;

    if (attributes.bold) {
      formatted = `**${formatted}**`;
    }
    if (attributes.italic) {
      formatted = `*${formatted}*`;
    }
    if (attributes.strike) {
      formatted = `~~${formatted}~~`;
    }
    if (attributes.link) {
      const title = attributes['link-title'] ? ` "${attributes['link-title']}"` : '';
      formatted = `[${formatted}](${attributes.link}${title})`;
    }
    if (attributes.code) {
      formatted = `\`${formatted}\``;
    }

    return formatted;
  }

  /**
   * Wrap text in paragraph
   */
  private wrapInParagraph(text: string): string {
    return `<p>${text}</p>`;
  }

  /**
   * Convert embed to HTML
   */
  private embedToHtml(embed: Record<string, any>, _attributes?: Record<string, any>): string {
    if (embed.image) {
      const alt = embed.alt ? ` alt="${this.escapeHtml(embed.alt)}"` : '';
      const title = embed.title ? ` title="${this.escapeHtml(embed.title)}"` : '';
      const width = embed.width ? ` width="${embed.width}"` : '';
      const height = embed.height ? ` height="${embed.height}"` : '';
      return `<img src="${embed.image}"${alt}${title}${width}${height}>`;
    }

    if (embed.table) {
      return this.tableToHtml(embed.table);
    }

    return '';
  }

  /**
   * Convert embed to Markdown
   */
  private embedToMarkdown(embed: Record<string, any>, _attributes?: Record<string, any>): string {
    if (embed.image) {
      const alt = embed.alt || '';
      const title = embed.title ? ` "${embed.title}"` : '';
      return `![${alt}](${embed.image}${title})`;
    }

    if (embed.table) {
      return this.tableToMarkdown(embed.table);
    }

    return '';
  }

  /**
   * Convert table to HTML
   */
  private tableToHtml(table: any): string {
    if (!table.rows || !Array.isArray(table.rows)) return '';

    let html = '<table>';
    
    table.rows.forEach((row: any[], index: number) => {
      const isHeader = index === 0 && table.headers;
      const tag = isHeader ? 'th' : 'td';
      
      html += '<tr>';
      row.forEach((cell: any) => {
        const content = typeof cell === 'string' ? cell : cell.content || '';
        const colspan = cell.colspan ? ` colspan="${cell.colspan}"` : '';
        const rowspan = cell.rowspan ? ` rowspan="${cell.rowspan}"` : '';
        const align = cell.align ? ` align="${cell.align}"` : '';
        
        html += `<${tag}${colspan}${rowspan}${align}>${this.escapeHtml(content)}</${tag}>`;
      });
      html += '</tr>';
    });
    
    html += '</table>';
    return html;
  }

  /**
   * Convert table to Markdown
   */
  private tableToMarkdown(table: any): string {
    if (!table.rows || !Array.isArray(table.rows)) return '';

    let markdown = '';
    
    table.rows.forEach((row: any[], index: number) => {
      const cells = row.map((cell: any) => {
        const content = typeof cell === 'string' ? cell : cell.content || '';
        return content.replace(/\|/g, '\\|'); // Escape pipes
      });
      
      markdown += '| ' + cells.join(' | ') + ' |\n';
      
      // Add separator after header
      if (index === 0 && table.headers) {
        const separator = cells.map(() => '---').join(' | ');
        markdown += '| ' + separator + ' |\n';
      }
    });
    
    return markdown;
  }

  /**
   * Parse inline Markdown formatting
   */
  private parseMarkdownInline(text: string): string {
    // This is a simplified implementation
    // In a real implementation, you would use a proper Markdown parser
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<s>$1</s>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }

  /**
   * Process DOM node recursively
   */
  private processNode(node: Node, delta: Delta): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text) {
        delta.insert(text);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      
      // Handle different HTML elements
      switch (tagName) {
        case 'p':
        case 'div':
          this.processChildren(element, delta);
          delta.insert('\n');
          break;
        case 'br':
          delta.insert('\n');
          break;
        case 'strong':
        case 'b':
          this.processChildrenWithFormat(element, delta, { bold: true });
          break;
        case 'em':
        case 'i':
          this.processChildrenWithFormat(element, delta, { italic: true });
          break;
        case 'u':
          this.processChildrenWithFormat(element, delta, { underline: true });
          break;
        case 's':
        case 'strike':
          this.processChildrenWithFormat(element, delta, { strike: true });
          break;
        case 'a':
          const href = element.getAttribute('href');
          if (href) {
            this.processChildrenWithFormat(element, delta, { link: href });
          } else {
            this.processChildren(element, delta);
          }
          break;
        case 'img':
          const src = element.getAttribute('src');
          if (src) {
            delta.insert({
              image: src,
              alt: element.getAttribute('alt') || '',
              title: element.getAttribute('title') || ''
            });
          }
          break;
        default:
          this.processChildren(element, delta);
          break;
      }
    }
  }

  /**
   * Process child nodes
   */
  private processChildren(element: Element, delta: Delta): void {
    for (const child of Array.from(element.childNodes)) {
      this.processNode(child, delta);
    }
  }

  /**
   * Process child nodes with formatting
   */
  private processChildrenWithFormat(element: Element, delta: Delta, format: Record<string, any>): void {
    const startLength = delta.length();
    this.processChildren(element, delta);
    const endLength = delta.length();
    
    if (endLength > startLength) {
      delta.retain(startLength).retain(endLength - startLength, format);
    }
  }

  /**
   * Escape HTML characters
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Update conversion options
   */
  setOptions(options: Partial<ConversionOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get current conversion options
   */
  getOptions(): ConversionOptions {
    return { ...this.options };
  }
}
