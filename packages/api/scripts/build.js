/**
 * api 构建脚本
 * 使用 @ldesign/builder 进行零配置打�? */

const { SimpleBuilder } = require('@ldesign/builder')
const path = require('path')

async function build() {
  const isDev = process.argv.includes('--dev')
  
  const builder = new SimpleBuilder({
    root: process.cwd(),
    src: 'src',
    outDir: 'dist',
    formats: ["esm","cjs"],
    sourcemap: true,
    minify: !isDev,
    clean: true,
    external: [
      'vue',
      'react', 
      'react-dom',
      '@ldesign/shared',
      '@ldesign/utils'
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
      console.log(`�?${process.cwd().split(path.sep).pop()} 构建成功！`)
    } else {
      console.error(`�?构建失败: ${result.errors?.join(', ')}`)
      process.exit(1)
    }
  } catch (error) {
    console.error('�?构建过程中发生错�?', error)
    process.exit(1)
  }
}

build().catch(console.error)
