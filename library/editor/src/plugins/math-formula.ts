/**
 * Math Formula Plugin
 * 
 * Provides LaTeX math formula editing and rendering using KaTeX.
 */

import type { Editor, Command, Format } from '@/types';
import { BasePlugin, BasePluginOptions } from './base-plugin';
import katex from 'katex';

/**
 * Math formula plugin options
 */
export interface MathFormulaOptions extends BasePluginOptions {
  displayMode?: boolean;
  throwOnError?: boolean;
  errorColor?: string;
  macros?: Record<string, string>;
  strict?: boolean | 'warn' | 'ignore';
  trust?: boolean;
  maxSize?: number;
  maxExpand?: number;
  allowedProtocols?: string[];
}

/**
 * Math formula data structure
 */
export interface MathFormulaData {
  latex: string;
  displayMode: boolean;
}

/**
 * Common LaTeX symbols and functions
 */
export const LATEX_SYMBOLS = [
  // Greek letters
  { symbol: '\\alpha', description: 'Alpha (α)' },
  { symbol: '\\beta', description: 'Beta (β)' },
  { symbol: '\\gamma', description: 'Gamma (γ)' },
  { symbol: '\\delta', description: 'Delta (δ)' },
  { symbol: '\\epsilon', description: 'Epsilon (ε)' },
  { symbol: '\\theta', description: 'Theta (θ)' },
  { symbol: '\\lambda', description: 'Lambda (λ)' },
  { symbol: '\\mu', description: 'Mu (μ)' },
  { symbol: '\\pi', description: 'Pi (π)' },
  { symbol: '\\sigma', description: 'Sigma (σ)' },
  { symbol: '\\phi', description: 'Phi (φ)' },
  { symbol: '\\omega', description: 'Omega (ω)' },
  
  // Mathematical operators
  { symbol: '\\sum', description: 'Summation' },
  { symbol: '\\prod', description: 'Product' },
  { symbol: '\\int', description: 'Integral' },
  { symbol: '\\oint', description: 'Contour integral' },
  { symbol: '\\lim', description: 'Limit' },
  { symbol: '\\infty', description: 'Infinity' },
  { symbol: '\\partial', description: 'Partial derivative' },
  { symbol: '\\nabla', description: 'Nabla' },
  
  // Relations
  { symbol: '\\leq', description: 'Less than or equal' },
  { symbol: '\\geq', description: 'Greater than or equal' },
  { symbol: '\\neq', description: 'Not equal' },
  { symbol: '\\approx', description: 'Approximately equal' },
  { symbol: '\\equiv', description: 'Equivalent' },
  { symbol: '\\in', description: 'Element of' },
  { symbol: '\\subset', description: 'Subset' },
  { symbol: '\\supset', description: 'Superset' },
  
  // Functions
  { symbol: '\\frac{a}{b}', description: 'Fraction' },
  { symbol: '\\sqrt{x}', description: 'Square root' },
  { symbol: '\\sqrt[n]{x}', description: 'nth root' },
  { symbol: 'x^{y}', description: 'Superscript' },
  { symbol: 'x_{y}', description: 'Subscript' },
  { symbol: '\\sin', description: 'Sine' },
  { symbol: '\\cos', description: 'Cosine' },
  { symbol: '\\tan', description: 'Tangent' },
  { symbol: '\\log', description: 'Logarithm' },
  { symbol: '\\ln', description: 'Natural logarithm' },
  { symbol: '\\exp', description: 'Exponential' }
];

/**
 * Math formula plugin implementation
 */
export class MathFormulaPlugin extends BasePlugin {
  readonly name = 'math-formula';
  readonly version = '1.0.0';
  override readonly dependencies = ['basic-formatting'];

  protected override options: MathFormulaOptions;

  constructor(options: MathFormulaOptions = {}) {
    super(options);
    this.options = {
      displayMode: false,
      throwOnError: false,
      errorColor: '#cc0000',
      strict: 'warn',
      trust: false,
      maxSize: 10,
      maxExpand: 1000,
      allowedProtocols: ['http', 'https', 'mailto', 'tel'],
      ...options
    };
  }

  override readonly commands: Record<string, Command> = {
    insertInlineMath: {
      name: 'insertInlineMath',
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range);
      },
      execute: (editor: Editor, _index?: number, latex = '') => {
        const selection = editor.getSelection();
        if (!selection?.range) return;

        const mathData: MathFormulaData = {
          latex,
          displayMode: false
        };

        this.logger.info('Insert inline math:', mathData);
        // TODO: Implement insertEmbed method
      }
    },

    insertDisplayMath: {
      name: 'insertDisplayMath',
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range);
      },
      execute: (editor: Editor, _index?: number, latex = '') => {
        const selection = editor.getSelection();
        if (!selection?.range) return;

        const mathData: MathFormulaData = {
          latex,
          displayMode: true
        };

        this.logger.info('Insert display math:', mathData);
        // TODO: Implement insertEmbed method
      }
    },

    editMathFormula: {
      name: 'editMathFormula',
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range);
      },
      execute: (editor: Editor, _index?: number, latex?: string) => {
        const selection = editor.getSelection();
        if (!selection?.range || !latex) return;

        // Find math formula at cursor
        const mathFormula = this.findMathFormulaAtCursor(editor);
        if (mathFormula) {
          const { index, data } = mathFormula;
          const updatedData = { ...data, latex };
          
          this.logger.info('Edit math formula:', updatedData);
          // TODO: Implement updateEmbed method
          this.reRenderMathFormula(editor, index, updatedData);
        }
      }
    }
  };

  override readonly formats: Record<string, Format> = {
    'math-inline': {
      name: 'math-inline',
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
    },
    'math-display': {
      name: 'math-display',
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
    this.loadKaTeXStyles();
  }

  override async uninstall(editor: Editor): Promise<void> {
    await super.uninstall(editor);
    this.removeKaTeXStyles();
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

    // Ctrl+Shift+M for inline math
    // Ctrl+Shift+D for display math
    this.addEventListener(this.editor.getContainer(), 'keydown', (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey) {
        if (event.key === 'M') {
          event.preventDefault();
          this.logger.info('Inline math shortcut triggered');
          // TODO: Implement executeCommand method
        } else if (event.key === 'D') {
          event.preventDefault();
          this.logger.info('Display math shortcut triggered');
          // TODO: Implement executeCommand method
        }
      }
    });
  }

  /**
   * Load KaTeX CSS styles
   */
  private loadKaTeXStyles(): void {
    const styleId = 'katex-styles';
    
    if (document.getElementById(styleId)) {
      return; // Styles already loaded
    }

    const link = document.createElement('link');
    link.id = styleId;
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
    link.integrity = 'sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  /**
   * Remove KaTeX CSS styles
   */
  private removeKaTeXStyles(): void {
    const styleId = 'katex-styles';
    const link = document.getElementById(styleId);
    if (link) {
      link.remove();
    }
  }

  /**
   * Render math formula using KaTeX
   */
  public renderMathFormula(data: MathFormulaData): HTMLElement {
    const container = document.createElement('span');
    container.className = data.displayMode ? 'math-display' : 'math-inline';
    container.setAttribute('data-latex', data.latex);
    container.setAttribute('data-display-mode', data.displayMode.toString());

    try {
      const katexOptions: any = {
        displayMode: data.displayMode,
        throwOnError: this.options.throwOnError || false,
        errorColor: this.options.errorColor || '#cc0000',
        strict: this.options.strict || 'warn',
        trust: this.options.trust || false,
        maxSize: this.options.maxSize || 10,
        maxExpand: this.options.maxExpand || 1000
      };

      if (this.options.macros) {
        katexOptions.macros = this.options.macros;
      }

      katex.render(data.latex, container, katexOptions);
    } catch (error) {
      this.logger.warn('Failed to render math formula:', error);
      container.textContent = data.latex;
      container.className += ' math-error';
    }

    // Add click handler for editing
    container.addEventListener('click', () => {
      this.openMathEditor(data);
    });

    return container;
  }

  /**
   * Parse math formula from HTML
   */
  public parseMathFormula(element: HTMLElement): MathFormulaData {
    const latex = element.getAttribute('data-latex') || '';
    const displayMode = element.getAttribute('data-display-mode') === 'true';
    
    return { latex, displayMode };
  }

  /**
   * Open math formula editor
   */
  private openMathEditor(data: MathFormulaData): void {
    // TODO: Implement math formula editor dialog
    const newLatex = prompt('Edit LaTeX formula:', data.latex);
    if (newLatex !== null) {
      data.latex = newLatex;
      this.logger.info('Math formula updated:', data);
    }
  }

  /**
   * Re-render math formula at specific index
   */
  private reRenderMathFormula(_editor: Editor, _index: number, _data: MathFormulaData): void {
    // Re-render the math formula with updated content
    this.logger.info('Re-rendering math formula at index:', _index);
    // TODO: Implement editor re-rendering
  }

  /**
   * Find math formula at cursor position
   */
  private findMathFormulaAtCursor(_editor: Editor): { index: number; data: MathFormulaData } | null {
    // TODO: Implement finding math formula at cursor
    // This would search through the document for math embeds
    return null;
  }

  /**
   * Validate LaTeX syntax
   */
  public validateLatex(latex: string): { valid: boolean; error?: string } {
    try {
      katex.renderToString(latex, {
        throwOnError: true,
        strict: 'error'
      });
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Invalid LaTeX syntax'
      };
    }
  }

  /**
   * Get LaTeX symbols for autocomplete
   */
  public getLatexSymbols(): typeof LATEX_SYMBOLS {
    return LATEX_SYMBOLS;
  }
}
