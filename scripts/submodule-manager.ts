#!/usr/bin/env tsx

import { Command } from 'commander'
import { resolve, join } from 'path'
import { existsSync } from 'fs'
import { execCommand, getSubmodules, logger, confirmAction, getUserInput } from './utils/common.js'

interface SubmoduleInfo {
  path: string
  url: string
  branch: string
  commit: string
  status?: string
}

/**
 * 添加新的 submodule
 */
async function addSubmodule(url: string, path: string, branch = 'main', dryRun = false): Promise<void> {
  logger.title('➕ 添加 Submodule')
  logger.info(`URL: ${url}`)
  logger.info(`路径: ${path}`)
  logger.info(`分支: ${branch}`)

  const rootPath = resolve(process.cwd())
  const targetPath = resolve(rootPath, path)

  // 检查路径是否已存在
  if (existsSync(targetPath)) {
    logger.error(`路径 ${path} 已存在`)
    process.exit(1)
  }

  try {
    // 添加 submodule
    logger.step('添加 submodule...')
    const addResult = await execCommand('git', ['submodule', 'add', '-b', branch, url, path], {
      cwd: rootPath,
      dryRun
    })

    if (addResult.exitCode !== 0) {
      logger.error(`添加 submodule 失败: ${addResult.stderr}`)
      process.exit(1)
    }

    // 初始化并更新 submodule
    logger.step('初始化 submodule...')
    await execCommand('git', ['submodule', 'update', '--init', path], {
      cwd: rootPath,
      dryRun
    })

    // 切换到指定分支
    logger.step(`切换到分支 ${branch}...`)
    await execCommand('git', ['checkout', branch], {
      cwd: targetPath,
      dryRun
    })

    logger.success(`✓ Submodule ${path} 添加成功`)

  } catch (error) {
    logger.error(`添加 submodule 时发生错误: ${error}`)
    process.exit(1)
  }
}

/**
 * 删除 submodule
 */
async function removeSubmodule(path: string, dryRun = false): Promise<void> {
  logger.title('🗑️ 删除 Submodule')
  logger.info(`路径: ${path}`)

  const rootPath = resolve(process.cwd())
  const targetPath = resolve(rootPath, path)

  // 检查 submodule 是否存在
  const submodules = await getSubmodules(rootPath)
  const submodule = submodules.find(sm => sm.path === path)

  if (!submodule) {
    logger.error(`Submodule ${path} 不存在`)
    process.exit(1)
  }

  const shouldContinue = await confirmAction(`确定要删除 submodule ${path} 吗？此操作不可逆。`)
  if (!shouldContinue) {
    logger.info('操作已取消')
    return
  }

  try {
    // 反初始化 submodule
    logger.step('反初始化 submodule...')
    await execCommand('git', ['submodule', 'deinit', '-f', path], {
      cwd: rootPath,
      dryRun
    })

    // 从 Git 中删除 submodule
    logger.step('从 Git 中删除...')
    await execCommand('git', ['rm', '-f', path], {
      cwd: rootPath,
      dryRun
    })

    // 删除 .git/modules 中的目录
    logger.step('清理 Git 模块...')
    await execCommand('rm', ['-rf', join('.git', 'modules', path)], {
      cwd: rootPath,
      dryRun
    })

    logger.success(`✓ Submodule ${path} 删除成功`)

  } catch (error) {
    logger.error(`删除 submodule 时发生错误: ${error}`)
    process.exit(1)
  }
}

/**
 * 列出所有 submodule
 */
async function listSubmodules(): Promise<void> {
  logger.title('📋 Submodule 列表')

  const rootPath = resolve(process.cwd())
  const submodules = await getSubmodules(rootPath)

  if (submodules.length === 0) {
    logger.info('没有找到 submodule')
    return
  }

  console.log()
  for (const submodule of submodules) {
    const submodulePath = resolve(rootPath, submodule.path)
    
    // 获取 submodule 状态
    const statusResult = await execCommand('git', ['status', '--porcelain'], {
      cwd: submodulePath
    })
    
    const hasChanges = statusResult.stdout.trim().length > 0
    const statusIcon = hasChanges ? '🔄' : '✅'
    
    // 获取最新提交信息
    const logResult = await execCommand('git', ['log', '-1', '--pretty=format:%h %s'], {
      cwd: submodulePath
    })
    
    const lastCommit = logResult.stdout.trim() || 'No commits'
    
    console.log(`${statusIcon} ${submodule.path}`)
    console.log(`   URL: ${submodule.url}`)
    console.log(`   分支: ${submodule.branch}`)
    console.log(`   提交: ${lastCommit}`)
    console.log(`   状态: ${hasChanges ? '有未提交更改' : '干净'}`)
    console.log()
  }
}

/**
 * 修改 submodule 配置
 */
async function modifySubmodule(path: string): Promise<void> {
  logger.title('✏️ 修改 Submodule')

  const rootPath = resolve(process.cwd())
  const submodules = await getSubmodules(rootPath)
  const submodule = submodules.find(sm => sm.path === path)

  if (!submodule) {
    logger.error(`Submodule ${path} 不存在`)
    process.exit(1)
  }

  logger.info(`当前配置:`)
  logger.info(`  路径: ${submodule.path}`)
  logger.info(`  URL: ${submodule.url}`)
  logger.info(`  分支: ${submodule.branch}`)

  const newUrl = await getUserInput('新的 URL (留空保持不变):', submodule.url)
  const newBranch = await getUserInput('新的分支 (留空保持不变):', submodule.branch)

  if (newUrl !== submodule.url) {
    logger.step('更新 URL...')
    await execCommand('git', ['config', '--file', '.gitmodules', `submodule.${path}.url`, newUrl], {
      cwd: rootPath
    })
    await execCommand('git', ['config', `submodule.${path}.url`, newUrl], {
      cwd: rootPath
    })
  }

  if (newBranch !== submodule.branch) {
    logger.step('更新分支...')
    await execCommand('git', ['config', '--file', '.gitmodules', `submodule.${path}.branch`, newBranch], {
      cwd: rootPath
    })
  }

  logger.success('✓ Submodule 配置更新成功')
}

// 命令行接口
const program = new Command()

program
  .name('submodule-manager')
  .description('Submodule 管理工具')
  .version('1.0.0')

// 添加 submodule
program
  .command('add <url> <path> [branch]')
  .description('添加新的 submodule')
  .option('-d, --dry-run', '预览模式')
  .action(async (url, path, branch = 'main', options) => {
    await addSubmodule(url, path, branch, options.dryRun)
  })

// 删除 submodule
program
  .command('remove <path>')
  .description('删除 submodule')
  .option('-d, --dry-run', '预览模式')
  .action(async (path, options) => {
    await removeSubmodule(path, options.dryRun)
  })

// 列出 submodule
program
  .command('list')
  .description('列出所有 submodule')
  .action(async () => {
    await listSubmodules()
  })

// 修改 submodule
program
  .command('modify <path>')
  .description('修改 submodule 配置')
  .action(async (path) => {
    await modifySubmodule(path)
  })

program.parse()
