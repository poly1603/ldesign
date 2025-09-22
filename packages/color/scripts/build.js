/**
 * color 构建脚本
 * 使用 @ldesign/builder LibraryBuilder 处理 TypeScript 项目
 */

import { sep } from 'node:path'
import process from 'node:process'
import { LibraryBuilder } from '@ldesign/builder'

async function build() {
  const isDev = process.argv.includes('--dev')

  console.log(`🚀 构建 color 包...`)

  const builder = new LibraryBuilder({
    config: {
      input: 'src/index.ts',
      output: {
        format: ['esm', 'cjs', 'umd'],
        name: 'LDesignColor',
        sourcemap: true,
        globals: {
          vue: 'Vue',
        },
      },
      external: ['vue'],
      minify: !isDev,
      dts: true,
    },
  })

  try {
    const result = await builder.build()
    const packageName = process.cwd().split(sep).pop()
    console.log(`✅ ${packageName} 构建成功！`)
    console.log(`📊 构建统计:`, result.stats)
  }
  catch (error) {
    console.error('❌ 构建过程中发生错误:', error)
    process.exit(1)
  }
}

build().catch(console.error)
