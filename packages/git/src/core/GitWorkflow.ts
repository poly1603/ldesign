/**
 * Git 工作流管理
 * 支持 GitFlow、GitHub Flow 等工作流
 */

import { Git } from '../index.js'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'

/**
 * 工作流类型
 */
export enum WorkflowType {
  GITFLOW = 'gitflow',
  GITHUB_FLOW = 'github_flow',
  GITLAB_FLOW = 'gitlab_flow'
}

/**
 * 分支类型
 */
export enum BranchType {
  FEATURE = 'feature',
  RELEASE = 'release',
  HOTFIX = 'hotfix',
  BUGFIX = 'bugfix'
}

/**
 * 工作流配置
 */
interface WorkflowConfig {
  type: WorkflowType
  branches: {
    main: string
    develop: string
    feature: string
    release: string
    hotfix: string
  }
  versionTag: string
}

/**
 * Git 工作流管理类
 */
export class GitWorkflow {
  private git: Git
  private config: WorkflowConfig
  private spinner?: ora.Ora

  constructor(git: Git) {
    this.git = git
    this.config = this.loadConfig()
  }

  /**
   * 加载配置
   */
  private loadConfig(): WorkflowConfig {
    // TODO: 从配置文件加载
    return {
      type: WorkflowType.GITFLOW,
      branches: {
        main: 'main',
        develop: 'develop',
        feature: 'feature/',
        release: 'release/',
        hotfix: 'hotfix/'
      },
      versionTag: 'v'
    }
  }

  /**
   * 处理工作流操作
   */
  async handle(action: string, options: any): Promise<void> {
    switch (action) {
      case 'init':
        await this.initWorkflow(options.type || WorkflowType.GITFLOW)
        break
      case 'feature':
        await this.handleFeature(options)
        break
      case 'release':
        await this.handleRelease(options)
        break
      case 'hotfix':
        await this.handleHotfix(options)
        break
      case 'finish':
        await this.finishCurrent()
        break
      case 'status':
        await this.showWorkflowStatus()
        break
      default:
        console.error(chalk.red(`未知的工作流操作: ${action}`))
    }
  }

  /**
   * 初始化工作流
   */
  async initWorkflow(type: WorkflowType): Promise<void> {
    console.log(chalk.cyan(`🚀 初始化 ${type} 工作流...`))
    
    this.spinner = ora('检查仓库状态...').start()

    try {
      // 检查是否是 Git 仓库
      const isRepo = await this.git.isRepo()
      if (!isRepo) {
        this.spinner.fail('不是 Git 仓库')
        return
      }

      this.spinner.text = '创建主要分支...'

      // 根据工作流类型创建分支
      if (type === WorkflowType.GITFLOW) {
        await this.initGitFlow()
      } else if (type === WorkflowType.GITHUB_FLOW) {
        await this.initGitHubFlow()
      }

      this.spinner.succeed('工作流初始化完成!')
      
      // 显示工作流信息
      this.showWorkflowInfo(type)

    } catch (error) {
      this.spinner?.fail('初始化失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 初始化 GitFlow
   */
  private async initGitFlow(): Promise<void> {
    // 确保 main 分支存在
    const currentBranch = await this.git.branch.current()
    if (currentBranch.data !== this.config.branches.main) {
      // 创建或切换到 main 分支
      const branches = await this.git.listBranches()
      const mainExists = branches.data?.some((b: any) => 
        b.name === this.config.branches.main
      )
      
      if (!mainExists) {
        await this.git.branch.create(this.config.branches.main)
      }
      await this.git.checkoutBranch(this.config.branches.main)
    }

    // 创建 develop 分支
    const developExists = await this.git.branch.exists(this.config.branches.develop)
    if (!developExists) {
      await this.git.branch.create(
        this.config.branches.develop,
        this.config.branches.main
      )
    }

    // 切换到 develop 分支
    await this.git.checkoutBranch(this.config.branches.develop)
  }

  /**
   * 初始化 GitHub Flow
   */
  private async initGitHubFlow(): Promise<void> {
    // GitHub Flow 只需要 main 分支
    const currentBranch = await this.git.branch.current()
    if (currentBranch.data !== this.config.branches.main) {
      const branches = await this.git.listBranches()
      const mainExists = branches.data?.some((b: any) => 
        b.name === this.config.branches.main
      )
      
      if (!mainExists) {
        await this.git.branch.create(this.config.branches.main)
      }
      await this.git.checkoutBranch(this.config.branches.main)
    }
  }

  /**
   * 显示工作流信息
   */
  private showWorkflowInfo(type: WorkflowType): void {
    console.log()
    console.log(chalk.cyan('📋 工作流信息:'))
    console.log(chalk.gray('─'.repeat(40)))
    
    if (type === WorkflowType.GITFLOW) {
      console.log(`主分支: ${chalk.green(this.config.branches.main)}`)
      console.log(`开发分支: ${chalk.blue(this.config.branches.develop)}`)
      console.log(`功能分支前缀: ${chalk.yellow(this.config.branches.feature)}`)
      console.log(`发布分支前缀: ${chalk.magenta(this.config.branches.release)}`)
      console.log(`修复分支前缀: ${chalk.red(this.config.branches.hotfix)}`)
    } else if (type === WorkflowType.GITHUB_FLOW) {
      console.log(`主分支: ${chalk.green(this.config.branches.main)}`)
      console.log(`功能分支: ${chalk.yellow('从 main 创建，合并回 main')}`)
    }
    
    console.log(chalk.gray('─'.repeat(40)))
  }

  /**
   * 处理功能分支
   */
  async handleFeature(options: any): Promise<void> {
    const action = await this.selectFeatureAction()
    
    switch (action) {
      case 'start':
        await this.startFeature(options.name)
        break
      case 'finish':
        await this.finishFeature()
        break
      case 'publish':
        await this.publishFeature()
        break
      case 'pull':
        await this.pullFeature()
        break
    }
  }

  /**
   * 选择功能分支操作
   */
  private async selectFeatureAction(): Promise<string> {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择功能分支操作:',
        choices: [
          { name: '开始新功能', value: 'start' },
          { name: '完成功能', value: 'finish' },
          { name: '发布功能到远程', value: 'publish' },
          { name: '从远程拉取功能', value: 'pull' }
        ]
      }
    ])
    
    return answer.action
  }

  /**
   * 开始新功能
   */
  async startFeature(name?: string): Promise<void> {
    if (!name) {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: '输入功能名称:',
          validate: (input) => {
            if (!input) return '功能名称不能为空'
            if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
              return '功能名称只能包含字母、数字、横线和下划线'
            }
            return true
          }
        }
      ])
      name = answer.name
    }

    const branchName = `${this.config.branches.feature}${name}`
    
    this.spinner = ora(`创建功能分支 ${branchName}...`).start()

    try {
      // 从 develop 分支创建
      await this.git.checkoutBranch(this.config.branches.develop)
      await this.git.branch.create(branchName)
      await this.git.checkoutBranch(branchName)
      
      this.spinner.succeed(`功能分支 ${branchName} 创建成功!`)
      console.log(chalk.green(`✅ 已切换到分支 ${branchName}`))
      console.log(chalk.gray('开始开发你的功能吧！'))
      
    } catch (error) {
      this.spinner?.fail('创建功能分支失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 完成功能
   */
  async finishFeature(): Promise<void> {
    const currentBranch = await this.git.branch.current()
    
    if (!currentBranch.data?.startsWith(this.config.branches.feature)) {
      console.error(chalk.red('当前不在功能分支上'))
      return
    }

    const featureName = currentBranch.data.replace(this.config.branches.feature, '')
    
    const confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `确认完成功能 ${featureName} 并合并到 develop?`,
        default: true
      }
    ])

    if (!confirm.confirm) {
      console.log(chalk.yellow('已取消'))
      return
    }

    this.spinner = ora('完成功能分支...').start()

    try {
      // 切换到 develop
      this.spinner.text = '切换到 develop 分支...'
      await this.git.checkoutBranch(this.config.branches.develop)
      
      // 合并功能分支
      this.spinner.text = '合并功能分支...'
      await this.git.branch.merge(currentBranch.data, { noFf: true })
      
      // 删除功能分支
      this.spinner.text = '删除功能分支...'
      await this.git.branch.delete(currentBranch.data)
      
      this.spinner.succeed(`功能 ${featureName} 完成!`)
      console.log(chalk.green('✅ 功能已合并到 develop 分支'))
      
    } catch (error) {
      this.spinner?.fail('完成功能失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 发布功能到远程
   */
  async publishFeature(): Promise<void> {
    const currentBranch = await this.git.branch.current()
    
    if (!currentBranch.data?.startsWith(this.config.branches.feature)) {
      console.error(chalk.red('当前不在功能分支上'))
      return
    }

    this.spinner = ora('发布功能分支到远程...').start()

    try {
      await this.git.push('origin', currentBranch.data)
      this.spinner.succeed('功能分支已发布!')
      
    } catch (error) {
      this.spinner?.fail('发布失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 从远程拉取功能
   */
  async pullFeature(): Promise<void> {
    const currentBranch = await this.git.branch.current()
    
    if (!currentBranch.data?.startsWith(this.config.branches.feature)) {
      console.error(chalk.red('当前不在功能分支上'))
      return
    }

    this.spinner = ora('从远程拉取功能分支...').start()

    try {
      await this.git.pull('origin', currentBranch.data)
      this.spinner.succeed('功能分支已更新!')
      
    } catch (error) {
      this.spinner?.fail('拉取失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 处理发布
   */
  async handleRelease(options: any): Promise<void> {
    const action = await this.selectReleaseAction()
    
    switch (action) {
      case 'start':
        await this.startRelease(options.version)
        break
      case 'finish':
        await this.finishRelease()
        break
    }
  }

  /**
   * 选择发布操作
   */
  private async selectReleaseAction(): Promise<string> {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择发布操作:',
        choices: [
          { name: '开始新发布', value: 'start' },
          { name: '完成发布', value: 'finish' }
        ]
      }
    ])
    
    return answer.action
  }

  /**
   * 开始发布
   */
  async startRelease(version?: string): Promise<void> {
    if (!version) {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'version',
          message: '输入版本号 (如 1.0.0):',
          validate: (input) => {
            if (!input) return '版本号不能为空'
            if (!/^\d+\.\d+\.\d+$/.test(input)) {
              return '版本号格式错误 (应为 x.y.z)'
            }
            return true
          }
        }
      ])
      version = answer.version
    }

    const branchName = `${this.config.branches.release}${version}`
    
    this.spinner = ora(`创建发布分支 ${branchName}...`).start()

    try {
      // 从 develop 分支创建
      await this.git.checkoutBranch(this.config.branches.develop)
      await this.git.branch.create(branchName)
      await this.git.checkoutBranch(branchName)
      
      this.spinner.succeed(`发布分支 ${branchName} 创建成功!`)
      console.log(chalk.green(`✅ 已切换到分支 ${branchName}`))
      console.log(chalk.gray('可以进行发布前的最后调整'))
      
    } catch (error) {
      this.spinner?.fail('创建发布分支失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 完成发布
   */
  async finishRelease(): Promise<void> {
    const currentBranch = await this.git.branch.current()
    
    if (!currentBranch.data?.startsWith(this.config.branches.release)) {
      console.error(chalk.red('当前不在发布分支上'))
      return
    }

    const version = currentBranch.data.replace(this.config.branches.release, '')
    
    const confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `确认完成发布 ${version}?`,
        default: true
      }
    ])

    if (!confirm.confirm) {
      console.log(chalk.yellow('已取消'))
      return
    }

    this.spinner = ora('完成发布...').start()

    try {
      // 合并到 main
      this.spinner.text = '合并到 main 分支...'
      await this.git.checkoutBranch(this.config.branches.main)
      await this.git.branch.merge(currentBranch.data, { noFf: true })
      
      // 创建标签
      this.spinner.text = '创建版本标签...'
      const tagName = `${this.config.versionTag}${version}`
      await this.createTag(tagName, `Release version ${version}`)
      
      // 合并回 develop
      this.spinner.text = '合并回 develop 分支...'
      await this.git.checkoutBranch(this.config.branches.develop)
      await this.git.branch.merge(currentBranch.data, { noFf: true })
      
      // 删除发布分支
      this.spinner.text = '删除发布分支...'
      await this.git.branch.delete(currentBranch.data)
      
      this.spinner.succeed(`版本 ${version} 发布完成!`)
      console.log(chalk.green(`✅ 标签 ${tagName} 已创建`))
      console.log(chalk.green('✅ 更改已合并到 main 和 develop 分支'))
      
    } catch (error) {
      this.spinner?.fail('完成发布失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 处理修复
   */
  async handleHotfix(options: any): Promise<void> {
    const action = await this.selectHotfixAction()
    
    switch (action) {
      case 'start':
        await this.startHotfix(options.name)
        break
      case 'finish':
        await this.finishHotfix()
        break
    }
  }

  /**
   * 选择修复操作
   */
  private async selectHotfixAction(): Promise<string> {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择修复操作:',
        choices: [
          { name: '开始紧急修复', value: 'start' },
          { name: '完成修复', value: 'finish' }
        ]
      }
    ])
    
    return answer.action
  }

  /**
   * 开始修复
   */
  async startHotfix(name?: string): Promise<void> {
    if (!name) {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: '输入修复名称:',
          validate: (input) => {
            if (!input) return '修复名称不能为空'
            if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
              return '修复名称只能包含字母、数字、横线和下划线'
            }
            return true
          }
        }
      ])
      name = answer.name
    }

    const branchName = `${this.config.branches.hotfix}${name}`
    
    this.spinner = ora(`创建修复分支 ${branchName}...`).start()

    try {
      // 从 main 分支创建
      await this.git.checkoutBranch(this.config.branches.main)
      await this.git.branch.create(branchName)
      await this.git.checkoutBranch(branchName)
      
      this.spinner.succeed(`修复分支 ${branchName} 创建成功!`)
      console.log(chalk.green(`✅ 已切换到分支 ${branchName}`))
      console.log(chalk.gray('开始修复问题吧！'))
      
    } catch (error) {
      this.spinner?.fail('创建修复分支失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 完成修复
   */
  async finishHotfix(): Promise<void> {
    const currentBranch = await this.git.branch.current()
    
    if (!currentBranch.data?.startsWith(this.config.branches.hotfix)) {
      console.error(chalk.red('当前不在修复分支上'))
      return
    }

    const hotfixName = currentBranch.data.replace(this.config.branches.hotfix, '')
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'version',
        message: '输入新版本号:',
        validate: (input) => {
          if (!input) return '版本号不能为空'
          if (!/^\d+\.\d+\.\d+$/.test(input)) {
            return '版本号格式错误 (应为 x.y.z)'
          }
          return true
        }
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: `确认完成修复 ${hotfixName}?`,
        default: true
      }
    ])

    if (!answers.confirm) {
      console.log(chalk.yellow('已取消'))
      return
    }

    this.spinner = ora('完成修复...').start()

    try {
      // 合并到 main
      this.spinner.text = '合并到 main 分支...'
      await this.git.checkoutBranch(this.config.branches.main)
      await this.git.branch.merge(currentBranch.data, { noFf: true })
      
      // 创建标签
      this.spinner.text = '创建版本标签...'
      const tagName = `${this.config.versionTag}${answers.version}`
      await this.createTag(tagName, `Hotfix version ${answers.version}`)
      
      // 合并回 develop
      this.spinner.text = '合并回 develop 分支...'
      await this.git.checkoutBranch(this.config.branches.develop)
      await this.git.branch.merge(currentBranch.data, { noFf: true })
      
      // 删除修复分支
      this.spinner.text = '删除修复分支...'
      await this.git.branch.delete(currentBranch.data)
      
      this.spinner.succeed(`修复 ${hotfixName} 完成!`)
      console.log(chalk.green(`✅ 标签 ${tagName} 已创建`))
      console.log(chalk.green('✅ 修复已合并到 main 和 develop 分支'))
      
    } catch (error) {
      this.spinner?.fail('完成修复失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 完成当前工作流
   */
  async finishCurrent(): Promise<void> {
    const currentBranch = await this.git.branch.current()
    
    if (currentBranch.data?.startsWith(this.config.branches.feature)) {
      await this.finishFeature()
    } else if (currentBranch.data?.startsWith(this.config.branches.release)) {
      await this.finishRelease()
    } else if (currentBranch.data?.startsWith(this.config.branches.hotfix)) {
      await this.finishHotfix()
    } else {
      console.error(chalk.red('当前不在工作流分支上'))
    }
  }

  /**
   * 显示工作流状态
   */
  async showWorkflowStatus(): Promise<void> {
    console.log(chalk.cyan('\n📊 工作流状态'))
    console.log(chalk.gray('─'.repeat(50)))
    
    // 获取所有分支
    const branches = await this.git.listBranches()
    const currentBranch = await this.git.branch.current()
    
    // 分类分支
    const features: string[] = []
    const releases: string[] = []
    const hotfixes: string[] = []
    
    branches.data?.forEach((branch: any) => {
      if (branch.name.startsWith(this.config.branches.feature)) {
        features.push(branch.name)
      } else if (branch.name.startsWith(this.config.branches.release)) {
        releases.push(branch.name)
      } else if (branch.name.startsWith(this.config.branches.hotfix)) {
        hotfixes.push(branch.name)
      }
    })
    
    // 显示当前分支
    console.log(`当前分支: ${chalk.yellow(currentBranch.data)}`)
    console.log()
    
    // 显示主要分支
    console.log(chalk.green('主要分支:'))
    console.log(`  main: ${chalk.green(this.config.branches.main)}`)
    console.log(`  develop: ${chalk.blue(this.config.branches.develop)}`)
    console.log()
    
    // 显示活跃的工作流分支
    if (features.length > 0) {
      console.log(chalk.yellow('功能分支:'))
      features.forEach(branch => {
        const name = branch.replace(this.config.branches.feature, '')
        const current = branch === currentBranch.data ? ' (当前)' : ''
        console.log(`  ${name}${chalk.gray(current)}`)
      })
      console.log()
    }
    
    if (releases.length > 0) {
      console.log(chalk.magenta('发布分支:'))
      releases.forEach(branch => {
        const version = branch.replace(this.config.branches.release, '')
        const current = branch === currentBranch.data ? ' (当前)' : ''
        console.log(`  ${version}${chalk.gray(current)}`)
      })
      console.log()
    }
    
    if (hotfixes.length > 0) {
      console.log(chalk.red('修复分支:'))
      hotfixes.forEach(branch => {
        const name = branch.replace(this.config.branches.hotfix, '')
        const current = branch === currentBranch.data ? ' (当前)' : ''
        console.log(`  ${name}${chalk.gray(current)}`)
      })
      console.log()
    }
    
    console.log(chalk.gray('─'.repeat(50)))
  }

  /**
   * 创建标签
   */
  private async createTag(name: string, message: string): Promise<void> {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)
    
    await execAsync(`git tag -a ${name} -m "${message}"`)
  }
}
