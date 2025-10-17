/**
 * Plugin Shared State System
 * 
 * Provides reactive state sharing between plugins with:
 * - Namespace isolation
 * - Type safety
 * - Cross-plugin communication
 * - State synchronization
 */

import type { Logger, Plugin } from '../types'
import { computed, type ComputedRef, reactive, ref, type Ref, watch, type WatchCallback } from 'vue'
import { ReactiveStateManager } from '../state/reactive-state'

// Plugin state access levels
export type AccessLevel = 'private' | 'protected' | 'public'

// Plugin state metadata
export interface PluginStateMetadata {
  pluginName: string
  key: string
  access: AccessLevel
  description?: string
  type?: string
  readonly?: boolean
  persist?: boolean
}

// Shared state entry
export interface SharedStateEntry<T = unknown> {
  value: Ref<T>
  metadata: PluginStateMetadata
  watchers: Set<WatchCallback<T, T>>
  dependencies: Set<string>
}

// Plugin state context
export interface PluginStateContext {
  pluginName: string
  permissions: Set<string>
  dependencies: string[]
}

// Inter-plugin message
export interface PluginMessage<T = unknown> {
  from: string
  to: string | '*'
  type: string
  data: T
  timestamp: number
}

/**
 * Plugin Shared State Manager
 * 
 * Manages shared state between plugins with proper isolation and access control
 */
export class PluginSharedStateManager {
  // Namespace-isolated states
  private namespaces = new Map<string, ReactiveStateManager>()
  
  // Shared state registry
  private sharedStates = new Map<string, SharedStateEntry>()
  
  // Plugin contexts
  private pluginContexts = new Map<string, PluginStateContext>()
  
  // Message bus for inter-plugin communication
  private messageBus = reactive<PluginMessage[]>([])
  private messageHandlers = new Map<string, Set<(message: PluginMessage) => void>>()
  
  // Global computed states
  private globalComputed = new Map<string, ComputedRef<unknown>>()
  
  constructor(private logger?: Logger) {}

  /**
   * Register a plugin with the shared state system
   */
  registerPlugin(plugin: Plugin): void {
    const context: PluginStateContext = {
      pluginName: plugin.name,
      permissions: new Set(),
      dependencies: (plugin.metadata?.dependencies as string[] | undefined) || []
    }
    
    this.pluginContexts.set(plugin.name, context)
    
    // Create isolated namespace for the plugin
    const namespace = new ReactiveStateManager(this.logger)
    this.namespaces.set(plugin.name, namespace)
    
    this.logger?.debug(`Plugin "${plugin.name}" registered in shared state system`)
  }

  /**
   * Unregister a plugin from the shared state system
   */
  unregisterPlugin(pluginName: string): void {
    // Clean up namespace
    const namespace = this.namespaces.get(pluginName)
    if (namespace) {
      namespace.dispose()
      this.namespaces.delete(pluginName)
    }
    
    // Clean up shared states owned by this plugin
    for (const [key, entry] of this.sharedStates) {
      if (entry.metadata.pluginName === pluginName) {
        this.sharedStates.delete(key)
      }
    }
    
    // Clean up message handlers
    this.messageHandlers.delete(pluginName)
    
    // Remove plugin context
    this.pluginContexts.delete(pluginName)
    
    this.logger?.debug(`Plugin "${pluginName}" unregistered from shared state system`)
  }

  /**
   * Get a plugin's isolated namespace
   */
  getNamespace(pluginName: string): ReactiveStateManager | undefined {
    return this.namespaces.get(pluginName)
  }

  /**
   * Create a shared state that can be accessed by other plugins
   */
  createSharedState<T = unknown>(
    pluginName: string,
    key: string,
    initialValue: T,
    options?: {
      access?: AccessLevel
      description?: string
      readonly?: boolean
      persist?: boolean
    }
  ): Ref<T> {
    const fullKey = `${pluginName}:${key}`
    
    // Check if already exists
    if (this.sharedStates.has(fullKey)) {
      throw new Error(`Shared state "${fullKey}" already exists`)
    }
    
    const valueRef = ref(initialValue) as Ref<T>
    
    const metadata: PluginStateMetadata = {
      pluginName,
      key,
      access: options?.access || 'protected',
      description: options?.description,
      type: typeof initialValue,
      readonly: options?.readonly || false,
      persist: options?.persist || false
    }
    
    const entry: SharedStateEntry<T> = {
      value: valueRef,
      metadata,
      watchers: new Set(),
      dependencies: new Set()
    }
    
    this.sharedStates.set(fullKey, entry as SharedStateEntry)
    
    // Setup persistence if needed
    if (options?.persist) {
      this.setupPersistence(fullKey, valueRef)
    }
    
    this.logger?.debug(`Created shared state "${fullKey}"`, metadata)
    
    return valueRef
  }

  /**
   * Access a shared state from another plugin
   */
  accessSharedState<T = unknown>(
    requestingPlugin: string,
    ownerPlugin: string,
    key: string
  ): Ref<T> | undefined {
    const fullKey = `${ownerPlugin}:${key}`
    const entry = this.sharedStates.get(fullKey)
    
    if (!entry) {
      this.logger?.warn(`Shared state "${fullKey}" not found`)
      return undefined
    }
    
    // Check access permissions
    if (!this.checkAccess(requestingPlugin, entry.metadata)) {
      this.logger?.warn(`Access denied to shared state "${fullKey}" for plugin "${requestingPlugin}"`)
      return undefined
    }
    
    // Track dependency
    entry.dependencies.add(requestingPlugin)
    
    // Return readonly ref if the state is marked as readonly
    if (entry.metadata.readonly) {
      return computed(() => entry.value.value) as ComputedRef<T>
    }
    
    return entry.value as Ref<T>
  }

  /**
   * Watch a shared state for changes
   */
  watchSharedState<T = unknown>(
    pluginName: string,
    ownerPlugin: string,
    key: string,
    callback: WatchCallback<T, T>
  ): () => void {
    const state = this.accessSharedState<T>(pluginName, ownerPlugin, key)
    
    if (!state) {
      throw new Error(`Cannot watch non-existent shared state "${ownerPlugin}:${key}"`)
    }
    
    return watch(state, callback)
  }

  /**
   * Create a computed state that derives from multiple shared states
   */
  createGlobalComputed<T = unknown>(
    key: string,
    getter: () => T,
    options?: {
      cache?: boolean
      description?: string
    }
  ): ComputedRef<T> {
    if (this.globalComputed.has(key)) {
      throw new Error(`Global computed state "${key}" already exists`)
    }
    
    const computedState = computed(getter)
    this.globalComputed.set(key, computedState as ComputedRef<unknown>)
    
    this.logger?.debug(`Created global computed state "${key}"`, options)
    
    return computedState
  }

  /**
   * Get a global computed state
   */
  getGlobalComputed<T = unknown>(key: string): ComputedRef<T> | undefined {
    return this.globalComputed.get(key) as ComputedRef<T> | undefined
  }

  /**
   * Send a message to another plugin or broadcast to all
   */
  sendMessage<T = unknown>(
    from: string,
    to: string | '*',
    type: string,
    data: T
  ): void {
    const message: PluginMessage<T> = {
      from,
      to,
      type,
      data,
      timestamp: Date.now()
    }
    
    this.messageBus.push(message as PluginMessage)
    
    // Trigger handlers
    if (to === '*') {
      // Broadcast to all plugins
      for (const [pluginName, handlers] of this.messageHandlers) {
        if (pluginName !== from) {
          handlers.forEach(handler => handler(message as PluginMessage))
        }
      }
    } else {
      // Send to specific plugin
      const handlers = this.messageHandlers.get(to)
      if (handlers) {
        handlers.forEach(handler => handler(message as PluginMessage))
      }
    }
    
    this.logger?.debug(`Message sent from "${from}" to "${to}"`, { type, data })
  }

  /**
   * Subscribe to messages for a plugin
   */
  onMessage(
    pluginName: string,
    handler: (message: PluginMessage) => void,
    filter?: (message: PluginMessage) => boolean
  ): () => void {
    if (!this.messageHandlers.has(pluginName)) {
      this.messageHandlers.set(pluginName, new Set())
    }
    
    const wrappedHandler = filter 
      ? (msg: PluginMessage) => filter(msg) && handler(msg)
      : handler
    
    this.messageHandlers.get(pluginName)!.add(wrappedHandler)
    
    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(pluginName)
      if (handlers) {
        handlers.delete(wrappedHandler)
      }
    }
  }

  /**
   * Create a reactive bridge between plugins
   */
  createBridge<T = unknown>(
    sourcePlugin: string,
    sourceKey: string,
    targetPlugin: string,
    targetKey: string,
    transformer?: (value: T) => unknown
  ): () => void {
    const source = this.accessSharedState<T>(targetPlugin, sourcePlugin, sourceKey)
    const target = this.getNamespace(targetPlugin)
    
    if (!source || !target) {
      throw new Error('Cannot create bridge: source or target not found')
    }
    
    // Watch source and update target
    return watch(source, (newValue) => {
      const transformed = transformer ? transformer(newValue) : newValue
      target.set(targetKey, transformed)
    })
  }

  /**
   * Synchronize state between multiple plugins
   */
  synchronize(
    plugins: string[],
    key: string,
    options?: {
      bidirectional?: boolean
      debounce?: number
    }
  ): () => void {
    const unsubscribes: Array<() => void> = []
    const { bidirectional = true, debounce: debounceMs = 0 } = options || {}
    
    let syncing = false
    const syncFn = (value: unknown) => {
      if (syncing) return
      syncing = true
      
      plugins.forEach(plugin => {
        const namespace = this.getNamespace(plugin)
        if (namespace) {
          namespace.set(key, value)
        }
      })
      
      setTimeout(() => syncing = false, 0)
    }
    
    const debouncedSync = debounceMs > 0 
      ? this.debounce(syncFn, debounceMs)
      : syncFn
    
    // Setup watchers
    plugins.forEach(plugin => {
      const namespace = this.getNamespace(plugin)
      if (namespace && bidirectional) {
        const unsubscribe = namespace.watch(key, debouncedSync)
        unsubscribes.push(unsubscribe)
      }
    })
    
    return () => {
      unsubscribes.forEach(fn => fn())
    }
  }

  /**
   * Get state dependency graph
   */
  getDependencyGraph(): Record<string, string[]> {
    const graph: Record<string, string[]> = {}
    
    for (const [key, entry] of this.sharedStates) {
      graph[key] = Array.from(entry.dependencies)
    }
    
    return graph
  }

  /**
   * Get state statistics
   */
  getStats(): {
    totalPlugins: number
    totalSharedStates: number
    totalGlobalComputed: number
    totalMessages: number
    memoryUsage: string
  } {
    const memoryUsage = JSON.stringify({
      states: Array.from(this.sharedStates.values()).map(e => e.value.value),
      messages: this.messageBus
    }).length
    
    return {
      totalPlugins: this.pluginContexts.size,
      totalSharedStates: this.sharedStates.size,
      totalGlobalComputed: this.globalComputed.size,
      totalMessages: this.messageBus.length,
      memoryUsage: `${(memoryUsage / 1024).toFixed(2)} KB`
    }
  }

  // Helper methods
  
  private checkAccess(requestingPlugin: string, metadata: PluginStateMetadata): boolean {
    // Public states can be accessed by anyone
    if (metadata.access === 'public') {
      return true
    }
    
    // Private states can only be accessed by the owner
    if (metadata.access === 'private') {
      return requestingPlugin === metadata.pluginName
    }
    
    // Protected states can be accessed by the owner and its dependencies
    if (metadata.access === 'protected') {
      const context = this.pluginContexts.get(requestingPlugin)
      if (!context) return false
      
      return requestingPlugin === metadata.pluginName || 
             context.dependencies.includes(metadata.pluginName)
    }
    
    return false
  }

  private setupPersistence<T>(key: string, valueRef: Ref<T>): void {
    if (typeof window === 'undefined') return
    
    const storageKey = `plugin-state:${key}`
    
    // Load initial value
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        valueRef.value = JSON.parse(stored)
      } catch (error) {
        this.logger?.error(`Failed to load persisted state for "${key}"`, error)
      }
    }
    
    // Save on change
    watch(valueRef, (newValue) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newValue))
      } catch (error) {
        this.logger?.error(`Failed to persist state for "${key}"`, error)
      }
    })
  }

  private debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
  ): T {
    let timeout: NodeJS.Timeout | undefined
    return ((...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }) as T
  }

  /**
   * Dispose and clean up all resources
   */
  dispose(): void {
    // Dispose all namespaces
    for (const namespace of this.namespaces.values()) {
      namespace.dispose()
    }
    this.namespaces.clear()
    
    // Clear all shared states
    this.sharedStates.clear()
    
    // Clear all handlers
    this.messageHandlers.clear()
    
    // Clear computed states
    this.globalComputed.clear()
    
    // Clear contexts
    this.pluginContexts.clear()
    
    // Clear message bus
    this.messageBus.length = 0
  }
}

/**
 * Create a plugin shared state manager
 */
export function createPluginSharedStateManager(logger?: Logger): PluginSharedStateManager {
  return new PluginSharedStateManager(logger)
}

/**
 * Plugin state composable for Vue components
 */
export function usePluginState<T = unknown>(
  pluginName: string,
  key: string,
  defaultValue?: T
): {
  state: Ref<T | undefined>
  setState: (value: T) => void
  watchState: (callback: WatchCallback<T | undefined, T | undefined>) => () => void
} {
  const state = ref<T | undefined>(defaultValue)
  
  const setState = (value: T) => {
    state.value = value
  }
  
  const watchState = (callback: WatchCallback<T | undefined, T | undefined>) => {
    const stopWatch = watch(state, callback as any)
    return stopWatch
  }
  
  return { 
    state: state as Ref<T | undefined>, 
    setState, 
    watchState 
  }
}