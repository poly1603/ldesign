/**
 * ConfigManager 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ConfigManager } from '../../core/ConfigManager'
import { Logger } from '../../utils/logger'
import { LibraryType } from '../../types/library'

describe('ConfigManager', () => {
  let configManager: ConfigManager
  let mockLogger: Logger

  beforeEach(() => {
    mockLogger = new Logger({ level: 'silent' })
    configManager = new ConfigManager({ logger: mockLogger })
  })

  describe('Constructor', () => {
    it('should create instance with default options', () => {
      const manager = new ConfigManager()
      expect(manager).toBeInstanceOf(ConfigManager)
    })

    it('should accept custom logger', () => {
      const customLogger = new Logger({ level: 'debug' })
      const manager = new ConfigManager({ logger: customLogger })
      expect(manager).toBeInstanceOf(ConfigManager)
    })
  })

  describe('Configuration Loading', () => {
    it('should load default configuration', async () => {
      const config = await configManager.loadConfig()
      expect(config).toHaveProperty('input')
      expect(config).toHaveProperty('output')
      expect(config).toHaveProperty('libraryType')
    })

    it('should merge user configuration with defaults', async () => {
      const userConfig = {
        input: 'custom/index.ts',
        libraryType: LibraryType.VUE3
      }

      const config = await configManager.loadConfig(undefined, userConfig)
      expect(config.input).toBe('custom/index.ts')
      expect(config.libraryType).toBe(LibraryType.VUE3)
    })

    it('should validate configuration', async () => {
      const invalidConfig = {
        input: '', // Invalid empty input
        output: null
      }

      await expect(
        configManager.loadConfig(undefined, invalidConfig)
      ).rejects.toThrow()
    })
  })

  describe('Configuration Validation', () => {
    it('should validate required fields', () => {
      const config = {
        input: 'src/index.ts',
        libraryType: LibraryType.TYPESCRIPT
      }

      const result = configManager.validateConfig(config)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing required fields', () => {
      const config = {
        // Missing input
        libraryType: LibraryType.TYPESCRIPT
      }

      const result = configManager.validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should provide helpful error messages', () => {
      const config = {
        input: '',
        libraryType: 'invalid-type' as any
      }

      const result = configManager.validateConfig(config)
      expect(result.valid).toBe(false)

      // 检查是否有包含 input 的错误消息
      const hasInputError = result.errors.some(error => error.includes('input'))
      expect(hasInputError).toBe(true)

      // 检查是否有包含 libraryType 的错误消息
      const hasLibraryTypeError = result.errors.some(error => error.includes('libraryType'))
      expect(hasLibraryTypeError).toBe(true)
    })
  })

  describe('Configuration Normalization', () => {
    it('should normalize output configuration', () => {
      const config = {
        input: 'src/index.ts',
        output: 'dist/index.js' // String format
      }

      const normalized = configManager.normalizeConfig(config)
      expect(normalized.output).toBeTypeOf('object')
      expect(normalized.output).toHaveProperty('file')
    })

    it('should normalize plugin configuration', () => {
      const config = {
        input: 'src/index.ts',
        plugins: ['typescript', 'vue'] // String array format
      }

      const normalized = configManager.normalizeConfig(config)
      expect(Array.isArray(normalized.plugins)).toBe(true)
      expect(normalized.plugins?.length).toBeGreaterThan(0)
    })
  })

  describe('Environment Variables', () => {
    it('should support environment variable substitution', async () => {
      // Mock environment variable
      vi.stubEnv('BUILD_OUTPUT_DIR', 'custom-dist')

      const config = {
        input: 'src/index.ts',
        output: {
          dir: '${BUILD_OUTPUT_DIR}'
        }
      }

      const resolved = await configManager.loadConfig(undefined, config)
      expect(resolved.output?.dir).toBe('custom-dist')

      vi.unstubAllEnvs()
    })
  })
})
