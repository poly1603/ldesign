import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'

// Mock child_process
vi.mock('child_process', () => ({
  spawn: vi.fn(),
}))

// Mock fs
vi.mock('fs', () => ({
  promises: {
    readdir: vi.fn(),
    stat: vi.fn(),
    access: vi.fn(),
  }
}))

// Mock path and url for ESM
vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/')),
  dirname: vi.fn(),
}))

vi.mock('url', () => ({
  fileURLToPath: vi.fn(() => '/mock/path/examples.js'),
}))

describe('examples command', () => {
  let mockSpawn: any
  let mockReaddir: any
  let mockStat: any
  let mockAccess: any

  beforeEach(() => {
    mockSpawn = vi.mocked(spawn)
    mockReaddir = vi.mocked(fs.readdir)
    mockStat = vi.mocked(fs.stat)
    mockAccess = vi.mocked(fs.access)

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => { })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('should find example projects with package.json', async () => {
    // 动态导入命令模块并获取内部函数
    const examplesModule = await import('../../../cli/commands/examples')
    const findExampleProjects = (examplesModule as any).findExampleProjects

    mockReaddir.mockResolvedValue(['project1', 'project2', 'not-a-project'])

    mockStat
      .mockResolvedValueOnce({ isDirectory: () => true })
      .mockResolvedValueOnce({ isDirectory: () => true })
      .mockResolvedValueOnce({ isDirectory: () => false })

    mockAccess
      .mockResolvedValueOnce(undefined) // project1/package.json exists
      .mockRejectedValueOnce(new Error('ENOENT')) // project2/package.json missing

    const result = await findExampleProjects('examples')

    expect(result).toEqual([
      { name: 'project1', path: 'examples/project1' }
    ])
  })

  it('should handle empty examples directory', async () => {
    const examplesModule = await import('../../../cli/commands/examples')
    const findExampleProjects = (examplesModule as any).findExampleProjects

    mockReaddir.mockResolvedValue([])

    const result = await findExampleProjects('examples')
    expect(result).toEqual([])
  })

  it('should run example build successfully', async () => {
    const examplesModule = await import('../../../cli/commands/examples')
    const runExample = (examplesModule as any).runExample

    const mockChild = {
      on: vi.fn((event, callback) => {
        if (event === 'close') {
          // 模拟成功退出
          setTimeout(() => callback(0), 10)
        }
      })
    }

    mockSpawn.mockReturnValue(mockChild)

    await expect(runExample('/bin/ldesign-builder.js', '/project/path'))
      .resolves.toBeUndefined()

    expect(mockSpawn).toHaveBeenCalledWith(
      process.execPath,
      ['/bin/ldesign-builder.js', 'build'],
      {
        cwd: '/project/path',
        stdio: 'inherit',
        env: process.env,
      }
    )
  })

  it('should handle build failure', async () => {
    const examplesModule = await import('../../../cli/commands/examples')
    const runExample = (examplesModule as any).runExample

    const mockChild = {
      on: vi.fn((event, callback) => {
        if (event === 'close') {
          // 模拟失败退出
          setTimeout(() => callback(1), 10)
        }
      })
    }

    mockSpawn.mockReturnValue(mockChild)

    await expect(runExample('/bin/ldesign-builder.js', '/project/path'))
      .rejects.toThrow('构建失败（退出码 1）: /project/path')
  })

  it('should handle spawn error', async () => {
    const examplesModule = await import('../../../cli/commands/examples')
    const runExample = (examplesModule as any).runExample

    const mockChild = {
      on: vi.fn((event, callback) => {
        if (event === 'error') {
          setTimeout(() => callback(new Error('spawn failed')), 10)
        }
      })
    }

    mockSpawn.mockReturnValue(mockChild)

    await expect(runExample('/bin/ldesign-builder.js', '/project/path'))
      .rejects.toThrow('spawn failed')
  })
})
