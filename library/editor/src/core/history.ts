/**
 * History Manager
 * 
 * Manages undo/redo functionality with operation history.
 */

import type { Delta as IDelta, Editor } from '@/types';
import { Delta } from './delta';
import { EventEmitter } from '@/utils/event-emitter';
import { logger } from '@/utils/logger';

/**
 * History entry
 */
export interface HistoryEntry {
  delta: IDelta;
  inverseDelta: IDelta;
  timestamp: number;
  source: string;
}

/**
 * History manager events
 */
interface HistoryEvents {
  'history-change': {
    canUndo: boolean;
    canRedo: boolean;
    undoSize: number;
    redoSize: number;
  };
  'undo': { entry: HistoryEntry };
  'redo': { entry: HistoryEntry };
}

/**
 * History manager options
 */
export interface HistoryOptions {
  maxSize: number;
  delay: number;
  userOnly: boolean;
  ignoreSources: string[];
}

/**
 * Default history options
 */
const DEFAULT_OPTIONS: HistoryOptions = {
  maxSize: 100,
  delay: 1000,
  userOnly: true,
  ignoreSources: ['api', 'silent']
};

/**
 * History manager implementation
 */
export class HistoryManager extends EventEmitter<HistoryEvents> {
  private editor: Editor;
  private options: HistoryOptions;
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private lastRecorded = 0;
  private ignoring = false;

  constructor(editor: Editor, options: Partial<HistoryOptions> = {}) {
    super();
    this.editor = editor;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.setupEventListeners();
  }

  /**
   * Record a change in history
   */
  record(delta: IDelta, oldDelta: IDelta, source: string): void {
    if (this.ignoring) return;
    
    // Check if we should ignore this source
    if (this.options.ignoreSources.includes(source)) {
      return;
    }

    // Check if this is a user action (if userOnly is enabled)
    if (this.options.userOnly && source !== 'user') {
      return;
    }

    // Check delay - combine rapid changes
    const now = Date.now();
    if (now - this.lastRecorded < this.options.delay && this.undoStack.length > 0) {
      // Combine with last entry
      const lastEntry = this.undoStack[this.undoStack.length - 1];
      const combinedDelta = lastEntry.delta.compose(delta);
      const combinedInverse = delta.invert(oldDelta).compose(lastEntry.inverseDelta);
      
      this.undoStack[this.undoStack.length - 1] = {
        delta: combinedDelta,
        inverseDelta: combinedInverse,
        timestamp: lastEntry.timestamp,
        source: lastEntry.source
      };
    } else {
      // Create new entry
      const inverseDelta = delta.invert(oldDelta);
      const entry: HistoryEntry = {
        delta,
        inverseDelta,
        timestamp: now,
        source
      };

      this.undoStack.push(entry);
      
      // Clear redo stack when new change is recorded
      this.redoStack = [];
      
      // Limit stack size
      if (this.undoStack.length > this.options.maxSize) {
        this.undoStack.shift();
      }
    }

    this.lastRecorded = now;
    this.emitHistoryChange();
  }

  /**
   * Undo last change
   */
  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    const entry = this.undoStack.pop()!;
    
    // Apply inverse delta
    this.ignoring = true;
    try {
      const currentDelta = this.editor.getContents();
      const newDelta = currentDelta.compose(entry.inverseDelta);
      this.editor.setContents(newDelta, 'user');
      
      // Move to redo stack
      this.redoStack.push(entry);
      
      this.emit('undo', { entry });
      this.emitHistoryChange();
      
      logger.debug('Undo applied:', entry);
      return true;
    } finally {
      this.ignoring = false;
    }
  }

  /**
   * Redo last undone change
   */
  redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }

    const entry = this.redoStack.pop()!;
    
    // Apply original delta
    this.ignoring = true;
    try {
      const currentDelta = this.editor.getContents();
      const newDelta = currentDelta.compose(entry.delta);
      this.editor.setContents(newDelta, 'user');
      
      // Move back to undo stack
      this.undoStack.push(entry);
      
      this.emit('redo', { entry });
      this.emitHistoryChange();
      
      logger.debug('Redo applied:', entry);
      return true;
    } finally {
      this.ignoring = false;
    }
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.lastRecorded = 0;
    this.emitHistoryChange();
    logger.debug('History cleared');
  }

  /**
   * Get history stack sizes
   */
  getStackSizes(): { undo: number; redo: number } {
    return {
      undo: this.undoStack.length,
      redo: this.redoStack.length
    };
  }

  /**
   * Get history entries (for debugging)
   */
  getHistory(): { undo: HistoryEntry[]; redo: HistoryEntry[] } {
    return {
      undo: [...this.undoStack],
      redo: [...this.redoStack]
    };
  }

  /**
   * Update options
   */
  setOptions(options: Partial<HistoryOptions>): void {
    this.options = { ...this.options, ...options };
    
    // Trim stacks if max size changed
    if (this.undoStack.length > this.options.maxSize) {
      this.undoStack = this.undoStack.slice(-this.options.maxSize);
    }
    if (this.redoStack.length > this.options.maxSize) {
      this.redoStack = this.redoStack.slice(-this.options.maxSize);
    }
  }

  /**
   * Get current options
   */
  getOptions(): HistoryOptions {
    return { ...this.options };
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen for content changes
    this.editor.on('text-change', (data) => {
      if (data.source !== 'user') return;
      
      // Create a simple delta for the change
      // In a real implementation, you would get the actual change delta
      const delta = data.delta;
      const oldDelta = data.oldDelta;
      
      this.record(delta, oldDelta, data.source);
    });
  }

  /**
   * Emit history change event
   */
  private emitHistoryChange(): void {
    this.emit('history-change', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoSize: this.undoStack.length,
      redoSize: this.redoStack.length
    });
  }

  /**
   * Dispose of the history manager
   */
  override dispose(): void {
    this.clear();
    super.dispose();
  }
}

// Extend Delta interface to include invert method
declare module '@/types' {
  interface Delta {
    invert(base: Delta): Delta;
  }
}

// Extend Delta with invert method
if (!Delta.prototype.invert) {
  Delta.prototype.invert = function(base: IDelta): Delta {
    const inverted = new Delta();
    let index = 0;

    for (const op of this.ops) {
      if (op.retain && typeof op.retain === 'number') {
        inverted.retain(op.retain);
        index += op.retain;
      } else if (op.delete && typeof op.delete === 'number') {
        // For delete, we need to insert the deleted content back
        const deletedContent = getTextFromDelta(base, index, op.delete);
        inverted.insert(deletedContent);
        index += op.delete;
      } else if (op.insert) {
        // For insert, we need to delete the inserted content
        const length = typeof op.insert === 'string' ? op.insert.length : 1;
        inverted.delete(length);
      }
    }

    return inverted;
  };
}

/**
 * Helper function to extract text from delta at specific position
 */
function getTextFromDelta(delta: IDelta, index: number, length: number): string {
  let currentIndex = 0;
  let result = '';
  let remaining = length;

  for (const op of delta.ops) {
    if (remaining <= 0) break;

    if (typeof op.insert === 'string') {
      const text = op.insert;
      const opLength = text.length;
      
      if (currentIndex + opLength > index) {
        const startOffset = Math.max(0, index - currentIndex);
        const endOffset = Math.min(opLength, startOffset + remaining);
        result += text.substring(startOffset, endOffset);
        remaining -= (endOffset - startOffset);
      }
      
      currentIndex += opLength;
    } else if (op.insert) {
      // Handle embeds
      if (currentIndex >= index && remaining > 0) {
        result += '\uFFFC'; // Object replacement character
        remaining--;
      }
      currentIndex++;
    }
  }

  return result;
}
