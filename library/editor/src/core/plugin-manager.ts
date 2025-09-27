/**
 * Plugin Manager
 * 
 * Manages plugin registration, loading, and lifecycle.
 */

import type { Plugin, Editor, Command, Format, UIComponent } from '@/types';
import { EventEmitter } from '@/utils/event-emitter';
import { logger } from '@/utils/logger';

/**
 * Plugin manager events
 */
interface PluginManagerEvents {
  'plugin-registered': { plugin: Plugin };
  'plugin-unregistered': { name: string };
  'plugin-loaded': { plugin: Plugin; editor: Editor };
  'plugin-unloaded': { plugin: Plugin; editor: Editor };
  'plugin-error': { plugin: Plugin; error: Error };
}

/**
 * Plugin dependency graph node
 */
interface DependencyNode {
  plugin: Plugin;
  dependencies: string[];
  dependents: Set<string>;
  loaded: boolean;
}

/**
 * Plugin manager implementation
 */
export class PluginManager extends EventEmitter<PluginManagerEvents> {
  private plugins = new Map<string, Plugin>();
  private loadedPlugins = new Map<string, Plugin>();
  private dependencyGraph = new Map<string, DependencyNode>();
  private commands = new Map<string, Command>();
  private formats = new Map<string, Format>();
  private uiComponents = new Map<string, UIComponent>();

  /**
   * Register a plugin
   */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    // Validate plugin
    this.validatePlugin(plugin);

    // Register plugin
    this.plugins.set(plugin.name, plugin);

    // Build dependency graph
    this.buildDependencyGraph(plugin);

    // Register plugin commands
    if (plugin.commands) {
      for (const [name, command] of Object.entries(plugin.commands)) {
        this.commands.set(name, command);
      }
    }

    // Register plugin formats
    if (plugin.formats) {
      for (const [name, format] of Object.entries(plugin.formats)) {
        this.formats.set(name, format);
      }
    }

    // Register plugin UI components
    if (plugin.ui) {
      for (const component of plugin.ui) {
        this.uiComponents.set(component.name, component);
      }
    }

    logger.info(`Plugin "${plugin.name}" registered`);
    this.emit('plugin-registered', { plugin });
  }

  /**
   * Unregister a plugin
   */
  unregister(name: string): void {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin "${name}" is not registered`);
    }

    // Check if plugin has dependents
    const node = this.dependencyGraph.get(name);
    if (node && node.dependents.size > 0) {
      const dependents = Array.from(node.dependents).join(', ');
      throw new Error(`Cannot unregister plugin "${name}" because it has dependents: ${dependents}`);
    }

    // Remove from dependency graph
    this.removeDependencyNode(name);

    // Unregister commands
    if (plugin.commands) {
      for (const commandName of Object.keys(plugin.commands)) {
        this.commands.delete(commandName);
      }
    }

    // Unregister formats
    if (plugin.formats) {
      for (const formatName of Object.keys(plugin.formats)) {
        this.formats.delete(formatName);
      }
    }

    // Unregister UI components
    if (plugin.ui) {
      for (const component of plugin.ui) {
        this.uiComponents.delete(component.name);
      }
    }

    // Remove plugin
    this.plugins.delete(name);
    this.loadedPlugins.delete(name);

    logger.info(`Plugin "${name}" unregistered`);
    this.emit('plugin-unregistered', { name });
  }

  /**
   * Load plugins for an editor
   */
  async loadPlugins(editor: Editor, pluginNames?: string[]): Promise<void> {
    const toLoad = pluginNames || Array.from(this.plugins.keys());
    const loadOrder = this.getLoadOrder(toLoad);

    for (const name of loadOrder) {
      await this.loadPlugin(name, editor);
    }
  }

  /**
   * Load a specific plugin
   */
  async loadPlugin(name: string, editor: Editor): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin "${name}" is not registered`);
    }

    if (this.loadedPlugins.has(name)) {
      logger.debug(`Plugin "${name}" is already loaded`);
      return;
    }

    try {
      // Load dependencies first
      if (plugin.dependencies) {
        for (const depName of plugin.dependencies) {
          if (!this.loadedPlugins.has(depName)) {
            await this.loadPlugin(depName, editor);
          }
        }
      }

      // Install plugin
      await plugin.install(editor);

      // Mark as loaded
      this.loadedPlugins.set(name, plugin);
      const node = this.dependencyGraph.get(name);
      if (node) {
        node.loaded = true;
      }

      logger.info(`Plugin "${name}" loaded`);
      this.emit('plugin-loaded', { plugin, editor });
    } catch (error) {
      logger.error(`Failed to load plugin "${name}":`, error);
      this.emit('plugin-error', { plugin, error: error as Error });
      throw error;
    }
  }

  /**
   * Unload plugins for an editor
   */
  async unloadPlugins(editor: Editor): Promise<void> {
    const loadedNames = Array.from(this.loadedPlugins.keys());
    const unloadOrder = this.getUnloadOrder(loadedNames);

    for (const name of unloadOrder) {
      await this.unloadPlugin(name, editor);
    }
  }

  /**
   * Unload a specific plugin
   */
  async unloadPlugin(name: string, editor: Editor): Promise<void> {
    const plugin = this.loadedPlugins.get(name);
    if (!plugin) {
      logger.debug(`Plugin "${name}" is not loaded`);
      return;
    }

    try {
      // Unload dependents first
      const node = this.dependencyGraph.get(name);
      if (node) {
        for (const dependentName of node.dependents) {
          if (this.loadedPlugins.has(dependentName)) {
            await this.unloadPlugin(dependentName, editor);
          }
        }
      }

      // Uninstall plugin
      await plugin.uninstall(editor);

      // Mark as unloaded
      this.loadedPlugins.delete(name);
      if (node) {
        node.loaded = false;
      }

      logger.info(`Plugin "${name}" unloaded`);
      this.emit('plugin-unloaded', { plugin, editor });
    } catch (error) {
      logger.error(`Failed to unload plugin "${name}":`, error);
      this.emit('plugin-error', { plugin, error: error as Error });
      throw error;
    }
  }

  /**
   * Get registered plugin
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Get all registered plugins
   */
  list(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get loaded plugins
   */
  getLoaded(): Plugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * Check if plugin is registered
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Check if plugin is loaded
   */
  isLoaded(name: string): boolean {
    return this.loadedPlugins.has(name);
  }

  /**
   * Get command by name
   */
  getCommand(name: string): Command | undefined {
    return this.commands.get(name);
  }

  /**
   * Get format by name
   */
  getFormat(name: string): Format | undefined {
    return this.formats.get(name);
  }

  /**
   * Get UI component by name
   */
  getUIComponent(name: string): UIComponent | undefined {
    return this.uiComponents.get(name);
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: Plugin): void {
    if (!plugin.name) {
      throw new Error('Plugin must have a name');
    }

    if (!plugin.version) {
      throw new Error('Plugin must have a version');
    }

    if (typeof plugin.install !== 'function') {
      throw new Error('Plugin must have an install function');
    }

    if (typeof plugin.uninstall !== 'function') {
      throw new Error('Plugin must have an uninstall function');
    }

    // Validate dependencies
    if (plugin.dependencies) {
      for (const depName of plugin.dependencies) {
        if (!this.plugins.has(depName)) {
          throw new Error(`Plugin dependency "${depName}" is not registered`);
        }
      }
    }
  }

  /**
   * Build dependency graph for a plugin
   */
  private buildDependencyGraph(plugin: Plugin): void {
    const node: DependencyNode = {
      plugin,
      dependencies: plugin.dependencies || [],
      dependents: new Set(),
      loaded: false,
    };

    this.dependencyGraph.set(plugin.name, node);

    // Update dependents
    if (plugin.dependencies) {
      for (const depName of plugin.dependencies) {
        const depNode = this.dependencyGraph.get(depName);
        if (depNode) {
          depNode.dependents.add(plugin.name);
        }
      }
    }
  }

  /**
   * Remove dependency graph node
   */
  private removeDependencyNode(name: string): void {
    const node = this.dependencyGraph.get(name);
    if (!node) return;

    // Remove from dependents
    for (const depName of node.dependencies) {
      const depNode = this.dependencyGraph.get(depName);
      if (depNode) {
        depNode.dependents.delete(name);
      }
    }

    this.dependencyGraph.delete(name);
  }

  /**
   * Get plugin load order based on dependencies
   */
  private getLoadOrder(pluginNames: string[]): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (name: string): void => {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected involving plugin "${name}"`);
      }

      visiting.add(name);

      const node = this.dependencyGraph.get(name);
      if (node) {
        for (const depName of node.dependencies) {
          if (pluginNames.includes(depName)) {
            visit(depName);
          }
        }
      }

      visiting.delete(name);
      visited.add(name);
      result.push(name);
    };

    for (const name of pluginNames) {
      visit(name);
    }

    return result;
  }

  /**
   * Get plugin unload order (reverse of load order)
   */
  private getUnloadOrder(pluginNames: string[]): string[] {
    return this.getLoadOrder(pluginNames).reverse();
  }

  /**
   * Dispose of the plugin manager
   */
  override dispose(): void {
    this.plugins.clear();
    this.loadedPlugins.clear();
    this.dependencyGraph.clear();
    this.commands.clear();
    this.formats.clear();
    this.uiComponents.clear();
    super.dispose();
  }
}
