/**
 * End-to-End Tests for Enhanced Rich Text Editor
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Enhanced Rich Text Editor', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Create a test page with the editor
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Editor Test</title>
        <style>
          body { margin: 20px; font-family: Arial, sans-serif; }
          #editor { width: 600px; height: 400px; border: 1px solid #ccc; }
        </style>
      </head>
      <body>
        <div id="editor"></div>
        <script type="module">
          import { EnhancedEditor, BasicFormattingPlugin } from '/dist/index.js';
          
          const editor = new EnhancedEditor('#editor', {
            placeholder: 'Start typing...',
            theme: 'default'
          });
          
          // Add basic formatting plugin
          editor.addPlugin(new BasicFormattingPlugin());
          
          // Make editor globally available for testing
          window.editor = editor;
        </script>
      </body>
      </html>
    `);

    // Wait for editor to be initialized
    await page.waitForFunction(() => window.editor);
  });

  test.describe('Basic Functionality', () => {
    test('should display placeholder text', async () => {
      const placeholder = await page.locator('[data-placeholder="Start typing..."]');
      await expect(placeholder).toBeVisible();
    });

    test('should allow text input', async () => {
      const editor = page.locator('#editor [contenteditable]');
      await editor.click();
      await editor.type('Hello World!');
      
      const text = await page.evaluate(() => window.editor.getText());
      expect(text).toBe('Hello World!');
    });

    test('should handle backspace and delete', async () => {
      const editor = page.locator('#editor [contenteditable]');
      await editor.click();
      await editor.type('Hello World!');
      
      // Backspace to remove exclamation mark
      await editor.press('Backspace');
      
      let text = await page.evaluate(() => window.editor.getText());
      expect(text).toBe('Hello World');
      
      // Move cursor to beginning and delete first character
      await editor.press('Home');
      await editor.press('Delete');
      
      text = await page.evaluate(() => window.editor.getText());
      expect(text).toBe('ello World');
    });

    test('should handle enter key for new lines', async () => {
      const editor = page.locator('#editor [contenteditable]');
      await editor.click();
      await editor.type('Line 1');
      await editor.press('Enter');
      await editor.type('Line 2');
      
      const text = await page.evaluate(() => window.editor.getText());
      expect(text).toContain('Line 1');
      expect(text).toContain('Line 2');
    });
  });

  test.describe('Text Selection', () => {
    test('should select text with mouse', async () => {
      const editor = page.locator('#editor [contenteditable]');
      await editor.click();
      await editor.type('Hello World!');
      
      // Select "World" by dragging
      const textElement = editor.locator('text=Hello World!');
      const box = await textElement.boundingBox();
      
      if (box) {
        // Start selection from "W" and drag to "d"
        await page.mouse.move(box.x + 36, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + 72, box.y + box.height / 2);
        await page.mouse.up();
      }
      
      const selectedText = await page.evaluate(() => {
        const selection = window.getSelection();
        return selection ? selection.toString() : '';
      });
      
      expect(selectedText).toBe('World');
    });

    test('should select all text with Ctrl+A', async () => {
      const editor = page.locator('#editor [contenteditable]');
      await editor.click();
      await editor.type('Hello World!');
      
      await editor.press('Control+a');
      
      const selectedText = await page.evaluate(() => {
        const selection = window.getSelection();
        return selection ? selection.toString() : '';
      });
      
      expect(selectedText).toBe('Hello World!');
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('should apply bold formatting with Ctrl+B', async () => {
      const editor = page.locator('#editor [contenteditable]');
      await editor.click();
      await editor.type('Hello World!');
      
      // Select "World"
      await editor.press('Control+a');
      await editor.press('Control+b');
      
      // Check if bold formatting was applied
      const hasBold = await page.evaluate(() => {
        const contents = window.editor.getContents();
        return contents.ops.some(op => op.attributes && op.attributes.bold);
      });
      
      expect(hasBold).toBe(true);
    });

    test('should apply italic formatting with Ctrl+I', async () => {
      const editor = page.locator('#editor [contenteditable]');
      await editor.click();
      await editor.type('Hello World!');
      
      await editor.press('Control+a');
      await editor.press('Control+i');
      
      const hasItalic = await page.evaluate(() => {
        const contents = window.editor.getContents();
        return contents.ops.some(op => op.attributes && op.attributes.italic);
      });
      
      expect(hasItalic).toBe(true);
    });

    test('should apply underline formatting with Ctrl+U', async () => {
      const editor = page.locator('#editor [contenteditable]');
      await editor.click();
      await editor.type('Hello World!');
      
      await editor.press('Control+a');
      await editor.press('Control+u');
      
      const hasUnderline = await page.evaluate(() => {
        const contents = window.editor.getContents();
        return contents.ops.some(op => op.attributes && op.attributes.underline);
      });
      
      expect(hasUnderline).toBe(true);
    });
  });

  test.describe('Undo/Redo', () => {
    test('should undo and redo text changes', async () => {
      const editor = page.locator('#editor [contenteditable]');
      await editor.click();
      await editor.type('Hello');
      
      let text = await page.evaluate(() => window.editor.getText());
      expect(text).toBe('Hello');
      
      // Undo
      await editor.press('Control+z');
      text = await page.evaluate(() => window.editor.getText());
      expect(text).toBe('');
      
      // Redo
      await editor.press('Control+y');
      text = await page.evaluate(() => window.editor.getText());
      expect(text).toBe('Hello');
    });

    test('should undo formatting changes', async () => {
      const editor = page.locator('#editor [contenteditable]');
      await editor.click();
      await editor.type('Hello World!');
      await editor.press('Control+a');
      await editor.press('Control+b');
      
      let hasBold = await page.evaluate(() => {
        const contents = window.editor.getContents();
        return contents.ops.some(op => op.attributes && op.attributes.bold);
      });
      expect(hasBold).toBe(true);
      
      // Undo formatting
      await editor.press('Control+z');
      hasBold = await page.evaluate(() => {
        const contents = window.editor.getContents();
        return contents.ops.some(op => op.attributes && op.attributes.bold);
      });
      expect(hasBold).toBe(false);
    });
  });

  test.describe('Focus and Blur', () => {
    test('should handle focus events', async () => {
      const editor = page.locator('#editor [contenteditable]');
      
      // Focus the editor
      await editor.click();
      
      const isFocused = await page.evaluate(() => window.editor.hasFocus());
      expect(isFocused).toBe(true);
    });

    test('should handle blur events', async () => {
      const editor = page.locator('#editor [contenteditable]');
      await editor.click();
      
      // Blur by clicking outside
      await page.click('body');
      
      const isFocused = await page.evaluate(() => window.editor.hasFocus());
      expect(isFocused).toBe(false);
    });
  });

  test.describe('Content Persistence', () => {
    test('should maintain content after focus/blur', async () => {
      const editor = page.locator('#editor [contenteditable]');
      await editor.click();
      await editor.type('Persistent content');
      
      // Blur and refocus
      await page.click('body');
      await editor.click();
      
      const text = await page.evaluate(() => window.editor.getText());
      expect(text).toBe('Persistent content');
    });

    test('should preserve formatting after operations', async () => {
      const editor = page.locator('#editor [contenteditable]');
      await editor.click();
      await editor.type('Bold text');
      await editor.press('Control+a');
      await editor.press('Control+b');
      
      // Add more text
      await editor.press('End');
      await editor.type(' and normal text');
      
      const contents = await page.evaluate(() => window.editor.getContents());
      expect(contents.ops).toHaveLength(2);
      expect(contents.ops[0].attributes?.bold).toBe(true);
      expect(contents.ops[1].attributes?.bold).toBeUndefined();
    });
  });

  test.describe('Performance', () => {
    test('should handle large text input efficiently', async () => {
      const editor = page.locator('#editor [contenteditable]');
      await editor.click();
      
      // Generate large text
      const largeText = 'Lorem ipsum '.repeat(1000);
      
      const startTime = Date.now();
      await editor.type(largeText);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      const text = await page.evaluate(() => window.editor.getText());
      expect(text.length).toBeGreaterThan(10000);
    });

    test('should handle rapid key presses', async () => {
      const editor = page.locator('#editor [contenteditable]');
      await editor.click();
      
      // Rapid typing simulation
      const keys = 'abcdefghijklmnopqrstuvwxyz'.split('');
      
      for (const key of keys) {
        await editor.press(key, { delay: 10 }); // 10ms delay between keys
      }
      
      const text = await page.evaluate(() => window.editor.getText());
      expect(text).toBe('abcdefghijklmnopqrstuvwxyz');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid operations gracefully', async () => {
      // Try to perform operations on destroyed editor
      await page.evaluate(() => {
        window.editor.destroy();
        
        // These should not throw errors
        try {
          window.editor.setText('test');
          window.editor.formatText(0, 4, 'bold', true);
          window.editor.setSelection({ index: 0, length: 0 });
        } catch (error) {
          window.testError = error;
        }
      });
      
      const error = await page.evaluate(() => window.testError);
      expect(error).toBeUndefined();
    });
  });
});
