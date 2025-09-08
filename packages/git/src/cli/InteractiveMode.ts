/**
 * 交互式模式
 * 提供友好的交互式界面和操作体验
 */

import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import boxen from 'boxen'
import Table from 'cli-table3'
import figlet from 'figlet'
import gradient from 'gradient-string'
import fuzzy from 'fuzzy'
import { Git } from '../index.js'

// 在需要时按需注册自动完成插件（避免 ESM 下的动态 require 错误）
let autocompleteRegistered = false
async function registerAutocompletePrompt() {
  if (autocompleteRegistered) return
  try {
    const mod: any = await import('inquirer-autocomplete-prompt')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    inquirer.registerPrompt('autocomplete', mod.default ?? mod)
    autocompleteRegistered = true
  } catch (e) {
    // 忽略注册失败，后续使用时将回退为普通输入
  }
}

/**
 * 菜单项接口
 */

/**
 * 交互式模式类
 */
export class InteractiveMode {
  private git: Git
  private running: boolean = false
  private spinner?: ora.Ora

  constructor(git: Git) {
    this.git = git
  }

  /**
   * 启动交互式模式
   */
  async start(): Promise<void> {
    this.running = true
    
    // 显示欢迎界面
    await this.showWelcome()

    // 主循环
    while (this.running) {
      try {
        await this.showMainMenu()
      } catch (error) {
        if (error instanceof Error && error.message === 'exit') {
          break
        }
        console.error(chalk.red('错误:'), error)
      }
    }

    // 显示告别信息
    this.showGoodbye()
  }

  /**
   * 显示欢迎界面
   */
  private async showWelcome(): Promise<void> {
    console.clear()
    
    const logo = figlet.textSync('Git Interactive', {
      font: 'Small',
      horizontalLayout: 'default'
    })

    console.log(gradient.rainbow(logo))
    console.log()
    
    const welcomeBox = boxen(
      chalk.cyan('🎮 欢迎进入 Git 交互式模式 🎮\n\n') +
      chalk.gray('使用方向键选择，回车确认\n') +
      chalk.gray('输入 / 进行搜索，ESC 退出'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
      }
    )

    console.log(welcomeBox)
    console.log()
  }

  /**
   * 显示主菜单
   */
  private async showMainMenu(): Promise<void> {
    const choices = [
      { 
        name: chalk.green('📝 提交管理'),
        value: 'commit',
        icon: '📝'
      },
      { 
        name: chalk.blue('🌿 分支管理'),
        value: 'branch',
        icon: '🌿'
      },
      { 
        name: chalk.yellow('📊 仓库状态'),
        value: 'status',
        icon: '📊'
      },
      { 
        name: chalk.cyan('🔄 同步操作'),
        value: 'sync',
        icon: '🔄'
      },
      { 
        name: chalk.magenta('📚 历史记录'),
        value: 'history',
        icon: '📚'
      },
      { 
        name: chalk.white('🏷️ 标签管理'),
        value: 'tags',
        icon: '🏷️'
      },
      { 
        name: chalk.gray('📦 储藏管理'),
        value: 'stash',
        icon: '📦'
      },
      { 
        name: chalk.green('🔧 工作流'),
        value: 'workflow',
        icon: '🔧'
      },
      { 
        name: chalk.blue('🎯 快速操作'),
        value: 'quick',
        icon: '🎯'
      },
      { 
        name: chalk.yellow('⚙️ 设置'),
        value: 'settings',
        icon: '⚙️'
      },
      new inquirer.Separator(),
      { 
        name: chalk.red('🚪 退出'),
        value: 'exit',
        icon: '🚪'
      }
    ]

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '请选择操作:',
        choices,
        pageSize: 15,
        loop: false
      }
    ])

    switch (answer.action) {
      case 'commit':
        await this.handleCommitMenu()
        break
      case 'branch':
        await this.handleBranchMenu()
        break
      case 'status':
        await this.handleStatus()
        break
      case 'sync':
        await this.handleSyncMenu()
        break
      case 'history':
        await this.handleHistoryMenu()
        break
      case 'tags':
        await this.handleTagsMenu()
        break
      case 'stash':
        await this.handleStashMenu()
        break
      case 'workflow':
        await this.handleWorkflowMenu()
        break
      case 'quick':
        await this.handleQuickMenu()
        break
      case 'settings':
        await this.handleSettingsMenu()
        break
      case 'exit':
        this.running = false
        break
    }
  }

  /**
   * 处理提交菜单
   */
  private async handleCommitMenu(): Promise<void> {
    const choices = [
      { name: '✨ 智能提交', value: 'smart' },
      { name: '📝 常规提交', value: 'normal' },
      { name: '🔄 修改最后提交', value: 'amend' },
      { name: '📦 批量提交', value: 'batch' },
      { name: '⏪ 返回', value: 'back' }
    ]

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择提交操作:',
        choices
      }
    ])

    switch (answer.action) {
      case 'smart':
        await this.handleSmartCommit()
        break
      case 'normal':
        await this.handleNormalCommit()
        break
      case 'amend':
        await this.handleAmendCommit()
        break
      case 'batch':
        await this.handleBatchCommit()
        break
      case 'back':
        return
    }
  }

  /**
   * 处理智能提交
   */
  private async handleSmartCommit(): Promise<void> {
    // 获取状态
    const status = await this.git.getStatus()
    
    if (!status.success || 
        (status.data?.modified?.length === 0 && 
         status.data?.not_added?.length === 0 &&
         status.data?.deleted?.length === 0)) {
      console.log(chalk.yellow('⚠️ 没有需要提交的更改'))
      await this.pause()
      return
    }

    // 显示更改的文件
    console.log(chalk.cyan('\n📋 待提交文件:'))
    this.displayChangedFiles(status.data)

    // 选择要提交的文件
    const filesToCommit = await this.selectFilesToCommit(status.data)

    if (filesToCommit.length === 0) {
      console.log(chalk.yellow('⚠️ 没有选择任何文件'))
      await this.pause()
      return
    }

    // 生成提交信息
    const commitInfo = await this.generateCommitMessage()

    // 确认提交
    const confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `确认提交 ${filesToCommit.length} 个文件?`,
        default: true
      }
    ])

    if (!confirm.confirm) {
      console.log(chalk.yellow('✖ 已取消提交'))
      await this.pause()
      return
    }

    // 执行提交
    this.spinner = ora('正在提交...').start()
    
    try {
      // 添加文件
      for (const file of filesToCommit) {
        await this.git.add(file)
      }

      // 提交
      const result = await this.git.commit(commitInfo.message)
      
      if (result.success) {
        this.spinner.succeed('提交成功!')
        console.log(chalk.green(`✅ 提交哈希: ${result.data?.hash}`))
        
        // 询问是否推送
        const pushAnswer = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'push',
            message: '是否推送到远程仓库?',
            default: false
          }
        ])

        if (pushAnswer.push) {
          await this.handlePush()
        }
      } else {
        this.spinner.fail('提交失败')
        console.error(chalk.red(result.error))
      }
    } catch (error) {
      this.spinner?.fail('操作失败')
      console.error(chalk.red('错误:'), error)
    }

    await this.pause()
  }

  /**
   * 处理常规提交
   */
  private async handleNormalCommit(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: '输入提交信息:',
        validate: (input) => input.length > 0 || '提交信息不能为空'
      },
      {
        type: 'confirm',
        name: 'addAll',
        message: '是否添加所有更改?',
        default: false
      }
    ])

    this.spinner = ora('正在提交...').start()

    try {
      if (answers.addAll) {
        await this.git.add('.')
      }

      const result = await this.git.commit(answers.message)
      
      if (result.success) {
        this.spinner.succeed('提交成功!')
        console.log(chalk.green(`✅ 提交哈希: ${result.data?.hash}`))
      } else {
        this.spinner.fail('提交失败')
        console.error(chalk.red(result.error))
      }
    } catch (error) {
      this.spinner?.fail('操作失败')
      console.error(chalk.red('错误:'), error)
    }

    await this.pause()
  }

  /**
   * 处理修改最后提交
   */
  private async handleAmendCommit(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'changeMessage',
        message: '是否修改提交信息?',
        default: false
      },
      {
        type: 'input',
        name: 'message',
        message: '新的提交信息:',
        when: (answers) => answers.changeMessage,
        validate: (input) => input.length > 0 || '提交信息不能为空'
      }
    ])

    this.spinner = ora('正在修改提交...').start()

    try {
      let command = 'git commit --amend'
      if (answers.changeMessage) {
        command += ` -m "${answers.message}"`
      } else {
        command += ' --no-edit'
      }

      const { exec } = await import('child_process')
      const { promisify } = await import('util')
      const execAsync = promisify(exec)
      
      await execAsync(command)
      this.spinner.succeed('提交已修改!')
    } catch (error) {
      this.spinner?.fail('修改失败')
      console.error(chalk.red('错误:'), error)
    }

    await this.pause()
  }

  /**
   * 处理批量提交
   */
  private async handleBatchCommit(): Promise<void> {
    console.log(chalk.cyan('📦 批量提交功能开发中...'))
    await this.pause()
  }

  /**
   * 处理分支菜单
   */
  private async handleBranchMenu(): Promise<void> {
    const choices = [
      { name: '📋 查看分支列表', value: 'list' },
      { name: '➕ 创建新分支', value: 'create' },
      { name: '🔄 切换分支', value: 'checkout' },
      { name: '🔀 合并分支', value: 'merge' },
      { name: '❌ 删除分支', value: 'delete' },
      { name: '📊 分支对比', value: 'compare' },
      { name: '⏪ 返回', value: 'back' }
    ]

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择分支操作:',
        choices
      }
    ])

    switch (answer.action) {
      case 'list':
        await this.handleBranchList()
        break
      case 'create':
        await this.handleBranchCreate()
        break
      case 'checkout':
        await this.handleBranchCheckout()
        break
      case 'merge':
        await this.handleBranchMerge()
        break
      case 'delete':
        await this.handleBranchDelete()
        break
      case 'compare':
        await this.handleBranchCompare()
        break
      case 'back':
        return
    }
  }

  /**
   * 处理分支列表
   */
  private async handleBranchList(): Promise<void> {
    this.spinner = ora('获取分支列表...').start()

    try {
      const branches = await this.git.listBranches(true)
      
      if (!branches.success || !branches.data) {
        this.spinner.fail('获取分支失败')
        await this.pause()
        return
      }

      this.spinner.succeed('分支列表获取成功')

      // 创建表格
      const table = new Table({
        head: [
          chalk.cyan('分支名'),
          chalk.cyan('类型'),
          chalk.cyan('当前')
        ],
        style: {
          head: [],
          border: ['cyan']
        }
      })

      branches.data.forEach((branch: any) => {
        table.push([
          branch.name,
          branch.remote ? chalk.blue('远程') : chalk.green('本地'),
          branch.current ? chalk.yellow('●') : ''
        ])
      })

      console.log('\n' + table.toString())
    } catch (error) {
      this.spinner?.fail('操作失败')
      console.error(chalk.red('错误:'), error)
    }

    await this.pause()
  }

  /**
   * 处理创建分支
   */
  private async handleBranchCreate(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '输入新分支名称:',
        validate: (input) => {
          if (!input) return '分支名不能为空'
          if (!/^[a-zA-Z0-9/_-]+$/.test(input)) {
            return '分支名只能包含字母、数字、下划线、横线和斜线'
          }
          return true
        }
      },
      {
        type: 'confirm',
        name: 'checkout',
        message: '是否立即切换到新分支?',
        default: true
      }
    ])

    this.spinner = ora('创建分支...').start()

    try {
      const result = await this.git.branch.create(answers.name)
      
      if (result.success) {
        this.spinner.succeed(`分支 ${answers.name} 创建成功!`)
        
        if (answers.checkout) {
          await this.git.checkoutBranch(answers.name)
          console.log(chalk.green(`✅ 已切换到分支 ${answers.name}`))
        }
      } else {
        this.spinner.fail('创建分支失败')
        console.error(chalk.red(result.error))
      }
    } catch (error) {
      this.spinner?.fail('操作失败')
      console.error(chalk.red('错误:'), error)
    }

    await this.pause()
  }

  /**
   * 处理切换分支
   */
  private async handleBranchCheckout(): Promise<void> {
    this.spinner = ora('获取分支列表...').start()

    try {
      const branches = await this.git.listBranches()
      
      if (!branches.success || !branches.data) {
        this.spinner.fail('获取分支失败')
        await this.pause()
        return
      }

      this.spinner.stop()

      const branchNames = branches.data
        .filter((b: any) => !b.current)
        .map((b: any) => b.name)

      if (branchNames.length === 0) {
        console.log(chalk.yellow('⚠️ 没有其他可切换的分支'))
        await this.pause()
        return
      }

      // 确保已注册自动完成提示
      await registerAutocompletePrompt()

      const answer = await inquirer.prompt([
        {
          type: 'autocomplete',
          name: 'branch',
          message: '选择要切换的分支:',
          source: async (_answersSoFar: any, input: string) => {
            if (!input) return branchNames
            return fuzzy.filter(input, branchNames).map(el => el.original)
          }
        }
      ])

      this.spinner = ora('切换分支...').start()
      const result = await this.git.checkoutBranch(answer.branch)
      
      if (result.success) {
        this.spinner.succeed(`已切换到分支 ${answer.branch}`)
      } else {
        this.spinner.fail('切换分支失败')
        console.error(chalk.red(result.error))
      }
    } catch (error) {
      this.spinner?.fail('操作失败')
      console.error(chalk.red('错误:'), error)
    }

    await this.pause()
  }

  /**
   * 处理合并分支
   */
  private async handleBranchMerge(): Promise<void> {
    console.log(chalk.cyan('🔀 分支合并功能开发中...'))
    await this.pause()
  }

  /**
   * 处理删除分支
   */
  private async handleBranchDelete(): Promise<void> {
    console.log(chalk.cyan('❌ 分支删除功能开发中...'))
    await this.pause()
  }

  /**
   * 处理分支对比
   */
  private async handleBranchCompare(): Promise<void> {
    console.log(chalk.cyan('📊 分支对比功能开发中...'))
    await this.pause()
  }

  /**
   * 处理状态显示
   */
  private async handleStatus(): Promise<void> {
    this.spinner = ora('获取仓库状态...').start()

    try {
      const status = await this.git.getStatus()
      
      if (!status.success) {
        this.spinner.fail('获取状态失败')
        console.error(chalk.red(status.error))
        await this.pause()
        return
      }

      this.spinner.succeed('状态获取成功')
      
      // 显示当前分支
      const branch = await this.git.branch.current()
      if (branch.success) {
        console.log(chalk.cyan(`\n📍 当前分支: ${branch.data}`))
      }

      // 显示文件状态
      this.displayChangedFiles(status.data)

      // 显示统计
      const stats = {
        staged: status.data?.staged?.length || 0,
        modified: status.data?.modified?.length || 0,
        untracked: status.data?.not_added?.length || 0,
        deleted: status.data?.deleted?.length || 0,
        conflicted: status.data?.conflicted?.length || 0
      }

      const total = Object.values(stats).reduce((a, b) => a + b, 0)

      if (total === 0) {
        console.log(chalk.green('\n✨ 工作目录干净，无待提交的更改'))
      } else {
        const statsBox = boxen(
          chalk.cyan('📊 统计信息\n\n') +
          `已暂存: ${chalk.green(stats.staged)}\n` +
          `已修改: ${chalk.yellow(stats.modified)}\n` +
          `未跟踪: ${chalk.gray(stats.untracked)}\n` +
          `已删除: ${chalk.red(stats.deleted)}\n` +
          `冲突: ${chalk.red(stats.conflicted)}`,
          {
            padding: 1,
            borderStyle: 'round',
            borderColor: 'cyan'
          }
        )
        console.log('\n' + statsBox)
      }

    } catch (error) {
      this.spinner?.fail('操作失败')
      console.error(chalk.red('错误:'), error)
    }

    await this.pause()
  }

  /**
   * 处理同步菜单
   */
  private async handleSyncMenu(): Promise<void> {
    const choices = [
      { name: '⬆️ 推送到远程', value: 'push' },
      { name: '⬇️ 从远程拉取', value: 'pull' },
      { name: '🔄 同步（拉取并推送）', value: 'sync' },
      { name: '📥 获取远程更新', value: 'fetch' },
      { name: '⏪ 返回', value: 'back' }
    ]

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择同步操作:',
        choices
      }
    ])

    switch (answer.action) {
      case 'push':
        await this.handlePush()
        break
      case 'pull':
        await this.handlePull()
        break
      case 'sync':
        await this.handleSync()
        break
      case 'fetch':
        await this.handleFetch()
        break
      case 'back':
        return
    }
  }

  /**
   * 处理推送
   */
  private async handlePush(): Promise<void> {
    this.spinner = ora('推送到远程仓库...').start()

    try {
      const result = await this.git.push()
      
      if (result.success) {
        this.spinner.succeed('推送成功!')
      } else {
        this.spinner.fail('推送失败')
        console.error(chalk.red(result.error))
      }
    } catch (error) {
      this.spinner?.fail('操作失败')
      console.error(chalk.red('错误:'), error)
    }

    await this.pause()
  }

  /**
   * 处理拉取
   */
  private async handlePull(): Promise<void> {
    this.spinner = ora('从远程仓库拉取...').start()

    try {
      const result = await this.git.pull()
      
      if (result.success) {
        this.spinner.succeed('拉取成功!')
      } else {
        this.spinner.fail('拉取失败')
        console.error(chalk.red(result.error))
      }
    } catch (error) {
      this.spinner?.fail('操作失败')
      console.error(chalk.red('错误:'), error)
    }

    await this.pause()
  }

  /**
   * 处理同步
   */
  private async handleSync(): Promise<void> {
    this.spinner = ora('同步仓库...').start()

    try {
      // 先拉取
      this.spinner.text = '拉取远程更新...'
      const pullResult = await this.git.pull()
      
      if (!pullResult.success) {
        this.spinner.fail('拉取失败')
        console.error(chalk.red(pullResult.error))
        await this.pause()
        return
      }

      // 再推送
      this.spinner.text = '推送本地更改...'
      const pushResult = await this.git.push()
      
      if (pushResult.success) {
        this.spinner.succeed('同步完成!')
      } else {
        this.spinner.fail('推送失败')
        console.error(chalk.red(pushResult.error))
      }
    } catch (error) {
      this.spinner?.fail('操作失败')
      console.error(chalk.red('错误:'), error)
    }

    await this.pause()
  }

  /**
   * 处理获取
   */
  private async handleFetch(): Promise<void> {
    console.log(chalk.cyan('📥 获取远程更新功能开发中...'))
    await this.pause()
  }

  /**
   * 处理历史菜单
   */
  private async handleHistoryMenu(): Promise<void> {
    const choices = [
      { name: '📜 查看提交日志', value: 'log' },
      { name: '🔍 搜索提交', value: 'search' },
      { name: '📊 提交统计', value: 'stats' },
      { name: '⏪ 返回', value: 'back' }
    ]

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择历史操作:',
        choices
      }
    ])

    switch (answer.action) {
      case 'log':
        await this.handleLog()
        break
      case 'search':
        await this.handleSearchCommit()
        break
      case 'stats':
        await this.handleStats()
        break
      case 'back':
        return
    }
  }

  /**
   * 处理日志显示
   */
  private async handleLog(): Promise<void> {
    const answer = await inquirer.prompt([
      {
        type: 'number',
        name: 'count',
        message: '显示最近多少条记录?',
        default: 10,
        validate: (input) => input > 0 || '请输入大于0的数字'
      }
    ])

    this.spinner = ora('获取提交日志...').start()

    try {
      const logs = await this.git.getLog(answer.count)
      
      if (!logs.success || !logs.data) {
        this.spinner.fail('获取日志失败')
        await this.pause()
        return
      }

      this.spinner.succeed('日志获取成功')

      // 显示日志
      console.log(chalk.cyan('\n📚 提交历史:\n'))
      
      logs.data.forEach((commit: any, index: number) => {
        const date = new Date(commit.date).toLocaleString()
        console.log(chalk.yellow(`${index + 1}. ${commit.hash.substring(0, 7)}`))
        console.log(`   ${chalk.white(commit.message)}`)
        console.log(`   ${chalk.gray(`作者: ${commit.author_name}`)}`)
        console.log(`   ${chalk.gray(`时间: ${date}`)}\n`)
      })

    } catch (error) {
      this.spinner?.fail('操作失败')
      console.error(chalk.red('错误:'), error)
    }

    await this.pause()
  }

  /**
   * 处理搜索提交
   */
  private async handleSearchCommit(): Promise<void> {
    console.log(chalk.cyan('🔍 搜索提交功能开发中...'))
    await this.pause()
  }

  /**
   * 处理统计
   */
  private async handleStats(): Promise<void> {
    console.log(chalk.cyan('📊 提交统计功能开发中...'))
    await this.pause()
  }

  /**
   * 处理标签菜单
   */
  private async handleTagsMenu(): Promise<void> {
    console.log(chalk.cyan('🏷️ 标签管理功能开发中...'))
    await this.pause()
  }

  /**
   * 处理储藏菜单
   */
  private async handleStashMenu(): Promise<void> {
    console.log(chalk.cyan('📦 储藏管理功能开发中...'))
    await this.pause()
  }

  /**
   * 处理工作流菜单
   */
  private async handleWorkflowMenu(): Promise<void> {
    console.log(chalk.cyan('🔧 工作流功能开发中...'))
    await this.pause()
  }

  /**
   * 处理快速操作菜单
   */
  private async handleQuickMenu(): Promise<void> {
    const choices = [
      { name: '💾 快速保存（添加所有并提交）', value: 'save' },
      { name: '🔄 快速同步（拉取并推送）', value: 'sync' },
      { name: '🧹 清理工作目录', value: 'clean' },
      { name: '⏪ 撤销最后一次提交', value: 'undo' },
      { name: '⏪ 返回', value: 'back' }
    ]

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择快速操作:',
        choices
      }
    ])

    switch (answer.action) {
      case 'save':
        await this.handleQuickSave()
        break
      case 'sync':
        await this.handleSync()
        break
      case 'clean':
        await this.handleClean()
        break
      case 'undo':
        await this.handleUndo()
        break
      case 'back':
        return
    }
  }

  /**
   * 处理快速保存
   */
  private async handleQuickSave(): Promise<void> {
    this.spinner = ora('快速保存...').start()

    try {
      await this.git.add('.')
      const message = `Quick save at ${new Date().toLocaleString()}`
      const result = await this.git.commit(message)
      
      if (result.success) {
        this.spinner.succeed('快速保存成功!')
        console.log(chalk.green(`✅ 提交哈希: ${result.data?.hash}`))
      } else {
        this.spinner.fail('保存失败')
        console.error(chalk.red(result.error))
      }
    } catch (error) {
      this.spinner?.fail('操作失败')
      console.error(chalk.red('错误:'), error)
    }

    await this.pause()
  }

  /**
   * 处理清理
   */
  private async handleClean(): Promise<void> {
    const confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: '确认要清理工作目录吗？这将删除所有未跟踪的文件！',
        default: false
      }
    ])

    if (!confirm.confirm) {
      console.log(chalk.yellow('✖ 已取消清理'))
      await this.pause()
      return
    }

    this.spinner = ora('清理工作目录...').start()

    try {
      const { exec } = await import('child_process')
      const { promisify } = await import('util')
      const execAsync = promisify(exec)
      
      await execAsync('git clean -fd')
      this.spinner.succeed('清理完成!')
    } catch (error) {
      this.spinner?.fail('清理失败')
      console.error(chalk.red('错误:'), error)
    }

    await this.pause()
  }

  /**
   * 处理撤销
   */
  private async handleUndo(): Promise<void> {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: '选择撤销方式:',
        choices: [
          { name: '软撤销（保留更改）', value: 'soft' },
          { name: '混合撤销（默认）', value: 'mixed' },
          { name: '硬撤销（丢弃更改）', value: 'hard' }
        ]
      }
    ])

    this.spinner = ora('撤销提交...').start()

    try {
      const { exec } = await import('child_process')
      const { promisify } = await import('util')
      const execAsync = promisify(exec)
      
      let command = 'git reset '
      if (answer.type === 'soft') {
        command += '--soft HEAD~1'
      } else if (answer.type === 'hard') {
        command += '--hard HEAD~1'
      } else {
        command += 'HEAD~1'
      }
      
      await execAsync(command)
      this.spinner.succeed('撤销成功!')
    } catch (error) {
      this.spinner?.fail('撤销失败')
      console.error(chalk.red('错误:'), error)
    }

    await this.pause()
  }

  /**
   * 处理设置菜单
   */
  private async handleSettingsMenu(): Promise<void> {
    console.log(chalk.cyan('⚙️ 设置功能开发中...'))
    await this.pause()
  }

  /**
   * 可视化冲突解决
   */
  async resolveConflictsVisual(): Promise<void> {
    console.log(chalk.cyan('🔀 可视化冲突解决功能开发中...'))
    await this.pause()
  }

  /**
   * 显示更改的文件
   */
  private displayChangedFiles(status: any): void {
    const table = new Table({
      head: [
        chalk.cyan('状态'),
        chalk.cyan('文件')
      ],
      style: {
        head: [],
        border: ['gray']
      }
    })

    status?.staged?.forEach((file: string) => {
      table.push([chalk.green('已暂存'), file])
    })

    status?.modified?.forEach((file: string) => {
      table.push([chalk.yellow('已修改'), file])
    })

    status?.not_added?.forEach((file: string) => {
      table.push([chalk.gray('未跟踪'), file])
    })

    status?.deleted?.forEach((file: string) => {
      table.push([chalk.red('已删除'), file])
    })

    status?.conflicted?.forEach((file: string) => {
      table.push([chalk.red('冲突'), file])
    })

    if (table.length > 0) {
      console.log('\n' + table.toString())
    }
  }

  /**
   * 选择要提交的文件
   */
  private async selectFilesToCommit(status: any): Promise<string[]> {
    const files: any[] = []

    status?.modified?.forEach((file: string) => {
      files.push({ name: `[M] ${file}`, value: file })
    })

    status?.not_added?.forEach((file: string) => {
      files.push({ name: `[?] ${file}`, value: file })
    })

    status?.deleted?.forEach((file: string) => {
      files.push({ name: `[D] ${file}`, value: file })
    })

    if (files.length === 0) {
      return []
    }

    const answer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'files',
        message: '选择要提交的文件:',
        choices: files,
        validate: (input) => input.length > 0 || '请至少选择一个文件'
      }
    ])

    return answer.files
  }

  /**
   * 生成提交信息
   */
  private async generateCommitMessage(): Promise<any> {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: '选择提交类型:',
        choices: [
          { name: '✨ feat: 新功能', value: 'feat' },
          { name: '🐛 fix: 修复bug', value: 'fix' },
          { name: '📝 docs: 文档更新', value: 'docs' },
          { name: '💄 style: 代码格式', value: 'style' },
          { name: '♻️ refactor: 重构', value: 'refactor' },
          { name: '⚡ perf: 性能优化', value: 'perf' },
          { name: '✅ test: 测试', value: 'test' },
          { name: '🔧 chore: 构建/工具', value: 'chore' }
        ]
      },
      {
        type: 'input',
        name: 'scope',
        message: '影响范围 (可选):'
      },
      {
        type: 'input',
        name: 'subject',
        message: '简短描述:',
        validate: (input) => input.length > 0 || '请输入描述'
      },
      {
        type: 'input',
        name: 'body',
        message: '详细描述 (可选):'
      }
    ])

    let message = answers.type
    if (answers.scope) {
      message += `(${answers.scope})`
    }
    message += `: ${answers.subject}`
    
    if (answers.body) {
      message += `\n\n${answers.body}`
    }

    return { message }
  }

  /**
   * 暂停
   */
  private async pause(): Promise<void> {
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: chalk.gray('按回车继续...')
      }
    ])
  }

  /**
   * 显示告别信息
   */
  private showGoodbye(): void {
    console.clear()
    
    const goodbyeBox = boxen(
      chalk.cyan('👋 感谢使用 Git 交互式模式！\n\n') +
      chalk.gray('欢迎下次再来！'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
      }
    )

    console.log(goodbyeBox)
  }
}
