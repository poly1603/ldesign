/**
 * 为 Vue 组件包创建专用的构建脚本
 * 使用 VueBuilder 处理 TypeScript 文件，跳过 Vue SFC（暂时）
 */

const fs = require('fs')
const path = require('path')

const VUE_PACKAGES = [
  'shared', 'color', 'component', 'device', 'form', 
  'qrcode', 'size', 'template', 'watermark'
]

function createVueBuildScript(packageName) {
  const packageDir = path.join('packages', packageName)
  const scriptPath = path.join(packageDir, 'scripts', 'build.js')
  
  console.log(`🔧 更新 ${packageName} 构建脚本...`)

  let formats = ['esm', 'cjs']
  
  // 组件库需要 UMD 格式
  if (packageName.includes('component') || packageName.includes('vue')) {
    formats.push('umd')
  }

  const buildScriptContent = `/**
 * ${packageName} Vue 增强构建脚本
 * 使用 @ldesign/builder VueBuilder 处理 Vue + TypeScript 项目
 */

import { VueBuilder } from '@ldesign/builder'
import { sep } from 'path'

async function build() {
  const isDev = process.argv.includes('--dev')
  const includeVue = process.argv.includes('--vue') // 实验性 Vue 支持
  
  console.log(\`🚀 构建 ${packageName} 包...\`)
  
  const builder = new VueBuilder({
    root: process.cwd(),
    src: 'src',
    outDir: 'dist',
    formats: ${JSON.stringify(formats)},
    sourcemap: true,
    minify: !isDev,
    clean: true,
    tsOnly: !includeVue, // 默认只构建 TS，除非指定 --vue
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
      console.log(\`✅ \${packageName} 构建成功！\`)
      
      if (result.skippedVueFiles > 0) {
        console.log(\`📄 跳过了 \${result.skippedVueFiles} 个 Vue SFC 文件\`)
        console.log('💡 使用 --vue 参数启用实验性 Vue SFC 支持')
      }
      
      console.log(\`📦 处理了 \${result.processedTsFiles} 个 TypeScript 文件\`)
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

  fs.writeFileSync(scriptPath, buildScriptContent)
  console.log(`✅ ${packageName} 构建脚本已更新`)
}

console.log('🚀 开始更新所有 Vue 包的构建脚本...')

for (const packageName of VUE_PACKAGES) {
  try {
    createVueBuildScript(packageName)
  } catch (error) {
    console.error(`❌ 更新 ${packageName} 失败:`, error)
  }
}

console.log('\n🎉 所有 Vue 包构建脚本更新完成！')
console.log('\n📝 使用方法:')
console.log('  node scripts/build.js          # 只构建 TypeScript 文件')
console.log('  node scripts/build.js --vue    # 实验性 Vue SFC 支持')
console.log('  node scripts/build.js --dev    # 开发模式（不压缩）')
