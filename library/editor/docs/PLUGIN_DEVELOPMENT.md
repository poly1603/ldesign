# Plugin Development Guide

## Table of Contents

- [Overview](#overview)
- [Plugin Architecture](#plugin-architecture)
- [Creating a Plugin](#creating-a-plugin)
- [Plugin Lifecycle](#plugin-lifecycle)
- [Commands](#commands)
- [Event Handling](#event-handling)
- [UI Components](#ui-components)
- [Testing Plugins](#testing-plugins)
- [Publishing](#publishing)

## Overview

The Enhanced Rich Text Editor uses a plugin-based architecture that allows you to extend functionality without modifying the core editor. Plugins can add new formatting options, UI components, commands, and integrate with external services.

## Plugin Architecture

### Base Plugin Class

All plugins must extend the `BasePlugin` class:

```typescript
import { BasePlugin, Editor, Command } from '@ldesign/enhanced-rich-editor';

export class MyPlugin extends BasePlugin {
  readonly name = 'my-plugin';
  readonly version = '1.0.0';
  readonly dependencies: string[] = []; // Optional dependencies
  
  async install(editor: Editor): Promise<void> {
    // Plugin installation logic
  }
  
  async uninstall(editor: Editor): Promise<void> {
    // Plugin cleanup logic
  }
}
```

### Plugin Interface

```typescript
interface Plugin {
  name: string;                                    // Unique plugin name
  version: string;                                // Plugin version
  dependencies?: string[];                        // Plugin dependencies
  install(editor: Editor): Promise<void>;         // Install method
  uninstall(editor: Editor): Promise<void>;       // Uninstall method
  commands?: Record<string, Command>;             // Plugin commands
}
```

## Creating a Plugin

### Simple Formatting Plugin

```typescript
import { BasePlugin, Editor, Command } from '@ldesign/enhanced-rich-editor';

export class HighlightPlugin extends BasePlugin {
  readonly name = 'highlight-plugin';
  readonly version = '1.0.0';
  
  // Define commands
  readonly commands: Record<string, Command> = {
    toggleHighlight: {
      name: 'toggleHighlight',
      canExecute: (editor: Editor) => !editor.isReadOnly(),
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection && selection.range) {
          const { index, length } = selection.range;
          const format = editor.getFormat(index, length);
          const isHighlighted = format.highlight;
          
          editor.formatText(index, length, 'highlight', !isHighlighted, 'user');
        }
      }
    }
  };
  
  async install(editor: Editor): Promise<void> {
    // Register the highlight format
    editor.registerFormat('highlight', {
      tag: 'mark',
      class: 'highlight',
      style: 'background-color: yellow; padding: 2px 4px; border-radius: 3px;'
    });
    
    // Add keyboard shortcut
    editor.addKeyboardShortcut('Ctrl+H', () => {
      this.commands.toggleHighlight.execute(editor);
    });
    
    // Add toolbar button
    editor.addToolbarButton({
      name: 'highlight',
      label: 'Highlight',
      icon: '🖍️',
      command: 'toggleHighlight'
    });
  }
  
  async uninstall(editor: Editor): Promise<void> {
    // Remove format
    editor.unregisterFormat('highlight');
    
    // Remove keyboard shortcut
    editor.removeKeyboardShortcut('Ctrl+H');
    
    // Remove toolbar button
    editor.removeToolbarButton('highlight');
  }
}
```

### Advanced Plugin with UI

```typescript
import { BasePlugin, Editor, EventEmitter } from '@ldesign/enhanced-rich-editor';

interface EmojiPickerOptions {
  categories: string[];
  recentEmojis: string[];
  customEmojis?: Record<string, string>;
}

export class EmojiPickerPlugin extends BasePlugin {
  readonly name = 'emoji-picker';
  readonly version = '1.0.0';
  
  private options: EmojiPickerOptions;
  private picker: HTMLElement | null = null;
  private isOpen = false;
  
  constructor(options: Partial<EmojiPickerOptions> = {}) {
    super();
    this.options = {
      categories: ['smileys', 'people', 'nature', 'food', 'activities', 'travel', 'objects', 'symbols'],
      recentEmojis: [],
      ...options
    };
  }
  
  readonly commands = {
    openEmojiPicker: {
      name: 'openEmojiPicker',
      canExecute: (editor: Editor) => !editor.isReadOnly(),
      execute: (editor: Editor) => {
        this.togglePicker(editor);
      }
    },
    
    insertEmoji: {
      name: 'insertEmoji',
      canExecute: (editor: Editor) => !editor.isReadOnly(),
      execute: (editor: Editor, emoji: string) => {
        const selection = editor.getSelection();
        if (selection && selection.range) {
          editor.insertText(selection.range.index, emoji, 'user');
          this.addToRecent(emoji);
        }
      }
    }
  };
  
  async install(editor: Editor): Promise<void> {
    // Create picker UI
    this.createPicker(editor);
    
    // Add toolbar button
    editor.addToolbarButton({
      name: 'emoji',
      label: 'Emoji',
      icon: '😀',
      command: 'openEmojiPicker'
    });
    
    // Add keyboard shortcut
    editor.addKeyboardShortcut('Ctrl+;', () => {
      this.commands.openEmojiPicker.execute(editor);
    });
    
    // Listen for clicks outside to close picker
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }
  
  async uninstall(editor: Editor): Promise<void> {
    // Remove picker
    if (this.picker) {
      this.picker.remove();
      this.picker = null;
    }
    
    // Remove toolbar button
    editor.removeToolbarButton('emoji');
    
    // Remove keyboard shortcut
    editor.removeKeyboardShortcut('Ctrl+;');
    
    // Remove event listeners
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }
  
  private createPicker(editor: Editor): void {
    this.picker = document.createElement('div');
    this.picker.className = 'emoji-picker';
    this.picker.style.cssText = `
      position: absolute;
      z-index: 1000;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: none;
      width: 300px;
      max-height: 400px;
      overflow-y: auto;
    `;
    
    // Create categories
    this.options.categories.forEach(category => {
      const categoryEl = document.createElement('div');
      categoryEl.className = 'emoji-category';
      categoryEl.innerHTML = `<h4>${category}</h4>`;
      
      const emojisEl = document.createElement('div');
      emojisEl.className = 'emoji-grid';
      emojisEl.style.cssText = `
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 4px;
        margin-bottom: 16px;
      `;
      
      // Add emojis for category (simplified)
      const emojis = this.getEmojisForCategory(category);
      emojis.forEach(emoji => {
        const emojiEl = document.createElement('button');
        emojiEl.textContent = emoji;
        emojiEl.className = 'emoji-button';
        emojiEl.style.cssText = `
          border: none;
          background: none;
          font-size: 20px;
          padding: 4px;
          cursor: pointer;
          border-radius: 4px;
        `;
        
        emojiEl.addEventListener('click', (e) => {
          e.stopPropagation();
          this.commands.insertEmoji.execute(editor, emoji);
          this.closePicker();
        });
        
        emojisEl.appendChild(emojiEl);
      });
      
      categoryEl.appendChild(emojisEl);
      this.picker.appendChild(categoryEl);
    });
    
    document.body.appendChild(this.picker);
  }
  
  private togglePicker(editor: Editor): void {
    if (!this.picker) return;
    
    if (this.isOpen) {
      this.closePicker();
    } else {
      this.openPicker(editor);
    }
  }
  
  private openPicker(editor: Editor): void {
    if (!this.picker) return;
    
    // Position picker near cursor
    const selection = editor.getSelection();
    if (selection && selection.range) {
      const bounds = editor.getBounds(selection.range.index);
      this.picker.style.left = `${bounds.left}px`;
      this.picker.style.top = `${bounds.bottom + 8}px`;
    }
    
    this.picker.style.display = 'block';
    this.isOpen = true;
  }
  
  private closePicker(): void {
    if (!this.picker) return;
    
    this.picker.style.display = 'none';
    this.isOpen = false;
  }
  
  private handleOutsideClick(event: Event): void {
    if (this.isOpen && this.picker && !this.picker.contains(event.target as Node)) {
      this.closePicker();
    }
  }
  
  private getEmojisForCategory(category: string): string[] {
    // Simplified emoji data
    const emojiData: Record<string, string[]> = {
      smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣'],
      people: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏'],
      nature: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
      food: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐'],
      activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉'],
      travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑'],
      objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️'],
      symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍']
    };
    
    return emojiData[category] || [];
  }
  
  private addToRecent(emoji: string): void {
    const recent = this.options.recentEmojis;
    const index = recent.indexOf(emoji);
    
    if (index > -1) {
      recent.splice(index, 1);
    }
    
    recent.unshift(emoji);
    
    if (recent.length > 16) {
      recent.splice(16);
    }
  }
}
```

## Plugin Lifecycle

### Installation Process

1. **Dependency Check**: Verify required dependencies are installed
2. **Format Registration**: Register custom formats with the editor
3. **Command Registration**: Add plugin commands
4. **UI Setup**: Create toolbar buttons, panels, etc.
5. **Event Listeners**: Attach event handlers
6. **Initialization**: Set up plugin state

### Uninstallation Process

1. **Cleanup UI**: Remove toolbar buttons, panels
2. **Remove Listeners**: Detach event handlers
3. **Unregister Commands**: Remove plugin commands
4. **Unregister Formats**: Clean up custom formats
5. **State Cleanup**: Clear plugin state

## Commands

### Command Interface

```typescript
interface Command {
  name: string;
  canExecute(editor: Editor, ...args: any[]): boolean;
  execute(editor: Editor, ...args: any[]): void;
}
```

### Command Examples

```typescript
// Simple toggle command
const boldCommand: Command = {
  name: 'toggleBold',
  canExecute: (editor) => !editor.isReadOnly(),
  execute: (editor) => {
    const selection = editor.getSelection();
    if (selection?.range) {
      const format = editor.getFormat(selection.range.index, selection.range.length);
      editor.formatText(selection.range.index, selection.range.length, 'bold', !format.bold);
    }
  }
};

// Parameterized command
const setFontSizeCommand: Command = {
  name: 'setFontSize',
  canExecute: (editor) => !editor.isReadOnly(),
  execute: (editor, size: string) => {
    const selection = editor.getSelection();
    if (selection?.range) {
      editor.formatText(selection.range.index, selection.range.length, 'size', size);
    }
  }
};

// Async command
const uploadImageCommand: Command = {
  name: 'uploadImage',
  canExecute: (editor) => !editor.isReadOnly(),
  execute: async (editor, file: File) => {
    try {
      const url = await uploadFile(file);
      const selection = editor.getSelection();
      if (selection?.range) {
        editor.insertEmbed(selection.range.index, 'image', { src: url, alt: file.name });
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  }
};
```

## Event Handling

### Listening to Editor Events

```typescript
export class MyPlugin extends BasePlugin {
  async install(editor: Editor): Promise<void> {
    // Listen to text changes
    editor.on('text-change', this.handleTextChange.bind(this));
    
    // Listen to selection changes
    editor.on('selection-change', this.handleSelectionChange.bind(this));
    
    // Listen to focus/blur
    editor.on('focus', this.handleFocus.bind(this));
    editor.on('blur', this.handleBlur.bind(this));
  }
  
  private handleTextChange({ delta, oldDelta, source }: any): void {
    // Handle text changes
    if (source === 'user') {
      this.analyzeContent(delta);
    }
  }
  
  private handleSelectionChange({ selection, oldSelection, source }: any): void {
    // Update UI based on selection
    this.updateToolbarState(selection);
  }
  
  private handleFocus(): void {
    // Show plugin UI
    this.showUI();
  }
  
  private handleBlur(): void {
    // Hide plugin UI
    this.hideUI();
  }
}
```

### Custom Events

```typescript
export class MyPlugin extends BasePlugin {
  private eventEmitter = new EventEmitter();
  
  // Emit custom events
  private notifyChange(): void {
    this.eventEmitter.emit('plugin-change', { data: 'some data' });
  }
  
  // Allow external listeners
  on(event: string, handler: Function): void {
    this.eventEmitter.on(event, handler);
  }
  
  off(event: string, handler: Function): void {
    this.eventEmitter.off(event, handler);
  }
}
```

## UI Components

### Toolbar Integration

```typescript
// Add toolbar button
editor.addToolbarButton({
  name: 'my-button',
  label: 'My Button',
  icon: '🔧',
  command: 'myCommand',
  tooltip: 'Execute my command'
});

// Add dropdown
editor.addToolbarDropdown({
  name: 'my-dropdown',
  label: 'Options',
  options: [
    { label: 'Option 1', value: 'opt1', command: 'setOption', args: ['opt1'] },
    { label: 'Option 2', value: 'opt2', command: 'setOption', args: ['opt2'] }
  ]
});
```

### Custom Panels

```typescript
export class MyPlugin extends BasePlugin {
  private panel: HTMLElement | null = null;
  
  async install(editor: Editor): Promise<void> {
    this.createPanel(editor);
  }
  
  private createPanel(editor: Editor): void {
    this.panel = document.createElement('div');
    this.panel.className = 'my-plugin-panel';
    this.panel.innerHTML = `
      <div class="panel-header">
        <h3>My Plugin</h3>
        <button class="close-btn">×</button>
      </div>
      <div class="panel-content">
        <!-- Panel content -->
      </div>
    `;
    
    // Add event listeners
    const closeBtn = this.panel.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => this.hidePanel());
    
    // Append to editor container
    const container = editor.getContainer();
    container.appendChild(this.panel);
  }
  
  private showPanel(): void {
    if (this.panel) {
      this.panel.style.display = 'block';
    }
  }
  
  private hidePanel(): void {
    if (this.panel) {
      this.panel.style.display = 'none';
    }
  }
}
```

## Testing Plugins

### Unit Tests

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedEditor } from '@ldesign/enhanced-rich-editor';
import { MyPlugin } from './my-plugin';

describe('MyPlugin', () => {
  let editor: EnhancedEditor;
  let plugin: MyPlugin;
  let container: HTMLElement;
  
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    editor = new EnhancedEditor(container);
    plugin = new MyPlugin();
  });
  
  afterEach(() => {
    editor.destroy();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });
  
  it('should install successfully', async () => {
    await plugin.install(editor);
    expect(editor.hasPlugin(plugin.name)).toBe(true);
  });
  
  it('should register commands', async () => {
    await plugin.install(editor);
    expect(editor.hasCommand('myCommand')).toBe(true);
  });
  
  it('should execute commands correctly', async () => {
    await plugin.install(editor);
    
    editor.setText('Hello World');
    editor.setSelection({ index: 0, length: 5 });
    
    editor.executeCommand('myCommand');
    
    // Assert expected behavior
    const contents = editor.getContents();
    expect(contents.ops[0].attributes?.myFormat).toBe(true);
  });
  
  it('should uninstall cleanly', async () => {
    await plugin.install(editor);
    await plugin.uninstall(editor);
    
    expect(editor.hasPlugin(plugin.name)).toBe(false);
    expect(editor.hasCommand('myCommand')).toBe(false);
  });
});
```

### Integration Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('MyPlugin Integration', () => {
  test('should work in browser environment', async ({ page }) => {
    await page.goto('/test-page');
    
    // Wait for editor to load
    await page.waitForSelector('.enhanced-rich-editor');
    
    // Test plugin functionality
    await page.click('[data-command="myCommand"]');
    
    // Assert UI changes
    const button = page.locator('[data-command="myCommand"]');
    await expect(button).toHaveClass(/active/);
  });
});
```

## Publishing

### Package Structure

```
my-plugin/
├── src/
│   ├── index.ts
│   ├── plugin.ts
│   └── styles.css
├── dist/
├── tests/
├── package.json
├── README.md
└── LICENSE
```

### Package.json

```json
{
  "name": "@myorg/enhanced-editor-my-plugin",
  "version": "1.0.0",
  "description": "My plugin for Enhanced Rich Text Editor",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "keywords": ["rich-text", "editor", "plugin"],
  "peerDependencies": {
    "@ldesign/enhanced-rich-editor": "^1.0.0"
  },
  "devDependencies": {
    "@ldesign/enhanced-rich-editor": "^1.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyPlugin',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['@ldesign/enhanced-rich-editor'],
      output: {
        globals: {
          '@ldesign/enhanced-rich-editor': 'EnhancedRichEditor'
        }
      }
    }
  }
});
```

### Documentation

Create comprehensive documentation including:
- Installation instructions
- Usage examples
- API reference
- Configuration options
- Troubleshooting guide

### Publishing to NPM

```bash
# Build the plugin
npm run build

# Run tests
npm test

# Publish to NPM
npm publish
```
