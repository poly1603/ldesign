/**
 * TypeScript 策略测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { TypeScriptStrategy } from '../../strategies/typescript/TypeScriptStrategy'
import { LibraryType } from '../../types/library'

describe('TypeScriptStrategy', () => {
  let strategy: TypeScriptStrategy

  beforeEach(() => {
    strategy = new TypeScriptStrategy()
  })

  describe('Basic Properties', () => {
    it('should have correct name', () => {
      expect(strategy.name).toBe('typescript')
    })

    it('should support TypeScript library type', () => {
      expect(strategy.supportedTypes).toContain(LibraryType.TYPESCRIPT)
    })

    it('should have appropriate priority', () => {
      expect(strategy.priority).toBe(10)
    })
  })

  describe('Applicability', () => {
    it('should be applicable for TypeScript projects', () => {
      const config = {
        input: 'src/index.ts',
        libraryType: LibraryType.TYPESCRIPT
      }

      expect(strategy.isApplicable(config)).toBe(true)
    })

    it('should not be applicable for non-TypeScript projects', () => {
      const config = {
        input: 'src/index.js',
        libraryType: LibraryType.STYLE
      }

      expect(strategy.isApplicable(config)).toBe(false)
    })
  })

  describe('Configuration Application', () => {
    it('should apply TypeScript-specific configuration', async () => {
      const baseConfig = {
        input: 'src/index.ts',
        libraryType: LibraryType.TYPESCRIPT
      }

      const result = await strategy.applyStrategy(baseConfig)
      expect(result).toBeDefined()
      // Should maintain the original config structure
      expect(result.input).toBe(baseConfig.input)
      expect(result.libraryType).toBe(baseConfig.libraryType)
    })
  })

  describe('Default Configuration', () => {
    it('should provide sensible defaults', () => {
      const defaults = strategy.getDefaultConfig()
      expect(defaults).toBeTypeOf('object')
    })
  })

  describe('Plugin Recommendations', () => {
    it('should recommend appropriate plugins', () => {
      const config = {
        input: 'src/index.ts',
        libraryType: LibraryType.TYPESCRIPT
      }

      const plugins = strategy.getRecommendedPlugins(config)
      expect(Array.isArray(plugins)).toBe(true)
    })
  })

  describe('Configuration Validation', () => {
    it('should validate TypeScript configuration', () => {
      const config = {
        input: 'src/index.ts',
        libraryType: LibraryType.TYPESCRIPT,
        output: {
          format: ['esm', 'cjs']
        }
      }

      const result = strategy.validateConfig(config)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
      expect(result.suggestions).toHaveLength(0)
    })

    it('should provide validation results structure', () => {
      const config = {
        input: 'src/index.ts',
        libraryType: LibraryType.TYPESCRIPT
      }

      const result = strategy.validateConfig(config)
      expect(result).toHaveProperty('valid')
      expect(result).toHaveProperty('errors')
      expect(result).toHaveProperty('warnings')
      expect(result).toHaveProperty('suggestions')
    })
  })
})
