/**
 * form 构建脚本
 * 使用 @ldesign/builder LibraryBuilder 处理 TypeScript 项目
 */

import { LibraryBuilder } from '@ldesign/builder'
import { sep } from 'path'

async function build() {
  const isDev = process.argv.includes('--dev')

  console.log(`🚀 构建 form 包...`)

  const builder = new LibraryBuilder({
    config: {
      input: 'src/index.ts',
      output: {
        format: ['esm', 'cjs', 'umd'],
        name: 'LDesignForm',
        sourcemap: true,
        globals: {
          'vue': 'Vue',
          '@ldesign/shared': 'LDesignShared',
          '@ldesign/components': 'LDesignComponents'
        }
      },
      external: [
        'vue',
        '@ldesign/shared',
        '@ldesign/components'
      ],
      minify: !isDev,
      dts: false, // 暂时禁用类型生成
      exclude: [
        'src/styles/**/*',
        'src/**/*.less',
        'src/**/*.css',
        'src/**/*.vue',
        'src/components/**/*',
        'src/**/*.test.*',
        'src/**/*.spec.*',
        'src/test-*.ts',
        'src/dev/**/*',
        '__tests__/**/*'
      ]
    }
  })

  try {
    const result = await builder.build()
    const packageName = process.cwd().split(sep).pop()
    console.log(`✅ ${packageName} 构建成功！`)
    console.log(`📊 构建统计:`, result.stats)
  } catch (error) {
    console.error('❌ 构建过程中发生错误:', error)
    process.exit(1)
  }
}

build().catch(console.error)
