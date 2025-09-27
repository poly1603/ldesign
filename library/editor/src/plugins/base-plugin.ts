/**
 * Base Plugin
 * 
 * Abstract base class for all editor plugins.
 */

import type { Plugin, Editor, Command, Format, UIComponent } from '@/types';
import { EventEmitter } from '@/utils/event-emitter';
import { logger } from '@/utils/logger';

/**
 * Plugin events
 */
interface PluginEvents {
  'installed': { editor: Editor };
  'uninstalled': { editor: Editor };
  'enabled': { editor: Editor };
  'disabled': { editor: Editor };
  'error': { error: Error };
}

/**
 * Base plugin options
 */
export interface BasePluginOptions {
  enabled?: boolean;
  debug?: boolean;
}

/**
 * Abstract base plugin class
 */
export abstract class BasePlugin extends EventEmitter<PluginEvents> implements Plugin {
  abstract readonly name: string;
  abstract readonly version: string;
  
  readonly dependencies?: string[];
  readonly commands?: Record<string, Command>;
  readonly formats?: Record<string, Format>;
  readonly ui?: UIComponent[];

  protected editor?: Editor;
  protected options: BasePluginOptions;
  protected installed = false;
  protected enabled = true;
  protected logger!: typeof logger;

  constructor(options: BasePluginOptions = {}) {
    super();
    
    this.options = {
      enabled: true,
      debug: false,
      ...options,
    };

    this.enabled = this.options.enabled ?? true;
    // Logger will be initialized in subclass
  }

  /**
   * Install plugin
   */
  async install(editor: Editor): Promise<void> {
    if (this.installed) {
      this.logger.warn('Plugin is already installed');
      return;
    }

    try {
      this.editor = editor;
      
      // Call implementation-specific installation
      await this.onInstall(editor);
      
      this.installed = true;
      this.logger.info('Plugin installed');
      this.emit('installed', { editor });
      
      // Enable plugin if it should be enabled
      if (this.enabled) {
        await this.enable();
      }
    } catch (error) {
      this.logger.error('Failed to install plugin:', error);
      this.emit('error', { error: error as Error });
      throw error;
    }
  }

  /**
   * Uninstall plugin
   */
  async uninstall(editor: Editor): Promise<void> {
    if (!this.installed) {
      this.logger.warn('Plugin is not installed');
      return;
    }

    try {
      // Disable plugin first
      if (this.enabled) {
        await this.disable();
      }

      // Call implementation-specific uninstallation
      await this.onUninstall(editor);
      
      this.installed = false;
      this.editor = undefined as any;
      this.logger.info('Plugin uninstalled');
      this.emit('uninstalled', { editor });
    } catch (error) {
      this.logger.error('Failed to uninstall plugin:', error);
      this.emit('error', { error: error as Error });
      throw error;
    }
  }

  /**
   * Enable plugin
   */
  async enable(): Promise<void> {
    if (!this.installed) {
      throw new Error('Plugin must be installed before enabling');
    }

    if (this.enabled) {
      this.logger.debug('Plugin is already enabled');
      return;
    }

    try {
      await this.onEnable(this.editor!);
      this.enabled = true;
      this.logger.info('Plugin enabled');
      this.emit('enabled', { editor: this.editor! });
    } catch (error) {
      this.logger.error('Failed to enable plugin:', error);
      this.emit('error', { error: error as Error });
      throw error;
    }
  }

  /**
   * Disable plugin
   */
  async disable(): Promise<void> {
    if (!this.installed) {
      throw new Error('Plugin must be installed before disabling');
    }

    if (!this.enabled) {
      this.logger.debug('Plugin is already disabled');
      return;
    }

    try {
      await this.onDisable(this.editor!);
      this.enabled = false;
      this.logger.info('Plugin disabled');
      this.emit('disabled', { editor: this.editor! });
    } catch (error) {
      this.logger.error('Failed to disable plugin:', error);
      this.emit('error', { error: error as Error });
      throw error;
    }
  }

  /**
   * Check if plugin is installed
   */
  isInstalled(): boolean {
    return this.installed;
  }

  /**
   * Check if plugin is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get plugin options
   */
  getOptions(): BasePluginOptions {
    return { ...this.options };
  }

  /**
   * Update plugin options
   */
  setOptions(options: Partial<BasePluginOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get editor instance
   */
  getEditor(): Editor | undefined {
    return this.editor;
  }

  /**
   * Create a DOM element with classes
   */
  protected createElement(tag: string, classes?: string[], attributes?: Record<string, string>): HTMLElement {
    const element = document.createElement(tag);
    
    if (classes) {
      element.classList.add(...classes);
    }
    
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
      }
    }
    
    return element;
  }

  /**
   * Add event listener with automatic cleanup
   */
  protected addEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(type, listener as EventListener, options);

    // Store for cleanup
    if (!this.eventListeners) {
      this.eventListeners = [];
    }
    this.eventListeners.push({
      element,
      type,
      listener: listener as EventListener,
      ...(options !== undefined && { options })
    });
  }

  private eventListeners: Array<{
    element: HTMLElement;
    type: string;
    listener: EventListener;
    options?: boolean | AddEventListenerOptions;
  }> = [];

  /**
   * Clean up event listeners
   */
  protected cleanupEventListeners(): void {
    for (const { element, type, listener, options } of this.eventListeners) {
      element.removeEventListener(type, listener, options);
    }
    this.eventListeners = [];
  }

  /**
   * Dispose of the plugin
   */
  override dispose(): void {
    if (this.installed && this.editor) {
      this.uninstall(this.editor);
    }
    
    this.cleanupEventListeners();
    super.dispose();
  }

  // Abstract methods to be implemented by subclasses

  /**
   * Called when plugin is installed
   */
  protected abstract onInstall(editor: Editor): Promise<void> | void;

  /**
   * Called when plugin is uninstalled
   */
  protected abstract onUninstall(editor: Editor): Promise<void> | void;

  /**
   * Called when plugin is enabled
   */
  protected onEnable(_editor: Editor): Promise<void> | void {
    // Default implementation - override if needed
  }

  /**
   * Called when plugin is disabled
   */
  protected onDisable(_editor: Editor): Promise<void> | void {
    // Default implementation - override if needed
  }
}

/**
 * Simple plugin implementation for basic plugins
 */
export abstract class SimplePlugin extends BasePlugin {
  protected override onEnable(_editor: Editor): void {
    // Simple plugins are always enabled when installed
  }

  protected override onDisable(_editor: Editor): void {
    // Simple plugins are always enabled when installed
  }
}
