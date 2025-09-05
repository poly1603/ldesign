import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RollupAdapter } from '../../../adapters/rollup/RollupAdapter'
import { promises as fs } from 'fs'

// Mock fs-extra
vi.mock('fs-extra', () => ({
  pathExists: vi.fn(),
  copy: vi.fn(),
}))

// Mock fs for lstatSync
vi.mock('fs', () => ({
  lstatSync: vi.fn(),
}))

describe('RollupAdapter.distributeTypes', () => {
  let adapter: RollupAdapter
  let mockPathExists: any
  let mockCopy: any
  let mockLstatSync: any

  beforeEach(async () => {
    adapter = new RollupAdapter({})
    
    // 动态导入 mock
    const fse = await import('fs-extra')
    const fsSync = await import('fs')
    
    mockPathExists = vi.mocked(fse.pathExists)
    mockCopy = vi.mocked(fse.copy)
    mockLstatSync = vi.mocked(fsSync.lstatSync)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should skip distribution when types directory does not exist', async () => {
    mockPathExists.mockResolvedValue(false)

    // 通过反射调用私有方法
    await (adapter as any).distributeTypes()

    expect(mockPathExists).toHaveBeenCalledWith('types')
    expect(mockCopy).not.toHaveBeenCalled()
  })

  it('should copy types to es and lib directories', async () => {
    mockPathExists.mockResolvedValue(true)
    mockLstatSync.mockReturnValue({ isDirectory: () => true })
    mockCopy.mockResolvedValue(undefined)

    await (adapter as any).distributeTypes()

    expect(mockPathExists).toHaveBeenCalledWith('types')
    expect(mockCopy).toHaveBeenCalledTimes(2)
    expect(mockCopy).toHaveBeenCalledWith('types', 'es', expect.objectContaining({
      overwrite: true,
      filter: expect.any(Function)
    }))
    expect(mockCopy).toHaveBeenCalledWith('types', 'lib', expect.objectContaining({
      overwrite: true,
      filter: expect.any(Function)
    }))
  })

  it('should filter only .d.ts files and directories', async () => {
    mockPathExists.mockResolvedValue(true)
    mockCopy.mockImplementation((src, dest, options) => {
      // 测试过滤器函数
      const filter = options.filter
      
      // 模拟目录
      mockLstatSync.mockReturnValue({ isDirectory: () => true })
      expect(filter('some/dir')).toBe(true)
      
      // 模拟 .d.ts 文件
      mockLstatSync.mockReturnValue({ isDirectory: () => false })
      expect(filter('types/index.d.ts')).toBe(true)
      expect(filter('types/utils.d.cts')).toBe(true)
      expect(filter('types/module.d.mts')).toBe(true)
      
      // 模拟非声明文件
      expect(filter('types/index.js')).toBe(false)
      expect(filter('types/style.css')).toBe(false)
      
      return Promise.resolve()
    })

    await (adapter as any).distributeTypes()

    expect(mockCopy).toHaveBeenCalledTimes(2)
  })

  it('should handle copy errors gracefully', async () => {
    mockPathExists.mockResolvedValue(true)
    mockCopy.mockRejectedValue(new Error('Copy failed'))

    // 应该不抛出异常
    await expect((adapter as any).distributeTypes()).resolves.toBeUndefined()
  })
})
