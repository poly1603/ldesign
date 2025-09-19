#!/usr/bin/env node

/**
 * 清理重复类型定义工具
 * 
 * 清理组件类型文件中的重复定义
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 清理单个组件的重复类型定义
 */
function cleanComponentTypes(componentName) {
  const typesFile = path.resolve(__dirname, '..', 'src', 'components', componentName, 'types.ts')
  
  if (!fs.existsSync(typesFile)) {
    console.log(`⚠️  组件 ${componentName} 的 types.ts 文件不存在`)
    return
  }

  console.log(`🧹 清理组件: ${componentName}`)
  
  let content = fs.readFileSync(typesFile, 'utf-8')
  let modified = false

  const capitalizedName = componentName.charAt(0).toUpperCase() + componentName.slice(1)

  // 移除重复的类型定义
  const typePatterns = [
    `export type ${capitalizedName}Props`,
    `export type ${capitalizedName}Emits`,
    `export interface ${capitalizedName}Slots`,
    `export interface ${capitalizedName}Instance`
  ]

  typePatterns.forEach(pattern => {
    const regex = new RegExp(`(${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^}]*}?)`, 'g')
    const matches = content.match(regex)
    
    if (matches && matches.length > 1) {
      console.log(`  🔍 发现重复定义: ${pattern}`)
      
      // 保留最后一个定义，移除前面的
      for (let i = 0; i < matches.length - 1; i++) {
        content = content.replace(matches[i], '')
        modified = true
      }
    }
  })

  // 清理多余的空行
  content = content.replace(/\n\n\n+/g, '\n\n')

  // 确保事件定义有 as const
  if (content.includes(`${componentName.toLowerCase()}Emits = {`) && 
      !content.includes(`${componentName.toLowerCase()}Emits = {`) + '.*as const') {
    content = content.replace(
      new RegExp(`(export const ${componentName.toLowerCase()}Emits = \\{[^}]+\\})(?!\\s*as const)`, 'g'),
      '$1 as const'
    )
    modified = true
  }

  if (modified) {
    fs.writeFileSync(typesFile, content)
    console.log(`  ✅ 已清理`)
  } else {
    console.log(`  ℹ️  无需清理`)
  }
}

/**
 * 清理所有组件
 */
async function cleanAllComponents() {
  console.log('🚀 开始清理所有组件的重复类型定义...\n')

  const componentsDir = path.resolve(__dirname, '..', 'src', 'components')
  const components = fs.readdirSync(componentsDir)
    .filter(item => {
      const itemPath = path.join(componentsDir, item)
      return fs.statSync(itemPath).isDirectory()
    })

  console.log(`找到 ${components.length} 个组件:`, components.join(', '))
  console.log('')

  for (const component of components) {
    try {
      cleanComponentTypes(component)
    } catch (error) {
      console.log(`  ❌ 清理失败: ${error.message}`)
    }
    console.log('')
  }

  console.log('🎉 所有组件重复类型定义清理完成！')
}

// 运行清理
if (import.meta.url === `file://${process.argv[1]}` || 
    import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  cleanAllComponents().catch(error => {
    console.error('清理过程中发生错误:', error)
    process.exit(1)
  })
}

export { cleanAllComponents }
