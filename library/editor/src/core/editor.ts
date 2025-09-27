/**
 * Enhanced Rich Text Editor - Core Editor
 * 
 * Main editor class that orchestrates all components.
 */

import type {
  Editor as IEditor,
  EditorOptions,
  EditorEventData,
  SelectionRange,
  Delta as IDelta
} from '@/types';
import { EventEmitter } from '@/utils/event-emitter';
import { logger } from '@/utils/logger';
import { Delta } from './delta';
import { Selection, SelectionManager, Range } from './selection';
import { PluginManager } from './plugin-manager';
import { CommandManager } from './command-manager';
import { DocumentRenderer } from './renderer';
import { HistoryManager } from './history';

/**
 * Default editor options
 */
const DEFAULT_OPTIONS: EditorOptions = {
  theme: 'snow',
  placeholder: '',
  readOnly: false,
  modules: {},
  formats: [],
  debug: false,
};

/**
 * Enhanced Rich Text Editor implementation
 */
export class EnhancedEditor extends EventEmitter<EditorEventData> implements IEditor {
  private container: HTMLElement;
  private root!: HTMLElement;
  private options: EditorOptions;
  private content: Delta;
  private selectionManager: SelectionManager;
  private pluginManager: PluginManager;
  private commandManager: CommandManager;
  private renderer: DocumentRenderer;
  private historyManager: HistoryManager;
  private enabled = true;
  private focused = false;

  constructor(container: string | HTMLElement, options: Partial<EditorOptions> = {}) {
    super();

    // Resolve container element
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(`Container element "${container}" not found`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = container;
    }

    // Merge options
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // Initialize content
    this.content = new Delta();

    // Setup logger
    if (this.options.debug) {
      logger.setLevel(0); // DEBUG level
    }

    // Initialize components
    this.setupDOM();
    this.selectionManager = new SelectionManager(this.root);
    this.pluginManager = new PluginManager();
    this.commandManager = new CommandManager(this);
    this.renderer = new DocumentRenderer();
    this.historyManager = new HistoryManager(this);

    // Setup event listeners
    this.setupEventListeners();

    // Initialize editor
    this.initialize();

    logger.info('Enhanced Rich Text Editor initialized');
  }

  /**
   * Get editor content as Delta
   */
  getContents(): IDelta {
    return new Delta(this.content.ops);
  }

  /**
   * Set editor content
   */
  setContents(delta: IDelta, source = 'api'): void {
    const oldDelta = this.content;
    this.content = new Delta(delta.ops);
    
    // Update DOM
    this.renderContent();

    // Emit events
    this.emit('content-change', {
      delta: this.content,
      oldDelta,
      source,
    });

    this.emit('text-change', {
      delta: this.content,
      oldDelta,
      source,
    });
  }

  /**
   * Get text content
   */
  getText(index?: number, length?: number): string {
    // This is a simplified implementation
    // In a real implementation, you would extract text from the Delta
    const text = this.root.textContent || '';
    
    if (index === undefined) {
      return text;
    }

    const start = Math.max(0, index);
    const end = length !== undefined ? start + length : text.length;
    
    return text.substring(start, Math.min(end, text.length));
  }

  /**
   * Get selection
   */
  getSelection(): Selection | null {
    return this.selectionManager.getSelection();
  }

  /**
   * Set selection
   */
  setSelection(range: SelectionRange | null, source = 'api'): void {
    const selectionRange = range ? new Range(range.index, range.length) : null;
    this.selectionManager.setSelection(selectionRange, source);
  }

  /**
   * Insert text
   */
  insertText(index: number, text: string, source = 'api'): void {
    const delta = new Delta()
      .retain(index)
      .insert(text);
    
    this.applyDelta(delta, source);
  }

  /**
   * Insert embed
   */
  insertEmbed(index: number, type: string, value: any, source = 'api'): void {
    const embed = { [type]: value };
    const delta = new Delta()
      .retain(index)
      .insert(embed);
    
    this.applyDelta(delta, source);
  }

  /**
   * Delete text
   */
  deleteText(index: number, length: number, source = 'api'): void {
    const delta = new Delta()
      .retain(index)
      .delete(length);
    
    this.applyDelta(delta, source);
  }

  /**
   * Format text
   */
  formatText(index: number, length: number, format: string, value: any, source = 'api'): void {
    const delta = new Delta()
      .retain(index)
      .retain(length, { [format]: value });
    
    this.applyDelta(delta, source);
  }

  /**
   * Format line
   */
  formatLine(index: number, length: number, format: string, value: any, source = 'api'): void {
    // This is a simplified implementation
    // In a real implementation, you would handle line-level formatting
    this.formatText(index, length, format, value, source);
  }

  /**
   * Remove format
   */
  removeFormat(index: number, length: number, source = 'api'): void {
    // This is a simplified implementation
    // In a real implementation, you would remove all formatting
    const delta = new Delta()
      .retain(index)
      .retain(length, {});
    
    this.applyDelta(delta, source);
  }

  /**
   * Get format at range
   */
  getFormat(_range?: SelectionRange): Record<string, any> {
    // This is a simplified implementation
    // In a real implementation, you would extract formatting from the Delta
    return {};
  }

  /**
   * Get line format
   */
  getLineFormat(_index?: number): Record<string, any> {
    // This is a simplified implementation
    return {};
  }

  /**
   * Focus editor
   */
  focus(): void {
    this.root.focus();
    this.focused = true;
    this.emit('focus', { editor: this });
  }

  /**
   * Blur editor
   */
  blur(): void {
    this.root.blur();
    this.focused = false;
    this.emit('blur', { editor: this });
  }

  /**
   * Check if editor has focus
   */
  hasFocus(): boolean {
    return this.focused;
  }

  /**
   * Enable/disable editor
   */
  enable(enabled = true): void {
    this.enabled = enabled;
    this.root.contentEditable = enabled ? 'true' : 'false';
    
    if (enabled) {
      this.container.classList.remove('enhanced-rich-editor__container--disabled');
    } else {
      this.container.classList.add('enhanced-rich-editor__container--disabled');
    }
  }

  /**
   * Check if editor is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get editor root element
   */
  getRoot(): HTMLElement {
    return this.root;
  }

  /**
   * Get editor container
   */
  getContainer(): HTMLElement {
    return this.container;
  }

  /**
   * Undo last change
   */
  undo(): boolean {
    return this.historyManager.undo();
  }

  /**
   * Redo last undone change
   */
  redo(): boolean {
    return this.historyManager.redo();
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.historyManager.canUndo();
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.historyManager.canRedo();
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.historyManager.clear();
  }

  /**
   * Destroy editor
   */
  destroy(): void {
    // Unload plugins
    this.pluginManager.unloadPlugins(this);

    // Dispose components
    this.selectionManager.dispose();
    this.pluginManager.dispose();
    this.commandManager.dispose();
    this.historyManager.dispose();

    // Remove event listeners
    this.removeAllListeners();

    // Clean up DOM
    this.container.innerHTML = '';
    this.container.classList.remove('enhanced-rich-editor');

    logger.info('Enhanced Rich Text Editor destroyed');
  }

  /**
   * Setup DOM structure
   */
  private setupDOM(): void {
    // Add editor class
    this.container.classList.add('enhanced-rich-editor');

    // Create container structure
    this.container.innerHTML = `
      <div class="enhanced-rich-editor__container">
        <div class="enhanced-rich-editor__content" contenteditable="true"></div>
      </div>
    `;

    // Get root element
    this.root = this.container.querySelector('.enhanced-rich-editor__content') as HTMLElement;

    // Set placeholder
    if (this.options.placeholder) {
      this.root.setAttribute('data-placeholder', this.options.placeholder);
    }

    // Set initial state
    this.enable(this.enabled);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Selection change events
    this.selectionManager.on('selection-change', (data) => {
      if (data.oldSelection) {
        this.emit('selection-change', {
          selection: data.selection,
          oldSelection: data.oldSelection,
          source: data.source,
        });
      }
    });

    // Focus/blur events
    this.root.addEventListener('focus', () => {
      this.focused = true;
      this.emit('focus', { editor: this });
    });

    this.root.addEventListener('blur', () => {
      this.focused = false;
      this.emit('blur', { editor: this });
    });

    // Input events
    this.root.addEventListener('input', this.handleInput.bind(this));
  }

  /**
   * Handle input events
   */
  private handleInput(_event: Event): void {
    // This is a simplified implementation
    // In a real implementation, you would convert DOM changes to Delta operations
    const text = this.root.textContent || '';
    const delta = new Delta().insert(text);
    
    const oldDelta = this.content;
    this.content = delta;

    this.emit('content-change', {
      delta: this.content,
      oldDelta,
      source: 'user',
    });

    this.emit('text-change', {
      delta: this.content,
      oldDelta,
      source: 'user',
    });
  }

  /**
   * Apply delta to content
   */
  private applyDelta(delta: IDelta, source = 'api'): void {
    const oldDelta = this.content;
    this.content = this.content.compose(new Delta(delta.ops));
    
    // Update DOM
    this.renderContent();

    // Emit events
    this.emit('content-change', {
      delta: this.content,
      oldDelta,
      source,
    });

    this.emit('text-change', {
      delta: this.content,
      oldDelta,
      source,
    });
  }

  /**
   * Render content to DOM
   */
  private renderContent(): void {
    this.renderer.renderToContainer(this.content, this.root);
  }

  /**
   * Initialize editor
   */
  private async initialize(): Promise<void> {
    try {
      // Load plugins
      await this.pluginManager.loadPlugins(this);
      
      // Set initial content
      if (this.root.innerHTML.trim() === '') {
        this.root.innerHTML = '<p><br></p>';
      }

      logger.debug('Editor initialization complete');
    } catch (error) {
      logger.error('Failed to initialize editor:', error);
      throw error;
    }
  }
}
