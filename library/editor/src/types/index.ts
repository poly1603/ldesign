/**
 * Enhanced Rich Text Editor - Type Definitions
 * 
 * This file contains all the core type definitions for the editor.
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Editor configuration options
 */
export interface EditorOptions {
  /** Editor theme */
  theme?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Read-only mode */
  readOnly?: boolean;
  /** Module configurations */
  modules?: Record<string, any>;
  /** Custom formats */
  formats?: string[];
  /** Debug mode */
  debug?: boolean;
}

/**
 * Document node structure
 */
export interface DocumentNode {
  /** Node type */
  type: string;
  /** Node attributes */
  attributes?: Record<string, any>;
  /** Child nodes */
  children?: DocumentNode[];
  /** Text content (for text nodes) */
  text?: string;
}

/**
 * Selection range
 */
export interface SelectionRange {
  /** Start index */
  index: number;
  /** Selection length */
  length: number;
}

/**
 * Editor selection state
 */
export interface Selection {
  /** Selection range */
  range: SelectionRange | null;
  /** Selection source */
  source: string;
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Editor event data
 */
export interface EditorEventData {
  'content-change': {
    delta: Delta;
    oldDelta: Delta;
    source: string;
  };
  'selection-change': {
    selection: Selection;
    oldSelection: Selection;
    source: string;
  };
  'text-change': {
    delta: Delta;
    oldDelta: Delta;
    source: string;
  };
  'editor-change': {
    eventName: string;
    args: any[];
  };
  'focus': {
    editor: Editor;
  };
  'blur': {
    editor: Editor;
  };
}

/**
 * Event handler type
 */
export type EventHandler<T = any> = (data: T) => void;

// ============================================================================
// Delta Types (Operation-based document format)
// ============================================================================

/**
 * Delta operation
 */
export interface DeltaOperation {
  /** Insert operation */
  insert?: string | Record<string, any>;
  /** Delete operation */
  delete?: number;
  /** Retain operation */
  retain?: number;
  /** Operation attributes */
  attributes?: Record<string, any>;
}

/**
 * Delta document format
 */
export interface Delta {
  /** Operations array */
  ops: DeltaOperation[];
  
  /** Insert content */
  insert(text: string | Record<string, any>, attributes?: Record<string, any>): Delta;
  /** Delete content */
  delete(length: number): Delta;
  /** Retain content */
  retain(length: number, attributes?: Record<string, any>): Delta;
  /** Compose with another delta */
  compose(other: Delta): Delta;
  /** Transform against another delta */
  transform(other: Delta, priority?: boolean): Delta;
  /** Invert delta against base */
  invert(base: Delta): Delta;
  /** Remove trailing retain */
  chop(): Delta;
  /** Get delta length */
  length(): number;
}

// ============================================================================
// Plugin System Types
// ============================================================================

/**
 * Plugin interface
 */
export interface Plugin {
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Plugin dependencies */
  dependencies?: string[];
  
  /** Install plugin */
  install(editor: Editor): void;
  /** Uninstall plugin */
  uninstall(editor: Editor): void;
  
  /** Plugin commands */
  commands?: Record<string, Command>;
  /** Plugin formats */
  formats?: Record<string, Format>;
  /** Plugin UI components */
  ui?: UIComponent[];
}

/**
 * Command interface
 */
export interface Command {
  /** Command name */
  name: string;
  /** Execute command */
  execute(editor: Editor, ...args: any[]): any;
  /** Check if command can execute */
  canExecute?(editor: Editor, ...args: any[]): boolean;
}

/**
 * Format interface
 */
export interface Format {
  /** Format name */
  name: string;
  /** Format type */
  type: 'inline' | 'block' | 'embed';
  /** Apply format */
  apply(editor: Editor, range: SelectionRange, value: any): void;
  /** Remove format */
  remove(editor: Editor, range: SelectionRange): void;
  /** Get format value */
  getValue(editor: Editor, range: SelectionRange): any;
}

/**
 * UI Component interface
 */
export interface UIComponent {
  /** Component name */
  name: string;
  /** Component type */
  type: 'button' | 'dropdown' | 'input' | 'custom';
  /** Render component */
  render(container: HTMLElement, editor: Editor): void;
  /** Destroy component */
  destroy?(): void;
}

// ============================================================================
// Editor Core Types
// ============================================================================

/**
 * Main Editor interface
 */
export interface Editor {
  /** Get editor content as Delta */
  getContents(): Delta;
  /** Set editor content */
  setContents(delta: Delta, source?: string): void;
  /** Get text content */
  getText(index?: number, length?: number): string;
  /** Get selection */
  getSelection(): Selection | null;
  /** Set selection */
  setSelection(range: SelectionRange | null, source?: string): void;
  
  /** Insert text */
  insertText(index: number, text: string, source?: string): void;
  /** Insert embed */
  insertEmbed(index: number, type: string, value: any, source?: string): void;
  /** Delete text */
  deleteText(index: number, length: number, source?: string): void;
  
  /** Format text */
  formatText(index: number, length: number, format: string, value: any, source?: string): void;
  /** Format line */
  formatLine(index: number, length: number, format: string, value: any, source?: string): void;
  /** Remove format */
  removeFormat(index: number, length: number, source?: string): void;
  
  /** Get format */
  getFormat(range?: SelectionRange): Record<string, any>;
  /** Get line format */
  getLineFormat(index?: number): Record<string, any>;
  
  /** Focus editor */
  focus(): void;
  /** Blur editor */
  blur(): void;
  /** Check if editor has focus */
  hasFocus(): boolean;
  
  /** Enable/disable editor */
  enable(enabled?: boolean): void;
  /** Check if editor is enabled */
  isEnabled(): boolean;
  
  /** Add event listener */
  on<K extends keyof EditorEventData>(event: K, handler: EventHandler<EditorEventData[K]>): void;
  /** Remove event listener */
  off<K extends keyof EditorEventData>(event: K, handler?: EventHandler<EditorEventData[K]>): void;
  /** Emit event */
  emit<K extends keyof EditorEventData>(event: K, data: EditorEventData[K]): void;
  
  /** Get editor root element */
  getRoot(): HTMLElement;
  /** Get editor container */
  getContainer(): HTMLElement;
  
  /** Destroy editor */
  destroy(): void;
}

// ============================================================================
// Module Types
// ============================================================================

/**
 * Editor module interface
 */
export interface Module {
  /** Module name */
  name: string;
  /** Initialize module */
  init(editor: Editor, options: any): void;
  /** Destroy module */
  destroy?(): void;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Event emitter interface
 */
export interface EventEmitter<T = Record<string, any>> {
  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void;
  off<K extends keyof T>(event: K, handler?: EventHandler<T[K]>): void;
  emit<K extends keyof T>(event: K, data: T[K]): void;
  removeAllListeners(event?: keyof T): void;
}

/**
 * Disposable interface
 */
export interface Disposable {
  dispose(): void;
}

/**
 * Source types for operations
 */
export type Source = 'api' | 'user' | 'silent';
