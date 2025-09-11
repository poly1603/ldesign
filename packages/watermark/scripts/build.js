/**
 * watermark 构建脚本
 * 使用 @ldesign/builder 构建库
 */

import { LibraryBuilder } from '@ldesign/builder'
import { sep } from 'path'

async function build() {
  const isDev = process.argv.includes('--dev')
  
  console.log(`🚀 构建 watermark 包...`)
  
  const builder = new LibraryBuilder({
    root: process.cwd(),
    src: 'src',
    outDir: 'dist',
    formats: ['esm', 'cjs', 'umd'],
    sourcemap: true,
    minify: !isDev,
    clean: true,
    external: [
      'vue',
      'react', 
      'react-dom'
    ],
    globals: {
      'vue': 'Vue',
      'react': 'React',
      'react-dom': 'ReactDOM'
    },
    libraryName: 'LDesignWatermark',
    entry: 'src/index.ts',
    typescript: {
      tsconfig: 'tsconfig.build.json'
    }
  })

  try {
    const result = await builder.build()
    if (result.success) {
      const packageName = process.cwd().split(sep).pop()
      console.log(`✅ ${packageName} 构建成功！`)
      
      if (result.processedFiles) {
        console.log(`📦 处理了 ${result.processedFiles} 个文件`)
      }
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
