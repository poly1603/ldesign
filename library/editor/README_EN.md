# Enhanced Rich Text Editor

<div align="center">

![Enhanced Rich Text Editor](https://img.shields.io/badge/Enhanced%20Rich%20Text%20Editor-v1.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)

A modern, extensible, and powerful rich text editor built with TypeScript. Designed for developers who need a flexible, performant, and feature-rich editing experience.

[🚀 Quick Start](#quick-start) • [📖 Documentation](#documentation) • [🎯 Features](#features) • [🔧 Examples](#examples) • [🤝 Contributing](#contributing)

</div>

## ✨ Features

### 🏗️ **Modern Architecture**
- **TypeScript First**: Complete type safety and excellent developer experience
- **Plugin-Based**: Modular architecture with extensible plugin system
- **Delta Operations**: Efficient document representation for real-time collaboration
- **Event-Driven**: Reactive architecture with comprehensive event system

### 📝 **Rich Formatting**
- **Basic Formatting**: Bold, italic, underline, strikethrough, colors, fonts
- **Advanced Formatting**: Headings, lists, blockquotes, code blocks
- **Media Support**: Images, links, tables with drag-and-drop upload
- **Math Formulas**: LaTeX math rendering with KaTeX
- **Code Highlighting**: Syntax highlighting for 20+ programming languages

### 🌐 **Collaboration Ready**
- **Real-time Editing**: Operational transformation for conflict-free collaboration
- **User Presence**: Live cursors and user indicators
- **WebSocket Integration**: Built-in collaborative editing infrastructure
- **Conflict Resolution**: Automatic merge conflict handling

### 📱 **Mobile & Accessibility**
- **Touch Optimized**: Native touch gesture support
- **Screen Reader**: Full ARIA compliance and screen reader support
- **Keyboard Navigation**: Complete keyboard accessibility
- **High Contrast**: Accessibility themes and large text support

### ⚡ **Performance**
- **Virtual Scrolling**: Handle large documents efficiently
- **Lazy Loading**: On-demand content loading
- **Debounced Operations**: Optimized for smooth user experience
- **Memory Management**: Efficient cleanup and garbage collection

### 🎨 **Customization**
- **Themes**: Built-in themes with CSS custom properties
- **Custom Formats**: Register your own formatting options
- **Toolbar**: Configurable toolbar with custom buttons
- **Framework Integration**: React, Vue, Angular adapters

## 🚀 Quick Start

### Installation

```bash
# Using npm
npm install @ldesign/enhanced-rich-editor

# Using yarn
yarn add @ldesign/enhanced-rich-editor

# Using pnpm
pnpm add @ldesign/enhanced-rich-editor
```

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/@ldesign/enhanced-rich-editor/dist/style.css">
</head>
<body>
  <div id="editor"></div>
  
  <script type="module">
    import { EnhancedEditor, BasicFormattingPlugin } from '@ldesign/enhanced-rich-editor';
    
    // Create editor
    const editor = new EnhancedEditor('#editor', {
      placeholder: 'Start typing...',
      theme: 'default'
    });
    
    // Add plugins
    editor.addPlugin(new BasicFormattingPlugin());
    
    // Listen for changes
    editor.on('text-change', ({ delta, source }) => {
      console.log('Content changed:', delta);
    });
  </script>
</body>
</html>
```

### TypeScript Usage

```typescript
import { 
  EnhancedEditor, 
  BasicFormattingPlugin,
  HeadingFormattingPlugin,
  ListFormattingPlugin,
  MediaFormattingPlugin,
  Delta 
} from '@ldesign/enhanced-rich-editor';

// Create editor with options
const editor = new EnhancedEditor('#editor', {
  placeholder: 'Enter your content here...',
  theme: 'snow',
  readOnly: false
});

// Add multiple plugins
editor.addPlugin(new BasicFormattingPlugin());
editor.addPlugin(new HeadingFormattingPlugin());
editor.addPlugin(new ListFormattingPlugin());
editor.addPlugin(new MediaFormattingPlugin({
  enableDragAndDrop: true,
  maxFileSize: 10 * 1024 * 1024 // 10MB
}));

// Set initial content
const initialContent = new Delta()
  .insert('Welcome to ')
  .insert('Enhanced Rich Text Editor', { bold: true })
  .insert('\n\nThis is a ')
  .insert('powerful', { italic: true })
  .insert(' and ')
  .insert('flexible', { underline: true })
  .insert(' rich text editor.\n');

editor.setContents(initialContent);

// Handle events
editor.on('text-change', ({ delta, oldDelta, source }) => {
  if (source === 'user') {
    // Save to server
    saveToServer(delta);
  }
});

editor.on('selection-change', ({ selection }) => {
  // Update UI based on selection
  updateToolbar(selection);
});
```

## 🔧 Examples

### Framework Integration

#### React

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
```

#### Vue 3

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

### Collaborative Editing

```typescript
import { CollaborativeEditingPlugin } from '@ldesign/enhanced-rich-editor';

const collaborativePlugin = new CollaborativeEditingPlugin({
  serverUrl: 'ws://your-server.com/collaborate',
  clientName: 'John Doe',
  enableCursors: true,
  enablePresence: true
});

editor.addPlugin(collaborativePlugin);

// Listen for collaboration events
collaborativePlugin.on('client-join', ({ client }) => {
  console.log(`${client.name} joined the session`);
});
```

### Custom Plugin

```typescript
import { BasePlugin, Editor, Command } from '@ldesign/enhanced-rich-editor';

export class HighlightPlugin extends BasePlugin {
  readonly name = 'highlight-plugin';
  readonly version = '1.0.0';
  
  readonly commands = {
    toggleHighlight: {
      name: 'toggleHighlight',
      canExecute: (editor: Editor) => !editor.isReadOnly(),
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          const { index, length } = selection.range;
          const format = editor.getFormat(index, length);
          editor.formatText(index, length, 'highlight', !format.highlight, 'user');
        }
      }
    }
  };
  
  async install(editor: Editor): Promise<void> {
    editor.registerFormat('highlight', {
      tag: 'mark',
      class: 'highlight',
      style: 'background-color: yellow;'
    });
    
    editor.addKeyboardShortcut('Ctrl+H', () => {
      this.commands.toggleHighlight.execute(editor);
    });
  }
  
  async uninstall(editor: Editor): Promise<void> {
    editor.unregisterFormat('highlight');
    editor.removeKeyboardShortcut('Ctrl+H');
  }
}

// Use the plugin
editor.addPlugin(new HighlightPlugin());
```

## 📖 Documentation

- **[📚 API Documentation](./docs/API.md)** - Complete API reference
- **[🎯 Usage Guide](./docs/USAGE_GUIDE.md)** - Comprehensive usage examples
- **[🔌 Plugin Development](./docs/PLUGIN_DEVELOPMENT.md)** - Create custom plugins

## 🎯 Available Plugins

| Plugin | Description | Features |
|--------|-------------|----------|
| **BasicFormattingPlugin** | Essential text formatting | Bold, italic, underline, colors, fonts |
| **HeadingFormattingPlugin** | Heading and block formatting | H1-H6, blockquotes, code blocks |
| **ListFormattingPlugin** | List management | Ordered/unordered lists, indentation |
| **MediaFormattingPlugin** | Media insertion | Links, images, drag-and-drop upload |
| **TableFormattingPlugin** | Table editing | Create, edit, style tables |
| **CodeHighlightingPlugin** | Syntax highlighting | 20+ languages, themes, line numbers |
| **MathFormulaPlugin** | LaTeX math rendering | Inline/display math, symbol palette |
| **CollaborativeEditingPlugin** | Real-time collaboration | Live cursors, presence, conflict resolution |
| **MobileAccessibilityPlugin** | Mobile & accessibility | Touch gestures, screen readers, ARIA |

## 🌟 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |

## 📊 Performance

- **Bundle Size**: 161.52 kB (gzipped)
- **Runtime Performance**: 60 FPS smooth editing
- **Memory Usage**: Optimized for large documents
- **Load Time**: < 100ms initialization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

Made with ❤️ by the LDesign Team

</div>
