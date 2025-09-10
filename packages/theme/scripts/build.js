/**
 * theme 构建脚本
 * 使用 @ldesign/builder 进行构建（ESM/CJS/UMD）
 */

import { VueBuilder } from '@ldesign/builder'
import { sep } from 'path'

async function build() {
  const isDev = process.argv.includes('--dev')

  const builder = new VueBuilder({
    root: process.cwd(),
    src: 'src',
    formats: ["esm","cjs","umd","dts"],
    sourcemap: true,
    minify: !isDev,
    clean: true,
    enableVue: true,
    external: ['vue', '@ldesign/shared', '@ldesign/color'],
    globals: {
      vue: 'Vue',
      '@ldesign/shared': 'LDesignShared',
      '@ldesign/color': 'LDesignColor'
    }
  })

  try {
    const result = await builder.build()
    const packageName = process.cwd().split(sep).pop()
    if (result.success) {
      console.log(`✅ ${packageName} 构建成功！`)
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
