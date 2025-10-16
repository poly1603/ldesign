/**
 * 测试环境设置
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { join } from 'path'
import { tmpdir } from 'os'

// 全局测试配置
export const TEST_CONFIG = {
  timeout: 30000,
  tempDirPrefix: 'ldesign-builder-test-',
  mockBundlers: true,
  enableCoverage: true
}

// 全局变量
declare global {
  var __TEST_TEMP_DIR__: string
  var __TEST_CLEANUP_FUNCTIONS__: Array<() => Promise<void>>
}

// 全局设置
beforeAll(async () => {
  // 初始化全局临时目录
  global.__TEST_TEMP_DIR__ = await fs.mkdtemp(
    join(tmpdir(), TEST_CONFIG.tempDirPrefix)
  )
  
  // 初始化清理函数数组
  global.__TEST_CLEANUP_FUNCTIONS__ = []
  
  
})

// 全局清理
afterAll(async () => {
  // 执行所有清理函数
  for (const cleanup of global.__TEST_CLEANUP_FUNCTIONS__) {
    try {
      await cleanup()
    } catch (error) {
      console.warn('Cleanup function failed:', error)
    }
  }
  
  // 清理全局临时目录
  try {
    await fs.rm(global.__TEST_TEMP_DIR__, { recursive: true, force: true })
  } catch (error) {
    console.warn('Failed to clean up temp directory:', error)
  }
})

// 每个测试前的设置
beforeEach(() => {
  // 重置模拟状态
  if (TEST_CONFIG.mockBundlers) {
    // 这里可以重置所有的 mock
  }
})

// 每个测试后的清理
afterEach(() => {
  // 清理测试特定的资源
})

/**
 * 测试工具函数
 */

/**
 * 创建临时测试目录
 */
export async function createTempDir(prefix = 'test-'): Promise<string> {
  const tempDir = await fs.mkdtemp(join(global.__TEST_TEMP_DIR__, prefix))
  
  // 添加清理函数
  global.__TEST_CLEANUP_FUNCTIONS__.push(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })
  
  return tempDir
}

/**
 * 创建测试项目结构
 */
export async function createTestProject(
  dir: string,
  type: 'typescript' | 'vue3' | 'style' = 'typescript'
): Promise<void> {
  await fs.mkdir(join(dir, 'src'), { recursive: true })
  
  switch (type) {
    case 'typescript':
      await fs.writeFile(
        join(dir, 'src/index.ts'),
        'export const hello = (name: string) => `Hello, ${name}!`'
      )
      await fs.writeFile(
        join(dir, 'tsconfig.json'),
        JSON.stringify({
          compilerOptions: {
            target: 'ES2020',
            module: 'ESNext',
            declaration: true,
            outDir: 'dist'
          },
          include: ['src/**/*']
        }, null, 2)
      )
      break
      
    case 'vue3':
      await fs.writeFile(
        join(dir, 'src/index.ts'),
        `import { defineComponent } from 'vue'
export default defineComponent({
  name: 'TestComponent',
  template: '<div>Hello Vue 3!</div>'
})`
      )
      break
      
    case 'style':
      await fs.writeFile(
        join(dir, 'src/index.css'),
        `.test { color: red; }`
      )
      break
  }
  
  await fs.writeFile(
    join(dir, 'package.json'),
    JSON.stringify({
      name: 'test-project',
      version: '1.0.0',
      main: 'dist/index.js',
      types: 'dist/index.d.ts'
    }, null, 2)
  )
}

/**
 * 等待指定时间
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 模拟构建器适配器
 */
export function createMockAdapter(name: 'rollup' | 'rolldown' = 'rollup') {
  return {
    name,
    version: '4.0.0',
    available: true,
    build: async () => ({
      success: true,
      outputs: [
        {
          fileName: 'index.js',
          size: 100,
          source: 'export const hello = () => "Hello!"',
          type: 'chunk' as const,
          format: 'esm' as const
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
    }),
    watch: async () => ({
      patterns: ['src/**/*'],
      watching: true,
      close: async () => {},
      on: () => {},
      off: () => {},
      emit: () => false
    }),
    getPerformanceMetrics: async () => ({
      buildTime: 1000,
      bundleSize: 100,
      memoryUsage: {
        heapUsed: 1000000,
        heapTotal: 2000000,
        external: 100000,
        arrayBuffers: 50000
      },
      cpuUsage: 50
    }),
    dispose: async () => {}
  }
}

/**
 * 断言工具
 */
export const assertions = {
  /**
   * 断言文件存在
   */
  async fileExists(filePath: string): Promise<void> {
    try {
      await fs.access(filePath)
    } catch {
      throw new Error(`File does not exist: ${filePath}`)
    }
  },
  
  /**
   * 断言目录存在
   */
  async directoryExists(dirPath: string): Promise<void> {
    try {
      const stat = await fs.stat(dirPath)
      if (!stat.isDirectory()) {
        throw new Error(`Path is not a directory: ${dirPath}`)
      }
    } catch {
      throw new Error(`Directory does not exist: ${dirPath}`)
    }
  },
  
  /**
   * 断言文件内容包含指定文本
   */
  async fileContains(filePath: string, content: string): Promise<void> {
    const fileContent = await fs.readFile(filePath, 'utf-8')
    if (!fileContent.includes(content)) {
      throw new Error(`File ${filePath} does not contain: ${content}`)
    }
  }
}
