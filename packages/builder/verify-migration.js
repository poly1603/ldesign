#!/usr/bin/env node

/**
 * 验证配置文件迁移是否成功
 * 检查新配置文件是否能被正确读取
 */

import { configLoader } from './dist/utils/config/config-loader.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 测试项目
const TEST_PROJECTS = [
  'examples/basic-typescript',
  'examples/vue3-components',
  '../api',
  '../shared'
]

async function verifyProject(projectDir) {
  const fullPath = path.resolve(__dirname, projectDir)
  const projectName = path.basename(fullPath)
  
  console.log(`\n验证项目: ${projectName}`)
  
  try {
    // 使用 ConfigLoader 查找配置文件
    const configPath = await configLoader.findConfigFile(fullPath)
    
    if (!configPath) {
      console.log(`  ❌ 未找到配置文件`)
      return false
    }
    
    console.log(`  ✓ 找到配置文件: ${path.relative(fullPath, configPath)}`)
    
    // 验证配置文件是否在 .ldesign 目录下
    if (configPath.includes('.ldesign')) {
      console.log(`  ✓ 配置文件位于 .ldesign 目录`)
    } else {
      console.log(`  ⚠️  配置文件不在 .ldesign 目录`)
    }
    
    // 尝试加载配置文件
    const config = await configLoader.loadConfigFile(configPath)
    console.log(`  ✓ 配置文件加载成功`)
    
    // 检查配置文件优先级
    const priority = configLoader.getConfigFilePriority(configPath)
    console.log(`  ✓ 配置文件优先级: ${priority}`)
    
    return true
    
  } catch (error) {
    console.log(`  ❌ 验证失败: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('开始验证配置文件迁移结果...')
  
  let successCount = 0
  
  for (const project of TEST_PROJECTS) {
    const success = await verifyProject(project)
    if (success) {
      successCount++
    }
  }
  
  console.log(`\n📊 验证结果: ${successCount}/${TEST_PROJECTS.length} 个项目验证成功`)
  
  if (successCount === TEST_PROJECTS.length) {
    console.log('🎉 配置文件迁移验证通过!')
  } else {
    console.log('⚠️  部分项目验证失败')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('验证过程出错:', error)
  process.exit(1)
})
