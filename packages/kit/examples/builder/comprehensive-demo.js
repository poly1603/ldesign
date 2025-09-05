/**
 * 构建工具综合使用示例
 * 展示如何在实际项目中使用 ViteBuilder 和 RollupBuilder
 */

import {
  BuilderUtils,
  createRollupBuilderWithPreset,
  createViteBuilderWithPreset,
  RollupBuilder,
  ViteBuilder,
} from '../../dist/builder/index.js'

/**
 * 项目类型检测和推荐配置示例
 */
async function projectDetectionExample() {
  console.log('\n🔍 项目类型检测示例')
  console.log('====================')

  const projectPath = process.cwd()

  // 检测项目类型
  const projectType = BuilderUtils.detectProjectType(projectPath)
  console.log(`项目类型: ${projectType}`)

  // 查找入口文件
  const entryFile = BuilderUtils.findEntryFile(projectPath)
  console.log(`入口文件: ${entryFile || '未找到'}`)

  // 获取推荐配置
  const recommendedConfig = BuilderUtils.getRecommendedConfig(projectPath)
  console.log('推荐配置:', JSON.stringify(recommendedConfig, null, 2))

  // 验证配置
  const validation = BuilderUtils.validateConfig(recommendedConfig)
  console.log(`配置验证: ${validation.valid ? '✅ 有效' : '❌ 无效'}`)
  if (!validation.valid) {
    validation.errors.forEach(error => {
      console.log(`  🚫 ${error}`)
    })
  }
}

/**
 * 依赖检查示例
 */
async function dependencyCheckExample() {
  console.log('\n📦 依赖检查示例')
  console.log('================')

  const projectPath = process.cwd()
  const requiredDeps = ['vite', 'rollup', 'typescript', 'react', 'vue']

  const depCheck = BuilderUtils.checkDependencies(projectPath, requiredDeps)

  console.log('依赖检查结果:')
  console.log(`  ✅ 已安装: ${depCheck.installed.join(', ') || '无'}`)
  console.log(`  ❌ 缺失: ${depCheck.missing.join(', ') || '无'}`)
}

/**
 * 多项目构建示例
 */
async function multiProjectBuildExample() {
  console.log('\n🏗️ 多项目构建示例')
  console.log('==================')

  const projects = [
    {
      name: 'Web App',
      type: 'vite',
      config: {
        entry: 'src/main.ts',
        outDir: 'dist/web',
        server: { port: 3000 },
      },
    },
    {
      name: 'Library',
      type: 'rollup',
      config: {
        input: 'src/lib/index.ts',
        output: [
          { file: 'dist/lib/index.js', format: 'es' },
          { file: 'dist/lib/index.cjs', format: 'cjs' },
        ],
      },
    },
    {
      name: 'Node App',
      type: 'vite',
      config: {
        entry: 'src/server.ts',
        outDir: 'dist/server',
        target: 'node16',
      },
    },
  ]

  const builders = []
  const results = []

  try {
    // 创建所有构建器
    for (const project of projects) {
      let builder
      if (project.type === 'vite') {
        builder = new ViteBuilder(project.config)
      } else {
        builder = new RollupBuilder(project.config)
      }
      builders.push({ name: project.name, builder })
    }

    // 并行构建所有项目
    console.log('开始并行构建所有项目...')
    const buildPromises = builders.map(async ({ name, builder }) => {
      try {
        console.log(`🔄 构建 ${name}...`)
        const result = await builder.build()
        console.log(
          `${result.success ? '✅' : '❌'} ${name} 构建${result.success ? '成功' : '失败'}`
        )
        return { name, result }
      } catch (error) {
        console.log(`❌ ${name} 构建异常: ${error.message}`)
        return { name, result: { success: false, error: error.message } }
      }
    })

    const buildResults = await Promise.all(buildPromises)

    // 汇总结果
    console.log('\n📊 构建结果汇总:')
    buildResults.forEach(({ name, result }) => {
      if (result.success) {
        console.log(`  ✅ ${name}: 成功 (${result.duration}ms)`)
        if (result.outputs) {
          result.outputs.forEach(output => {
            console.log(`    📦 ${output.fileName} - ${BuilderUtils.formatFileSize(output.size)}`)
          })
        }
      } else {
        console.log(`  ❌ ${name}: 失败`)
      }
    })
  } finally {
    // 清理所有构建器
    await Promise.all(builders.map(({ builder }) => builder.destroy()))
  }
}

/**
 * 构建管道示例
 */
async function buildPipelineExample() {
  console.log('\n🔄 构建管道示例')
  console.log('================')

  // 第一步：构建库
  console.log('步骤 1: 构建库文件...')
  const libBuilder = createRollupBuilderWithPreset('rollup-library', {
    input: 'src/lib/index.ts',
    output: [
      { file: 'dist/lib/index.js', format: 'es' },
      { file: 'dist/lib/index.cjs', format: 'cjs' },
    ],
  })

  try {
    const libResult = await libBuilder.build()
    if (!libResult.success) {
      console.log('❌ 库构建失败，停止管道')
      return
    }
    console.log('✅ 库构建成功')

    // 第二步：构建应用（依赖于库）
    console.log('\n步骤 2: 构建应用...')
    const appBuilder = createViteBuilderWithPreset('vue-app', {
      entry: 'src/app/main.ts',
      outDir: 'dist/app',
      external: ['./lib'], // 外部化库依赖
    })

    const appResult = await appBuilder.build()
    if (!appResult.success) {
      console.log('❌ 应用构建失败')
      return
    }
    console.log('✅ 应用构建成功')

    // 第三步：生成构建报告
    console.log('\n步骤 3: 生成构建报告...')
    const totalSize = [...libResult.outputs, ...appResult.outputs].reduce(
      (sum, output) => sum + output.size,
      0
    )

    const report = {
      timestamp: new Date().toISOString(),
      totalFiles: libResult.outputs.length + appResult.outputs.length,
      totalSize: BuilderUtils.formatFileSize(totalSize),
      library: {
        files: libResult.outputs.length,
        size: BuilderUtils.formatFileSize(
          libResult.outputs.reduce((sum, output) => sum + output.size, 0)
        ),
      },
      application: {
        files: appResult.outputs.length,
        size: BuilderUtils.formatFileSize(
          appResult.outputs.reduce((sum, output) => sum + output.size, 0)
        ),
      },
    }

    console.log('📊 构建报告:')
    console.log(JSON.stringify(report, null, 2))

    await appBuilder.destroy()
  } finally {
    await libBuilder.destroy()
  }
}

/**
 * 环境特定构建示例
 */
async function environmentSpecificBuildExample() {
  console.log('\n🌍 环境特定构建示例')
  console.log('====================')

  const environments = ['development', 'staging', 'production']

  for (const env of environments) {
    console.log(`\n构建 ${env} 环境...`)

    const builder = new ViteBuilder({
      entry: 'src/index.ts',
      outDir: `dist/${env}`,
      env,
      minify: env === 'production',
      sourcemap: env !== 'production',
      define: {
        __ENV__: JSON.stringify(env),
        __DEV__: env === 'development',
        __PROD__: env === 'production',
      },
    })

    try {
      const result = await builder.build()
      if (result.success) {
        console.log(`✅ ${env} 环境构建成功`)
        result.outputs.forEach(output => {
          console.log(`  📦 ${output.fileName} - ${BuilderUtils.formatFileSize(output.size)}`)
        })
      } else {
        console.log(`❌ ${env} 环境构建失败`)
      }
    } catch (error) {
      console.log(`❌ ${env} 环境构建异常: ${error.message}`)
    } finally {
      await builder.destroy()
    }
  }
}

/**
 * 性能监控示例
 */
async function performanceMonitoringExample() {
  console.log('\n⚡ 性能监控示例')
  console.log('================')

  const builder = new ViteBuilder({
    entry: 'src/index.ts',
    outDir: 'dist/perf-test',
  })

  // 监控构建性能
  const performanceData = {
    builds: [],
    totalTime: 0,
    averageTime: 0,
  }

  builder.on('build:start', ({ mode }) => {
    console.log(`🔄 开始构建 (${mode})`)
  })

  builder.on('build:end', ({ result }) => {
    performanceData.builds.push({
      duration: result.duration,
      success: result.success,
      outputCount: result.outputs.length,
      totalSize: result.outputs.reduce((sum, output) => sum + output.size, 0),
    })

    performanceData.totalTime += result.duration
    performanceData.averageTime = performanceData.totalTime / performanceData.builds.length

    console.log(`${result.success ? '✅' : '❌'} 构建完成 (${result.duration}ms)`)
  })

  try {
    // 执行多次构建来收集性能数据
    console.log('执行多次构建以收集性能数据...')
    for (let i = 0; i < 3; i++) {
      await builder.build()
    }

    // 输出性能报告
    console.log('\n📊 性能报告:')
    console.log(`  构建次数: ${performanceData.builds.length}`)
    console.log(`  总耗时: ${performanceData.totalTime}ms`)
    console.log(`  平均耗时: ${Math.round(performanceData.averageTime)}ms`)
    console.log(`  最快构建: ${Math.min(...performanceData.builds.map(b => b.duration))}ms`)
    console.log(`  最慢构建: ${Math.max(...performanceData.builds.map(b => b.duration))}ms`)
  } finally {
    await builder.destroy()
  }
}

/**
 * 错误处理和恢复示例
 */
async function errorHandlingExample() {
  console.log('\n🚨 错误处理示例')
  console.log('================')

  // 创建一个会失败的构建配置
  const builder = new ViteBuilder({
    entry: 'src/nonexistent.ts', // 不存在的文件
    outDir: 'dist/error-test',
  })

  builder.on('build:error', ({ error }) => {
    console.log(`🚫 捕获到构建错误: ${error.message}`)
  })

  try {
    console.log('尝试构建不存在的入口文件...')
    const result = await builder.build()

    if (!result.success) {
      console.log('❌ 构建失败，尝试恢复...')

      // 修复配置
      builder.setConfig({
        entry: 'src/index.ts', // 修正为存在的文件
      })

      console.log('使用修正后的配置重新构建...')
      const retryResult = await builder.build()

      if (retryResult.success) {
        console.log('✅ 恢复构建成功!')
      } else {
        console.log('❌ 恢复构建仍然失败')
      }
    }
  } catch (error) {
    console.log(`💥 未处理的异常: ${error.message}`)
  } finally {
    await builder.destroy()
  }
}

/**
 * 运行所有综合示例
 */
async function runAllExamples() {
  console.log('🎉 构建工具综合使用示例演示')
  console.log('==============================')

  try {
    await projectDetectionExample()
    await dependencyCheckExample()
    await multiProjectBuildExample()
    await buildPipelineExample()
    await environmentSpecificBuildExample()
    await performanceMonitoringExample()
    await errorHandlingExample()

    console.log('\n🎊 所有综合示例演示完成!')
  } catch (error) {
    console.error('综合示例运行失败:', error)
  }
}

// 如果直接运行此文件，则执行所有示例
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples()
}

export {
  buildPipelineExample,
  dependencyCheckExample,
  environmentSpecificBuildExample,
  errorHandlingExample,
  multiProjectBuildExample,
  performanceMonitoringExample,
  projectDetectionExample,
  runAllExamples,
}
