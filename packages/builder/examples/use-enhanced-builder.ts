/**
 * 使用增强版打包工具的示例
 * 
 * 展示如何使用优化后的打包工具来确保打包产物的正确性
 * 
 * @author LDesign Team
 */

import { EnhancedLibraryBuilder } from '../src/core/EnhancedLibraryBuilder'
import { EnhancedPostBuildValidator } from '../src/core/EnhancedPostBuildValidator'
import type { BuilderConfig } from '../src/types/config'
import * as path from 'path'

/**
 * 示例 1：基础使用
 */
async function basicExample() {
  console.log('\n=== 示例 1：基础使用 ===\n')

  // 创建增强版构建器
  const builder = new EnhancedLibraryBuilder({
    config: {
      input: 'src/index.ts',
      output: {
        dir: 'dist',
        format: ['esm', 'cjs', 'umd'],
        name: 'MyLibrary',
        sourcemap: true
      },
      external: ['react', 'react-dom'],
      minify: true,
      // 启用严格模式，确保打包前后功能一致
      strictMode: true,
      // 启用打包后验证
      postBuildValidation: {
        enabled: true,
        failOnError: true,
        testFramework: 'vitest',
        reporting: {
          format: 'all',
          outputPath: 'validation-report'
        }
      }
    }
  })

  try {
    // 初始化
    await builder.initialize()

    // 执行构建
    const result = await builder.build()

    if (result.success) {
      console.log('✅ 构建成功')
      console.log(`  - 构建时间: ${result.duration}ms`)
      console.log(`  - 输出文件: ${result.outputs.length} 个`)
      console.log(`  - 总大小: ${result.stats.totalSize.raw} bytes`)
      
      // 检查验证结果
      if (result.validation) {
        console.log(`  - 验证状态: ${result.validation.success ? '✅ 通过' : '❌ 失败'}`)
        if (!result.validation.success) {
          console.log('  - 验证错误:')
          result.validation.errors.forEach(err => console.log(`    • ${err}`))
        }
      }
    } else {
      console.log('❌ 构建失败')
      result.errors.forEach(err => console.log(`  - ${err}`))
    }

  } finally {
    await builder.dispose()
  }
}

/**
 * 示例 2：高级配置
 */
async function advancedExample() {
  console.log('\n=== 示例 2：高级配置 ===\n')

  const config: BuilderConfig = {
    // 多入口配置
    input: {
      main: 'src/index.ts',
      utils: 'src/utils/index.ts',
      components: 'src/components/index.ts'
    },
    
    output: {
      dir: 'dist',
      format: ['esm', 'cjs'],
      preserveModules: true,
      sourcemap: true,
      entryFileNames: '[name].[format].js',
      chunkFileNames: 'chunks/[name]-[hash].js'
    },

    // 外部依赖
    external: [
      'react',
      'react-dom',
      /^@babel\/runtime/,
      (id) => id.includes('node_modules')
    ],

    // 插件配置
    plugins: [
      // 自定义插件可以在这里添加
    ],

    // TypeScript 配置
    typescript: {
      tsconfig: './tsconfig.build.json',
      declaration: true,
      declarationMap: true
    },

    // 性能优化
    performance: {
      bundleAnalyzer: true,
      treeshaking: true,
      chunkSizeWarningLimit: 500000
    },

    // 缓存配置
    cache: {
      disabled: false
    },

    // 增强的验证配置
    postBuildValidation: {
      enabled: true,
      strict: true,
      compareExports: true,
      compareImports: true,
      compareBehavior: true,
      comparePerformance: true,
      runtimeValidation: true,
      apiCompatibility: true,
      integrationTests: true,
      snapshotTesting: true,
      benchmarks: true,
      environment: {
        tempDir: '.validation',
        keepTempFiles: false
      },
      reporting: {
        format: 'html',
        outputPath: 'build-report',
        verbose: true
      }
    }
  }

  const builder = new EnhancedLibraryBuilder({ config })

  try {
    await builder.initialize()

    // 执行构建并进行全面验证
    const result = await builder.build()

    // 分析结果
    if (result.success) {
      console.log('✅ 构建和验证成功')
      
      // 导出对比
      if (result.functionalityComparison?.exports) {
        const exportScore = result.functionalityComparison.exports.score
        console.log(`  - 导出一致性: ${exportScore}%`)
      }

      // API 兼容性
      if (result.apiCompatibility) {
        console.log(`  - API 兼容性: ${result.apiCompatibility.compatible ? '✅' : '❌'}`)
        if (result.apiCompatibility.breaking.length > 0) {
          console.log('    破坏性变更:')
          result.apiCompatibility.breaking.forEach(b => console.log(`      • ${b}`))
        }
      }

      // 性能对比
      if (result.functionalityComparison?.performance) {
        const perf = result.functionalityComparison.performance
        console.log('  - 性能对比:')
        console.log(`    • 加载时间变化: ${perf.loadTime?.percentage.toFixed(2)}%`)
        console.log(`    • 内存使用变化: ${perf.memoryUsage?.percentage.toFixed(2)}%`)
      }

      // 依赖分析
      if (result.dependencies) {
        console.log('  - 依赖分析:')
        console.log(`    • 外部依赖: ${result.dependencies.external.length} 个`)
        console.log(`    • 打包依赖: ${result.dependencies.bundled.length} 个`)
        console.log(`    • 循环依赖: ${result.dependencies.circular.length} 个`)
        console.log(`    • 未使用依赖: ${result.dependencies.unused.length} 个`)
      }

      // 代码质量
      if (result.quality) {
        console.log('  - 代码质量:')
        console.log(`    • 问题数量: ${result.quality.issues.length}`)
        console.log(`    • 可维护性: ${result.quality.metrics.maintainability}/100`)
      }
    }

  } catch (error) {
    console.error('构建过程出错:', error)
  } finally {
    await builder.dispose()
  }
}

/**
 * 示例 3：监听模式
 */
async function watchExample() {
  console.log('\n=== 示例 3：监听模式 ===\n')

  const builder = new EnhancedLibraryBuilder({
    config: {
      input: 'src/index.ts',
      output: {
        dir: 'dist',
        format: 'esm'
      },
      watch: {
        include: 'src/**/*',
        exclude: 'node_modules/**'
      }
    }
  })

  try {
    await builder.initialize()

    // 启动监听模式
    const watcher = await builder.buildWatch()

    console.log('👀 监听模式已启动...')
    console.log('  监听文件:', watcher.patterns)

    // 监听事件
    watcher.on('event', (event: any) => {
      if (event.code === 'START') {
        console.log('🔄 检测到文件变化，重新构建...')
      } else if (event.code === 'BUNDLE_END') {
        console.log(`✅ 构建完成 (${event.duration}ms)`)
      } else if (event.code === 'ERROR') {
        console.error('❌ 构建错误:', event.error)
      }
    })

    // 保持监听 10 秒后退出（示例）
    await new Promise(resolve => setTimeout(resolve, 10000))

    // 关闭监听
    await watcher.close()
    console.log('监听模式已关闭')

  } finally {
    await builder.dispose()
  }
}

/**
 * 示例 4：批量构建
 */
async function batchBuildExample() {
  console.log('\n=== 示例 4：批量构建 ===\n')

  const projects = [
    {
      name: 'Core Library',
      config: {
        input: 'packages/core/src/index.ts',
        output: { dir: 'packages/core/dist', format: ['esm', 'cjs'] }
      }
    },
    {
      name: 'React Components',
      config: {
        input: 'packages/react/src/index.tsx',
        output: { dir: 'packages/react/dist', format: ['esm', 'cjs'] },
        libraryType: 'react' as const
      }
    },
    {
      name: 'Vue Components',
      config: {
        input: 'packages/vue/src/index.ts',
        output: { dir: 'packages/vue/dist', format: ['esm', 'cjs'] },
        libraryType: 'vue' as const
      }
    }
  ]

  const results = []

  for (const project of projects) {
    console.log(`\n构建 ${project.name}...`)
    
    const builder = new EnhancedLibraryBuilder({
      config: {
        ...project.config,
        postBuildValidation: {
          enabled: true,
          strict: true
        }
      }
    })

    try {
      await builder.initialize()
      const result = await builder.build()
      
      results.push({
        name: project.name,
        success: result.success,
        duration: result.duration,
        outputs: result.outputs.length,
        errors: result.errors
      })

      if (result.success) {
        console.log(`  ✅ ${project.name} 构建成功 (${result.duration}ms)`)
      } else {
        console.log(`  ❌ ${project.name} 构建失败`)
      }

    } catch (error) {
      results.push({
        name: project.name,
        success: false,
        error: (error as Error).message
      })
      console.log(`  ❌ ${project.name} 构建异常: ${(error as Error).message}`)
    } finally {
      await builder.dispose()
    }
  }

  // 打印总结
  console.log('\n=== 批量构建总结 ===')
  console.log(`总计: ${results.length} 个项目`)
  console.log(`成功: ${results.filter(r => r.success).length} 个`)
  console.log(`失败: ${results.filter(r => !r.success).length} 个`)
}

/**
 * 示例 5：自定义验证
 */
async function customValidationExample() {
  console.log('\n=== 示例 5：自定义验证 ===\n')

  const builder = new EnhancedLibraryBuilder({
    config: {
      input: 'src/index.ts',
      output: {
        dir: 'dist',
        format: ['esm', 'cjs']
      },
      postBuildValidation: {
        enabled: true,
        hooks: {
          // 验证前钩子
          beforeValidation: async (context) => {
            console.log('  执行自定义验证前检查...')
            // 可以在这里准备测试环境
          },
          
          // 验证后钩子
          afterValidation: async (context, result) => {
            console.log('  执行自定义验证后处理...')
            
            // 自定义验证逻辑
            if (result.success) {
              // 额外的验证步骤
              const customChecks = await performCustomChecks(context)
              if (!customChecks.passed) {
                throw new Error('自定义验证失败')
              }
            }
          }
        }
      }
    }
  })

  try {
    await builder.initialize()
    const result = await builder.build()

    if (result.success && result.validation?.success) {
      console.log('✅ 构建和自定义验证都通过')
    }

  } finally {
    await builder.dispose()
  }
}

/**
 * 执行自定义检查
 */
async function performCustomChecks(context: any) {
  // 示例：检查特定的导出是否存在
  const requiredExports = ['default', 'Button', 'Input', 'Form']
  const allExportsPresent = true // 实际实现应该检查打包产物

  return {
    passed: allExportsPresent,
    message: allExportsPresent ? '所有必需的导出都存在' : '缺少必需的导出'
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('增强版打包工具使用示例')
  console.log('=' .repeat(50))

  // 根据命令行参数选择运行哪个示例
  const example = process.argv[2] || 'basic'

  switch (example) {
    case 'basic':
      await basicExample()
      break
    case 'advanced':
      await advancedExample()
      break
    case 'watch':
      await watchExample()
      break
    case 'batch':
      await batchBuildExample()
      break
    case 'custom':
      await customValidationExample()
      break
    case 'all':
      await basicExample()
      await advancedExample()
      // await watchExample() // 跳过监听模式以避免阻塞
      await batchBuildExample()
      await customValidationExample()
      break
    default:
      console.log('用法: ts-node use-enhanced-builder.ts [basic|advanced|watch|batch|custom|all]')
  }

  console.log('\n示例运行完成')
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error)
}

// 导出示例函数供其他模块使用
export {
  basicExample,
  advancedExample,
  watchExample,
  batchBuildExample,
  customValidationExample
}
