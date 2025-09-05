import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TypeScriptStrategy } from '../../../strategies/typescript/TypeScriptStrategy'
import { BuilderConfig, LibraryType } from '../../../types'

// Mock file-system utils
vi.mock('../../../utils/file-system', () => ({
  findFiles: vi.fn(),
}))

// Mock path
vi.mock('path', () => ({
  relative: vi.fn(),
  extname: vi.fn(),
}))

describe('TypeScriptStrategy.resolveInputEntries', () => {
  let strategy: TypeScriptStrategy
  let mockFindFiles: any
  let mockRelative: any
  let mockExtname: any

  beforeEach(async () => {
    strategy = new TypeScriptStrategy()
    
    const fileSystem = await import('../../../utils/file-system')
    const path = await import('path')
    
    mockFindFiles = vi.mocked(fileSystem.findFiles)
    mockRelative = vi.mocked(path.relative)
    mockExtname = vi.mocked(path.extname)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return user-provided input when specified', async () => {
    const config: BuilderConfig = {
      input: 'custom/entry.ts',
      libraryType: LibraryType.TYPESCRIPT,
    }

    const result = await (strategy as any).resolveInputEntries(config)
    expect(result).toBe('custom/entry.ts')
    expect(mockFindFiles).not.toHaveBeenCalled()
  })

  it('should fallback to src/index.ts when no files found', async () => {
    const config: BuilderConfig = {
      libraryType: LibraryType.TYPESCRIPT,
    }

    mockFindFiles.mockResolvedValue([])

    const result = await (strategy as any).resolveInputEntries(config)
    expect(result).toBe('src/index.ts')
    expect(mockFindFiles).toHaveBeenCalledWith(
      ['src/**/*.{ts,tsx,js,jsx}'],
      expect.objectContaining({
        cwd: process.cwd(),
        ignore: ['**/*.d.ts', '**/*.test.*', '**/*.spec.*', '**/__tests__/**']
      })
    )
  })

  it('should generate multi-entry map from src files', async () => {
    const config: BuilderConfig = {
      libraryType: LibraryType.TYPESCRIPT,
    }

    const mockFiles = [
      'D:\\project\\src\\index.ts',
      'D:\\project\\src\\utils\\helper.ts',
      'D:\\project\\src\\components\\Button.tsx'
    ]

    mockFindFiles.mockResolvedValue(mockFiles)
    
    // Mock path operations
    mockRelative
      .mockReturnValueOnce('src\\index.ts')
      .mockReturnValueOnce('src\\utils\\helper.ts')
      .mockReturnValueOnce('src\\components\\Button.tsx')
    
    mockExtname
      .mockReturnValueOnce('.ts')
      .mockReturnValueOnce('.ts')
      .mockReturnValueOnce('.tsx')

    const result = await (strategy as any).resolveInputEntries(config)

    expect(result).toEqual({
      'index': 'D:\\project\\src\\index.ts',
      'utils/helper': 'D:\\project\\src\\utils\\helper.ts',
      'components/Button': 'D:\\project\\src\\components\\Button.tsx'
    })
  })

  it('should handle Windows path separators correctly', async () => {
    const config: BuilderConfig = {
      libraryType: LibraryType.TYPESCRIPT,
    }

    mockFindFiles.mockResolvedValue(['D:\\project\\src\\nested\\deep\\module.ts'])
    mockRelative.mockReturnValue('src\\nested\\deep\\module.ts')
    mockExtname.mockReturnValue('.ts')

    const result = await (strategy as any).resolveInputEntries(config)

    expect(result).toEqual({
      'nested/deep/module': 'D:\\project\\src\\nested\\deep\\module.ts'
    })
  })

  it('should use correct glob patterns and ignore rules', async () => {
    const config: BuilderConfig = {
      libraryType: LibraryType.TYPESCRIPT,
    }

    mockFindFiles.mockResolvedValue([])

    await (strategy as any).resolveInputEntries(config)

    expect(mockFindFiles).toHaveBeenCalledWith(
      ['src/**/*.{ts,tsx,js,jsx}'],
      {
        cwd: process.cwd(),
        ignore: [
          '**/*.d.ts',
          '**/*.test.*',
          '**/*.spec.*',
          '**/__tests__/**'
        ]
      }
    )
  })
})
