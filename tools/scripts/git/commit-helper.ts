#!/usr/bin/env tsx

import { execSync } from 'node:child_process'
import { createInterface } from 'node:readline'

interface CommitType {
  value: string
  name: string
  description: string
}

const COMMIT_TYPES: CommitType[] = [
  { value: 'feat', name: '✨ feat', description: '新功能' },
  { value: 'fix', name: '🐛 fix', description: '修复bug' },
  { value: 'docs', name: '📝 docs', description: '文档更新' },
  { value: 'style', name: '💄 style', description: '代码格式调整' },
  { value: 'refactor', name: '♻️ refactor', description: '代码重构' },
  { value: 'perf', name: '⚡ perf', description: '性能优化' },
  { value: 'test', name: '✅ test', description: '测试相关' },
  { value: 'build', name: '📦 build', description: '构建相关' },
  { value: 'ci', name: '👷 ci', description: 'CI/CD相关' },
  { value: 'chore', name: '🔧 chore', description: '其他杂项' },
  { value: 'revert', name: '⏪ revert', description: '回滚提交' },
]

class CommitHelper {
  private rl: any

  constructor() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    })
  }

  // 获取用户输入
  private question(prompt: string): Promise<string> {
    return new Promise(resolve => {
      this.rl.question(prompt, resolve)
    })
  }

  // 检查工作区状态
  private checkWorkingDirectory() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf-8' })
      if (!status.trim()) {
        console.log('❌ 没有需要提交的更改')
        process.exit(1)
      }

      console.log('📋 当前更改:')
      console.log(status)
    } catch (error) {
      console.error('❌ 无法获取 Git 状态')
      process.exit(1)
    }
  }

  // 选择提交类型
  private async selectCommitType(): Promise<string> {
    console.log('\n📝 请选择提交类型:')
    COMMIT_TYPES.forEach((type, index) => {
      console.log(`${index + 1}. ${type.name} - ${type.description}`)
    })

    const answer = await this.question('\n请输入序号 (1-11): ')
    const index = Number.parseInt(answer) - 1

    if (index < 0 || index >= COMMIT_TYPES.length) {
      console.log('❌ 无效选择')
      return this.selectCommitType()
    }

    return COMMIT_TYPES[index].value
  }

  // 获取影响范围
  private async getScope(): Promise<string> {
    const scope = await this.question(
      '\n🎯 影响范围 (可选，如: engine, color, http): '
    )
    return scope.trim()
  }

  // 获取提交描述
  private async getDescription(): Promise<string> {
    const description = await this.question('\n📄 简短描述 (必填): ')
    if (!description.trim()) {
      console.log('❌ 描述不能为空')
      return this.getDescription()
    }
    return description.trim()
  }

  // 获取详细描述
  private async getBody(): Promise<string> {
    const body = await this.question('\n📋 详细描述 (可选，按回车跳过): ')
    return body.trim()
  }

  // 获取关联问题
  private async getIssues(): Promise<string> {
    const issues = await this.question('\n🔗 关联问题 (可选，如: #123, #456): ')
    return issues.trim()
  }

  // 是否为破坏性更改
  private async isBreakingChange(): Promise<boolean> {
    const answer = await this.question('\n💥 是否为破坏性更改? (y/N): ')
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes'
  }

  // 构建提交消息
  private buildCommitMessage(
    type: string,
    scope: string,
    description: string,
    body: string,
    issues: string,
    isBreaking: boolean
  ): string {
    let message = type

    if (scope) {
      message += `(${scope})`
    }

    if (isBreaking) {
      message += '!'
    }

    message += `: ${description}`

    if (body) {
      message += `\n\n${body}`
    }

    if (isBreaking) {
      message += '\n\nBREAKING CHANGE: 此更改包含破坏性变更'
    }

    if (issues) {
      message += `\n\n${issues}`
    }

    return message
  }

  // 预览并确认提交
  private async confirmCommit(message: string): Promise<boolean> {
    console.log('\n📋 提交消息预览:')
    console.log('─'.repeat(50))
    console.log(message)
    console.log('─'.repeat(50))

    const answer = await this.question('\n✅ 确认提交? (Y/n): ')
    return answer.toLowerCase() !== 'n' && answer.toLowerCase() !== 'no'
  }

  // 执行提交
  private executeCommit(message: string) {
    try {
      // 添加所有更改
      execSync('git add .', { stdio: 'inherit' })

      // 提交
      execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
        stdio: 'inherit',
      })

      console.log('✅ 提交成功!')

      // 询问是否推送
      this.question('\n⬆️ 是否推送到远程? (Y/n): ').then(answer => {
        if (answer.toLowerCase() !== 'n' && answer.toLowerCase() !== 'no') {
          try {
            execSync('git push', { stdio: 'inherit' })
            console.log('✅ 推送成功!')
          } catch (error) {
            console.error('❌ 推送失败:', error)
          }
        }
        this.rl.close()
      })
    } catch (error) {
      console.error('❌ 提交失败:', error)
      this.rl.close()
    }
  }

  // 主流程
  async run() {
    console.log('🚀 Git 提交助手')

    // 检查工作区
    this.checkWorkingDirectory()

    try {
      // 收集提交信息
      const type = await this.selectCommitType()
      const scope = await this.getScope()
      const description = await this.getDescription()
      const body = await this.getBody()
      const issues = await this.getIssues()
      const isBreaking = await this.isBreakingChange()

      // 构建提交消息
      const message = this.buildCommitMessage(
        type,
        scope,
        description,
        body,
        issues,
        isBreaking
      )

      // 确认并提交
      const confirmed = await this.confirmCommit(message)
      if (confirmed) {
        this.executeCommit(message)
      } else {
        console.log('❌ 提交已取消')
        this.rl.close()
      }
    } catch (error) {
      console.error('❌ 提交过程出错:', error)
      this.rl.close()
    }
  }

  // 快速提交 (用于简单更改)
  async quickCommit(type: string, message: string, scope?: string) {
    this.checkWorkingDirectory()

    const commitMessage = this.buildCommitMessage(
      type,
      scope || '',
      message,
      '',
      '',
      false
    )

    console.log('📋 快速提交:', commitMessage)

    try {
      execSync('git add .', { stdio: 'inherit' })
      execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, {
        stdio: 'inherit',
      })
      console.log('✅ 提交成功!')
    } catch (error) {
      console.error('❌ 提交失败:', error)
    }

    this.rl.close()
  }
}

// CLI 接口
const args = process.argv.slice(2)

const helper = new CommitHelper()

if (args.length >= 2) {
  // 快速提交模式
  const [type, message, scope] = args
  helper.quickCommit(type, message, scope).catch(console.error)
} else {
  // 交互模式
  helper.run().catch(console.error)
}
