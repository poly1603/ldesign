/**
 * Plugin type definitions
 */

import type { ViewerOptions } from './viewer';
import type { IEventEmitter } from './events';

/**
 * Plugin interface
 */
export interface IPlugin {
 /**
  * Plugin name
  */
 name: string;

 /**
  * Plugin version
  */
 version: string;

 /**
  * Initialize the plugin
  */
 initialize(context: PluginContext): void;

 /**
  * Destroy and cleanup
  */
 destroy(): void;
}

/**
 * Plugin context
 */
export interface PluginContext {
 container: HTMLElement;
 options: ViewerOptions;
 eventEmitter: IEventEmitter;
 documentType?: string;
}

/**
 * Plugin configuration
 */
export interface PluginConfig {
 enabled: boolean;
 options?: Record<string, any>;
}
