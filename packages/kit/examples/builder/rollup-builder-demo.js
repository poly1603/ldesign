/**
 * RollupBuilder 使用示例
 * 展示如何使用 RollupBuilder 进行各种打包场景
 */

import {
  createRollupBuilder,
  createRollupBuilderWithPreset,
  RollupBuilder,
} from '../../dist/builder/index.js'

/**
 * 基础打包示例
 */
async function basicBuildExample() {
  console.log('\n🚀 基础打包示例')
  console.log('================')

  const builder = new RollupBuilder({
    input: 'src/index.ts',
    output: {
      file: 'dist/bundle.js',
      format: 'es',
      sourcemap: true,
    },
    external: ['lodash'],
    plugins: [],
  })

  try {
    const result = await builder.build()
    console.log('打包结果:', result)

    if (result.success) {
      console.log('✅ 打包成功!')
      result.outputs.forEach(output => {
        console.log(`  📦 ${output.fileName} (${output.format}) - ${formatFileSize(output.size)}`)
      })
    } else {
      console.log('❌ 打包失败!')
      result.errors.forEach(error => {
        console.log(`  🚫 ${error}`)
      })
    }
  } catch (error) {
    console.error('打包异常:', error.message)
  } finally {
    await builder.destroy()
  }
}

/**
 * 多输出格式示例
 */
async function multipleOutputExample() {
  console.log('\n📦 多输出格式示例')
  console.log('==================')

  const builder = new RollupBuilder({
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'MyLibrary',
        sourcemap: true,
      },
    ],
    external: ['react', 'react-dom'],
  })

  try {
    console.log('打包多种格式...')
    const result = await builder.build()

    if (result.success) {
      console.log('✅ 多格式打包成功!')
      result.outputs.forEach(output => {
        console.log(`  📦 ${output.fileName} (${output.format}) - ${formatFileSize(output.size)}`)
      })
    } else {
      console.log('❌ 多格式打包失败!')
      result.errors.forEach(error => {
        console.log(`  🚫 ${error}`)
      })
    }
  } catch (error) {
    console.error('多格式打包异常:', error.message)
  } finally {
    await builder.destroy()
  }
}

/**
 * 多入口打包示例
 */
async function multipleEntryExample() {
  console.log('\n🎯 多入口打包示例')
  console.log('==================')

  const builder = new RollupBuilder({
    input: {
      main: 'src/index.ts',
      utils: 'src/utils/index.ts',
      components: 'src/components/index.ts',
    },
    output: {
      dir: 'dist',
      format: 'es',
      sourcemap: true,
      entryFileNames: '[name].js',
      chunkFileNames: 'chunks/[name]-[hash].js',
    },
    external: ['react', 'vue'],
  })

  try {
    console.log('打包多个入口...')
    const result = await builder.build()

    if (result.success) {
      console.log('✅ 多入口打包成功!')
      result.outputs.forEach(output => {
        console.log(`  📦 ${output.fileName} - ${formatFileSize(output.size)}`)
      })
    } else {
      console.log('❌ 多入口打包失败!')
      result.errors.forEach(error => {
        console.log(`  🚫 ${error}`)
      })
    }
  } catch (error) {
    console.error('多入口打包异常:', error.message)
  } finally {
    await builder.destroy()
  }
}

/**
 * 使用 buildMultiple 方法示例
 */
async function buildMultipleFormatsExample() {
  console.log('\n🔄 多格式构建方法示例')
  console.log('======================')

  const builder = new RollupBuilder({
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      sourcemap: true,
    },
    external: ['lodash'],
  })

  try {
    console.log('使用 buildMultiple 方法构建多种格式...')
    const results = await builder.buildMultiple(['es', 'cjs', 'umd'])

    console.log(`✅ 构建了 ${results.length} 种格式:`)
    results.forEach((result, index) => {
      const formats = ['es', 'cjs', 'umd']
      if (result.success) {
        console.log(`  ✅ ${formats[index]} 格式构建成功`)
        result.outputs.forEach(output => {
          console.log(`    📦 ${output.fileName} - ${formatFileSize(output.size)}`)
        })
      } else {
        console.log(`  ❌ ${formats[index]} 格式构建失败`)
        result.errors.forEach(error => {
          console.log(`    🚫 ${error}`)
        })
      }
    })
  } catch (error) {
    console.error('多格式构建异常:', error.message)
  } finally {
    await builder.destroy()
  }
}

/**
 * 监听模式示例
 */
async function watchModeExample() {
  console.log('\n👁️ 监听模式示例')
  console.log('================')

  const builder = new RollupBuilder({
    input: 'src/index.ts',
    output: {
      file: 'dist/watch-bundle.js',
      format: 'es',
      sourcemap: true,
    },
    watch: {
      include: 'src/**',
      exclude: 'node_modules/**',
      clearScreen: true,
    },
  })

  // 监听构建事件
  builder.on('build:start', ({ mode, config }) => {
    console.log(`🔄 开始构建 (模式: ${mode})`)
  })

  builder.on('build:end', ({ result }) => {
    if (result.success) {
      console.log(`✅ 构建完成 (${result.duration}ms)`)
    } else {
      console.log(`❌ 构建失败 (${result.duration}ms)`)
    }
  })

  builder.on('build:error', ({ error }) => {
    console.log(`🚫 构建错误: ${error.message}`)
  })

  try {
    console.log('启动监听模式...')
    // 注意：watch() 会持续运行，这里只是演示
    const watchPromise = builder.watch()

    // 模拟运行一段时间后停止
    setTimeout(async () => {
      console.log('停止监听模式...')
      await builder.destroy()
      console.log('✅ 监听模式已停止')
    }, 5000)
  } catch (error) {
    console.error('监听模式异常:', error.message)
    await builder.destroy()
  }
}

/**
 * 使用预设创建构建器示例
 */
async function presetExample() {
  console.log('\n🎯 预设配置示例')
  console.log('================')

  // 使用 Rollup 库预设
  console.log('使用 Rollup 库预设...')
  const libBuilder = createRollupBuilderWithPreset('rollup-library', {
    input: 'src/my-lib.ts',
  })

  console.log('库构建器配置:', JSON.stringify(libBuilder.getConfig(), null, 2))
  await libBuilder.destroy()

  // 使用 UMD 库预设
  console.log('\n使用 UMD 库预设...')
  const umdBuilder = createRollupBuilderWithPreset('umd-library', {
    output: {
      name: 'MyCustomLibrary',
    },
  })

  console.log('UMD 构建器配置:', JSON.stringify(umdBuilder.getConfig(), null, 2))
  await umdBuilder.destroy()
}

/**
 * 插件管理示例
 */
async function pluginExample() {
  console.log('\n🔌 插件管理示例')
  console.log('================')

  const builder = new RollupBuilder({
    input: 'src/index.ts',
    output: {
      file: 'dist/bundle.js',
      format: 'es',
    },
  })

  // 添加插件
  const mockPlugin = {
    name: 'mock-plugin',
    buildStart() {
      console.log('Mock plugin buildStart')
    },
  }

  builder.addPlugin(mockPlugin)
  console.log('✅ 已添加插件:', mockPlugin.name)

  // 查看配置
  const config = builder.getConfig()
  console.log('当前插件数量:', config.plugins?.length || 0)

  // 移除插件
  builder.removePlugin('mock-plugin')
  console.log('✅ 已移除插件:', mockPlugin.name)

  const updatedConfig = builder.getConfig()
  console.log('更新后插件数量:', updatedConfig.plugins?.length || 0)

  await builder.destroy()
}

/**
 * 配置管理示例
 */
async function configManagementExample() {
  console.log('\n⚙️ 配置管理示例')
  console.log('================')

  const builder = new RollupBuilder({
    input: 'src/index.ts',
    output: {
      file: 'dist/bundle.js',
      format: 'es',
    },
  })

  // 获取当前配置
  console.log('初始配置:')
  console.log('  输入:', builder.getConfig().input)
  console.log('  输出:', builder.getConfig().output.file)

  // 更新配置
  builder.setConfig({
    external: ['lodash', 'moment'],
    minify: true,
  })

  console.log('\n更新后配置:')
  console.log('  外部依赖:', builder.getConfig().external)
  console.log('  压缩:', builder.getConfig().minify)

  // 获取 Rollup 原始配置
  const rollupConfig = builder.getRollupConfig()
  console.log('\nRollup 配置键:', Object.keys(rollupConfig))

  await builder.destroy()
}

/**
 * 工厂函数示例
 */
async function factoryExample() {
  console.log('\n🏭 工厂函数示例')
  console.log('================')

  // 使用工厂函数创建构建器
  const builder1 = createRollupBuilder({
    input: 'src/app.ts',
    output: {
      file: 'dist/app.js',
      format: 'es',
    },
  })

  console.log('构建器1配置:', {
    input: builder1.getConfig().input,
    output: builder1.getConfig().output.file,
  })

  // 创建另一个构建器
  const builder2 = createRollupBuilder({
    input: ['src/main.ts', 'src/worker.ts'],
    output: {
      dir: 'dist',
      format: 'cjs',
    },
  })

  console.log('构建器2配置:', {
    input: builder2.getConfig().input,
    output: builder2.getConfig().output.dir,
  })

  await builder1.destroy()
  await builder2.destroy()
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

/**
 * 运行所有示例
 */
async function runAllExamples() {
  console.log('🎉 RollupBuilder 使用示例演示')
  console.log('==============================')

  try {
    await basicBuildExample()
    await multipleOutputExample()
    await multipleEntryExample()
    await buildMultipleFormatsExample()
    await presetExample()
    await pluginExample()
    await configManagementExample()
    await factoryExample()

    // 注意：监听模式会持续运行，在演示环境中可能需要注释掉
    // await watchModeExample()

    console.log('\n🎊 所有示例演示完成!')
  } catch (error) {
    console.error('示例运行失败:', error)
  }
}

// 如果直接运行此文件，则执行所有示例
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples()
}

export {
  basicBuildExample,
  buildMultipleFormatsExample,
  configManagementExample,
  factoryExample,
  multipleEntryExample,
  multipleOutputExample,
  pluginExample,
  presetExample,
  runAllExamples,
  watchModeExample,
}
