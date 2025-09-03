#!/usr/bin/env node

/**
 * 智能同步功能演示
 * 展示如何使用 @ldesign/git 的智能同步功能
 */

import { Git } from '../index.js'

async function demonstrateSmartSync() {
  console.log('🚀 @ldesign/git 智能同步功能演示\n')

  try {
    // 创建 Git 实例
    const git = Git.create('./demo-repo')

    // 检查是否为 Git 仓库
    const isRepo = await git.isRepo()
    if (!isRepo) {
      console.log('❌ 当前目录不是 Git 仓库')
      console.log('💡 请在 Git 仓库中运行此演示')
      return
    }

    console.log('✅ Git 仓库检查通过')

    // 演示基础智能同步
    console.log('\n📦 演示智能同步提交...')
    
    const result = await git.syncCommit('Demo: 智能同步功能测试', undefined, {
      showProgress: true,
      autoResolveConflicts: false,
      conflictStrategy: 'manual',
      confirmBeforeAction: false
    })

    if (result.success) {
      console.log('\n🎉 智能同步成功!')
      console.log(`📝 ${result.message}`)
      
      if (result.steps.length > 0) {
        console.log('\n执行步骤:')
        result.steps.forEach(step => console.log(`  ${step}`))
      }
    } else {
      console.log('\n⚠️ 智能同步遇到问题:')
      console.log(`📝 ${result.message}`)
      
      if (result.error) {
        console.log(`🔍 错误详情: ${result.error}`)
      }
      
      if (result.conflicts && !result.conflicts.resolved) {
        console.log('\n🔀 检测到合并冲突:')
        result.conflicts.conflictFiles.forEach(file => {
          console.log(`  - ${file.path} (${file.status})`)
        })
        
        console.log('\n💡 解决建议:')
        console.log('1. 手动编辑冲突文件')
        console.log('2. 使用 ldesign-git resolve --ours 保留本地更改')
        console.log('3. 使用 ldesign-git resolve --theirs 保留远程更改')
      }
      
      if (result.rollbackAvailable) {
        console.log('\n🔄 可以回滚操作:')
        console.log(`   ldesign-git rollback ${result.stashId || ''}`)
      }
    }

  } catch (error: any) {
    console.error('\n❌ 演示过程中发生错误:')
    console.error(error?.message || error)
  }
}

// 演示 stash 功能
async function demonstrateStash() {
  console.log('\n📦 演示 Stash 功能...')

  try {
    const git = Git.create('./demo-repo')

    // 检查是否有未提交的更改
    const status = await git.getStatus()
    const hasChanges = status.success && (
      (status.data?.modified?.length || 0) > 0 ||
      (status.data?.not_added?.length || 0) > 0
    )

    if (hasChanges) {
      console.log('📝 发现未提交的更改，演示 stash 功能')

      // 保存到 stash
      const stashResult = await git.stash.save('Demo stash', true)
      if (stashResult.success) {
        console.log('✅ 更改已保存到 stash')
        console.log(`📦 Stash ID: ${stashResult.data?.hash}`)

        // 列出 stash
        const stashList = await git.stash.list()
        if (stashList.success && stashList.data) {
          console.log('\n📋 Stash 列表:')
          stashList.data.forEach((stash, index) => {
            console.log(`  ${index}. ${stash.message} (${stash.date})`)
          })
        }

        // 恢复 stash
        console.log('\n🔄 恢复 stash...')
        const popResult = await git.stash.pop()
        if (popResult.success) {
          console.log('✅ Stash 已恢复')
        } else {
          console.log('❌ 恢复 stash 失败:', popResult.error)
        }
      } else {
        console.log('❌ 保存 stash 失败:', stashResult.error)
      }
    } else {
      console.log('ℹ️ 没有未提交的更改，跳过 stash 演示')
    }

  } catch (error: any) {
    console.error('❌ Stash 演示失败:', error?.message || error)
  }
}

// 演示冲突解决
async function demonstrateConflictResolution() {
  console.log('\n🔀 演示冲突解决功能...')

  try {
    const git = Git.create('./demo-repo')
    const { ConflictResolver } = await import('../utils/ConflictResolver.js')
    
    const resolver = new ConflictResolver(git)

    // 检查是否有冲突
    const hasConflicts = await resolver.hasConflicts()
    
    if (hasConflicts) {
      console.log('⚠️ 检测到合并冲突')

      // 获取冲突文件
      const conflictFiles = await resolver.getConflictFiles()
      if (conflictFiles.success && conflictFiles.data) {
        console.log('\n📋 冲突文件列表:')
        conflictFiles.data.forEach(file => {
          console.log(`  - ${file.path} (${file.status})`)
        })

        // 显示解决建议
        const suggestions = resolver.getResolutionSuggestions(conflictFiles.data)
        console.log('\n💡 解决建议:')
        suggestions.forEach(suggestion => console.log(suggestion))
      }
    } else {
      console.log('✅ 没有检测到合并冲突')
    }

  } catch (error: any) {
    console.error('❌ 冲突解决演示失败:', error?.message || error)
  }
}

// 主函数
async function main() {
  console.log('=' .repeat(60))
  console.log('🎯 @ldesign/git 智能同步功能完整演示')
  console.log('=' .repeat(60))

  // 演示智能同步
  await demonstrateSmartSync()

  // 演示 stash 功能
  await demonstrateStash()

  // 演示冲突解决
  await demonstrateConflictResolution()

  console.log('\n' + '=' .repeat(60))
  console.log('🎉 演示完成！')
  console.log('💡 更多功能请查看文档: packages/git/docs/')
  console.log('=' .repeat(60))
}

// 运行演示
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { demonstrateSmartSync, demonstrateStash, demonstrateConflictResolution }
