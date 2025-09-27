/**
 * Toolbar Component
 * 
 * Provides a configurable toolbar for the rich text editor.
 */

import type { Editor, UIComponent } from '@/types';
import { EventEmitter } from '@/utils/event-emitter';
import { logger } from '@/utils/logger';

/**
 * Toolbar button configuration
 */
export interface ToolbarButton {
  name: string;
  label: string;
  icon?: string;
  command: string;
  args?: any[];
  tooltip?: string;
  className?: string;
  group?: string;
}

/**
 * Toolbar separator
 */
export interface ToolbarSeparator {
  type: 'separator';
  group?: string;
}

/**
 * Toolbar dropdown configuration
 */
export interface ToolbarDropdown {
  name: string;
  label: string;
  icon?: string;
  tooltip?: string;
  className?: string;
  group?: string;
  options: Array<{
    label: string;
    value: any;
    command: string;
    args?: any[];
  }>;
}

/**
 * Toolbar item type
 */
export type ToolbarItem = ToolbarButton | ToolbarSeparator | ToolbarDropdown;

/**
 * Toolbar configuration
 */
export interface ToolbarConfig {
  items: ToolbarItem[];
  className?: string;
  groups?: Record<string, { label?: string; className?: string }>;
}

/**
 * Toolbar events
 */
interface ToolbarEvents {
  'button-click': { button: ToolbarButton; editor: Editor };
  'dropdown-change': { dropdown: ToolbarDropdown; value: any; editor: Editor };
}

/**
 * Default toolbar configuration
 */
const DEFAULT_CONFIG: ToolbarConfig = {
  items: [
    // Formatting group
    { name: 'bold', label: 'B', command: 'bold', tooltip: 'Bold (Ctrl+B)', group: 'format' },
    { name: 'italic', label: 'I', command: 'italic', tooltip: 'Italic (Ctrl+I)', group: 'format' },
    { name: 'underline', label: 'U', command: 'underline', tooltip: 'Underline (Ctrl+U)', group: 'format' },
    { name: 'strike', label: 'S', command: 'strike', tooltip: 'Strikethrough', group: 'format' },
    { type: 'separator', group: 'format' },
    
    // History group
    { name: 'undo', label: '↶', command: 'undo', tooltip: 'Undo (Ctrl+Z)', group: 'history' },
    { name: 'redo', label: '↷', command: 'redo', tooltip: 'Redo (Ctrl+Y)', group: 'history' },
  ],
  className: 'enhanced-rich-editor__toolbar',
  groups: {
    format: { label: 'Formatting' },
    history: { label: 'History' }
  }
};

/**
 * Toolbar component implementation
 */
export class Toolbar extends EventEmitter<ToolbarEvents> implements UIComponent {
  readonly name = 'toolbar';
  readonly type = 'custom' as const;
  
  private editor: Editor;
  private config: ToolbarConfig;
  private container: HTMLElement;
  private buttons = new Map<string, HTMLButtonElement>();
  private dropdowns = new Map<string, HTMLSelectElement>();

  constructor(editor: Editor, config: Partial<ToolbarConfig> = {}) {
    super();
    this.editor = editor;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.container = this.createContainer();
    this.render();
    this.setupEventListeners();
  }

  /**
   * Get toolbar container element
   */
  getElement(): HTMLElement {
    return this.container;
  }

  /**
   * Update toolbar state based on editor state
   */
  updateState(): void {
    const selection = this.editor.getSelection();
    const format = selection ? this.editor.getFormat(selection.range || undefined) : {};

    // Update button states
    this.buttons.forEach((button, name) => {
      const isActive = this.isFormatActive(name, format);
      button.classList.toggle('active', isActive);
      
      // Update disabled state
      const canExecute = this.canExecuteCommand(name);
      button.disabled = !canExecute;
    });

    // Update dropdown states
    this.dropdowns.forEach((dropdown, name) => {
      const value = this.getFormatValue(name, format);
      if (value !== undefined) {
        dropdown.value = value;
      }
    });
  }

  /**
   * Add a button to the toolbar
   */
  addButton(button: ToolbarButton): void {
    const buttonElement = this.createButton(button);
    this.insertItem(buttonElement, button.group);
    this.buttons.set(button.name, buttonElement);
  }

  /**
   * Remove a button from the toolbar
   */
  removeButton(name: string): void {
    const button = this.buttons.get(name);
    if (button) {
      button.remove();
      this.buttons.delete(name);
    }
  }

  /**
   * Add a dropdown to the toolbar
   */
  addDropdown(dropdown: ToolbarDropdown): void {
    const dropdownElement = this.createDropdown(dropdown);
    this.insertItem(dropdownElement, dropdown.group);
    this.dropdowns.set(dropdown.name, dropdownElement);
  }

  /**
   * Remove a dropdown from the toolbar
   */
  removeDropdown(name: string): void {
    const dropdown = this.dropdowns.get(name);
    if (dropdown) {
      dropdown.remove();
      this.dropdowns.delete(name);
    }
  }

  /**
   * Create toolbar container
   */
  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = this.config.className || 'enhanced-rich-editor__toolbar';
    container.setAttribute('role', 'toolbar');
    return container;
  }

  /**
   * Render toolbar items
   */
  render(): void {
    this.container.innerHTML = '';
    
    for (const item of this.config.items) {
      if ('type' in item && item.type === 'separator') {
        const separator = this.createSeparator();
        this.insertItem(separator, item.group);
      } else if ('options' in item) {
        // Dropdown
        const dropdown = this.createDropdown(item);
        this.insertItem(dropdown, item.group);
        this.dropdowns.set(item.name, dropdown);
      } else if ('name' in item) {
        // Button
        const button = this.createButton(item as ToolbarButton);
        this.insertItem(button, item.group);
        this.buttons.set(item.name, button);
      }
    }
  }

  /**
   * Create a toolbar button
   */
  private createButton(config: ToolbarButton): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `toolbar-button ${config.className || ''}`;
    button.textContent = config.label;
    button.title = config.tooltip || config.label;
    button.setAttribute('data-command', config.command);
    
    if (config.icon) {
      button.innerHTML = `<i class="${config.icon}"></i>`;
    }

    button.addEventListener('click', (e) => {
      e.preventDefault();
      this.executeCommand(config.command, config.args);
      this.emit('button-click', { button: config, editor: this.editor });
    });

    return button;
  }

  /**
   * Create a toolbar dropdown
   */
  private createDropdown(config: ToolbarDropdown): HTMLSelectElement {
    const select = document.createElement('select');
    select.className = `toolbar-dropdown ${config.className || ''}`;
    select.title = config.tooltip || config.label;

    for (const option of config.options) {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      select.appendChild(optionElement);
    }

    select.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      const selectedOption = config.options.find(opt => opt.value === target.value);
      if (selectedOption) {
        this.executeCommand(selectedOption.command, selectedOption.args);
        this.emit('dropdown-change', { dropdown: config, value: target.value, editor: this.editor });
      }
    });

    return select;
  }

  /**
   * Create a toolbar separator
   */
  private createSeparator(): HTMLElement {
    const separator = document.createElement('div');
    separator.className = 'toolbar-separator';
    separator.setAttribute('role', 'separator');
    return separator;
  }

  /**
   * Insert item into appropriate group
   */
  private insertItem(element: HTMLElement, group?: string): void {
    if (group && this.config.groups?.[group]) {
      let groupContainer = this.container.querySelector(`[data-group="${group}"]`) as HTMLElement;
      if (!groupContainer) {
        groupContainer = document.createElement('div');
        groupContainer.className = `toolbar-group ${this.config.groups[group].className || ''}`;
        groupContainer.setAttribute('data-group', group);
        this.container.appendChild(groupContainer);
      }
      groupContainer.appendChild(element);
    } else {
      this.container.appendChild(element);
    }
  }

  /**
   * Execute a command
   */
  private executeCommand(command: string, args: any[] = []): void {
    try {
      this.editor.focus();
      // Use command manager if available
      if ('execute' in this.editor && typeof this.editor.execute === 'function') {
        (this.editor as any).execute(command, ...args);
      } else {
        // Fallback to direct method calls
        if (command in this.editor && typeof (this.editor as any)[command] === 'function') {
          (this.editor as any)[command](...args);
        } else {
          logger.warn(`Command "${command}" not found`);
        }
      }
    } catch (error) {
      logger.error(`Failed to execute command "${command}":`, error);
    }
  }

  /**
   * Check if a format is active
   */
  private isFormatActive(name: string, format: Record<string, any>): boolean {
    switch (name) {
      case 'bold':
        return !!format.bold;
      case 'italic':
        return !!format.italic;
      case 'underline':
        return !!format.underline;
      case 'strike':
        return !!format.strike;
      default:
        return false;
    }
  }

  /**
   * Get format value for dropdown
   */
  private getFormatValue(name: string, format: Record<string, any>): any {
    return format[name];
  }

  /**
   * Check if command can be executed
   */
  private canExecuteCommand(name: string): boolean {
    switch (name) {
      case 'undo':
        // TODO: Implement canUndo check
        return this.editor.isEnabled();
      case 'redo':
        // TODO: Implement canRedo check
        return this.editor.isEnabled();
      default:
        return this.editor.isEnabled();
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Update toolbar state when selection changes
    this.editor.on('selection-change', () => {
      this.updateState();
    });

    // Update toolbar state when content changes
    this.editor.on('text-change', () => {
      this.updateState();
    });

    // Update toolbar state when editor focus changes
    this.editor.on('focus', () => {
      this.updateState();
    });

    this.editor.on('blur', () => {
      this.updateState();
    });
  }

  /**
   * Dispose of the toolbar
   */
  override dispose(): void {
    this.container.remove();
    this.buttons.clear();
    this.dropdowns.clear();
    super.dispose();
  }
}
