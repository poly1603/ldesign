/**
 * 构建流程集成测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { LibraryBuilder } from '../../core/LibraryBuilder'
import { LibraryType } from '../../types/library'
import { Logger } from '../../utils/logger'
import { promises as fs } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('Build Flow Integration', () => {
  let builder: LibraryBuilder
  let tempDir: string
  let mockLogger: Logger

  beforeEach(async () => {
    // Create temporary directory for test files
    tempDir = await fs.mkdtemp(join(tmpdir(), 'builder-test-'))
    
    // Create mock logger
    mockLogger = new Logger({ level: 'silent' })
    
    // Create test source file
    await fs.writeFile(
      join(tempDir, 'index.ts'),
      'export const hello = (name: string) => `Hello, ${name}!`'
    )
    
    // Create builder instance
    builder = new LibraryBuilder({
      config: {
        input: join(tempDir, 'index.ts'),
        output: {
          dir: join(tempDir, 'dist'),
          format: ['esm']
        },
        libraryType: LibraryType.TYPESCRIPT
      },
      logger: mockLogger
    })
  })

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  describe('Basic Build Flow', () => {
    it('should complete build process', async () => {
      // Mock the actual build process since we don't have real bundlers in test
      vi.spyOn(builder as any, 'bundlerAdapter').mockValue({
        name: 'rollup',
        version: '4.0.0',
        available: true,
        build: vi.fn().mockResolvedValue({
          success: true,
          outputs: [
            {
              fileName: 'index.js',
              size: 100,
              source: 'export const hello = (name) => `Hello, ${name}!`',
              type: 'chunk',
              format: 'esm'
            }
          ],
          duration: 1000,
          stats: {
            buildTime: 1000,
            fileCount: 1,
            totalSize: {
              raw: 100,
              gzip: 50,
              brotli: 45,
              byType: {},
              byFormat: { esm: 100, cjs: 0, umd: 0, iife: 0 },
              largest: { file: 'index.js', size: 100 },
              fileCount: 1
            },
            byFormat: {
              esm: {
                fileCount: 1,
                size: {
                  raw: 100,
                  gzip: 50,
                  brotli: 45,
                  byType: {},
                  byFormat: { esm: 100, cjs: 0, umd: 0, iife: 0 },
                  largest: { file: 'index.js', size: 100 },
                  fileCount: 1
                }
              },
              cjs: { fileCount: 0, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } },
              umd: { fileCount: 0, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } },
              iife: { fileCount: 0, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } }
            },
            modules: {
              total: 1,
              external: 0,
              internal: 1,
              largest: { 
                id: 'index.ts', 
                size: 100,
                renderedLength: 100,
                originalLength: 100,
                isEntry: true,
                isExternal: false,
                importedIds: [],
                dynamicallyImportedIds: [],
                importers: [],
                dynamicImporters: []
              }
            },
            dependencies: {
              total: 0,
              external: [],
              bundled: [],
              circular: []
            }
          }
        })
      })

      const result = await builder.build()
      
      expect(result.success).toBe(true)
      expect(result.outputs).toHaveLength(1)
      expect(result.duration).toBeGreaterThan(0)
      expect(result.stats).toBeDefined()
    }, 10000)

    it('should handle build errors gracefully', async () => {
      // Mock build failure
      vi.spyOn(builder as any, 'bundlerAdapter').mockValue({
        name: 'rollup',
        version: '4.0.0',
        available: true,
        build: vi.fn().mockRejectedValue(new Error('Build failed'))
      })

      await expect(builder.build()).rejects.toThrow('Build failed')
    })
  })

  describe('Configuration Validation', () => {
    it('should validate configuration before build', async () => {
      // Test with invalid configuration
      const invalidBuilder = new LibraryBuilder({
        config: {
          input: '', // Invalid empty input
          libraryType: LibraryType.TYPESCRIPT
        },
        logger: mockLogger
      })

      await expect(invalidBuilder.build()).rejects.toThrow()
    })
  })

  describe('Event Emission', () => {
    it('should emit build events', async () => {
      const events: string[] = []
      
      builder.on('build:start', () => events.push('start'))
      builder.on('build:end', () => events.push('end'))
      builder.on('build:error', () => events.push('error'))

      // Mock successful build
      vi.spyOn(builder as any, 'bundlerAdapter').mockValue({
        name: 'rollup',
        version: '4.0.0',
        available: true,
        build: vi.fn().mockResolvedValue({
          success: true,
          outputs: [],
          duration: 1000,
          stats: {
            buildTime: 1000,
            fileCount: 0,
            totalSize: {
              raw: 0,
              gzip: 0,
              brotli: 0,
              byType: {},
              byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0 },
              largest: { file: '', size: 0 },
              fileCount: 0
            },
            byFormat: {
              esm: { fileCount: 0, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } },
              cjs: { fileCount: 0, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } },
              umd: { fileCount: 0, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } },
              iife: { fileCount: 0, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } }
            },
            modules: {
              total: 0,
              external: 0,
              internal: 0,
              largest: { 
                id: '', 
                size: 0,
                renderedLength: 0,
                originalLength: 0,
                isEntry: false,
                isExternal: false,
                importedIds: [],
                dynamicallyImportedIds: [],
                importers: [],
                dynamicImporters: []
              }
            },
            dependencies: {
              total: 0,
              external: [],
              bundled: [],
              circular: []
            }
          }
        })
      })

      await builder.build()
      
      expect(events).toContain('start')
      expect(events).toContain('end')
    })
  })
})
