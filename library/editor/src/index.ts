/**
 * Enhanced Rich Text Editor
 * 
 * A modern, extensible rich text editor with advanced features.
 * 
 * @author LDesign Team
 * @version 0.1.0
 */

// Core exports
export { EnhancedEditor } from './core/editor';
export { Delta } from './core/delta';
export { Selection, Range, SelectionManager } from './core/selection';
export { CommandManager } from './core/command-manager';
export { DocumentRenderer } from './core/renderer';
export { HistoryManager } from './core/history';
export { FormatConverter } from './core/format-converter';
export { CollaborativeEngine, OperationalTransform } from './core/collaborative-engine';

// Plugin system
export { PluginManager } from './core/plugin-manager';
export { BasePlugin, SimplePlugin } from './plugins/base-plugin';
export { BasicFormattingPlugin } from './plugins/basic-formatting';
export { ListFormattingPlugin } from './plugins/list-formatting';
export { HeadingFormattingPlugin } from './plugins/heading-formatting';
export { MediaFormattingPlugin } from './plugins/media-formatting';
export { TableFormattingPlugin } from './plugins/table-formatting';
export { CodeHighlightingPlugin } from './plugins/code-highlighting';
export { MathFormulaPlugin } from './plugins/math-formula';
export { MobileAccessibilityPlugin } from './plugins/mobile-accessibility';
export { CollaborativeEditingPlugin } from './plugins/collaborative-editing';

// UI components
export { Toolbar } from './ui/toolbar';

// Framework adapters are available in separate files:
// - ./adapters/react/index.tsx for React
// - ./adapters/vue/index.ts for Vue
// - ./adapters/angular/index.ts for Angular

// Utilities
export { EventEmitter } from './utils/event-emitter';
export { Logger } from './utils/logger';
export {
  PerformanceMonitor,
  VirtualScroller,
  LazyLoader,
  debounce,
  throttle,
  performanceMonitor
} from './utils/performance';

// Types
export type {
  Editor,
  EditorOptions,
  Plugin,
  Command,
  Format,
  UIComponent,
  Module,
  DocumentNode,
  SelectionRange,
  DeltaOperation,
  EventHandler,
  EditorEventData,
  Source,
} from './types';

// Version
export const VERSION = '0.1.0';

// Default export
export { EnhancedEditor as default } from './core/editor';
