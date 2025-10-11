/**
 * Namespace support for i18n
 *
 * 提供命名空间功能，支持模块化的翻译组织
 *
 * @author LDesign Team
 * @version 2.0.0
 */

import type { NestedObject, TranslationParams } from './types'
import { getNestedValue, setNestedValue } from '../utils/path'

/**
 * Namespace configuration
 */
export interface NamespaceConfig {
  /** Default namespace */
  defaultNamespace?: string
  /** Namespace separator */
  separator?: string
  /** Allow namespace nesting */
  allowNesting?: boolean
  /** Namespace loading strategy */
  loadingStrategy?: 'eager' | 'lazy' | 'onDemand'
  /** Namespace isolation (prevent cross-namespace access) */
  isolation?: boolean
}

/**
 * Namespace metadata
 */
export interface NamespaceMetadata {
  /** Namespace name */
  name: string
  /** Parent namespace */
  parent?: string
  /** Child namespaces */
  children: Set<string>
  /** Is namespace loaded */
  loaded: boolean
  /** Loading promise */
  loadingPromise?: Promise<void>
  /** Namespace size in bytes */
  size?: number
  /** Last access time */
  lastAccess?: number
  /** Access count */
  accessCount: number
}

/**
 * Namespace manager class
 *
 * 管理翻译的命名空间
 */
export class NamespaceManager {
  private namespaces = new Map<string, NamespaceMetadata>()
  private translations = new Map<string, Map<string, NestedObject>>()
  private config: Required<NamespaceConfig>
  private accessHistory: string[] = []
  private maxHistorySize = 100

  constructor(config: NamespaceConfig = {}) {
    this.config = {
      defaultNamespace: config.defaultNamespace || 'default',
      separator: config.separator || ':',
      allowNesting: config.allowNesting ?? true,
      loadingStrategy: config.loadingStrategy || 'lazy',
      isolation: config.isolation ?? false,
    }

    // Initialize default namespace
    this.createNamespace(this.config.defaultNamespace)
  }

  /**
   * Create a new namespace
   */
  createNamespace(name: string, parent?: string): void {
    if (this.namespaces.has(name)) {
      return
    }

    const metadata: NamespaceMetadata = {
      name,
      parent,
      children: new Set(),
      loaded: false,
      accessCount: 0,
    }

    this.namespaces.set(name, metadata)
    this.translations.set(name, new Map())

    // Update parent's children
    if (parent && this.namespaces.has(parent)) {
      const parentMeta = this.namespaces.get(parent)!
      parentMeta.children.add(name)
    }
  }

  /**
   * Load translations into a namespace
   */
  loadNamespace(
    namespace: string,
    locale: string,
    translations: NestedObject,
  ): void {
    if (!this.namespaces.has(namespace)) {
      this.createNamespace(namespace)
    }

    const nsTranslations = this.translations.get(namespace)!
    nsTranslations.set(locale, translations)

    const metadata = this.namespaces.get(namespace)!
    metadata.loaded = true
    metadata.size = JSON.stringify(translations).length
  }

  /**
   * Get translation from namespace
   */
  getTranslation(
    key: string,
    locale: string,
    namespace?: string,
  ): string | undefined {
    const ns = namespace || this.config.defaultNamespace

    // Record access
    this.recordAccess(ns)

    // Check if namespace exists
    if (!this.namespaces.has(ns)) {
      return undefined
    }

    // Check isolation
    if (this.config.isolation && namespace && namespace !== ns) {
      console.warn(`Cross-namespace access denied: ${namespace} -> ${ns}`)
      return undefined
    }

    const nsTranslations = this.translations.get(ns)
    if (!nsTranslations) {
      return undefined
    }

    const localeTranslations = nsTranslations.get(locale)
    if (!localeTranslations) {
      return undefined
    }

    return getNestedValue(localeTranslations, key) as string | undefined
  }

  /**
   * Set translation in namespace
   */
  setTranslation(
    key: string,
    value: string,
    locale: string,
    namespace?: string,
  ): void {
    const ns = namespace || this.config.defaultNamespace

    if (!this.namespaces.has(ns)) {
      this.createNamespace(ns)
    }

    const nsTranslations = this.translations.get(ns)!
    let localeTranslations = nsTranslations.get(locale)

    if (!localeTranslations) {
      localeTranslations = {}
      nsTranslations.set(locale, localeTranslations)
    }

    setNestedValue(localeTranslations as Record<string, any>, key, value)

    // Update metadata
    const metadata = this.namespaces.get(ns)!
    metadata.size = JSON.stringify(localeTranslations).length
  }

  /**
   * Parse namespace from key
   */
  parseNamespaceKey(key: string): { namespace: string, key: string } {
    const separatorIndex = key.indexOf(this.config.separator)

    if (separatorIndex === -1) {
      return {
        namespace: this.config.defaultNamespace,
        key,
      }
    }

    return {
      namespace: key.substring(0, separatorIndex),
      key: key.substring(separatorIndex + this.config.separator.length),
    }
  }

  /**
   * Build namespaced key
   */
  buildNamespacedKey(namespace: string, key: string): string {
    if (namespace === this.config.defaultNamespace) {
      return key
    }
    return `${namespace}${this.config.separator}${key}`
  }

  /**
   * Get all namespaces
   */
  getAllNamespaces(): string[] {
    return Array.from(this.namespaces.keys())
  }

  /**
   * Get namespace metadata
   */
  getNamespaceMetadata(namespace: string): NamespaceMetadata | undefined {
    return this.namespaces.get(namespace)
  }

  /**
   * Check if namespace exists
   */
  hasNamespace(namespace: string): boolean {
    return this.namespaces.has(namespace)
  }

  /**
   * Remove namespace
   */
  removeNamespace(namespace: string): boolean {
    if (namespace === this.config.defaultNamespace) {
      console.warn('Cannot remove default namespace')
      return false
    }

    // Remove from parent's children
    const metadata = this.namespaces.get(namespace)
    if (metadata?.parent) {
      const parentMeta = this.namespaces.get(metadata.parent)
      parentMeta?.children.delete(namespace)
    }

    // Remove children recursively
    if (metadata?.children.size) {
      for (const child of metadata.children) {
        this.removeNamespace(child)
      }
    }

    this.namespaces.delete(namespace)
    this.translations.delete(namespace)
    return true
  }

  /**
   * Get namespace hierarchy
   */
  getNamespaceHierarchy(): NamespaceTree {
    const tree: NamespaceTree = {}

    for (const [name, metadata] of this.namespaces) {
      if (!metadata.parent) {
        tree[name] = this.buildTree(name)
      }
    }

    return tree
  }

  /**
   * Build namespace tree
   */
  private buildTree(namespace: string): NamespaceTree {
    const metadata = this.namespaces.get(namespace)
    if (!metadata) {
      return {}
    }

    const tree: NamespaceTree = {}

    for (const child of metadata.children) {
      tree[child] = this.buildTree(child)
    }

    return tree
  }

  /**
   * Record namespace access
   */
  private recordAccess(namespace: string): void {
    const metadata = this.namespaces.get(namespace)
    if (metadata) {
      metadata.lastAccess = Date.now()
      metadata.accessCount++
    }

    // Update access history
    this.accessHistory.push(namespace)
    if (this.accessHistory.length > this.maxHistorySize) {
      this.accessHistory.shift()
    }
  }

  /**
   * Get namespace statistics
   */
  getStatistics(): NamespaceStatistics {
    const stats: NamespaceStatistics = {
      totalNamespaces: this.namespaces.size,
      loadedNamespaces: 0,
      totalSize: 0,
      mostUsed: '',
      leastUsed: '',
      recentlyAccessed: [...this.accessHistory].reverse().slice(0, 10),
    }

    let maxAccess = 0
    let minAccess = Infinity

    for (const [name, metadata] of this.namespaces) {
      if (metadata.loaded) {
        stats.loadedNamespaces++
      }

      if (metadata.size) {
        stats.totalSize += metadata.size
      }

      if (metadata.accessCount > maxAccess) {
        maxAccess = metadata.accessCount
        stats.mostUsed = name
      }

      if (metadata.accessCount < minAccess) {
        minAccess = metadata.accessCount
        stats.leastUsed = name
      }
    }

    return stats
  }

  /**
   * Clear unused namespaces
   */
  clearUnused(threshold = 100): string[] {
    const removed: string[] = []

    for (const [name, metadata] of this.namespaces) {
      if (
        name !== this.config.defaultNamespace
        && metadata.accessCount < threshold
      ) {
        if (this.removeNamespace(name)) {
          removed.push(name)
        }
      }
    }

    return removed
  }

  /**
   * Export namespace data
   */
  exportNamespace(namespace: string): NamespaceExport | undefined {
    if (!this.namespaces.has(namespace)) {
      return undefined
    }

    const metadata = this.namespaces.get(namespace)!
    const translations = this.translations.get(namespace)!

    return {
      metadata: {
        name: metadata.name,
        parent: metadata.parent,
        children: Array.from(metadata.children),
      },
      translations: Object.fromEntries(translations),
    }
  }

  /**
   * Import namespace data
   */
  importNamespace(data: NamespaceExport): void {
    const { metadata, translations } = data

    this.createNamespace(metadata.name, metadata.parent)

    for (const [locale, trans] of Object.entries(translations)) {
      this.loadNamespace(metadata.name, locale, trans)
    }

    // Recreate children
    for (const child of metadata.children) {
      const meta = this.namespaces.get(metadata.name)
      if (meta) {
        meta.children.add(child)
      }
    }
  }

  /**
   * Get namespace configuration
   */
  getConfig(): Readonly<Required<NamespaceConfig>> {
    return this.config
  }
}

/**
 * Namespace tree structure
 */
export interface NamespaceTree {
  [namespace: string]: NamespaceTree
}

/**
 * Namespace statistics
 */
export interface NamespaceStatistics {
  totalNamespaces: number
  loadedNamespaces: number
  totalSize: number
  mostUsed: string
  leastUsed: string
  recentlyAccessed: string[]
}

/**
 * Namespace export format
 */
export interface NamespaceExport {
  metadata: {
    name: string
    parent?: string
    children: string[]
  }
  translations: Record<string, NestedObject>
}

/**
 * Create namespace-aware translator
 */
export function createNamespacedTranslator(
  manager: NamespaceManager,
  defaultLocale: string,
): (key: string, params?: TranslationParams, namespace?: string) => string {
  return (key: string, params?: TranslationParams, namespace?: string): string => {
    // Parse namespace from key if not provided
    const config = manager.getConfig()
    if (!namespace && key.includes(config.separator)) {
      const parsed = manager.parseNamespaceKey(key)
      namespace = parsed.namespace
      key = parsed.key
    }

    const translation = manager.getTranslation(key, defaultLocale, namespace)

    if (!translation) {
      return key
    }

    // Apply parameters if provided
    if (params && typeof translation === 'string') {
      let result = translation
      for (const [param, value] of Object.entries(params)) {
        result = result.replace(
          new RegExp(`\\{\\{\\s*${param}\\s*\\}\\}`, 'g'),
          String(value),
        )
      }
      return result
    }

    return translation
  }
}

export default NamespaceManager
