/**
 * 修复所有构建脚本，将其转换为 ES 模块格式
 */

const fs = require('fs')
const path = require('path')

const PACKAGES = [
  'api', 'cache', 'color', 'component', 
  'crypto', 'device', 'engine', 'form', 'git', 'http',
  'i18n', 'pdf', 'qrcode', 'router', 'shared', 'size',
  'store', 'template', 'theme', 'watermark'
]

function fixBuildScript(packageName) {
  const buildScriptPath = path.join('packages', packageName, 'scripts', 'build.js')
  
  if (!fs.existsSync(buildScriptPath)) {
    console.log(`⚠️ ${packageName} 构建脚本不存在，跳过`)
    return
  }

  console.log(`🔧 修复 ${packageName} 构建脚本...`)

  let formats = ['esm', 'cjs']
  
  // 组件库需要 UMD 格式
  if (packageName.includes('component') || packageName.includes('vue')) {
    formats.push('umd')
  }

  const buildScriptContent = `/**
 * ${packageName} 构建脚本
 * 使用 @ldesign/builder 进行零配置打包
 */

import { SimpleBuilder } from '@ldesign/builder'
import { sep } from 'path'

async function build() {
  const isDev = process.argv.includes('--dev')
  
  const builder = new SimpleBuilder({
    root: process.cwd(),
    src: 'src',
    outDir: 'dist',
    formats: ${JSON.stringify(formats)},
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
      console.log(\`✅ \${process.cwd().split(sep).pop()} 构建成功！\`)
    } else {
      console.error(\`❌ 构建失败: \${result.errors?.join(', ')}\`)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ 构建过程中发生错误:', error)
    process.exit(1)
  }
}

build().catch(console.error)
`

  fs.writeFileSync(buildScriptPath, buildScriptContent)
  console.log(`✅ ${packageName} 构建脚本已修复`)
}

console.log('🚀 开始修复所有构建脚本...')

for (const packageName of PACKAGES) {
  try {
    fixBuildScript(packageName)
  } catch (error) {
    console.error(`❌ 修复 ${packageName} 构建脚本失败:`, error)
  }
}

console.log('\n🎉 所有构建脚本修复完成！')
