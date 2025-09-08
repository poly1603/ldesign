/**
 * 批量操作模块
 * 支持批量cherry-pick、批量revert、批量分支操作等
 */

import { Git } from '../index.js'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import Table from 'cli-table3'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface BatchResult {
  total: number
  successful: number
  failed: number
  skipped: number
  results: OperationResult[]
}

interface OperationResult {
  item: string
  status: 'success' | 'failed' | 'skipped'
  message?: string
  error?: string
}

export class BatchOperations {
  private git: Git
  private spinner?: ora.Ora

  constructor(git: Git) {
    this.git = git
  }

  /**
   * 执行批量操作
   */
  async execute(operation: string, options: any): Promise<void> {
    switch (operation) {
      case 'cherry-pick':
        await this.batchCherryPick(options)
        break
      case 'revert':
        await this.batchRevert(options)
        break
      case 'branch':
        await this.batchBranch(options)
        break
      case 'tag':
        await this.batchTag(options)
        break
      case 'stash':
        await this.batchStash(options)
        break
      case 'merge':
        await this.batchMerge(options)
        break
      case 'rebase':
        await this.batchRebase(options)
        break
      default:
        console.error(chalk.red(`未知的批量操作: ${operation}`))
        await this.showAvailableOperations()
    }
  }

  /**
   * 批量 cherry-pick
   */
  private async batchCherryPick(options: any): Promise<void> {
    let commits = options.commits || []

    // 如果没有提供提交列表，交互式选择
    if (commits.length === 0) {
      commits = await this.selectCommits('cherry-pick')
      if (commits.length === 0) {
        console.log(chalk.yellow('没有选择任何提交'))
        return
      }
    }

    console.log(chalk.cyan(`\n🍒 准备 cherry-pick ${commits.length} 个提交`))
    
    // 确认操作
    const confirm = await this.confirmOperation(
      `确认要 cherry-pick 这 ${commits.length} 个提交吗？`,
      commits
    )
    
    if (!confirm) {
      console.log(chalk.yellow('操作已取消'))
      return
    }

    // 执行批量操作
    const results = await this.performBatchOperation(
      commits,
      async (commit) => {
        try {
          await execAsync(`git cherry-pick ${commit}`)
          return { success: true }
        } catch (error: any) {
          // 检查是否有冲突
          if (error.message.includes('conflict')) {
            // 中止当前 cherry-pick
            await execAsync('git cherry-pick --abort').catch(() => {})
            return { success: false, error: '存在冲突' }
          }
          return { success: false, error: error.message }
        }
      },
      'Cherry-picking'
    )

    // 显示结果
    this.displayBatchResults(results, 'Cherry-pick')
  }

  /**
   * 批量 revert
   */
  private async batchRevert(options: any): Promise<void> {
    let commits = options.commits || []

    if (commits.length === 0) {
      commits = await this.selectCommits('revert')
      if (commits.length === 0) {
        console.log(chalk.yellow('没有选择任何提交'))
        return
      }
    }

    console.log(chalk.cyan(`\n⏪ 准备回滚 ${commits.length} 个提交`))
    
    const confirm = await this.confirmOperation(
      `确认要回滚这 ${commits.length} 个提交吗？`,
      commits
    )
    
    if (!confirm) {
      console.log(chalk.yellow('操作已取消'))
      return
    }

    // 询问是否创建单个回滚提交
    const { singleCommit } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'singleCommit',
        message: '是否创建单个回滚提交？',
        default: false
      }
    ])

    const results = await this.performBatchOperation(
      commits,
      async (commit) => {
        try {
          const flags = singleCommit ? '--no-commit' : '--no-edit'
          await execAsync(`git revert ${flags} ${commit}`)
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      'Reverting'
    )

    // 如果是单个提交，最后创建一个合并的回滚提交
    if (singleCommit && results.successful > 0) {
      try {
        await execAsync(`git commit -m "Revert ${results.successful} commits"`)
        console.log(chalk.green('✅ 创建了合并的回滚提交'))
      } catch (error) {
        console.error(chalk.red('创建合并提交失败'), error)
      }
    }

    this.displayBatchResults(results, 'Revert')
  }

  /**
   * 批量分支操作
   */
  private async batchBranch(options: any): Promise<void> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择批量分支操作:',
        choices: [
          { name: '创建多个分支', value: 'create' },
          { name: '删除多个分支', value: 'delete' },
          { name: '重命名分支（批量添加前缀/后缀）', value: 'rename' },
          { name: '清理已合并分支', value: 'cleanup' }
        ]
      }
    ])

    switch (action) {
      case 'create':
        await this.batchCreateBranches()
        break
      case 'delete':
        await this.batchDeleteBranches(options)
        break
      case 'rename':
        await this.batchRenameBranches()
        break
      case 'cleanup':
        await this.cleanupMergedBranches()
        break
    }
  }

  /**
   * 批量创建分支
   */
  private async batchCreateBranches(): Promise<void> {
    const { pattern, count, baseBranch } = await inquirer.prompt([
      {
        type: 'input',
        name: 'pattern',
        message: '输入分支名称模式 (使用 {n} 表示序号):',
        default: 'feature/task-{n}',
        validate: (input) => input.includes('{n}') || '模式必须包含 {n}'
      },
      {
        type: 'number',
        name: 'count',
        message: '创建多少个分支？',
        default: 3,
        validate: (input) => input > 0 && input <= 20 || '请输入 1-20 之间的数字'
      },
      {
        type: 'input',
        name: 'baseBranch',
        message: '基于哪个分支创建？',
        default: 'develop'
      }
    ])

    const branches: string[] = []
    for (let i = 1; i <= count; i++) {
      branches.push(pattern.replace('{n}', i.toString()))
    }

    console.log(chalk.cyan('\n将创建以下分支:'))
    branches.forEach(branch => console.log(`  - ${branch}`))

    const confirm = await this.confirmOperation('确认创建这些分支吗？')
    if (!confirm) return

    // 先切换到基础分支
    try {
      await execAsync(`git checkout ${baseBranch}`)
    } catch (error) {
      console.error(chalk.red(`无法切换到基础分支 ${baseBranch}`))
      return
    }

    const results = await this.performBatchOperation(
      branches,
      async (branch) => {
        try {
          await execAsync(`git checkout -b ${branch}`)
          await execAsync(`git checkout ${baseBranch}`) // 切回基础分支
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      'Creating branches'
    )

    this.displayBatchResults(results, 'Branch creation')
  }

  /**
   * 批量删除分支
   */
  private async batchDeleteBranches(options: any): Promise<void> {
    let branches = options.branches || []

    if (branches.length === 0) {
      // 获取所有本地分支
      const { stdout } = await execAsync('git branch --format="%(refname:short)"')
      const allBranches = stdout.split('\n').filter(b => b.trim())
      
      // 获取当前分支
      const { stdout: currentBranch } = await execAsync('git branch --show-current')
      
      // 过滤掉当前分支和主要分支
      const deletableBranches = allBranches.filter(b => 
        b !== currentBranch.trim() && 
        !['main', 'master', 'develop'].includes(b)
      )

      if (deletableBranches.length === 0) {
        console.log(chalk.yellow('没有可删除的分支'))
        return
      }

      // 交互式选择
      const { selected } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selected',
          message: '选择要删除的分支:',
          choices: deletableBranches,
          validate: (input) => input.length > 0 || '请至少选择一个分支'
        }
      ])
      branches = selected
    }

    const { force } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'force',
        message: '是否强制删除（即使未合并）？',
        default: false
      }
    ])

    const results = await this.performBatchOperation(
      branches,
      async (branch) => {
        try {
          const flag = force ? '-D' : '-d'
          await execAsync(`git branch ${flag} ${branch}`)
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      'Deleting branches'
    )

    this.displayBatchResults(results, 'Branch deletion')
  }

  /**
   * 批量重命名分支
   */
  private async batchRenameBranches(): Promise<void> {
    const { action, pattern } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择重命名操作:',
        choices: [
          { name: '添加前缀', value: 'prefix' },
          { name: '添加后缀', value: 'suffix' },
          { name: '替换模式', value: 'replace' }
        ]
      },
      {
        type: 'input',
        name: 'pattern',
        message: action => {
          switch (action) {
            case 'prefix': return '输入要添加的前缀:'
            case 'suffix': return '输入要添加的后缀:'
            case 'replace': return '输入替换模式 (格式: old/new):'
            default: return '输入模式:'
          }
        }
      }
    ])

    // 获取分支列表
    const branches = await this.git.listBranches()
    if (!branches.success || !branches.data) {
      console.error(chalk.red('获取分支列表失败'))
      return
    }

    // 生成重命名映射
    const renameMap: Map<string, string> = new Map()
    
    branches.data
      .filter((b: any) => !b.current && !['main', 'master', 'develop'].includes(b.name))
      .forEach((branch: any) => {
        let newName = ''
        switch (action) {
          case 'prefix':
            newName = pattern + branch.name
            break
          case 'suffix':
            newName = branch.name + pattern
            break
          case 'replace':
            const [oldPart, newPart] = pattern.split('/')
            newName = branch.name.replace(oldPart, newPart)
            break
        }
        if (newName && newName !== branch.name) {
          renameMap.set(branch.name, newName)
        }
      })

    if (renameMap.size === 0) {
      console.log(chalk.yellow('没有需要重命名的分支'))
      return
    }

    // 显示重命名预览
    console.log(chalk.cyan('\n重命名预览:'))
    renameMap.forEach((newName, oldName) => {
      console.log(`  ${oldName} → ${newName}`)
    })

    const confirm = await this.confirmOperation('确认重命名这些分支吗？')
    if (!confirm) return

    const results: OperationResult[] = []
    for (const [oldName, newName] of renameMap) {
      try {
        await execAsync(`git branch -m ${oldName} ${newName}`)
        results.push({ item: `${oldName} → ${newName}`, status: 'success' })
      } catch (error: any) {
        results.push({ 
          item: `${oldName} → ${newName}`, 
          status: 'failed',
          error: error.message 
        })
      }
    }

    this.displayBatchResults(
      { 
        total: results.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
        skipped: 0,
        results 
      },
      'Branch rename'
    )
  }

  /**
   * 清理已合并的分支
   */
  private async cleanupMergedBranches(): Promise<void> {
    console.log(chalk.cyan('🧹 查找已合并的分支...'))
    
    try {
      // 获取已合并到当前分支的分支列表
      const { stdout } = await execAsync('git branch --merged')
      const mergedBranches = stdout
        .split('\n')
        .map(b => b.trim().replace('* ', ''))
        .filter(b => b && !['main', 'master', 'develop'].includes(b))

      if (mergedBranches.length === 0) {
        console.log(chalk.green('✨ 没有需要清理的已合并分支'))
        return
      }

      console.log(chalk.yellow(`\n找到 ${mergedBranches.length} 个已合并的分支:`))
      mergedBranches.forEach(branch => console.log(`  - ${branch}`))

      const { selected } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selected',
          message: '选择要删除的分支:',
          choices: mergedBranches,
          default: mergedBranches
        }
      ])

      if (selected.length === 0) {
        console.log(chalk.yellow('没有选择任何分支'))
        return
      }

      const results = await this.performBatchOperation(
        selected,
        async (branch) => {
          try {
            await execAsync(`git branch -d ${branch}`)
            return { success: true }
          } catch (error: any) {
            return { success: false, error: error.message }
          }
        },
        'Cleaning up branches'
      )

      this.displayBatchResults(results, 'Branch cleanup')
    } catch (error) {
      console.error(chalk.red('清理分支失败:'), error)
    }
  }

  /**
   * 批量标签操作
   */
private async batchTag(options: any): Promise<void> {
    void options
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择批量标签操作:',
        choices: [
          { name: '创建版本标签系列', value: 'create-series' },
          { name: '删除多个标签', value: 'delete' },
          { name: '推送所有标签', value: 'push-all' }
        ]
      }
    ])

    switch (action) {
      case 'create-series':
        await this.createTagSeries()
        break
      case 'delete':
        await this.deleteTags()
        break
      case 'push-all':
        await this.pushAllTags()
        break
    }
  }

  /**
   * 创建标签系列
   */
  private async createTagSeries(): Promise<void> {
    const { prefix, startVersion, count } = await inquirer.prompt([
      {
        type: 'input',
        name: 'prefix',
        message: '标签前缀:',
        default: 'v'
      },
      {
        type: 'input',
        name: 'startVersion',
        message: '起始版本:',
        default: '1.0.0',
        validate: (input) => /^\d+\.\d+\.\d+$/.test(input) || '请输入有效的版本号 (x.y.z)'
      },
      {
        type: 'number',
        name: 'count',
        message: '创建多少个标签？',
        default: 3
      }
    ])

    const tags: string[] = []
    let [major, minor, patch] = startVersion.split('.').map(Number)
    
    for (let i = 0; i < count; i++) {
      tags.push(`${prefix}${major}.${minor}.${patch}`)
      patch++ // 递增补丁版本
    }

    console.log(chalk.cyan('\n将创建以下标签:'))
    tags.forEach(tag => console.log(`  - ${tag}`))

    const confirm = await this.confirmOperation('确认创建这些标签吗？')
    if (!confirm) return

    const results = await this.performBatchOperation(
      tags,
      async (tag) => {
        try {
          await execAsync(`git tag -a ${tag} -m "Release ${tag}"`)
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      'Creating tags'
    )

    this.displayBatchResults(results, 'Tag creation')

    // 询问是否推送
    const { push } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'push',
        message: '是否推送这些标签到远程？',
        default: true
      }
    ])

    if (push) {
      await this.pushTags(tags)
    }
  }

  /**
   * 删除标签
   */
  private async deleteTags(): Promise<void> {
    // 获取所有标签
    const { stdout } = await execAsync('git tag')
    const allTags = stdout.split('\n').filter(t => t.trim())

    if (allTags.length === 0) {
      console.log(chalk.yellow('没有标签可删除'))
      return
    }

    const { selected } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message: '选择要删除的标签:',
        choices: allTags
      }
    ])

    if (selected.length === 0) {
      console.log(chalk.yellow('没有选择任何标签'))
      return
    }

    const results = await this.performBatchOperation(
      selected,
      async (tag) => {
        try {
          await execAsync(`git tag -d ${tag}`)
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      'Deleting tags'
    )

    this.displayBatchResults(results, 'Tag deletion')
  }

  /**
   * 推送所有标签
   */
  private async pushAllTags(): Promise<void> {
    this.spinner = ora('推送所有标签...').start()
    
    try {
      await execAsync('git push --tags')
      this.spinner.succeed('所有标签已推送')
    } catch (error) {
      this.spinner.fail('推送失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 推送指定标签
   */
  private async pushTags(tags: string[]): Promise<void> {
    const results = await this.performBatchOperation(
      tags,
      async (tag) => {
        try {
          await execAsync(`git push origin ${tag}`)
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      'Pushing tags'
    )

    this.displayBatchResults(results, 'Tag push')
  }

  /**
   * 批量 stash 操作
   */
private async batchStash(options: any): Promise<void> {
    void options
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择批量 stash 操作:',
        choices: [
          { name: '应用多个 stash', value: 'apply' },
          { name: '删除多个 stash', value: 'drop' },
          { name: '清空所有 stash', value: 'clear' }
        ]
      }
    ])

    switch (action) {
      case 'apply':
        await this.applyStashes()
        break
      case 'drop':
        await this.dropStashes()
        break
      case 'clear':
        await this.clearStashes()
        break
    }
  }

  /**
   * 应用多个 stash
   */
  private async applyStashes(): Promise<void> {
    // 获取 stash 列表
    const { stdout } = await execAsync('git stash list')
    if (!stdout) {
      console.log(chalk.yellow('没有 stash 可应用'))
      return
    }

    const stashes = stdout.split('\n')
      .filter(s => s)
      .map((s, i) => ({ name: s, value: i }))

    const { selected } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message: '选择要应用的 stash:',
        choices: stashes
      }
    ])

    if (selected.length === 0) {
      console.log(chalk.yellow('没有选择任何 stash'))
      return
    }

    const results = await this.performBatchOperation(
      selected,
      async (index) => {
        try {
          await execAsync(`git stash apply stash@{${index}}`)
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      'Applying stashes'
    )

    this.displayBatchResults(results, 'Stash apply')
  }

  /**
   * 删除多个 stash
   */
  private async dropStashes(): Promise<void> {
    const { stdout } = await execAsync('git stash list')
    if (!stdout) {
      console.log(chalk.yellow('没有 stash 可删除'))
      return
    }

    const stashes = stdout.split('\n')
      .filter(s => s)
      .map((s, i) => ({ name: s, value: i }))

    const { selected } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message: '选择要删除的 stash:',
        choices: stashes
      }
    ])

    if (selected.length === 0) {
      console.log(chalk.yellow('没有选择任何 stash'))
      return
    }

    // 从后往前删除，避免索引变化
    selected.sort((a, b) => b - a)

    const results = await this.performBatchOperation(
      selected,
      async (index) => {
        try {
          await execAsync(`git stash drop stash@{${index}}`)
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },
      'Dropping stashes'
    )

    this.displayBatchResults(results, 'Stash drop')
  }

  /**
   * 清空所有 stash
   */
  private async clearStashes(): Promise<void> {
    const confirm = await this.confirmOperation(
      '确认要清空所有 stash 吗？此操作不可恢复！'
    )
    
    if (!confirm) return

    try {
      await execAsync('git stash clear')
      console.log(chalk.green('✅ 所有 stash 已清空'))
    } catch (error) {
      console.error(chalk.red('清空 stash 失败:'), error)
    }
  }

  /**
   * 批量合并
   */
private async batchMerge(options: any): Promise<void> {
    void options
    // 获取分支列表
    const branches = await this.git.listBranches()
    if (!branches.success || !branches.data) {
      console.error(chalk.red('获取分支列表失败'))
      return
    }

    const availableBranches = branches.data
      .filter((b: any) => !b.current)
      .map((b: any) => b.name)

    const { selected, strategy } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message: '选择要合并的分支:',
        choices: availableBranches
      },
      {
        type: 'list',
        name: 'strategy',
        message: '选择合并策略:',
        choices: [
          { name: '普通合并', value: 'normal' },
          { name: '快进合并', value: 'ff-only' },
          { name: '禁止快进', value: 'no-ff' },
          { name: 'Squash 合并', value: 'squash' }
        ]
      }
    ])

    if (selected.length === 0) {
      console.log(chalk.yellow('没有选择任何分支'))
      return
    }

    let mergeFlags = ''
    switch (strategy) {
      case 'ff-only': mergeFlags = '--ff-only'; break
      case 'no-ff': mergeFlags = '--no-ff'; break
      case 'squash': mergeFlags = '--squash'; break
    }

    const results = await this.performBatchOperation(
      selected,
      async (branch) => {
        try {
          await execAsync(`git merge ${mergeFlags} ${branch}`)
          return { success: true }
        } catch (error: any) {
          // 如果有冲突，中止合并
          if (error.message.includes('conflict')) {
            await execAsync('git merge --abort').catch(() => {})
            return { success: false, error: '存在冲突' }
          }
          return { success: false, error: error.message }
        }
      },
      'Merging branches'
    )

    this.displayBatchResults(results, 'Branch merge')
  }

  /**
   * 批量变基
   */
private async batchRebase(options: any): Promise<void> {
    void options
    console.log(chalk.cyan('🔄 批量变基功能正在开发中...'))
  }

  /**
   * 选择提交
   */
  private async selectCommits(operation: string): Promise<string[]> {
    // 获取最近的提交
    const { stdout } = await execAsync('git log --oneline -n 30')
    const commits = stdout.split('\n')
      .filter(c => c)
      .map(c => {
const [hash] = c.split(' ')
        return {
          name: c,
          value: hash,
          short: hash
        }
      })

    const { selected } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message: `选择要 ${operation} 的提交:`,
        choices: commits,
        validate: (input) => input.length > 0 || '请至少选择一个提交'
      }
    ])

    return selected
  }

  /**
   * 执行批量操作
   */
  private async performBatchOperation<T>(
    items: T[],
    operation: (item: T) => Promise<{ success: boolean; error?: string }>,
    progressMessage: string
  ): Promise<BatchResult> {
    const results: OperationResult[] = []
    let successful = 0
    let failed = 0
    let skipped = 0

    this.spinner = ora(`${progressMessage} (0/${items.length})`).start()

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      this.spinner.text = `${progressMessage} (${i + 1}/${items.length})`
      
      try {
        const result = await operation(item)
        if (result.success) {
          successful++
          results.push({ item: String(item), status: 'success' })
        } else {
          failed++
          results.push({ 
            item: String(item), 
            status: 'failed',
            error: result.error 
          })
        }
      } catch (error: any) {
        failed++
        results.push({ 
          item: String(item), 
          status: 'failed',
          error: error.message 
        })
      }
    }

    this.spinner.stop()

    return {
      total: items.length,
      successful,
      failed,
      skipped,
      results
    }
  }

  /**
   * 确认操作
   */
  private async confirmOperation(message: string, items?: string[]): Promise<boolean> {
    if (items && items.length > 0) {
      console.log(chalk.cyan('\n待处理项目:'))
      items.slice(0, 10).forEach(item => console.log(`  - ${item}`))
      if (items.length > 10) {
        console.log(chalk.gray(`  ... 还有 ${items.length - 10} 项`))
      }
    }

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message,
        default: false
      }
    ])

    return confirm
  }

  /**
   * 显示批量操作结果
   */
  private displayBatchResults(results: BatchResult, operationType: string): void {
    console.log()
    
    // 创建结果表格
    const table = new Table({
      head: [
        chalk.cyan('项目'),
        chalk.cyan('状态'),
        chalk.cyan('消息')
      ],
      style: {
        head: [],
        border: ['gray']
      }
    })

    results.results.forEach(result => {
      const status = result.status === 'success' 
        ? chalk.green('✅ 成功')
        : result.status === 'failed'
        ? chalk.red('❌ 失败')
        : chalk.yellow('⏭️ 跳过')
      
      table.push([
        result.item.substring(0, 50),
        status,
        result.error || result.message || ''
      ])
    })

    if (table.length > 0) {
      console.log(table.toString())
    }

    // 显示统计
    console.log()
    console.log(chalk.cyan(`📊 ${operationType} 统计:`))
    console.log(`  总计: ${chalk.yellow(results.total)}`)
    console.log(`  成功: ${chalk.green(results.successful)}`)
    console.log(`  失败: ${chalk.red(results.failed)}`)
    if (results.skipped > 0) {
      console.log(`  跳过: ${chalk.yellow(results.skipped)}`)
    }

    // 显示总结
    if (results.failed === 0) {
      console.log(chalk.green(`\n✅ ${operationType} 完成，所有操作成功！`))
    } else if (results.successful === 0) {
      console.log(chalk.red(`\n❌ ${operationType} 失败，所有操作都失败了`))
    } else {
      console.log(chalk.yellow(
        `\n⚠️ ${operationType} 部分完成，${results.successful} 个成功，${results.failed} 个失败`
      ))
    }
  }

  /**
   * 显示可用操作
   */
  private async showAvailableOperations(): Promise<void> {
    console.log(chalk.cyan('\n可用的批量操作:'))
    console.log('  cherry-pick - 批量 cherry-pick 提交')
    console.log('  revert      - 批量回滚提交')
    console.log('  branch      - 批量分支操作')
    console.log('  tag         - 批量标签操作')
    console.log('  stash       - 批量 stash 操作')
    console.log('  merge       - 批量合并分支')
    console.log('  rebase      - 批量变基操作')
  }
}
