/**
 * shared Vue 增强构建脚本
 * 使用 @ldesign/builder LibraryBuilder 处理 Vue + TypeScript 项目
 */

import { LibraryBuilder } from '@ldesign/builder'
import { sep } from 'path'

async function build() {
  const isDev = process.argv.includes('--dev')
  const includeVue = process.argv.includes('--vue') // 实验性 Vue 支持
  
  console.log(`🚀 构建 shared 包...`)
  
  const builder = new LibraryBuilder({
    root: process.cwd(),
    src: 'src',
    formats: ["esm","cjs","umd","dts"],
    sourcemap: true,
    minify: !isDev,
    clean: true,
    enableVue: true, // 启用Vue支持，因为包含Vue组件
    external: [
      'vue',
      'react', 
      'react-dom',
      '@ldesign/shared',
      '@ldesign/utils',
      '@ldesign/kit'
    ],
    globals: {
      'vue': 'Vue',
      'react': 'React',
      'react-dom': 'ReactDOM'
    }
  })

  try {
    const result = await builder.build()
    if (result.success) {
      const packageName = process.cwd().split(sep).pop()
      console.log(`✅ ${packageName} 构建成功！`)
      
      if (result.skippedVueFiles > 0) {
        console.log(`📄 跳过了 ${result.skippedVueFiles} 个 Vue SFC 文件`)
        console.log('💡 使用 --vue 参数启用实验性 Vue SFC 支持')
      }
      
      console.log(`📦 处理了 ${result.processedTsFiles} 个 TypeScript 文件`)
    } else {
      console.error(`❌ 构建失败: ${result.errors?.join(', ')}`)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ 构建过程中发生错误:', error)
    process.exit(1)
  }
}

build().catch(console.error)
