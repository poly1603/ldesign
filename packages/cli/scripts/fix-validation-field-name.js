/**
 * 批量修复配置文件中的字段名
 * 将 validation: { enabled: false } 替换为 postBuildValidation: { enabled: false }
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 项目根目录
const rootDir = resolve(__dirname, '../../..')
const packagesDir = join(rootDir, 'packages')

console.log('🔍 扫描并修复配置文件...')
console.log(`   路径: ${packagesDir}\n`)

let fixedCount = 0
let skippedCount = 0

// 递归查找配置文件
function findConfigFiles(dir) {
  const files = []
  const items = readdirSync(dir)
  
  for (const item of items) {
    const fullPath = join(dir, item)
    
    // 跳过 node_modules
    if (item === 'node_modules') continue
    
    const stat = statSync(fullPath)
    
    if (stat.isDirectory()) {
      files.push(...findConfigFiles(fullPath))
    } else if (item === 'builder.config.ts' || item === 'ldesign.config.ts') {
      files.push(fullPath)
    }
  }
  
  return files
}

const configFiles = findConfigFiles(packagesDir)
console.log(`📄 找到 ${configFiles.length} 个配置文件\n`)

for (const configPath of configFiles) {
  const relativePath = configPath.replace(rootDir, '')
  
  try {
    let content = readFileSync(configPath, 'utf-8')
    
    // 检查是否包含需要修复的模式
    const needsFix = /^\s*validation:\s*\{/m.test(content)
    
    if (!needsFix) {
      console.log(`⏭️  跳过: ${relativePath}`)
      skippedCount++
      continue
    }
    
    // 替换 validation: { 为 postBuildValidation: {
    const originalContent = content
    content = content.replace(
      /^(\s*)validation:(\s*\{)/gm,
      '$1postBuildValidation:$2'
    )
    
    if (content !== originalContent) {
      writeFileSync(configPath, content, 'utf-8')
      console.log(`✅ 修复: ${relativePath}`)
      fixedCount++
    } else {
      console.log(`⏭️  跳过: ${relativePath}`)
      skippedCount++
    }
    
  } catch (error) {
    console.error(`❌ 错误: ${relativePath}`)
    console.error(`   ${error.message}`)
  }
}

console.log(`\n✅ 完成！`)
console.log(`   修复: ${fixedCount} 个文件`)
console.log(`   跳过: ${skippedCount} 个文件`)
