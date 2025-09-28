# Enhanced Rich Text Editor - Usage Guide

## Table of Contents

- [Getting Started](#getting-started)
- [Basic Usage](#basic-usage)
- [Advanced Features](#advanced-features)
- [Customization](#customization)
- [Framework Integration](#framework-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Installation

```bash
# Using npm
npm install @ldesign/enhanced-rich-editor

# Using yarn
yarn add @ldesign/enhanced-rich-editor

# Using pnpm
pnpm add @ldesign/enhanced-rich-editor
```

### Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Editor</title>
  <!-- Include editor styles -->
  <link rel="stylesheet" href="node_modules/@ldesign/enhanced-rich-editor/dist/style.css">
</head>
<body>
  <!-- Editor container -->
  <div id="editor"></div>
  
  <!-- Include editor script -->
  <script type="module">
    import { EnhancedEditor, BasicFormattingPlugin } from '@ldesign/enhanced-rich-editor';
    
    // Create editor
    const editor = new EnhancedEditor('#editor', {
      placeholder: 'Start typing...',
      theme: 'default'
    });
    
    // Add basic formatting
    editor.addPlugin(new BasicFormattingPlugin());
  </script>
</body>
</html>
```

## Basic Usage

### Creating an Editor

```typescript
import { EnhancedEditor } from '@ldesign/enhanced-rich-editor';

// Basic editor
const editor = new EnhancedEditor('#editor');

// With options
const editor = new EnhancedEditor('#editor', {
  placeholder: 'Enter your text here...',
  theme: 'snow',
  readOnly: false,
  debug: false
});
```

### Working with Content

```typescript
import { Delta } from '@ldesign/enhanced-rich-editor';

// Set initial content
const initialContent = new Delta()
  .insert('Hello ')
  .insert('World', { bold: true })
  .insert('!\n');

editor.setContents(initialContent);

// Get current content
const currentContent = editor.getContents();
console.log(currentContent);

// Get plain text
const text = editor.getText();
console.log(text); // "Hello World!\n"

// Insert text at position
editor.insertText(6, 'Beautiful ', 'user');

// Delete text
editor.deleteText(0, 5, 'user'); // Remove "Hello"

// Format text
editor.formatText(0, 5, 'bold', true, 'user');
```

### Handling Events

```typescript
// Listen for content changes
editor.on('text-change', ({ delta, oldDelta, source }) => {
  console.log('Content changed:', delta);
  console.log('Source:', source); // 'user', 'api', or 'silent'
  
  // Save to server
  if (source === 'user') {
    saveToServer(delta);
  }
});

// Listen for selection changes
editor.on('selection-change', ({ selection, oldSelection, source }) => {
  console.log('Selection changed:', selection.range);
});

// Listen for focus/blur
editor.on('focus', () => {
  console.log('Editor focused');
});

editor.on('blur', () => {
  console.log('Editor blurred');
});
```

### Managing Selection

```typescript
import { Range } from '@ldesign/enhanced-rich-editor';

// Get current selection
const selection = editor.getSelection();
if (selection && selection.range) {
  console.log('Selected range:', selection.range.index, selection.range.length);
}

// Set selection
const range = new Range(0, 5); // Select first 5 characters
editor.setSelection(range, 'api');

// Clear selection
editor.setSelection(null, 'api');
```

## Advanced Features

### Using Plugins

```typescript
import { 
  BasicFormattingPlugin,
  HeadingFormattingPlugin,
  ListFormattingPlugin,
  MediaFormattingPlugin,
  TableFormattingPlugin,
  CodeHighlightingPlugin,
  MathFormulaPlugin
} from '@ldesign/enhanced-rich-editor';

// Add multiple plugins
editor.addPlugin(new BasicFormattingPlugin());
editor.addPlugin(new HeadingFormattingPlugin());
editor.addPlugin(new ListFormattingPlugin());
editor.addPlugin(new MediaFormattingPlugin({
  enableDragAndDrop: true,
  maxFileSize: 5 * 1024 * 1024 // 5MB
}));
editor.addPlugin(new TableFormattingPlugin());
editor.addPlugin(new CodeHighlightingPlugin({
  languages: ['javascript', 'typescript', 'python'],
  showLineNumbers: true
}));
editor.addPlugin(new MathFormulaPlugin());
```

### Custom Toolbar

```typescript
import { Toolbar } from '@ldesign/enhanced-rich-editor';

const toolbar = new Toolbar(editor, {
  buttons: [
    { command: 'toggleBold', label: 'Bold', icon: 'bold' },
    { command: 'toggleItalic', label: 'Italic', icon: 'italic' },
    { command: 'toggleUnderline', label: 'Underline', icon: 'underline' },
    '|', // Separator
    { command: 'setHeading', label: 'Heading', args: [1] },
    { command: 'toggleOrderedList', label: 'Ordered List' },
    { command: 'toggleUnorderedList', label: 'Unordered List' },
    '|',
    { command: 'insertLink', label: 'Link' },
    { command: 'insertImage', label: 'Image' },
    { command: 'insertTable', label: 'Table' }
  ]
});

// Attach toolbar to container
toolbar.attachTo('#toolbar');
```

### Collaborative Editing

```typescript
import { CollaborativeEditingPlugin } from '@ldesign/enhanced-rich-editor';

const collaborativePlugin = new CollaborativeEditingPlugin({
  serverUrl: 'ws://your-server.com/collaborate',
  clientName: 'John Doe',
  clientColor: '#3b82f6',
  enableCursors: true,
  enablePresence: true
});

editor.addPlugin(collaborativePlugin);

// Listen for collaboration events
collaborativePlugin.on('client-join', ({ client }) => {
  console.log(`${client.name} joined the session`);
});

collaborativePlugin.on('client-leave', ({ clientId }) => {
  console.log(`Client ${clientId} left the session`);
});
```

### Mobile and Accessibility

```typescript
import { MobileAccessibilityPlugin } from '@ldesign/enhanced-rich-editor';

const mobilePlugin = new MobileAccessibilityPlugin({
  enableTouchGestures: true,
  enableKeyboardNavigation: true,
  announceChanges: true,
  highContrastMode: false,
  largeTextMode: false
});

editor.addPlugin(mobilePlugin);

// Toggle accessibility features
mobilePlugin.commands.toggleHighContrast.execute();
mobilePlugin.commands.toggleLargeText.execute();
```

## Customization

### Custom Themes

```css
/* Custom theme CSS */
.enhanced-rich-editor--custom {
  --ere-primary: #6366f1;
  --ere-primary-hover: #4f46e5;
  --ere-bg: #ffffff;
  --ere-text: #1f2937;
  --ere-border: #e5e7eb;
  --ere-border-radius: 8px;
}

.enhanced-rich-editor--custom .enhanced-rich-editor__content {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  padding: 24px;
}
```

```typescript
// Apply custom theme
const editor = new EnhancedEditor('#editor', {
  theme: 'custom'
});
```

### Custom Formats

```typescript
// Register custom format
editor.registerFormat('highlight', {
  tag: 'mark',
  class: 'highlight',
  style: 'background-color: yellow;'
});

// Use custom format
editor.formatText(0, 10, 'highlight', true);
```

### Custom Commands

```typescript
// Define custom command
const customCommand = {
  name: 'insertSignature',
  canExecute: (editor) => !editor.isReadOnly(),
  execute: (editor) => {
    const signature = '\n\nBest regards,\nJohn Doe';
    const length = editor.getLength();
    editor.insertText(length, signature, 'api');
  }
};

// Register command
editor.registerCommand(customCommand);

// Execute command
editor.executeCommand('insertSignature');
```

## Framework Integration

### React

```tsx
import React, { useRef, useEffect } from 'react';
import { EnhancedEditor, BasicFormattingPlugin } from '@ldesign/enhanced-rich-editor';

const EditorComponent: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<EnhancedEditor | null>(null);

  useEffect(() => {
    if (editorRef.current && !editorInstance.current) {
      editorInstance.current = new EnhancedEditor(editorRef.current, {
        placeholder: 'Start typing...'
      });
      
      editorInstance.current.addPlugin(new BasicFormattingPlugin());
    }

    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, []);

  return <div ref={editorRef} style={{ height: '400px' }} />;
};

export default EditorComponent;
```

### Vue 3

```vue
<template>
  <div ref="editorRef" style="height: 400px"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { EnhancedEditor, BasicFormattingPlugin } from '@ldesign/enhanced-rich-editor';

const editorRef = ref<HTMLDivElement>();
let editor: EnhancedEditor | null = null;

onMounted(() => {
  if (editorRef.value) {
    editor = new EnhancedEditor(editorRef.value, {
      placeholder: 'Start typing...'
    });
    
    editor.addPlugin(new BasicFormattingPlugin());
  }
});

onUnmounted(() => {
  if (editor) {
    editor.destroy();
    editor = null;
  }
});
</script>
```

### Angular

```typescript
import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { EnhancedEditor, BasicFormattingPlugin } from '@ldesign/enhanced-rich-editor';

@Component({
  selector: 'app-editor',
  template: '<div #editorContainer style="height: 400px"></div>'
})
export class EditorComponent implements OnInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  private editor: EnhancedEditor | null = null;

  ngOnInit() {
    this.editor = new EnhancedEditor(this.editorContainer.nativeElement, {
      placeholder: 'Start typing...'
    });
    
    this.editor.addPlugin(new BasicFormattingPlugin());
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  }
}
```

## Best Practices

### Performance Optimization

```typescript
// Use debounced save
import { debounce } from '@ldesign/enhanced-rich-editor';

const debouncedSave = debounce((delta) => {
  saveToServer(delta);
}, 1000);

editor.on('text-change', ({ delta, source }) => {
  if (source === 'user') {
    debouncedSave(delta);
  }
});

// Use virtual scrolling for large documents
import { VirtualScroller } from '@ldesign/enhanced-rich-editor';

const scroller = new VirtualScroller(
  container,
  lineHeight,
  (startIndex, endIndex) => {
    renderVisibleLines(startIndex, endIndex);
  }
);
```

### Memory Management

```typescript
// Always destroy editor when done
editor.destroy();

// Remove event listeners
editor.removeAllListeners();

// Clean up plugins
editor.removePlugin('plugin-name');
```

### Error Handling

```typescript
try {
  editor.setContents(delta);
} catch (error) {
  console.error('Failed to set contents:', error);
  // Handle error gracefully
}

// Validate content before setting
if (isValidDelta(delta)) {
  editor.setContents(delta);
} else {
  console.warn('Invalid delta format');
}
```

## Troubleshooting

### Common Issues

#### Editor not rendering
- Ensure the container element exists
- Check that styles are loaded
- Verify the element has dimensions

#### Content not updating
- Check event listeners are properly attached
- Verify the source parameter in operations
- Ensure the editor is not in read-only mode

#### Performance issues
- Use debouncing for frequent operations
- Implement virtual scrolling for large documents
- Optimize plugin usage

#### Mobile issues
- Enable the MobileAccessibilityPlugin
- Test touch interactions
- Verify viewport meta tag

### Debug Mode

```typescript
const editor = new EnhancedEditor('#editor', {
  debug: true // Enable debug logging
});

// Monitor performance
import { performanceMonitor } from '@ldesign/enhanced-rich-editor';

performanceMonitor.recordMetrics({
  renderTime: performance.now() - startTime
});

console.log('Average metrics:', performanceMonitor.getAverageMetrics());
```

### Browser Compatibility

The editor supports:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

For older browsers, consider using polyfills:
- IntersectionObserver polyfill
- ResizeObserver polyfill
- Custom Elements polyfill
