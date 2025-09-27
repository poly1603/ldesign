/**
 * Mobile and Accessibility Plugin
 * 
 * Enhances mobile experience and accessibility support.
 */

import type { Editor, Command } from '@/types';
import { BasePlugin, BasePluginOptions } from './base-plugin';

/**
 * Mobile and accessibility plugin options
 */
export interface MobileAccessibilityOptions extends BasePluginOptions {
  enableTouchGestures?: boolean;
  enableVoiceCommands?: boolean;
  enableKeyboardNavigation?: boolean;
  touchSensitivity?: number;
  announceChanges?: boolean;
  highContrastMode?: boolean;
  largeTextMode?: boolean;
}

/**
 * Touch gesture types
 */
export interface TouchGesture {
  type: 'tap' | 'double-tap' | 'long-press' | 'swipe' | 'pinch';
  direction?: 'left' | 'right' | 'up' | 'down';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  distance: number;
}

/**
 * Mobile and accessibility plugin implementation
 */
export class MobileAccessibilityPlugin extends BasePlugin {
  readonly name = 'mobile-accessibility';
  readonly version = '1.0.0';

  protected override options: MobileAccessibilityOptions;
  private touchStartTime = 0;
  private touchStartX = 0;
  private touchStartY = 0;
  private longPressTimer: number | null = null;
  private announcer: HTMLElement | null = null;

  constructor(options: MobileAccessibilityOptions = {}) {
    super(options);
    this.options = {
      enableTouchGestures: true,
      enableVoiceCommands: false,
      enableKeyboardNavigation: true,
      touchSensitivity: 10,
      announceChanges: true,
      highContrastMode: false,
      largeTextMode: false,
      ...options
    };
  }

  override readonly commands: Record<string, Command> = {
    toggleHighContrast: {
      name: 'toggleHighContrast',
      canExecute: () => true,
      execute: () => {
        this.toggleHighContrast();
      }
    },

    toggleLargeText: {
      name: 'toggleLargeText',
      canExecute: () => true,
      execute: () => {
        this.toggleLargeText();
      }
    },

    announceSelection: {
      name: 'announceSelection',
      canExecute: (editor: Editor) => {
        return Boolean(editor.getSelection());
      },
      execute: (editor: Editor) => {
        this.announceSelection(editor);
      }
    }
  };

  override async install(editor: Editor): Promise<void> {
    await super.install(editor);
    
    if (this.options.enableTouchGestures) {
      this.setupTouchGestures(editor);
    }
    
    if (this.options.enableKeyboardNavigation) {
      this.setupKeyboardNavigation(editor);
    }
    
    if (this.options.announceChanges) {
      this.setupScreenReaderSupport(editor);
    }
    
    this.setupAccessibilityAttributes(editor);
    this.setupMobileOptimizations(editor);
  }

  protected async onInstall(_editor: Editor): Promise<void> {
    this.logger.info('Installing mobile and accessibility enhancements');
  }

  protected async onUninstall(_editor: Editor): Promise<void> {
    this.logger.info('Uninstalling mobile and accessibility enhancements');
    this.cleanupAnnouncer();
  }

  /**
   * Setup touch gesture handling
   */
  private setupTouchGestures(editor: Editor): void {
    const container = editor.getContainer();

    this.addEventListener(container, 'touchstart', (event: TouchEvent) => {
      this.handleTouchStart(event);
    }, { passive: false });

    this.addEventListener(container, 'touchend', (event: TouchEvent) => {
      this.handleTouchEnd(event, editor);
    }, { passive: false });

    this.addEventListener(container, 'touchmove', (event: TouchEvent) => {
      this.handleTouchMove(event);
    }, { passive: false });
  }

  /**
   * Handle touch start
   */
  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStartTime = Date.now();
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;

    // Setup long press detection
    this.longPressTimer = window.setTimeout(() => {
      this.handleLongPress(touch.clientX, touch.clientY);
    }, 500);
  }

  /**
   * Handle touch end
   */
  private handleTouchEnd(event: TouchEvent, editor: Editor): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    const touch = event.changedTouches[0];
    const endTime = Date.now();
    const duration = endTime - this.touchStartTime;
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const gesture: TouchGesture = {
      type: 'tap',
      startX: this.touchStartX,
      startY: this.touchStartY,
      endX: touch.clientX,
      endY: touch.clientY,
      duration,
      distance
    };

    // Detect gesture type
    if (distance < this.options.touchSensitivity!) {
      if (duration < 200) {
        gesture.type = 'tap';
      } else if (duration > 500) {
        gesture.type = 'long-press';
      }
    } else if (distance > 50) {
      gesture.type = 'swipe';
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        gesture.direction = deltaX > 0 ? 'right' : 'left';
      } else {
        gesture.direction = deltaY > 0 ? 'down' : 'up';
      }
    }

    this.handleGesture(gesture, editor);
  }

  /**
   * Handle touch move
   */
  private handleTouchMove(_event: TouchEvent): void {
    // Cancel long press if user moves finger
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  /**
   * Handle long press
   */
  private handleLongPress(x: number, y: number): void {
    this.logger.info('Long press detected at:', { x, y });
    // TODO: Show context menu or selection handles
  }

  /**
   * Handle gesture
   */
  private handleGesture(gesture: TouchGesture, editor: Editor): void {
    this.logger.info('Gesture detected:', gesture);

    switch (gesture.type) {
      case 'double-tap':
        // Select word at position
        this.selectWordAtPosition(gesture.endX, gesture.endY, editor);
        break;
      case 'swipe':
        if (gesture.direction === 'left' || gesture.direction === 'right') {
          // Navigate between formatting options
          this.navigateFormatting(gesture.direction, editor);
        }
        break;
    }
  }

  /**
   * Setup keyboard navigation
   */
  private setupKeyboardNavigation(editor: Editor): void {
    const container = editor.getContainer();

    this.addEventListener(container, 'keydown', (event: KeyboardEvent) => {
      // Enhanced keyboard navigation
      if (event.altKey) {
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            this.navigateByWord(editor, 'backward');
            break;
          case 'ArrowRight':
            event.preventDefault();
            this.navigateByWord(editor, 'forward');
            break;
          case 'ArrowUp':
            event.preventDefault();
            this.navigateByParagraph(editor, 'up');
            break;
          case 'ArrowDown':
            event.preventDefault();
            this.navigateByParagraph(editor, 'down');
            break;
        }
      }

      // Screen reader shortcuts
      if (event.ctrlKey && event.shiftKey) {
        switch (event.key) {
          case 'A':
            event.preventDefault();
            this.announceSelection(editor);
            break;
          case 'H':
            event.preventDefault();
            this.toggleHighContrast();
            break;
          case 'L':
            event.preventDefault();
            this.toggleLargeText();
            break;
        }
      }
    });
  }

  /**
   * Setup screen reader support
   */
  private setupScreenReaderSupport(editor: Editor): void {
    // Create live region for announcements
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.style.position = 'absolute';
    this.announcer.style.left = '-10000px';
    this.announcer.style.width = '1px';
    this.announcer.style.height = '1px';
    this.announcer.style.overflow = 'hidden';
    document.body.appendChild(this.announcer);

    // Listen for content changes
    editor.on('text-change', () => {
      if (this.options.announceChanges) {
        this.announceChange('Content updated');
      }
    });

    editor.on('selection-change', () => {
      if (this.options.announceChanges) {
        this.announceSelection(editor);
      }
    });
  }

  /**
   * Setup accessibility attributes
   */
  private setupAccessibilityAttributes(editor: Editor): void {
    const container = editor.getContainer();
    const content = editor.getRoot();

    // Set ARIA attributes
    container.setAttribute('role', 'application');
    container.setAttribute('aria-label', 'Rich text editor');
    
    content.setAttribute('role', 'textbox');
    content.setAttribute('aria-multiline', 'true');
    content.setAttribute('aria-label', 'Editor content');
    content.setAttribute('contenteditable', 'true');

    // Add keyboard shortcuts description
    const shortcutsId = 'editor-shortcuts-' + Math.random().toString(36).substr(2, 9);
    const shortcuts = document.createElement('div');
    shortcuts.id = shortcutsId;
    shortcuts.style.display = 'none';
    shortcuts.textContent = 'Keyboard shortcuts: Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline';
    container.appendChild(shortcuts);
    content.setAttribute('aria-describedby', shortcutsId);
  }

  /**
   * Setup mobile optimizations
   */
  private setupMobileOptimizations(editor: Editor): void {
    const container = editor.getContainer();

    // Prevent zoom on double tap
    container.style.touchAction = 'manipulation';

    // Add mobile-specific CSS classes
    if (this.isMobileDevice()) {
      container.classList.add('enhanced-rich-editor--mobile');
    }

    if (this.isTouchDevice()) {
      container.classList.add('enhanced-rich-editor--touch');
    }
  }

  /**
   * Announce change to screen readers
   */
  private announceChange(message: string): void {
    if (this.announcer) {
      this.announcer.textContent = message;
    }
  }

  /**
   * Announce current selection
   */
  private announceSelection(editor: Editor): void {
    const selection = editor.getSelection();
    if (selection && selection.range && this.announcer) {
      const range = selection.range;
      const text = editor.getText().substring(range.index, range.index + range.length);
      const message = text ? `Selected: ${text}` : `Cursor at position ${range.index}`;
      this.announcer.textContent = message;
    }
  }

  /**
   * Toggle high contrast mode
   */
  private toggleHighContrast(): void {
    this.options.highContrastMode = !this.options.highContrastMode;
    document.body.classList.toggle('high-contrast', this.options.highContrastMode);
    this.announceChange(`High contrast mode ${this.options.highContrastMode ? 'enabled' : 'disabled'}`);
  }

  /**
   * Toggle large text mode
   */
  private toggleLargeText(): void {
    this.options.largeTextMode = !this.options.largeTextMode;
    document.body.classList.toggle('large-text', this.options.largeTextMode);
    this.announceChange(`Large text mode ${this.options.largeTextMode ? 'enabled' : 'disabled'}`);
  }

  /**
   * Navigate by word
   */
  private navigateByWord(_editor: Editor, _direction: 'forward' | 'backward'): void {
    // TODO: Implement word navigation
    this.logger.info('Navigate by word:', _direction);
  }

  /**
   * Navigate by paragraph
   */
  private navigateByParagraph(_editor: Editor, _direction: 'up' | 'down'): void {
    // TODO: Implement paragraph navigation
    this.logger.info('Navigate by paragraph:', _direction);
  }

  /**
   * Select word at position
   */
  private selectWordAtPosition(_x: number, _y: number, _editor: Editor): void {
    // TODO: Implement word selection
    this.logger.info('Select word at position:', { x: _x, y: _y });
  }

  /**
   * Navigate formatting options
   */
  private navigateFormatting(_direction: 'left' | 'right', _editor: Editor): void {
    // TODO: Implement formatting navigation
    this.logger.info('Navigate formatting:', _direction);
  }

  /**
   * Check if device is mobile
   */
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Check if device supports touch
   */
  private isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Cleanup announcer element
   */
  private cleanupAnnouncer(): void {
    if (this.announcer && this.announcer.parentNode) {
      this.announcer.parentNode.removeChild(this.announcer);
      this.announcer = null;
    }
  }
}
