/**
 * pdf 构建脚本
 * 使用 @ldesign/builder 进行零配置打包
 */

import { createBuilder } from '@ldesign/builder'
import { sep, resolve } from 'path'

async function build() {
  const isDev = process.argv.includes('--dev')

  // 将最简构建选项映射为 @ldesign/builder 的配置
  const config = {
    input: 'src/index.ts',
    output: {
      dir: resolve(process.cwd(), 'dist'),
      format: ['esm', 'cjs'],
      sourcemap: true,
      exports: 'named',
      globals: {
        vue: 'Vue',
        react: 'React',
        'react-dom': 'ReactDOM'
      }
    },
    external: [
      'vue',
      'react',
      'react-dom',
      '@ldesign/shared',
      '@ldesign/utils'
    ],
    minify: !isDev,
    clean: true
  }

  const builder = createBuilder(config, { autoDetect: true })

  try {
    const result = await builder.build()
    if (result.success) {
      console.log(`✅ ${process.cwd().split(sep).pop()} 构建成功！`)
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
