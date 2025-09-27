/**
 * Code Highlighting Plugin
 * 
 * Provides syntax highlighting for code blocks using Prism.js.
 */

import type { Editor, Command, Format } from '@/types';
import { BasePlugin, BasePluginOptions } from './base-plugin';
import Prism from 'prismjs';

// Import common languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-xml-doc';

/**
 * Code highlighting plugin options
 */
export interface CodeHighlightingOptions extends BasePluginOptions {
  theme?: 'default' | 'dark' | 'light';
  showLineNumbers?: boolean;
  showLanguage?: boolean;
  copyButton?: boolean;
  defaultLanguage?: string;
  supportedLanguages?: string[];
}

/**
 * Supported programming languages
 */
export const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'tsx', label: 'TSX' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' }
];

/**
 * Code highlighting plugin implementation
 */
export class CodeHighlightingPlugin extends BasePlugin {
  readonly name = 'code-highlighting';
  readonly version = '1.0.0';
  override readonly dependencies = ['basic-formatting'];

  protected override options: CodeHighlightingOptions;

  constructor(options: CodeHighlightingOptions = {}) {
    super(options);
    this.options = {
      theme: 'default',
      showLineNumbers: true,
      showLanguage: true,
      copyButton: true,
      defaultLanguage: 'javascript',
      supportedLanguages: SUPPORTED_LANGUAGES.map(lang => lang.value),
      ...options
    };
  }

  override readonly commands: Record<string, Command> = {
    insertCodeBlock: {
      name: 'insertCodeBlock',
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range);
      },
      execute: (editor: Editor, _index?: number, language = this.options.defaultLanguage) => {
        const selection = editor.getSelection();
        if (!selection?.range) return;

        const codeBlockData = {
          language,
          code: ''
        };

        // TODO: Implement insertEmbed method
        this.logger.info('Insert code block:', codeBlockData);
      }
    },

    formatCodeBlock: {
      name: 'formatCodeBlock',
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range);
      },
      execute: (editor: Editor, _index?: number, language?: string) => {
        const selection = editor.getSelection();
        if (!selection?.range || !language) return;

        // Find code block at cursor
        const codeBlock = this.findCodeBlockAtCursor(editor);
        if (codeBlock) {
          const { index, data } = codeBlock;
          const updatedData = { ...data, language };

          // TODO: Implement updateEmbed method
          this.highlightCodeBlock(editor, index, updatedData);
        }
      }
    },

    toggleLineNumbers: {
      name: 'toggleLineNumbers',
      canExecute: () => true,
      execute: (_editor: Editor) => {
        this.options.showLineNumbers = !this.options.showLineNumbers;
        this.updateAllCodeBlocks();
      }
    }
  };

  override readonly formats: Record<string, Format> = {
    'code-block': {
      name: 'code-block',
      type: 'embed',
      apply: (_editor: Editor, _range: any, _value: any) => {
        // TODO: Implement apply method
      },
      remove: (_editor: Editor, _range: any) => {
        // TODO: Implement remove method
      },
      getValue: (_editor: Editor, _range: any) => {
        // TODO: Implement getValue method
        return null;
      }
    }
  };

  override async install(editor: Editor): Promise<void> {
    await super.install(editor);
    this.setupKeyboardShortcuts();
    this.loadPrismTheme();
  }

  override async uninstall(editor: Editor): Promise<void> {
    await super.uninstall(editor);
    this.removePrismTheme();
  }

  protected async onInstall(_editor: Editor): Promise<void> {
    // Plugin-specific installation logic
  }

  protected async onUninstall(_editor: Editor): Promise<void> {
    // Plugin-specific uninstallation logic
  }

  /**
   * Setup keyboard shortcuts
   */
  private setupKeyboardShortcuts(): void {
    if (!this.editor) return;

    // Ctrl+Shift+C for code block
    this.addEventListener(this.editor.getContainer(), 'keydown', (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        // TODO: Implement executeCommand method
        this.logger.info('Code block shortcut triggered');
      }
    });
  }

  /**
   * Load Prism theme CSS
   */
  private loadPrismTheme(): void {
    const themeId = `prism-theme-${this.options.theme}`;
    
    if (document.getElementById(themeId)) {
      return; // Theme already loaded
    }

    const link = document.createElement('link');
    link.id = themeId;
    link.rel = 'stylesheet';
    link.href = this.getPrismThemeUrl();
    document.head.appendChild(link);
  }

  /**
   * Remove Prism theme CSS
   */
  private removePrismTheme(): void {
    const themeId = `prism-theme-${this.options.theme}`;
    const link = document.getElementById(themeId);
    if (link) {
      link.remove();
    }
  }

  /**
   * Get Prism theme URL
   */
  private getPrismThemeUrl(): string {
    const themes = {
      default: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css',
      dark: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-dark.min.css',
      light: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css'
    };
    return themes[this.options.theme || 'default'];
  }

  /**
   * Render code block
   */
  public renderCodeBlock(data: { language: string; code: string }): HTMLElement {
    const container = document.createElement('div');
    container.className = 'code-block-container';
    container.setAttribute('data-language', data.language);

    // Language label
    if (this.options.showLanguage) {
      const label = document.createElement('div');
      label.className = 'code-block-language';
      label.textContent = this.getLanguageLabel(data.language);
      container.appendChild(label);
    }

    // Copy button
    if (this.options.copyButton) {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-block-copy';
      copyBtn.textContent = 'Copy';
      copyBtn.onclick = () => this.copyCodeToClipboard(data.code);
      container.appendChild(copyBtn);
    }

    // Code element
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    
    if (this.options.showLineNumbers) {
      pre.className = 'line-numbers';
    }
    
    code.className = `language-${data.language}`;
    code.textContent = data.code;
    
    pre.appendChild(code);
    container.appendChild(pre);

    // Apply syntax highlighting
    this.highlightElement(code);

    return container;
  }

  /**
   * Parse code block from HTML
   */
  public parseCodeBlock(element: HTMLElement): { language: string; code: string } {
    const language = element.getAttribute('data-language') || 'javascript';
    const codeElement = element.querySelector('code');
    const code = codeElement?.textContent || '';
    
    return { language, code };
  }

  /**
   * Highlight code element
   */
  private highlightElement(element: HTMLElement): void {
    try {
      Prism.highlightElement(element);
    } catch (error) {
      this.logger.warn('Failed to highlight code element:', error);
    }
  }

  /**
   * Highlight code block at specific index
   */
  private highlightCodeBlock(_editor: Editor, _index: number, _data: any): void {
    // Re-render the code block with updated highlighting
    // This would typically trigger a re-render of the specific embed
    this.logger.info('Highlighting code block at index:', _index);
  }

  /**
   * Find code block at cursor position
   */
  private findCodeBlockAtCursor(_editor: Editor): { index: number; data: any } | null {
    // TODO: Implement finding code block at cursor
    // This would search through the document for code-block embeds
    return null;
  }

  /**
   * Update all code blocks with current options
   */
  private updateAllCodeBlocks(): void {
    if (!this.editor) return;

    // Re-render all code blocks
    this.logger.info('Updating all code blocks');
  }

  /**
   * Get language display label
   */
  private getLanguageLabel(language: string): string {
    const lang = SUPPORTED_LANGUAGES.find(l => l.value === language);
    return lang?.label || language.toUpperCase();
  }

  /**
   * Copy code to clipboard
   */
  private async copyCodeToClipboard(code: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      this.logger.info('Code copied to clipboard');
    } catch (error) {
      this.logger.warn('Failed to copy code to clipboard:', error);
      
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }
}
