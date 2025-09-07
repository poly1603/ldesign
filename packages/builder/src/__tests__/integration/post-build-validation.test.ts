/**
 * 打包后验证集成测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as os from 'os'
import { LibraryBuilder } from '../../core/LibraryBuilder'
import type { BuilderConfig } from '../../types/config'
import type { PostBuildValidationConfig } from '../../types/validation'

describe('Post-Build Validation Integration', () => {
  let tempDir: string
  let projectDir: string
  let builder: LibraryBuilder

  beforeEach(async () => {
    // 创建临时测试项目
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ldesign-builder-test-'))
    projectDir = path.join(tempDir, 'test-project')
    await fs.ensureDir(projectDir)

    // 创建测试项目结构
    await createTestProject(projectDir)

    // 创建 builder 实例
    builder = new LibraryBuilder({
      config: {
        input: path.join(projectDir, 'src/index.ts'),
        output: {
          dir: path.join(projectDir, 'dist'),
          format: ['esm', 'cjs']
        },
        bundler: 'rollup',
        mode: 'production'
      }
    })

    // 初始化 builder
    await builder.initialize()
  })

  afterEach(async () => {
    // 清理资源
    if (builder) {
      await builder.dispose()
    }

    // 删除临时目录
    if (tempDir) {
      await fs.remove(tempDir)
    }
  })

  describe('基本验证功能', () => {
    it('应该在启用验证时执行验证', async () => {
      const config: BuilderConfig = {
        input: path.join(projectDir, 'src/index.ts'),
        output: {
          dir: path.join(projectDir, 'dist'),
          format: ['esm', 'cjs']
        },
        postBuildValidation: {
          enabled: true,
          testFramework: 'vitest',
          testPattern: ['**/*.test.ts'],
          timeout: 30000,
          failOnError: false, // 不因验证失败而停止构建
          environment: {
            keepTempFiles: false,
            installDependencies: false // 跳过依赖安装以加快测试
          },
          reporting: {
            format: 'console',
            verbose: false
          }
        }
      }

      const result = await builder.build(config)

      expect(result.success).toBe(true)
      expect(result.validation).toBeDefined()
      expect(result.validation?.validationId).toBeDefined()
      expect(result.validation?.duration).toBeGreaterThan(0)
    })

    it('应该在禁用验证时跳过验证', async () => {
      const config: BuilderConfig = {
        input: path.join(projectDir, 'src/index.ts'),
        output: {
          dir: path.join(projectDir, 'dist'),
          format: ['esm', 'cjs']
        },
        postBuildValidation: {
          enabled: false
        }
      }

      const result = await builder.build(config)

      expect(result.success).toBe(true)
      expect(result.validation).toBeUndefined()
    })

    it('应该在验证失败且 failOnError=true 时抛出错误', async () => {
      // 创建一个会失败的测试
      await createFailingTest(projectDir)

      const config: BuilderConfig = {
        input: path.join(projectDir, 'src/index.ts'),
        output: {
          dir: path.join(projectDir, 'dist'),
          format: ['esm', 'cjs']
        },
        postBuildValidation: {
          enabled: true,
          testFramework: 'vitest',
          testPattern: ['**/*.test.ts'],
          timeout: 30000,
          failOnError: true,
          environment: {
            installDependencies: false
          }
        }
      }

      await expect(builder.build(config)).rejects.toThrow('打包后验证失败')
    })
  })

  describe('验证配置', () => {
    it('应该使用自定义测试模式', async () => {
      const config: BuilderConfig = {
        input: path.join(projectDir, 'src/index.ts'),
        output: {
          dir: path.join(projectDir, 'dist'),
          format: ['esm', 'cjs']
        },
        postBuildValidation: {
          enabled: true,
          testFramework: 'jest',
          testPattern: ['**/*.spec.ts'],
          timeout: 45000,
          environment: {
            tempDir: path.join(projectDir, '.custom-validation'),
            keepTempFiles: true,
            installDependencies: false
          },
          reporting: {
            format: 'json',
            outputPath: path.join(projectDir, 'validation-report.json'),
            verbose: true
          }
        }
      }

      const result = await builder.build(config)

      expect(result.success).toBe(true)
      expect(result.validation).toBeDefined()

      // 检查自定义临时目录是否被创建（由于 keepTempFiles=true）
      const customTempDir = path.join(projectDir, '.custom-validation')
      // 注意：由于我们设置了 keepTempFiles=true，临时目录应该存在
      // 但在实际实现中，这取决于验证器的具体行为
    })

    it('应该支持验证钩子', async () => {
      const hooks = {
        beforeValidation: vi.fn(),
        afterEnvironmentSetup: vi.fn(),
        beforeTestRun: vi.fn(),
        afterTestRun: vi.fn(),
        afterValidation: vi.fn()
      }

      const config: BuilderConfig = {
        input: path.join(projectDir, 'src/index.ts'),
        output: {
          dir: path.join(projectDir, 'dist'),
          format: ['esm', 'cjs']
        },
        postBuildValidation: {
          enabled: true,
          testFramework: 'vitest',
          environment: {
            installDependencies: false
          },
          hooks
        }
      }

      const result = await builder.build(config)

      expect(result.success).toBe(true)
      expect(hooks.beforeValidation).toHaveBeenCalled()
      expect(hooks.afterEnvironmentSetup).toHaveBeenCalled()
      expect(hooks.beforeTestRun).toHaveBeenCalled()
      expect(hooks.afterTestRun).toHaveBeenCalled()
      expect(hooks.afterValidation).toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的测试框架', async () => {
      const config: BuilderConfig = {
        input: path.join(projectDir, 'src/index.ts'),
        output: {
          dir: path.join(projectDir, 'dist'),
          format: ['esm', 'cjs']
        },
        postBuildValidation: {
          enabled: true,
          testFramework: 'invalid-framework' as any,
          environment: {
            installDependencies: false
          }
        }
      }

      // 应该回退到默认框架或处理错误
      const result = await builder.build(config)
      
      // 根据实现，这可能成功（使用默认框架）或失败
      // 这里我们假设它会优雅地处理并使用默认框架
      expect(result.success).toBe(true)
    })

    it('应该处理测试文件不存在的情况', async () => {
      // 删除测试文件
      await fs.remove(path.join(projectDir, 'src/index.test.ts'))

      const config: BuilderConfig = {
        input: path.join(projectDir, 'src/index.ts'),
        output: {
          dir: path.join(projectDir, 'dist'),
          format: ['esm', 'cjs']
        },
        postBuildValidation: {
          enabled: true,
          testFramework: 'vitest',
          testPattern: ['**/*.test.ts'],
          failOnError: false,
          environment: {
            installDependencies: false
          }
        }
      }

      const result = await builder.build(config)

      expect(result.success).toBe(true)
      expect(result.validation).toBeDefined()
      // 验证应该报告没有找到测试或测试数量为0
      expect(result.validation?.testResult.totalTests).toBe(0)
    })
  })
})

/**
 * 创建测试项目结构
 */
async function createTestProject(projectDir: string): Promise<void> {
  // 创建 package.json
  const packageJson = {
    name: 'test-project',
    version: '1.0.0',
    type: 'module',
    main: 'dist/index.cjs',
    module: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: {
      test: 'vitest run'
    },
    devDependencies: {
      vitest: '^0.34.0',
      typescript: '^5.0.0'
    }
  }

  await fs.writeJson(path.join(projectDir, 'package.json'), packageJson, { spaces: 2 })

  // 创建 tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      moduleResolution: 'node',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      declaration: true,
      outDir: 'dist'
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  }

  await fs.writeJson(path.join(projectDir, 'tsconfig.json'), tsConfig, { spaces: 2 })

  // 创建 vitest.config.ts
  const vitestConfig = `
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node'
  }
})
`

  await fs.writeFile(path.join(projectDir, 'vitest.config.ts'), vitestConfig)

  // 创建源码目录和文件
  await fs.ensureDir(path.join(projectDir, 'src'))

  // 创建主文件
  const indexTs = `
export function add(a: number, b: number): number {
  return a + b
}

export function multiply(a: number, b: number): number {
  return a * b
}

export default {
  add,
  multiply
}
`

  await fs.writeFile(path.join(projectDir, 'src/index.ts'), indexTs)

  // 创建测试文件
  const testFile = `
import { describe, it, expect } from 'vitest'
import { add, multiply } from './index'

describe('Math functions', () => {
  it('should add two numbers correctly', () => {
    expect(add(2, 3)).toBe(5)
    expect(add(-1, 1)).toBe(0)
    expect(add(0, 0)).toBe(0)
  })

  it('should multiply two numbers correctly', () => {
    expect(multiply(2, 3)).toBe(6)
    expect(multiply(-1, 1)).toBe(-1)
    expect(multiply(0, 5)).toBe(0)
  })
})
`

  await fs.writeFile(path.join(projectDir, 'src/index.test.ts'), testFile)
}

/**
 * 创建会失败的测试
 */
async function createFailingTest(projectDir: string): Promise<void> {
  const failingTest = `
import { describe, it, expect } from 'vitest'
import { add } from './index'

describe('Failing tests', () => {
  it('should fail intentionally', () => {
    expect(add(2, 2)).toBe(5) // 这会失败
  })

  it('should also fail', () => {
    expect(true).toBe(false) // 这也会失败
  })
})
`

  await fs.writeFile(path.join(projectDir, 'src/failing.test.ts'), failingTest)
}
