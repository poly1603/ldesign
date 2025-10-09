/**
 * 批量为所有使用 @ldesign/builder 的包禁用构建后验证
 * 
 * 此脚本会扫描所有 packages 目录，为使用 ldesign-builder 的包添加禁用验证的配置
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 项目根目录 - 从 scripts 目录向上 3 级到 ldesign 根目录
const rootDir = resolve(__dirname, '../../..')
const packagesDir = join(rootDir, 'packages')

console.log('🔍 扫描 packages 目录...')
console.log(`   路径: ${packagesDir}`)

const packages = readdirSync(packagesDir).filter(name => {
  const pkgPath = join(packagesDir, name)
  return statSync(pkgPath).isDirectory()
})

console.log(`\n📦 找到 ${packages.length} 个包:\n   ${packages.join(', ')}\n`)

let updatedCount = 0
let skippedCount = 0

for (const pkg of packages) {
  const pkgPath = join(packagesDir, pkg)
  const packageJsonPath = join(pkgPath, 'package.json')
  
  // 跳过没有 package.json 的目录
  if (!existsSync(packageJsonPath)) {
    continue
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
  
  // 检查是否使用 @ldesign/builder
  const usesBuilder = 
    packageJson.devDependencies?.['@ldesign/builder'] ||
    packageJson.dependencies?.['@ldesign/builder']

  if (!usesBuilder) {
    console.log(`⏭️  跳过 ${pkg} (未使用 @ldesign/builder)`)
    skippedCount++
    continue
  }

  console.log(`\n🔧 处理包: ${pkg}`)

  // 查找配置文件
  const configPaths = [
    join(pkgPath, '.ldesign', 'builder.config.ts'),
    join(pkgPath, '.ldesign', 'builder.config.js'),
    join(pkgPath, 'ldesign.config.ts'),
    join(pkgPath, 'ldesign.config.js')
  ]

  let configPath = null
  for (const path of configPaths) {
    if (existsSync(path)) {
      configPath = path
      break
    }
  }

  if (!configPath) {
    // 如果没有配置文件，创建一个
    configPath = join(pkgPath, 'ldesign.config.ts')
    const configContent = `import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 禁用构建后验证（库项目不需要运行测试验证）
  postBuildValidation: {
    enabled: false
  }
})
`
    writeFileSync(configPath, configContent, 'utf-8')
    console.log(`   ✅ 创建新配置文件: ${configPath.replace(rootDir, '')}`)
    updatedCount++
    continue
  }

  // 读取现有配置
  let configContent = readFileSync(configPath, 'utf-8')

  // 检查是否已经有 postBuildValidation 配置
  if (configContent.includes('postBuildValidation') || configContent.includes('validation')) {
    console.log(`   ⏭️  已存在 postBuildValidation 配置`)
    skippedCount++
    continue
  }

  // 添加 validation 配置
  // 找到 defineConfig({ 后面的位置
  const defineConfigMatch = configContent.match(/defineConfig\s*\(\s*\{/)
  if (!defineConfigMatch) {
    console.log(`   ⚠️  无法解析配置文件格式`)
    skippedCount++
    continue
  }

  const insertPos = defineConfigMatch.index + defineConfigMatch[0].length
  const validationConfig = `
  // 禁用构建后验证（库项目不需要运行测试验证）
  postBuildValidation: {
    enabled: false
  },
`

  configContent = 
    configContent.slice(0, insertPos) +
    validationConfig +
    configContent.slice(insertPos)

  writeFileSync(configPath, configContent, 'utf-8')
  console.log(`   ✅ 更新配置文件: ${configPath.replace(rootDir, '')}`)
  updatedCount++
}

console.log(`\n✅ 完成！`)
console.log(`   更新: ${updatedCount} 个包`)
console.log(`   跳过: ${skippedCount} 个包`)
