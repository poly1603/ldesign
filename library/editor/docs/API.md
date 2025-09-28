# Enhanced Rich Text Editor - API Documentation

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Classes](#core-classes)
- [Plugins](#plugins)
- [Events](#events)
- [Types](#types)
- [Utilities](#utilities)

## Installation

```bash
npm install @ldesign/enhanced-rich-editor
```

## Quick Start

```typescript
import { EnhancedEditor, BasicFormattingPlugin } from '@ldesign/enhanced-rich-editor';
import '@ldesign/enhanced-rich-editor/styles';

// Create editor instance
const editor = new EnhancedEditor('#editor', {
  placeholder: 'Start typing...',
  theme: 'default'
});

// Add plugins
editor.addPlugin(new BasicFormattingPlugin());

// Listen for changes
editor.on('text-change', ({ delta, source }) => {
  console.log('Content changed:', delta, source);
});
```

## Core Classes

### EnhancedEditor

The main editor class that provides the core editing functionality.

#### Constructor

```typescript
new EnhancedEditor(container: string | HTMLElement, options?: EditorOptions)
```

**Parameters:**
- `container`: CSS selector string or HTMLElement to mount the editor
- `options`: Optional configuration object

#### Methods

##### Content Management

```typescript
// Get/set editor contents
getContents(): Delta
setContents(delta: Delta, source?: string): void

// Get text content
getText(): string

// Insert text at position
insertText(index: number, text: string, source?: string): void

// Delete text at position
deleteText(index: number, length: number, source?: string): void

// Format text range
formatText(index: number, length: number, format: string, value: any, source?: string): void
```

##### Selection Management

```typescript
// Get/set selection
getSelection(): Selection | null
setSelection(range: SelectionRange | null, source?: string): void
```

##### Plugin Management

```typescript
// Add/remove plugins
addPlugin(plugin: Plugin): void
removePlugin(name: string): void
hasPlugin(name: string): boolean
```

##### State Management

```typescript
// Focus/blur
focus(): void
blur(): void
hasFocus(): boolean

// Enable/disable
enable(enabled: boolean): void
isEnabled(): boolean

// History
undo(): void
redo(): void
```

##### Lifecycle

```typescript
// Destroy editor
destroy(): void
```

#### Events

```typescript
// Content changes
editor.on('text-change', ({ delta, oldDelta, source }) => {});
editor.on('content-change', ({ delta, oldDelta, source }) => {});

// Selection changes
editor.on('selection-change', ({ selection, oldSelection, source }) => {});

// Focus/blur
editor.on('focus', ({ editor }) => {});
editor.on('blur', ({ editor }) => {});
```

### Delta

Represents document content as a series of operations.

#### Constructor

```typescript
new Delta(ops?: DeltaOperation[])
```

#### Methods

```typescript
// Insert content
insert(text: string | object, attributes?: object): Delta

// Delete content
delete(length: number): Delta

// Retain content
retain(length: number, attributes?: object): Delta

// Compose with another delta
compose(other: Delta): Delta

// Transform against another delta
transform(other: Delta, priority?: boolean): Delta

// Get length
length(): number

// Check equality
isEqual(other: Delta): boolean

// Convert to operations array
ops: DeltaOperation[]
```

### Selection

Represents editor selection state.

#### Constructor

```typescript
new Selection(range?: Range | null, source?: string)
```

#### Methods

```typescript
// Get/set range
getRange(): Range | null
setRange(range: Range | null, source?: string): void

// Check if collapsed
isCollapsed(): boolean

// Clone selection
clone(): Selection
```

### Range

Represents a selection range.

#### Constructor

```typescript
new Range(index: number, length?: number)
```

#### Properties

```typescript
index: number    // Start position
length: number   // Selection length
```

#### Methods

```typescript
// Check if collapsed
isCollapsed(): boolean

// Get end position
getEnd(): number

// Check if contains index
contains(index: number): boolean

// Check if intersects with another range
intersects(other: Range): boolean

// Check equality
equals(other: Range | null): boolean
```

## Plugins

### BasePlugin

Base class for all plugins.

```typescript
abstract class BasePlugin {
  abstract readonly name: string;
  abstract readonly version: string;
  
  // Lifecycle methods
  abstract install(editor: Editor): Promise<void>;
  abstract uninstall(editor: Editor): Promise<void>;
  
  // Commands
  readonly commands: Record<string, Command> = {};
}
```

### Built-in Plugins

#### BasicFormattingPlugin

Provides basic text formatting (bold, italic, underline, etc.).

```typescript
import { BasicFormattingPlugin } from '@ldesign/enhanced-rich-editor';

const plugin = new BasicFormattingPlugin({
  enableKeyboardShortcuts: true,
  formats: ['bold', 'italic', 'underline', 'strike']
});

editor.addPlugin(plugin);
```

**Commands:**
- `toggleBold`
- `toggleItalic`
- `toggleUnderline`
- `toggleStrike`
- `setColor`
- `setBackground`
- `setFont`
- `setSize`

#### HeadingFormattingPlugin

Provides heading and block formatting.

```typescript
import { HeadingFormattingPlugin } from '@ldesign/enhanced-rich-editor';

const plugin = new HeadingFormattingPlugin({
  enableKeyboardShortcuts: true,
  maxLevel: 6
});

editor.addPlugin(plugin);
```

**Commands:**
- `setHeading`
- `toggleBlockquote`
- `toggleCodeBlock`

#### ListFormattingPlugin

Provides list formatting functionality.

```typescript
import { ListFormattingPlugin } from '@ldesign/enhanced-rich-editor';

const plugin = new ListFormattingPlugin({
  enableKeyboardShortcuts: true,
  enableIndentation: true
});

editor.addPlugin(plugin);
```

**Commands:**
- `toggleOrderedList`
- `toggleUnorderedList`
- `indentList`
- `outdentList`

#### MediaFormattingPlugin

Provides media insertion (links, images).

```typescript
import { MediaFormattingPlugin } from '@ldesign/enhanced-rich-editor';

const plugin = new MediaFormattingPlugin({
  enableDragAndDrop: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
});

editor.addPlugin(plugin);
```

**Commands:**
- `insertLink`
- `insertImage`
- `uploadImage`

#### TableFormattingPlugin

Provides table editing functionality.

```typescript
import { TableFormattingPlugin } from '@ldesign/enhanced-rich-editor';

const plugin = new TableFormattingPlugin({
  enableKeyboardShortcuts: true,
  defaultRows: 3,
  defaultCols: 3
});

editor.addPlugin(plugin);
```

**Commands:**
- `insertTable`
- `insertTableRow`
- `insertTableColumn`
- `deleteTableRow`
- `deleteTableColumn`

#### CodeHighlightingPlugin

Provides syntax highlighting for code blocks.

```typescript
import { CodeHighlightingPlugin } from '@ldesign/enhanced-rich-editor';

const plugin = new CodeHighlightingPlugin({
  languages: ['javascript', 'typescript', 'python', 'html', 'css'],
  theme: 'default',
  showLineNumbers: true
});

editor.addPlugin(plugin);
```

**Commands:**
- `insertCodeBlock`
- `setCodeLanguage`

#### MathFormulaPlugin

Provides LaTeX math formula editing.

```typescript
import { MathFormulaPlugin } from '@ldesign/enhanced-rich-editor';

const plugin = new MathFormulaPlugin({
  enableInlineMath: true,
  enableDisplayMath: true,
  showSymbolPalette: true
});

editor.addPlugin(plugin);
```

**Commands:**
- `insertInlineMath`
- `insertDisplayMath`
- `editMathFormula`

#### MobileAccessibilityPlugin

Provides mobile and accessibility enhancements.

```typescript
import { MobileAccessibilityPlugin } from '@ldesign/enhanced-rich-editor';

const plugin = new MobileAccessibilityPlugin({
  enableTouchGestures: true,
  enableVoiceCommands: false,
  announceChanges: true,
  highContrastMode: false
});

editor.addPlugin(plugin);
```

**Commands:**
- `toggleHighContrast`
- `toggleLargeText`
- `announceSelection`

#### CollaborativeEditingPlugin

Provides real-time collaborative editing.

```typescript
import { CollaborativeEditingPlugin } from '@ldesign/enhanced-rich-editor';

const plugin = new CollaborativeEditingPlugin({
  serverUrl: 'ws://localhost:8080',
  clientName: 'User 1',
  enableCursors: true,
  enablePresence: true
});

editor.addPlugin(plugin);
```

**Commands:**
- `connect`
- `disconnect`
- `syncState`

## Events

### Event System

The editor uses a type-safe event system based on EventEmitter.

```typescript
// Listen to events
editor.on('text-change', handler);

// Listen once
editor.once('text-change', handler);

// Remove listener
editor.off('text-change', handler);

// Remove all listeners
editor.removeAllListeners('text-change');
```

### Event Types

#### text-change

Fired when document content changes.

```typescript
interface TextChangeEvent {
  delta: Delta;      // Change delta
  oldDelta: Delta;   // Previous content
  source: string;    // Change source ('user', 'api', 'silent')
}
```

#### selection-change

Fired when selection changes.

```typescript
interface SelectionChangeEvent {
  selection: Selection;     // New selection
  oldSelection: Selection;  // Previous selection
  source: string;          // Change source
}
```

#### focus/blur

Fired when editor gains/loses focus.

```typescript
interface FocusEvent {
  editor: EnhancedEditor;
}
```

## Types

### EditorOptions

```typescript
interface EditorOptions {
  theme?: string;                    // Editor theme
  placeholder?: string;              // Placeholder text
  readOnly?: boolean;               // Read-only mode
  modules?: Record<string, any>;    // Module configurations
  formats?: string[];               // Allowed formats
  debug?: boolean;                  // Debug mode
}
```

### DeltaOperation

```typescript
interface DeltaOperation {
  insert?: string | Record<string, any>;  // Insert operation
  delete?: number;                        // Delete operation
  retain?: number;                        // Retain operation
  attributes?: Record<string, any>;       // Operation attributes
}
```

### SelectionRange

```typescript
interface SelectionRange {
  index: number;   // Start position
  length: number;  // Selection length
}
```

### Plugin

```typescript
interface Plugin {
  name: string;                                    // Plugin name
  version: string;                                // Plugin version
  dependencies?: string[];                        // Plugin dependencies
  install(editor: Editor): Promise<void>;         // Install method
  uninstall(editor: Editor): Promise<void>;       // Uninstall method
  commands?: Record<string, Command>;             // Plugin commands
}
```

### Command

```typescript
interface Command {
  name: string;                                   // Command name
  canExecute(editor: Editor, ...args: any[]): boolean;  // Can execute check
  execute(editor: Editor, ...args: any[]): void;        // Execute method
}
```

## Utilities

### Performance Monitoring

```typescript
import { performanceMonitor, PerformanceMonitor } from '@ldesign/enhanced-rich-editor';

// Use global monitor
performanceMonitor.recordMetrics({
  renderTime: 16.5,
  updateTime: 8.2
});

// Create custom monitor
const monitor = new PerformanceMonitor();
const result = monitor.measure('operation', () => {
  // Your code here
});
```

### Virtual Scrolling

```typescript
import { VirtualScroller } from '@ldesign/enhanced-rich-editor';

const scroller = new VirtualScroller(
  container,
  itemHeight,
  (startIndex, endIndex) => {
    // Render visible items
  }
);

scroller.setTotalCount(1000);
scroller.scrollToItem(500);
```

### Lazy Loading

```typescript
import { LazyLoader } from '@ldesign/enhanced-rich-editor';

const loader = new LazyLoader((element) => {
  // Load content for element
});

loader.observe(element);
```

### Utility Functions

```typescript
import { debounce, throttle } from '@ldesign/enhanced-rich-editor';

// Debounce function calls
const debouncedFn = debounce(fn, 300);

// Throttle function calls
const throttledFn = throttle(fn, 100);
```
