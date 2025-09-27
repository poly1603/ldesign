/**
 * Command Manager
 * 
 * Manages editor commands and provides undo/redo functionality.
 */

import type { Editor, Command } from '@/types';
import { EventEmitter } from '@/utils/event-emitter';
import { logger } from '@/utils/logger';

/**
 * Command execution result
 */
export interface CommandResult {
  success: boolean;
  result?: any;
  error?: Error;
}

/**
 * Command history entry
 */
interface CommandHistoryEntry {
  command: string;
  args: any[];
  timestamp: number;
  result?: any;
}

/**
 * Command manager events
 */
interface CommandManagerEvents {
  'command-registered': { name: string; command: Command };
  'command-unregistered': { name: string };
  'command-executed': { name: string; args: any[]; result: CommandResult };
  'command-failed': { name: string; args: any[]; error: Error };
}

/**
 * Command manager implementation
 */
export class CommandManager extends EventEmitter<CommandManagerEvents> {
  private editor: Editor;
  private commands = new Map<string, Command>();
  private history: CommandHistoryEntry[] = [];
  private maxHistorySize = 100;

  constructor(editor: Editor) {
    super();
    this.editor = editor;
    this.registerBuiltinCommands();
  }

  /**
   * Register a command
   */
  register(name: string, command: Command): void {
    if (this.commands.has(name)) {
      logger.warn(`Command "${name}" is already registered, overwriting`);
    }

    this.commands.set(name, command);
    logger.debug(`Command "${name}" registered`);
    this.emit('command-registered', { name, command });
  }

  /**
   * Unregister a command
   */
  unregister(name: string): void {
    if (!this.commands.has(name)) {
      logger.warn(`Command "${name}" is not registered`);
      return;
    }

    this.commands.delete(name);
    logger.debug(`Command "${name}" unregistered`);
    this.emit('command-unregistered', { name });
  }

  /**
   * Execute a command
   */
  async execute(name: string, ...args: any[]): Promise<CommandResult> {
    const command = this.commands.get(name);
    if (!command) {
      const error = new Error(`Command "${name}" is not registered`);
      this.emit('command-failed', { name, args, error });
      return { success: false, error };
    }

    // Check if command can execute
    if (command.canExecute && !command.canExecute(this.editor, ...args)) {
      const error = new Error(`Command "${name}" cannot execute with given arguments`);
      this.emit('command-failed', { name, args, error });
      return { success: false, error };
    }

    try {
      logger.debug(`Executing command "${name}" with args:`, args);
      const result = await command.execute(this.editor, ...args);

      // Add to history
      this.addToHistory(name, args, result);

      const commandResult: CommandResult = { success: true, result };
      this.emit('command-executed', { name, args, result: commandResult });
      return commandResult;
    } catch (error) {
      logger.error(`Command "${name}" failed:`, error);
      const commandResult: CommandResult = { success: false, error: error as Error };
      this.emit('command-failed', { name, args, error: error as Error });
      return commandResult;
    }
  }

  /**
   * Check if a command exists
   */
  has(name: string): boolean {
    return this.commands.has(name);
  }

  /**
   * Get a command
   */
  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  /**
   * Get all registered commands
   */
  list(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * Get command history
   */
  getHistory(): CommandHistoryEntry[] {
    return [...this.history];
  }

  /**
   * Clear command history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Set maximum history size
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(0, size);
    this.trimHistory();
  }

  /**
   * Add command to history
   */
  private addToHistory(command: string, args: any[], result?: any): void {
    this.history.push({
      command,
      args,
      timestamp: Date.now(),
      result,
    });

    this.trimHistory();
  }

  /**
   * Trim history to max size
   */
  private trimHistory(): void {
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  /**
   * Register built-in commands
   */
  private registerBuiltinCommands(): void {
    // Insert text command
    this.register('insertText', {
      name: 'insertText',
      execute: (editor: Editor, index: number, text: string, source = 'api') => {
        editor.insertText(index, text, source);
        return { index, text, source };
      },
      canExecute: (_editor: Editor, _index: number, _text: string) => {
        return typeof _index === 'number' && typeof _text === 'string' && _index >= 0;
      },
    });

    // Delete text command
    this.register('deleteText', {
      name: 'deleteText',
      execute: (editor: Editor, index: number, length: number, source = 'api') => {
        editor.deleteText(index, length, source);
        return { index, length, source };
      },
      canExecute: (_editor: Editor, _index: number, _length: number) => {
        return typeof _index === 'number' && typeof _length === 'number' &&
               _index >= 0 && _length > 0;
      },
    });

    // Format text command
    this.register('formatText', {
      name: 'formatText',
      execute: (editor: Editor, index: number, length: number, format: string, value: any, source = 'api') => {
        editor.formatText(index, length, format, value, source);
        return { index, length, format, value, source };
      },
      canExecute: (_editor: Editor, _index: number, _length: number, _format: string) => {
        return typeof _index === 'number' && typeof _length === 'number' &&
               typeof _format === 'string' && _index >= 0 && _length >= 0;
      },
    });

    // Insert embed command
    this.register('insertEmbed', {
      name: 'insertEmbed',
      execute: (editor: Editor, index: number, type: string, value: any, source = 'api') => {
        editor.insertEmbed(index, type, value, source);
        return { index, type, value, source };
      },
      canExecute: (_editor: Editor, _index: number, _type: string, _value: any) => {
        return typeof _index === 'number' && typeof _type === 'string' &&
               _index >= 0 && _value != null;
      },
    });

    // Set selection command
    this.register('setSelection', {
      name: 'setSelection',
      execute: (editor: Editor, index: number, length = 0, source = 'api') => {
        editor.setSelection({ index, length }, source);
        return { index, length, source };
      },
      canExecute: (_editor: Editor, _index: number, _length = 0) => {
        return typeof _index === 'number' && typeof _length === 'number' &&
               _index >= 0 && _length >= 0;
      },
    });

    // Focus command
    this.register('focus', {
      name: 'focus',
      execute: (editor: Editor) => {
        editor.focus();
        return { focused: true };
      },
    });

    // Blur command
    this.register('blur', {
      name: 'blur',
      execute: (editor: Editor) => {
        editor.blur();
        return { focused: false };
      },
    });

    // Enable/disable command
    this.register('enable', {
      name: 'enable',
      execute: (editor: Editor, enabled = true) => {
        editor.enable(enabled);
        return { enabled };
      },
      canExecute: (_editor: Editor, _enabled = true) => {
        return typeof _enabled === 'boolean';
      },
    });

    // Get content command
    this.register('getContents', {
      name: 'getContents',
      execute: (editor: Editor) => {
        return editor.getContents();
      },
    });

    // Set content command
    this.register('setContents', {
      name: 'setContents',
      execute: (editor: Editor, delta: any, source = 'api') => {
        editor.setContents(delta, source);
        return { delta, source };
      },
      canExecute: (_editor: Editor, _delta: any) => {
        return _delta != null;
      },
    });

    // Get text command
    this.register('getText', {
      name: 'getText',
      execute: (editor: Editor, index?: number, length?: number) => {
        return editor.getText(index, length);
      },
    });

    // Get format command
    this.register('getFormat', {
      name: 'getFormat',
      execute: (editor: Editor, range?: any) => {
        return editor.getFormat(range);
      },
    });

    // Remove format command
    this.register('removeFormat', {
      name: 'removeFormat',
      execute: (editor: Editor, index: number, length: number, source = 'api') => {
        editor.removeFormat(index, length, source);
        return { index, length, source };
      },
      canExecute: (_editor: Editor, _index: number, _length: number) => {
        return typeof _index === 'number' && typeof _length === 'number' &&
               _index >= 0 && _length > 0;
      },
    });

    logger.debug('Built-in commands registered');
  }

  /**
   * Dispose of the command manager
   */
  override dispose(): void {
    this.commands.clear();
    this.history = [];
    super.dispose();
  }
}
