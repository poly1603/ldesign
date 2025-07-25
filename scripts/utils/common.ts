import { execa } from 'execa'
import chalk from 'chalk'
import { existsSync, readFileSync } from 'fs'
import { join, resolve } from 'path'

export interface ExecOptions {
  cwd?: string
  stdio?: 'inherit' | 'pipe'
  dryRun?: boolean
}

export interface GitStatus {
  isGitRepo: boolean
  isSubmodule: boolean
  currentBranch: string
  hasUncommittedChanges: boolean
  hasUnpushedCommits: boolean
  remoteBranch?: string
}

/**
 * 执行命令并返回结果
 */
export async function execCommand(
  command: string,
  args: string[] = [],
  options: ExecOptions = {}
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const { cwd = process.cwd(), stdio = 'pipe', dryRun = false } = options

  if (dryRun) {
    console.log(chalk.yellow(`[DRY RUN] ${command} ${args.join(' ')}`))
    return { stdout: '', stderr: '', exitCode: 0 }
  }

  try {
    const result = await execa(command, args, { cwd, stdio })
    return {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      exitCode: result.exitCode || 0
    }
  } catch (error: any) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message || '',
      exitCode: error.exitCode || 1
    }
  }
}

/**
 * 检查目录是否为 Git 仓库
 */
export function isGitRepository(path: string): boolean {
  return existsSync(join(path, '.git'))
}

/**
 * 检查目录是否为 Git Submodule
 */
export function isGitSubmodule(path: string): boolean {
  const gitFile = join(path, '.git')
  if (!existsSync(gitFile)) return false
  
  try {
    const content = readFileSync(gitFile, 'utf-8')
    return content.startsWith('gitdir:')
  } catch {
    return false
  }
}

/**
 * 获取 Git 状态信息
 */
export async function getGitStatus(path: string): Promise<GitStatus> {
  const isRepo = isGitRepository(path) || isGitSubmodule(path)
  
  if (!isRepo) {
    return {
      isGitRepo: false,
      isSubmodule: false,
      currentBranch: '',
      hasUncommittedChanges: false,
      hasUnpushedCommits: false
    }
  }

  const isSubmodule = isGitSubmodule(path)
  
  // 获取当前分支
  const branchResult = await execCommand('git', ['branch', '--show-current'], { cwd: path })
  const currentBranch = branchResult.stdout.trim()

  // 检查未提交的更改
  const statusResult = await execCommand('git', ['status', '--porcelain'], { cwd: path })
  const hasUncommittedChanges = statusResult.stdout.trim().length > 0

  // 检查未推送的提交
  let hasUnpushedCommits = false
  let remoteBranch: string | undefined

  if (currentBranch) {
    const remoteResult = await execCommand('git', ['rev-parse', '--abbrev-ref', `${currentBranch}@{upstream}`], { cwd: path })
    if (remoteResult.exitCode === 0) {
      remoteBranch = remoteResult.stdout.trim()
      const aheadResult = await execCommand('git', ['rev-list', '--count', `${remoteBranch}..HEAD`], { cwd: path })
      hasUnpushedCommits = parseInt(aheadResult.stdout.trim() || '0') > 0
    }
  }

  return {
    isGitRepo: true,
    isSubmodule,
    currentBranch,
    hasUncommittedChanges,
    hasUnpushedCommits,
    remoteBranch
  }
}

/**
 * 获取所有 submodule 信息
 */
export async function getSubmodules(rootPath: string): Promise<Array<{
  path: string
  url: string
  branch: string
  commit: string
}>> {
  const submodules: Array<{ path: string; url: string; branch: string; commit: string }> = []
  
  const result = await execCommand('git', ['submodule', 'status'], { cwd: rootPath })
  if (result.exitCode !== 0) return submodules

  const lines = result.stdout.trim().split('\n').filter(line => line.trim())
  
  for (const line of lines) {
    const match = line.match(/^.?([a-f0-9]+)\s+(.+?)(?:\s+\((.+)\))?$/)
    if (match) {
      const [, commit, path, branch] = match
      
      // 获取 submodule URL
      const urlResult = await execCommand('git', ['config', '--file', '.gitmodules', `submodule.${path}.url`], { cwd: rootPath })
      const url = urlResult.stdout.trim()
      
      // 获取 submodule 分支
      const branchResult = await execCommand('git', ['config', '--file', '.gitmodules', `submodule.${path}.branch`], { cwd: rootPath })
      const configBranch = branchResult.stdout.trim() || 'main'
      
      submodules.push({
        path,
        url,
        branch: branch || configBranch,
        commit
      })
    }
  }
  
  return submodules
}

/**
 * 日志输出函数
 */
export const logger = {
  info: (message: string) => console.log(chalk.blue('ℹ'), message),
  success: (message: string) => console.log(chalk.green('✓'), message),
  warning: (message: string) => console.log(chalk.yellow('⚠'), message),
  error: (message: string) => console.log(chalk.red('✗'), message),
  step: (message: string) => console.log(chalk.cyan('→'), message),
  title: (message: string) => console.log(chalk.bold.magenta(message))
}

/**
 * 确认用户操作
 */
export async function confirmAction(message: string): Promise<boolean> {
  const { default: inquirer } = await import('inquirer')
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
 * 获取用户输入
 */
export async function getUserInput(message: string, defaultValue?: string): Promise<string> {
  const { default: inquirer } = await import('inquirer')
  const { input } = await inquirer.prompt([
    {
      type: 'input',
      name: 'input',
      message,
      default: defaultValue
    }
  ])
  return input
}
