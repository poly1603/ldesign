/**
 * Media Formatting Plugin
 * 
 * Provides link and image insertion functionality.
 */

import type { Editor, Command, Format } from '@/types';
import { BasePlugin } from './base-plugin';
import { logger } from '@/utils/logger';

/**
 * Link data interface
 */
export interface LinkData {
  url: string;
  text?: string;
  title?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
}

/**
 * Image data interface
 */
export interface ImageData {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

/**
 * Media formatting plugin
 */
export class MediaFormattingPlugin extends BasePlugin {
  readonly name = 'media-formatting';
  readonly version = '1.0.0';

  constructor() {
    super();
    this.logger = logger.child(this.name);
  }

  override readonly commands: Record<string, Command> = {
    'insert-link': {
      name: 'insert-link',
      execute: (editor: Editor, linkData?: LinkData) => {
        const selection = editor.getSelection();
        if (!selection?.range) return { success: false };

        if (!linkData) {
          // Prompt user for link data
          linkData = this.promptForLink(editor) || undefined;
          if (!linkData) return { success: false };
        }

        const { url, text, title, target } = linkData;
        const linkText = text || url;

        if (selection.range.length > 0) {
          // Replace selected text with link
          editor.formatText(selection.range.index, selection.range.length, 'link', url);
          if (title) {
            editor.formatText(selection.range.index, selection.range.length, 'link-title', title);
          }
          if (target) {
            editor.formatText(selection.range.index, selection.range.length, 'link-target', target);
          }
        } else {
          // Insert new link
          const delta = editor.getContents();
          const newDelta = delta
            .retain(selection.range.index)
            .insert(linkText, { 
              link: url,
              'link-title': title,
              'link-target': target 
            });
          editor.setContents(newDelta);
          
          // Move cursor to end of link
          editor.setSelection({ index: selection.range.index + linkText.length, length: 0 });
        }

        return { success: true, url, text: linkText };
      },
      canExecute: (editor: Editor) => {
        return Boolean(editor.isEnabled() && editor.getSelection());
      },
    },

    'remove-link': {
      name: 'remove-link',
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (!selection?.range) return { success: false };

        // Find link boundaries
        const linkRange = this.findLinkRange(editor, selection.range.index);
        if (!linkRange) return { success: false };

        // Remove link formatting
        editor.formatText(linkRange.index, linkRange.length, 'link', false);
        editor.formatText(linkRange.index, linkRange.length, 'link-title', false);
        editor.formatText(linkRange.index, linkRange.length, 'link-target', false);

        return { success: true };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (!selection?.range) return false;
        return Boolean(this.isInLink(editor, selection.range.index));
      },
    },

    'insert-image': {
      name: 'insert-image',
      execute: (editor: Editor, imageData?: ImageData) => {
        const selection = editor.getSelection();
        if (!selection?.range) return { success: false };

        if (!imageData) {
          // Prompt user for image data
          imageData = this.promptForImage(editor) || undefined;
          if (!imageData) return { success: false };
        }

        const { src, alt, title, width, height } = imageData;
        
        // Insert image embed
        const imageEmbed = {
          image: src,
          alt: alt || '',
          title: title || '',
          width: width || undefined,
          height: height || undefined
        };

        const delta = editor.getContents();
        const newDelta = delta
          .retain(selection.range.index)
          .insert(imageEmbed);
        
        editor.setContents(newDelta);
        
        // Move cursor after image
        editor.setSelection({ index: selection.range.index + 1, length: 0 });

        return { success: true, src, alt };
      },
      canExecute: (editor: Editor) => {
        return Boolean(editor.isEnabled() && editor.getSelection());
      },
    },

    'upload-image': {
      name: 'upload-image',
      execute: (editor: Editor) => {
        return this.openFileDialog(editor);
      },
      canExecute: (editor: Editor) => {
        return Boolean(editor.isEnabled() && editor.getSelection());
      },
    },
  };

  override readonly formats: Record<string, Format> = {
    link: {
      name: 'link',
      type: 'inline',
      apply: (editor: Editor, range, value) => {
        editor.formatText(range.index, range.length, 'link', value);
      },
      remove: (editor: Editor, range) => {
        editor.formatText(range.index, range.length, 'link', false);
      },
      getValue: (editor: Editor, range) => {
        const format = editor.getFormat(range);
        return format.link || false;
      },
    },

    'link-title': {
      name: 'link-title',
      type: 'inline',
      apply: (editor: Editor, range, value) => {
        editor.formatText(range.index, range.length, 'link-title', value);
      },
      remove: (editor: Editor, range) => {
        editor.formatText(range.index, range.length, 'link-title', false);
      },
      getValue: (editor: Editor, range) => {
        const format = editor.getFormat(range);
        return format['link-title'] || false;
      },
    },

    'link-target': {
      name: 'link-target',
      type: 'inline',
      apply: (editor: Editor, range, value) => {
        editor.formatText(range.index, range.length, 'link-target', value);
      },
      remove: (editor: Editor, range) => {
        editor.formatText(range.index, range.length, 'link-target', false);
      },
      getValue: (editor: Editor, range) => {
        const format = editor.getFormat(range);
        return format['link-target'] || false;
      },
    },
  };

  protected async onInstall(editor: Editor): Promise<void> {
    this.logger.info('Installing media formatting plugin');
    
    // Add keyboard shortcuts
    this.setupKeyboardShortcuts(editor);
    
    // Add CSS styles
    this.addStyles();
    
    // Setup drag and drop
    this.setupDragAndDrop(editor);
  }

  protected async onUninstall(_editor: Editor): Promise<void> {
    this.logger.info('Uninstalling media formatting plugin');
    
    // Clean up event listeners
    this.cleanupEventListeners();
    
    // Remove CSS styles
    this.removeStyles();
  }

  /**
   * Setup keyboard shortcuts
   */
  private setupKeyboardShortcuts(editor: Editor): void {
    const root = editor.getRoot();
    
    this.addEventListener(root, 'keydown', (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'k':
            event.preventDefault();
            this.commands['insert-link'].execute(editor);
            break;
        }
      }
    });
  }

  /**
   * Setup drag and drop for images
   */
  private setupDragAndDrop(editor: Editor): void {
    const root = editor.getRoot();
    
    this.addEventListener(root, 'dragover', (event) => {
      event.preventDefault();
      event.dataTransfer!.dropEffect = 'copy';
    });
    
    this.addEventListener(root, 'drop', (event) => {
      event.preventDefault();
      
      const files = Array.from(event.dataTransfer?.files || []);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length > 0) {
        this.handleImageFiles(editor, imageFiles);
      }
    });
  }

  /**
   * Handle dropped image files
   */
  private async handleImageFiles(editor: Editor, files: File[]): Promise<void> {
    for (const file of files) {
      try {
        const dataUrl = await this.fileToDataUrl(file);
        const imageData: ImageData = {
          src: dataUrl,
          alt: file.name,
          title: file.name
        };
        
        this.commands['insert-image'].execute(editor, imageData);
      } catch (error) {
        this.logger.error('Failed to process image file:', error);
      }
    }
  }

  /**
   * Convert file to data URL
   */
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Prompt user for link data
   */
  private promptForLink(editor: Editor): LinkData | null {
    const selection = editor.getSelection();
    const selectedText = selection?.range && selection.range.length > 0 
      ? editor.getText(selection.range.index, selection.range.length)
      : '';

    const url = prompt('请输入链接地址:', 'https://');
    if (!url) return null;

    const text = prompt('请输入链接文本:', selectedText || url);
    const title = prompt('请输入链接标题 (可选):', '');
    
    return {
      url,
      text: text || url,
      title: title || '',
      target: '_blank'
    };
  }

  /**
   * Prompt user for image data
   */
  private promptForImage(_editor: Editor): ImageData | null {
    const src = prompt('请输入图片地址:', 'https://');
    if (!src) return null;

    const alt = prompt('请输入图片描述 (可选):', '');
    const title = prompt('请输入图片标题 (可选):', '');
    
    return {
      src,
      alt: alt || '',
      title: title || ''
    };
  }

  /**
   * Open file dialog for image upload
   */
  private openFileDialog(editor: Editor): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      
      input.onchange = async () => {
        const files = Array.from(input.files || []);
        if (files.length > 0) {
          await this.handleImageFiles(editor, files);
          resolve({ success: true });
        } else {
          resolve({ success: false });
        }
      };
      
      input.oncancel = () => resolve({ success: false });
      input.click();
    });
  }

  /**
   * Find link range at position
   */
  private findLinkRange(editor: Editor, index: number): { index: number; length: number } | null {
    const text = editor.getText();
    const format = editor.getFormat({ index, length: 1 });
    
    if (!format.link) return null;

    // Find start of link
    let start = index;
    while (start > 0) {
      const prevFormat = editor.getFormat({ index: start - 1, length: 1 });
      if (prevFormat.link !== format.link) break;
      start--;
    }

    // Find end of link
    let end = index;
    while (end < text.length) {
      const nextFormat = editor.getFormat({ index: end, length: 1 });
      if (nextFormat.link !== format.link) break;
      end++;
    }

    return { index: start, length: end - start };
  }

  /**
   * Check if position is in a link
   */
  private isInLink(editor: Editor, index: number): boolean {
    const format = editor.getFormat({ index, length: 1 });
    return !!format.link;
  }

  /**
   * Add CSS styles for links and images
   */
  private addStyles(): void {
    const styleId = `${this.name}-styles`;
    
    if (document.getElementById(styleId)) {
      return; // Styles already added
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .enhanced-rich-editor__content a {
        color: var(--ere-color-primary, #3b82f6);
        text-decoration: underline;
        cursor: pointer;
        transition: color var(--ere-transition-fast, 0.2s);
      }
      
      .enhanced-rich-editor__content a:hover {
        color: var(--ere-color-primary-hover, #2563eb);
        text-decoration: none;
      }
      
      .enhanced-rich-editor__content a:visited {
        color: var(--ere-color-primary-visited, #7c3aed);
      }
      
      .enhanced-rich-editor__content img {
        max-width: 100%;
        height: auto;
        border-radius: var(--ere-border-radius, 4px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin: 0.5em 0;
        display: block;
      }
      
      .enhanced-rich-editor__content img[width] {
        width: attr(width px);
      }
      
      .enhanced-rich-editor__content img[height] {
        height: attr(height px);
      }
      
      /* Drag and drop styles */
      .enhanced-rich-editor__content.dragover {
        background: var(--ere-color-bg-hover, #f3f4f6);
        border: 2px dashed var(--ere-color-primary, #3b82f6);
      }
      
      /* Dark theme support */
      .enhanced-rich-editor--dark .enhanced-rich-editor__content a {
        color: var(--ere-color-primary-dark, #60a5fa);
      }
      
      .enhanced-rich-editor--dark .enhanced-rich-editor__content a:hover {
        color: var(--ere-color-primary-hover-dark, #93c5fd);
      }
      
      .enhanced-rich-editor--dark .enhanced-rich-editor__content a:visited {
        color: var(--ere-color-primary-visited-dark, #a78bfa);
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Remove CSS styles
   */
  private removeStyles(): void {
    const styleId = `${this.name}-styles`;
    const style = document.getElementById(styleId);
    if (style) {
      style.remove();
    }
  }
}
