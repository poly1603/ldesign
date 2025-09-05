/**
 * ViteBuilder 使用示例
 * 展示如何使用 ViteBuilder 进行各种构建场景
 */

import {
  createViteBuilder,
  createViteBuilderWithPreset,
  ViteBuilder,
} from '../../dist/builder/index.js'

/**
 * 基础构建示例
 */
async function basicBuildExample() {
  console.log('\n🚀 基础构建示例')
  console.log('================')

  const builder = new ViteBuilder({
    root: process.cwd(),
    entry: 'src/index.ts',
    outDir: 'dist',
    sourcemap: true,
    minify: true,
  })

  try {
    const result = await builder.build()
    console.log('构建结果:', result)

    if (result.success) {
      console.log('✅ 构建成功!')
      result.outputs.forEach(output => {
        console.log(`  📦 ${output.fileName} - ${formatFileSize(output.size)}`)
      })
    } else {
      console.log('❌ 构建失败!')
      result.errors.forEach(error => {
        console.log(`  🚫 ${error}`)
      })
    }
  } catch (error) {
    console.error('构建异常:', error.message)
  } finally {
    await builder.destroy()
  }
}

/**
 * 开发服务器示例
 */
async function devServerExample() {
  console.log('\n🔧 开发服务器示例')
  console.log('==================')

  const builder = new ViteBuilder({
    entry: 'src/index.ts',
    server: {
      port: 3000,
      host: true,
      open: true,
      cors: true,
      hmr: true,
    },
  })

  try {
    console.log('启动开发服务器...')
    const server = await builder.dev()

    console.log(`✅ 开发服务器已启动!`)
    console.log(`  🌐 URL: ${server.url}`)
    console.log(`  📡 端口: ${server.port}`)
    console.log(`  🔒 HTTPS: ${server.https ? '是' : '否'}`)

    // 模拟运行一段时间后关闭
    setTimeout(async () => {
      console.log('关闭开发服务器...')
      await server.close()
      await builder.destroy()
      console.log('✅ 开发服务器已关闭')
    }, 3000)
  } catch (error) {
    console.error('启动开发服务器失败:', error.message)
    await builder.destroy()
  }
}

/**
 * 库模式构建示例
 */
async function libraryBuildExample() {
  console.log('\n📚 库模式构建示例')
  console.log('==================')

  const builder = new ViteBuilder({
    lib: {
      entry: 'src/index.ts',
      name: 'MyLibrary',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format, entryName) => {
        const formatMap = {
          es: `${entryName}.js`,
          cjs: `${entryName}.cjs`,
          umd: `${entryName}.umd.js`,
        }
        return formatMap[format] || `${entryName}.${format}.js`
      },
    },
    outDir: 'lib',
    sourcemap: true,
    external: ['react', 'react-dom'],
  })

  try {
    console.log('构建库文件...')
    const result = await builder.buildLib()

    if (result.success) {
      console.log('✅ 库构建成功!')
      result.outputs.forEach(output => {
        console.log(`  📦 ${output.fileName} (${output.format}) - ${formatFileSize(output.size)}`)
      })
    } else {
      console.log('❌ 库构建失败!')
      result.errors.forEach(error => {
        console.log(`  🚫 ${error}`)
      })
    }
  } catch (error) {
    console.error('库构建异常:', error.message)
  } finally {
    await builder.destroy()
  }
}

/**
 * 预览服务器示例
 */
async function previewServerExample() {
  console.log('\n👀 预览服务器示例')
  console.log('==================')

  const builder = new ViteBuilder({
    outDir: 'dist',
    preview: {
      port: 4173,
      host: true,
      open: false,
    },
  })

  try {
    // 先构建项目
    console.log('构建项目...')
    const buildResult = await builder.build()

    if (!buildResult.success) {
      console.log('❌ 构建失败，无法启动预览服务器')
      return
    }

    console.log('启动预览服务器...')
    const server = await builder.preview()

    console.log(`✅ 预览服务器已启动!`)
    console.log(`  🌐 URL: ${server.url}`)
    console.log(`  📡 端口: ${server.port}`)

    // 模拟运行一段时间后关闭
    setTimeout(async () => {
      console.log('关闭预览服务器...')
      await server.close()
      await builder.destroy()
      console.log('✅ 预览服务器已关闭')
    }, 3000)
  } catch (error) {
    console.error('预览服务器异常:', error.message)
    await builder.destroy()
  }
}

/**
 * 使用预设创建构建器示例
 */
async function presetExample() {
  console.log('\n🎯 预设配置示例')
  console.log('================')

  // 使用 Vue 应用预设
  console.log('使用 Vue 应用预设...')
  const vueBuilder = createViteBuilderWithPreset('vue-app', {
    server: {
      port: 8080,
    },
  })

  console.log('Vue 构建器配置:', JSON.stringify(vueBuilder.getConfig(), null, 2))
  await vueBuilder.destroy()

  // 使用库开发预设
  console.log('\n使用库开发预设...')
  const libBuilder = createViteBuilderWithPreset('library', {
    lib: {
      name: 'MyCustomLibrary',
    },
  })

  console.log('库构建器配置:', JSON.stringify(libBuilder.getConfig(), null, 2))
  await libBuilder.destroy()
}

/**
 * 监听模式示例
 */
async function watchModeExample() {
  console.log('\n👁️ 监听模式示例')
  console.log('================')

  const builder = new ViteBuilder({
    entry: 'src/index.ts',
    outDir: 'dist-watch',
    sourcemap: true,
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
 * 插件管理示例
 */
async function pluginExample() {
  console.log('\n🔌 插件管理示例')
  console.log('================')

  const builder = new ViteBuilder({
    entry: 'src/index.ts',
    outDir: 'dist',
  })

  // 添加插件
  const mockPlugin = {
    name: 'mock-plugin',
    setup() {
      console.log('Mock plugin setup')
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
 * 工厂函数示例
 */
async function factoryExample() {
  console.log('\n🏭 工厂函数示例')
  console.log('================')

  // 使用工厂函数创建构建器
  const builder1 = createViteBuilder({
    entry: 'src/app.ts',
    outDir: 'dist-app',
  })

  console.log('构建器1配置:', {
    entry: builder1.getConfig().entry,
    outDir: builder1.getConfig().outDir,
  })

  // 使用默认配置
  const builder2 = createViteBuilder()
  console.log('构建器2配置:', {
    entry: builder2.getConfig().entry,
    outDir: builder2.getConfig().outDir,
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
  console.log('🎉 ViteBuilder 使用示例演示')
  console.log('============================')

  try {
    await basicBuildExample()
    await presetExample()
    await pluginExample()
    await factoryExample()

    // 注意：以下示例会启动服务器，在演示环境中可能需要注释掉
    // await devServerExample()
    // await libraryBuildExample()
    // await previewServerExample()
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
  devServerExample,
  factoryExample,
  libraryBuildExample,
  pluginExample,
  presetExample,
  previewServerExample,
  runAllExamples,
  watchModeExample,
}
