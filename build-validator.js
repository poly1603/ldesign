/**
 * 简单的构建验证脚本
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔍 验证engine包构建配置...')

const engineDir = path.join(__dirname, 'packages', 'engine')
const configFiles = [
  'package.json',
  'tsconfig.json',
  'tsconfig.build.json',
  'rollup.config.js',
  'eslint.config.js',
]

console.log('📂 检查必要的配置文件...')
configFiles.forEach((file) => {
  const filePath = path.join(engineDir, file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - 存在`)
  }
  else {
    console.log(`❌ ${file} - 缺失`)
  }
})

console.log('\n📁 检查源代码结构...')
const srcDir = path.join(engineDir, 'src')
if (fs.existsSync(srcDir)) {
  const srcFiles = fs.readdirSync(srcDir, { withFileTypes: true })
  console.log('✅ src目录存在')
  console.log('   包含：')
  srcFiles.forEach((file) => {
    const type = file.isDirectory() ? '📁' : '📄'
    console.log(`   ${type} ${file.name}`)
  })
}
else {
  console.log('❌ src目录不存在')
}

console.log('\n📋 检查package.json脚本...')
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(engineDir, 'package.json'), 'utf-8'))
  const scripts = packageJson.scripts || {}

  const requiredScripts = ['build', 'lint', 'type-check']
  requiredScripts.forEach((script) => {
    if (scripts[script]) {
      console.log(`✅ ${script}: ${scripts[script]}`)
    }
    else {
      console.log(`❌ ${script}: 缺失`)
    }
  })

  console.log('\n📦 依赖检查...')
  console.log(`主要依赖: ${Object.keys(packageJson.dependencies || {}).length}`)
  console.log(`开发依赖: ${Object.keys(packageJson.devDependencies || {}).length}`)
}
catch (error) {
  console.log('❌ 无法解析package.json:', error.message)
}

console.log('\n✅ 构建配置验证完成!')
