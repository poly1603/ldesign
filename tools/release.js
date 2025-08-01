#!/usr/bin/env node

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

/**
 * 发布脚本
 */
async function release() {
  console.log('🚀 开始发布流程...\n')
  
  try {
    // 1. 检查工作目录是否干净
    console.log('📋 检查工作目录状态...')
    const status = execSync('git status --porcelain', { encoding: 'utf-8' })
    if (status.trim()) {
      console.error('❌ 工作目录不干净，请先提交或暂存更改')
      process.exit(1)
    }
    console.log('✅ 工作目录干净\n')
    
    // 2. 拉取最新代码
    console.log('📥 拉取最新代码...')
    execSync('git pull origin main', { stdio: 'inherit' })
    console.log('✅ 代码已更新\n')
    
    // 3. 安装依赖
    console.log('📦 安装依赖...')
    execSync('pnpm install', { stdio: 'inherit' })
    console.log('✅ 依赖安装完成\n')
    
    // 4. 运行测试
    console.log('🧪 运行测试...')
    execSync('pnpm test:run', { stdio: 'inherit' })
    console.log('✅ 测试通过\n')
    
    // 5. 类型检查
    console.log('🔍 类型检查...')
    execSync('pnpm type-check:packages', { stdio: 'inherit' })
    console.log('✅ 类型检查通过\n')
    
    // 6. 代码检查
    console.log('🔧 代码检查...')
    execSync('pnpm lint', { stdio: 'inherit' })
    console.log('✅ 代码检查通过\n')
    
    // 7. 构建
    console.log('🏗️  构建包...')
    execSync('pnpm build', { stdio: 'inherit' })
    console.log('✅ 构建完成\n')
    
    // 8. 包大小检查
    console.log('📏 检查包大小...')
    try {
      execSync('pnpm size-check', { stdio: 'inherit' })
      console.log('✅ 包大小检查通过\n')
    } catch (error) {
      console.warn('⚠️  包大小检查失败，但继续发布\n')
    }
    
    // 9. 检查是否有变更集
    console.log('📝 检查变更集...')
    const changesetFiles = fs.readdirSync('.changeset').filter(file => 
      file.endsWith('.md') && file !== 'README.md'
    )
    
    if (changesetFiles.length === 0) {
      console.log('ℹ️  没有待处理的变更集')
      console.log('💡 如果需要发布，请先运行: pnpm changeset')
      return
    }
    
    console.log(`✅ 找到 ${changesetFiles.length} 个变更集\n`)
    
    // 10. 版本更新
    console.log('🔢 更新版本...')
    execSync('pnpm changeset version', { stdio: 'inherit' })
    console.log('✅ 版本更新完成\n')
    
    // 11. 提交版本更新
    console.log('💾 提交版本更新...')
    execSync('git add .', { stdio: 'inherit' })
    execSync('git commit -m "chore: update versions"', { stdio: 'inherit' })
    console.log('✅ 版本更新已提交\n')
    
    // 12. 发布到 npm
    console.log('📤 发布到 npm...')
    execSync('pnpm changeset publish', { stdio: 'inherit' })
    console.log('✅ 发布完成\n')
    
    // 13. 推送到远程
    console.log('⬆️  推送到远程仓库...')
    execSync('git push origin main --follow-tags', { stdio: 'inherit' })
    console.log('✅ 推送完成\n')
    
    console.log('🎉 发布流程完成！')
    
  } catch (error) {
    console.error('❌ 发布失败:', error.message)
    process.exit(1)
  }
}

/**
 * 预发布（beta版本）
 */
async function prerelease() {
  console.log('🚀 开始预发布流程...\n')
  
  try {
    // 基本检查和构建
    execSync('pnpm install', { stdio: 'inherit' })
    execSync('pnpm test:run', { stdio: 'inherit' })
    execSync('pnpm build', { stdio: 'inherit' })
    
    // 进入预发布模式
    console.log('🔄 进入预发布模式...')
    execSync('pnpm changeset pre enter beta', { stdio: 'inherit' })
    
    // 版本更新
    execSync('pnpm changeset version', { stdio: 'inherit' })
    
    // 发布 beta 版本
    console.log('📤 发布 beta 版本...')
    execSync('pnpm changeset publish --tag beta', { stdio: 'inherit' })
    
    console.log('🎉 Beta 版本发布完成！')
    
  } catch (error) {
    console.error('❌ 预发布失败:', error.message)
    process.exit(1)
  }
}

// CLI 处理
const command = process.argv[2]

switch (command) {
  case 'beta':
  case 'prerelease':
    prerelease()
    break
  case 'stable':
  case undefined:
    release()
    break
  default:
    console.log('用法:')
    console.log('  node tools/release.js          # 正式发布')
    console.log('  node tools/release.js beta     # 预发布')
    process.exit(1)
}
