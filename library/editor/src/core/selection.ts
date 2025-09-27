/**
 * Selection Management
 * 
 * Manages editor selection state and provides utilities for working with selections.
 */

import type { Selection as ISelection, SelectionRange } from '@/types';
import { EventEmitter } from '@/utils/event-emitter';
import { logger } from '@/utils/logger';

/**
 * Selection range implementation
 */
export class Range implements SelectionRange {
  index: number;
  length: number;

  constructor(index: number, length = 0) {
    this.index = Math.max(0, index);
    this.length = Math.max(0, length);
  }

  /**
   * Check if range is collapsed (zero length)
   */
  isCollapsed(): boolean {
    return this.length === 0;
  }

  /**
   * Get range end index
   */
  getEnd(): number {
    return this.index + this.length;
  }

  /**
   * Check if range contains index
   */
  contains(index: number): boolean {
    return index >= this.index && index < this.getEnd();
  }

  /**
   * Check if range intersects with another range
   */
  intersects(other: Range): boolean {
    return this.index < other.getEnd() && other.index < this.getEnd();
  }

  /**
   * Clone range
   */
  clone(): Range {
    return new Range(this.index, this.length);
  }

  /**
   * Check if ranges are equal
   */
  equals(other: Range | null): boolean {
    if (!other) return false;
    return this.index === other.index && this.length === other.length;
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return `Range(${this.index}, ${this.length})`;
  }
}

/**
 * Selection events
 */
interface SelectionEvents {
  'selection-change': {
    selection: Selection;
    oldSelection: Selection | null;
    source: string;
  };
}

/**
 * Selection implementation
 */
export class Selection extends EventEmitter<SelectionEvents> implements ISelection {
  range: Range | null;
  source: string;

  constructor(range: Range | null = null, source = 'api') {
    super();
    this.range = range;
    this.source = source;
  }

  /**
   * Set selection range
   */
  setRange(range: Range | null, source = 'api'): void {
    const oldSelection = this.clone();
    this.range = range;
    this.source = source;

    this.emit('selection-change', {
      selection: this,
      oldSelection,
      source,
    });
  }

  /**
   * Get selection range
   */
  getRange(): Range | null {
    return this.range;
  }

  /**
   * Check if selection is collapsed
   */
  isCollapsed(): boolean {
    return !this.range || this.range.isCollapsed();
  }

  /**
   * Get selection start index
   */
  getIndex(): number {
    return this.range ? this.range.index : 0;
  }

  /**
   * Get selection length
   */
  getLength(): number {
    return this.range ? this.range.length : 0;
  }

  /**
   * Get selection end index
   */
  getEnd(): number {
    return this.range ? this.range.getEnd() : 0;
  }

  /**
   * Check if selection contains index
   */
  contains(index: number): boolean {
    return this.range ? this.range.contains(index) : false;
  }

  /**
   * Clone selection
   */
  clone(): Selection {
    return new Selection(this.range ? this.range.clone() : null, this.source);
  }

  /**
   * Check if selections are equal
   */
  equals(other: Selection | null): boolean {
    if (!other) return !this.range;
    if (!this.range && !other.range) return true;
    if (!this.range || !other.range) return false;
    return this.range.equals(other.range);
  }

  /**
   * Convert to string representation
   */
  override toString(): string {
    return `Selection(${this.range ? this.range.toString() : 'null'}, ${this.source})`;
  }
}

/**
 * Selection manager for handling DOM selections
 */
export class SelectionManager extends EventEmitter<SelectionEvents> {
  private container: HTMLElement;
  private selection: Selection;
  private isUpdating = false;

  constructor(container: HTMLElement) {
    super();
    this.container = container;
    this.selection = new Selection();
    this.setupEventListeners();
  }

  /**
   * Get current selection
   */
  getSelection(): Selection {
    return this.selection;
  }

  /**
   * Set selection
   */
  setSelection(range: Range | null, source = 'api'): void {
    if (this.isUpdating) return;

    this.isUpdating = true;
    
    try {
      const oldSelection = this.selection.clone();
      this.selection.setRange(range, source);

      // Update DOM selection
      this.updateDOMSelection(range);

      this.emit('selection-change', {
        selection: this.selection,
        oldSelection,
        source,
      });
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Update DOM selection to match internal selection
   */
  private updateDOMSelection(range: Range | null): void {
    const domSelection = window.getSelection();
    if (!domSelection) return;

    if (!range) {
      domSelection.removeAllRanges();
      return;
    }

    try {
      const domRange = this.rangeToDOMRange(range);
      if (domRange) {
        domSelection.removeAllRanges();
        domSelection.addRange(domRange);
      }
    } catch (error) {
      logger.warn('Failed to update DOM selection:', error);
    }
  }

  /**
   * Convert internal range to DOM range
   */
  private rangeToDOMRange(range: Range): globalThis.Range | null {
    // This is a simplified implementation
    // In a real implementation, you would need to traverse the DOM tree
    // and find the correct text nodes and offsets
    
    const walker = document.createTreeWalker(
      this.container,
      NodeFilter.SHOW_TEXT
    );

    let currentIndex = 0;
    let startNode: Node | null = null;
    let startOffset = 0;
    let endNode: Node | null = null;
    let endOffset = 0;

    let node: Node | null;
    while ((node = walker.nextNode())) {
      const textLength = node.textContent?.length || 0;
      
      if (!startNode && currentIndex + textLength > range.index) {
        startNode = node;
        startOffset = range.index - currentIndex;
      }

      if (!endNode && currentIndex + textLength >= range.getEnd()) {
        endNode = node;
        endOffset = range.getEnd() - currentIndex;
        break;
      }

      currentIndex += textLength;
    }

    if (startNode && endNode) {
      const domRange = document.createRange();
      domRange.setStart(startNode, startOffset);
      domRange.setEnd(endNode, endOffset);
      return domRange as any; // Type assertion for compatibility
    }

    return null;
  }

  /**
   * Convert DOM selection to internal range
   */
  private domSelectionToRange(): Range | null {
    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) {
      return null;
    }

    const domRange = domSelection.getRangeAt(0);
    if (!this.container.contains(domRange.commonAncestorContainer)) {
      return null;
    }

    // This is a simplified implementation
    // In a real implementation, you would need to calculate the text offset
    // by traversing the DOM tree
    
    const walker = document.createTreeWalker(
      this.container,
      NodeFilter.SHOW_TEXT
    );

    let currentIndex = 0;
    let startIndex = -1;
    let endIndex = -1;

    let node: Node | null;
    while ((node = walker.nextNode())) {
      const textLength = node.textContent?.length || 0;

      if (node === domRange.startContainer) {
        startIndex = currentIndex + domRange.startOffset;
      }

      if (node === domRange.endContainer) {
        endIndex = currentIndex + domRange.endOffset;
        break;
      }

      currentIndex += textLength;
    }

    if (startIndex >= 0 && endIndex >= 0) {
      return new Range(startIndex, endIndex - startIndex);
    }

    return null;
  }

  /**
   * Setup event listeners for DOM selection changes
   */
  private setupEventListeners(): void {
    // Listen for selection changes
    document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));

    // Listen for mouse events
    this.container.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.container.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  /**
   * Handle DOM selection change
   */
  private handleSelectionChange(): void {
    if (this.isUpdating) return;

    const range = this.domSelectionToRange();
    if (!this.selection.range?.equals(range)) {
      this.setSelection(range, 'user');
    }
  }

  /**
   * Handle mouse up event
   */
  private handleMouseUp(): void {
    // Small delay to ensure selection has been updated
    setTimeout(() => {
      this.handleSelectionChange();
    }, 0);
  }

  /**
   * Handle key up event
   */
  private handleKeyUp(): void {
    this.handleSelectionChange();
  }

  /**
   * Dispose of the selection manager
   */
  override dispose(): void {
    document.removeEventListener('selectionchange', this.handleSelectionChange.bind(this));
    this.container.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.container.removeEventListener('keyup', this.handleKeyUp.bind(this));
    super.dispose();
  }
}
