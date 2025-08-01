#!/usr/bin/env tsx

/**
 * Git 自动提交工具
 *
 * 使用方法:
 *   pnpm run commit  # 或者 pnpm run c
 *   tsx tools/git-commit.ts
 *
 * 功能特性:
 *   - 自动拉取最新代码并使用 rebase 保持线性历史
 *   - 智能检测工作区状态
 *   - 交互式输入提交信息
 *   - 自动推送到远程仓库
 *   - 处理常见的 Git 冲突场景
 *   - 支持上游分支自动设置
 *
 * @author Scaffold Tool Team
 * @version 1.0.0
 */

import { execSync, spawn } from 'child_process'
import { createInterface } from 'readline'
import { promisify } from 'util'

/**
 * Git 自动提交工具
 * 
 * 功能：
 * - 自动拉取最新代码并使用 rebase 保持线性历史
 * - 添加所有更改文件
 * - 交互式输入提交信息
 * - 自动推送到远程仓库
 * - 处理常见的 Git 冲突场景
 */

interface GitStatus {
  hasChanges: boolean
  currentBranch: string
  isClean: boolean
  hasUnpushedCommits: boolean
}

class GitCommitTool {
  private rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  /**
   * 执行命令并返回结果
   */
  private exec(command: string, silent = false): string {
    try {
      const result = execSync(command, {
        encoding: 'utf8',
        stdio: silent ? 'pipe' : 'inherit'
      })
      // 确保结果不为 null 或 undefined，并转换为字符串
      return (result || '').toString().trim()
    } catch (error) {
      if (!silent) {
        console.error(`❌ 命令执行失败: ${command}`)
        console.error(error)
      }
      throw error
    }
  }

  /**
   * 安全执行命令，不抛出异常
   */
  private safeExec(command: string): { success: boolean; output: string } {
    try {
      const output = this.exec(command, true)
      return { success: true, output }
    } catch (error) {
      return { success: false, output: '' }
    }
  }

  /**
   * 获取 Git 状态信息
   */
  private getGitStatus(): GitStatus {
    const statusResult = this.safeExec('git status --porcelain')
    const branchResult = this.safeExec('git branch --show-current')
    const unpushedResult = this.safeExec('git log @{u}..HEAD --oneline')

    return {
      hasChanges: statusResult.success && statusResult.output.length > 0,
      currentBranch: branchResult.success ? branchResult.output : 'unknown',
      isClean: statusResult.success && statusResult.output.length === 0,
      hasUnpushedCommits: unpushedResult.success && unpushedResult.output.length > 0
    }
  }

  /**
   * 交互式获取提交信息
   */
  private async getCommitMessage(): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question('📝 请输入提交信息: ', (answer) => {
        resolve(answer.trim())
      })
    })
  }

  /**
   * 确认操作
   */
  private async confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.rl.question(`${message} (y/N): `, (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
      })
    })
  }

  /**
   * 拉取最新代码并使用 rebase
   */
  private async pullWithRebase(): Promise<boolean> {
    console.log('🔄 正在拉取最新代码...')
    
    try {
      // 先 fetch 获取最新的远程信息
      this.exec('git fetch origin')
      
      // 检查是否有远程更新
      const behindResult = this.safeExec('git rev-list HEAD..@{u} --count')
      const behind = behindResult.success ? parseInt(behindResult.output) : 0
      
      if (behind > 0) {
        console.log(`📥 发现 ${behind} 个远程提交，正在执行 rebase...`)
        this.exec('git pull --rebase origin')
        console.log('✅ Rebase 完成')
      } else {
        console.log('✅ 本地代码已是最新')
      }
      
      return true
    } catch (error) {
      console.error('❌ 拉取代码失败，可能存在冲突')
      console.log('💡 请手动解决冲突后重新运行此脚本')
      return false
    }
  }

  /**
   * 添加所有更改
   */
  private addAllChanges(): void {
    console.log('📁 正在添加所有更改...')
    this.exec('git add .')
    console.log('✅ 文件添加完成')
  }

  /**
   * 提交更改
   */
  private commit(message: string): void {
    console.log('💾 正在提交更改...')
    this.exec(`git commit -m "${message}"`)
    console.log('✅ 提交完成')
  }

  /**
   * 推送到远程仓库
   */
  private async push(branch: string): Promise<void> {
    console.log('🚀 正在推送到远程仓库...')
    
    try {
      this.exec(`git push origin ${branch}`)
      console.log('✅ 推送完成')
    } catch (error) {
      console.error('❌ 推送失败')
      
      // 检查是否需要设置上游分支
      const upstreamResult = this.safeExec('git rev-parse --abbrev-ref @{u}')
      if (!upstreamResult.success) {
        const shouldSetUpstream = await this.confirm('🔗 是否设置上游分支并推送？')
        if (shouldSetUpstream) {
          this.exec(`git push --set-upstream origin ${branch}`)
          console.log('✅ 上游分支设置完成并推送成功')
        }
      } else {
        throw error
      }
    }
  }

  /**
   * 显示当前状态
   */
  private displayStatus(status: GitStatus): void {
    console.log('\n📊 当前 Git 状态:')
    console.log(`   分支: ${status.currentBranch}`)
    console.log(`   有未提交更改: ${status.hasChanges ? '是' : '否'}`)
    console.log(`   有未推送提交: ${status.hasUnpushedCommits ? '是' : '否'}`)
    console.log('')
  }

  /**
   * 主要执行流程
   */
  async run(): Promise<void> {
    try {
      console.log('🎯 Git 自动提交工具启动\n')

      // 检查是否在 Git 仓库中
      const isGitRepo = this.safeExec('git rev-parse --git-dir')
      if (!isGitRepo.success) {
        console.error('❌ 当前目录不是 Git 仓库')
        process.exit(1)
      }

      // 获取当前状态
      const status = this.getGitStatus()
      this.displayStatus(status)

      // 如果没有更改且没有未推送的提交，直接退出
      if (status.isClean && !status.hasUnpushedCommits) {
        console.log('✅ 工作区干净，无需提交')
        this.rl.close()
        return
      }

      // 如果有未推送的提交，询问是否直接推送
      if (!status.hasChanges && status.hasUnpushedCommits) {
        const shouldPush = await this.confirm('🚀 发现未推送的提交，是否直接推送？')
        if (shouldPush) {
          await this.push(status.currentBranch)
          this.rl.close()
          return
        }
      }

      // 如果有更改，执行完整流程
      if (status.hasChanges) {
        // 1. 拉取最新代码
        const pullSuccess = await this.pullWithRebase()
        if (!pullSuccess) {
          this.rl.close()
          process.exit(1)
        }

        // 2. 添加所有更改
        this.addAllChanges()

        // 3. 获取提交信息
        const commitMessage = await this.getCommitMessage()
        if (!commitMessage) {
          console.log('❌ 提交信息不能为空')
          this.rl.close()
          process.exit(1)
        }

        // 4. 提交更改
        this.commit(commitMessage)

        // 5. 推送到远程仓库
        await this.push(status.currentBranch)
      }

      console.log('\n🎉 所有操作完成！')
      this.rl.close()

    } catch (error) {
      console.error('❌ 执行过程中发生错误:', error)
      this.rl.close()
      process.exit(1)
    }
  }
}

// 运行工具
const tool = new GitCommitTool()
tool.run()
