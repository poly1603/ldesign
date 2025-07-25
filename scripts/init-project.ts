#!/usr/bin/env tsx

import { Command } from 'commander'
import { resolve } from 'path'
import { execCommand, getSubmodules, logger, confirmAction } from './utils/common.js'

interface InitOptions {
  skipDeps?: boolean
  skipSubmodules?: boolean
  dryRun?: boolean
  force?: boolean
}

/**
 * 初始化 submodule
 */
async function initializeSubmodules(rootPath: string, dryRun = false): Promise<boolean> {
  logger.step('初始化所有 submodule...')
  
  // 初始化并更新所有 submodule
  const initResult = await execCommand('git', ['submodule', 'update', '--init', '--recursive'], {
    cwd: rootPath,
    dryRun
  })

  if (initResult.exitCode !== 0) {
    logger.error('初始化 submodule 失败:')
    console.log(initResult.stderr)
    return false
  }

  // 获取所有 submodule 信息
  const submodules = await getSubmodules(rootPath)
  
  if (submodules.length === 0) {
    logger.info('没有找到 submodule')
    return true
  }

  logger.info(`找到 ${submodules.length} 个 submodule`)

  // 为每个 submodule 切换到正确的分支
  for (const submodule of submodules) {
    const submodulePath = resolve(rootPath, submodule.path)
    logger.step(`设置 ${submodule.path} 分支为 ${submodule.branch}...`)

    // 检查远程分支是否存在
    const remoteResult = await execCommand('git', ['ls-remote', '--heads', 'origin', submodule.branch], {
      cwd: submodulePath,
      dryRun
    })

    if (remoteResult.exitCode !== 0 || !remoteResult.stdout.trim()) {
      logger.warning(`远程分支 ${submodule.branch} 不存在，使用默认分支`)
      continue
    }

    // 切换到指定分支
    const checkoutResult = await execCommand('git', ['checkout', '-B', submodule.branch, `origin/${submodule.branch}`], {
      cwd: submodulePath,
      dryRun
    })

    if (checkoutResult.exitCode !== 0) {
      logger.warning(`切换 ${submodule.path} 到分支 ${submodule.branch} 失败`)
      continue
    }

    // 拉取最新代码
    const pullResult = await execCommand('git', ['pull', 'origin', submodule.branch], {
      cwd: submodulePath,
      dryRun
    })

    if (pullResult.exitCode === 0) {
      logger.success(`✓ ${submodule.path} 初始化完成`)
    } else {
      logger.warning(`拉取 ${submodule.path} 最新代码失败`)
    }
  }

  return true
}

/**
 * 安装项目依赖
 */
async function installDependencies(rootPath: string, dryRun = false): Promise<boolean> {
  logger.step('安装项目依赖...')

  const installResult = await execCommand('pnpm', ['install'], {
    cwd: rootPath,
    stdio: 'inherit',
    dryRun
  })

  if (installResult.exitCode !== 0) {
    logger.error('安装依赖失败')
    return false
  }

  logger.success('✓ 依赖安装完成')
  return true
}

/**
 * 运行初始化检查
 */
async function runInitialChecks(rootPath: string, dryRun = false): Promise<void> {
  logger.step('运行初始化检查...')

  // 检查 TypeScript 配置
  const typecheckResult = await execCommand('pnpm', ['typecheck'], {
    cwd: rootPath,
    dryRun
  })

  if (typecheckResult.exitCode === 0) {
    logger.success('✓ TypeScript 检查通过')
  } else {
    logger.warning('⚠ TypeScript 检查有警告')
  }

  // 检查代码格式
  const lintResult = await execCommand('pnpm', ['lint'], {
    cwd: rootPath,
    dryRun
  })

  if (lintResult.exitCode === 0) {
    logger.success('✓ 代码检查通过')
  } else {
    logger.warning('⚠ 代码检查有警告')
  }
}

/**
 * 显示项目信息
 */
async function showProjectInfo(rootPath: string): Promise<void> {
  logger.title('📊 项目信息')

  // 显示 Git 信息
  const branchResult = await execCommand('git', ['branch', '--show-current'], { cwd: rootPath })
  const currentBranch = branchResult.stdout.trim()
  
  const remoteResult = await execCommand('git', ['remote', 'get-url', 'origin'], { cwd: rootPath })
  const remoteUrl = remoteResult.stdout.trim()

  logger.info(`Git 仓库: ${remoteUrl}`)
  logger.info(`当前分支: ${currentBranch}`)

  // 显示 submodule 信息
  const submodules = await getSubmodules(rootPath)
  logger.info(`Submodule 数量: ${submodules.length}`)

  // 显示 Node.js 和 pnpm 版本
  const nodeResult = await execCommand('node', ['--version'])
  const pnpmResult = await execCommand('pnpm', ['--version'])
  
  logger.info(`Node.js 版本: ${nodeResult.stdout.trim()}`)
  logger.info(`pnpm 版本: ${pnpmResult.stdout.trim()}`)

  console.log()
  logger.success('🎉 项目初始化完成！')
  console.log()
  logger.info('可用命令:')
  console.log('  pnpm dev          - 启动开发服务器')
  console.log('  pnpm build        - 构建项目')
  console.log('  pnpm test         - 运行测试')
  console.log('  pnpm docs:dev     - 启动文档服务器')
  console.log('  pnpm script:commit - 提交代码')
  console.log('  pnpm script:update - 更新代码')
}

/**
 * 主初始化函数
 */
async function initializeProject(options: InitOptions): Promise<void> {
  const { skipDeps = false, skipSubmodules = false, dryRun = false, force = false } = options
  const rootPath = resolve(process.cwd())

  logger.title('🚀 LDesign 项目初始化')

  if (dryRun) {
    logger.warning('🔍 预览模式 - 不会执行实际操作')
  }

  if (!force) {
    const shouldContinue = await confirmAction('确定要初始化项目吗？这将会更新所有 submodule 并安装依赖。')
    if (!shouldContinue) {
      logger.info('操作已取消')
      return
    }
  }

  try {
    let success = true

    // 初始化 submodule
    if (!skipSubmodules) {
      logger.title('📦 初始化 Submodule')
      success = await initializeSubmodules(rootPath, dryRun) && success
      console.log()
    }

    // 安装依赖
    if (!skipDeps) {
      logger.title('📥 安装依赖')
      success = await installDependencies(rootPath, dryRun) && success
      console.log()
    }

    // 运行检查
    if (!dryRun) {
      logger.title('🔍 运行检查')
      await runInitialChecks(rootPath, dryRun)
      console.log()
    }

    // 显示项目信息
    if (!dryRun) {
      await showProjectInfo(rootPath)
    }

    if (!success) {
      logger.warning('初始化过程中遇到一些问题，请检查上面的错误信息')
      process.exit(1)
    }

  } catch (error) {
    logger.error('初始化过程中发生错误:')
    console.error(error)
    process.exit(1)
  }
}

// 命令行接口
const program = new Command()

program
  .name('init-project')
  .description('初始化 LDesign 项目')
  .version('1.0.0')

program
  .option('--skip-deps', '跳过依赖安装')
  .option('--skip-submodules', '跳过 submodule 初始化')
  .option('-d, --dry-run', '预览模式，不执行实际操作')
  .option('-f, --force', '强制执行，跳过确认')
  .action(async (options) => {
    await initializeProject(options)
  })

program.parse()
