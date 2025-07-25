#!/usr/bin/env tsx

import { Command } from 'commander'
import { resolve } from 'path'
import { execCommand, getGitStatus, getSubmodules, logger, confirmAction } from './utils/common.js'

interface UpdateOptions {
  path?: string
  branch?: string
  all?: boolean
  dryRun?: boolean
  force?: boolean
}

/**
 * 更新单个项目到最新代码
 */
async function updateProject(projectPath: string, branch?: string, dryRun = false): Promise<boolean> {
  const gitStatus = await getGitStatus(projectPath)
  
  if (!gitStatus.isGitRepo) {
    logger.error(`${projectPath} 不是 Git 仓库`)
    return false
  }

  const targetBranch = branch || gitStatus.currentBranch
  if (!targetBranch) {
    logger.error(`无法确定目标分支`)
    return false
  }

  logger.info(`更新 ${gitStatus.isSubmodule ? 'Submodule' : 'Repository'}: ${projectPath}`)
  logger.info(`目标分支: ${targetBranch}`)

  try {
    // 检查是否有未提交的更改
    if (gitStatus.hasUncommittedChanges) {
      logger.warning('检测到未提交的更改')
      
      // 保存本地更改
      logger.step('保存本地更改...')
      const stashResult = await execCommand('git', ['stash', 'push', '-m', 'auto-stash-before-update'], {
        cwd: projectPath,
        dryRun
      })
      
      if (stashResult.exitCode !== 0) {
        logger.error('保存本地更改失败')
        return false
      }
    }

    // 切换到目标分支（如果需要）
    if (gitStatus.currentBranch !== targetBranch) {
      logger.step(`切换到分支 ${targetBranch}...`)
      const checkoutResult = await execCommand('git', ['checkout', targetBranch], {
        cwd: projectPath,
        dryRun
      })
      
      if (checkoutResult.exitCode !== 0) {
        logger.error(`切换分支失败: ${checkoutResult.stderr}`)
        return false
      }
    }

    // 拉取最新代码
    logger.step('拉取最新代码...')
    const pullResult = await execCommand('git', ['pull', 'origin', targetBranch], {
      cwd: projectPath,
      dryRun
    })

    if (pullResult.exitCode !== 0) {
      logger.error(`拉取代码失败: ${pullResult.stderr}`)
      return false
    }

    // 恢复本地更改（如果有）
    if (gitStatus.hasUncommittedChanges) {
      logger.step('恢复本地更改...')
      const popResult = await execCommand('git', ['stash', 'pop'], {
        cwd: projectPath,
        dryRun
      })

      if (popResult.exitCode !== 0) {
        logger.warning('恢复本地更改时发生冲突，请手动处理')
        logger.info('使用 git stash list 查看保存的更改')
      }
    }

    logger.success(`✓ ${projectPath} 更新完成`)
    return true

  } catch (error) {
    logger.error(`更新 ${projectPath} 时发生错误: ${error}`)
    return false
  }
}

/**
 * 更新所有 submodule
 */
async function updateAllSubmodules(rootPath: string, dryRun = false): Promise<void> {
  logger.title('📦 更新所有 Submodule')
  
  const submodules = await getSubmodules(rootPath)
  
  if (submodules.length === 0) {
    logger.info('没有找到 submodule')
    return
  }

  logger.info(`找到 ${submodules.length} 个 submodule`)
  
  let successCount = 0
  let failCount = 0

  for (const submodule of submodules) {
    const submodulePath = resolve(rootPath, submodule.path)
    logger.step(`处理 submodule: ${submodule.path}`)
    
    const success = await updateProject(submodulePath, submodule.branch, dryRun)
    if (success) {
      successCount++
    } else {
      failCount++
    }
    
    console.log() // 添加空行分隔
  }

  logger.info(`更新完成: ${successCount} 成功, ${failCount} 失败`)
}

/**
 * 主更新函数
 */
async function updateCode(options: UpdateOptions): Promise<void> {
  const { path, branch, all, dryRun = false, force = false } = options
  const rootPath = resolve(process.cwd())

  if (dryRun) {
    logger.warning('🔍 预览模式 - 不会执行实际操作')
  }

  if (all) {
    // 更新 root 项目
    logger.title('🔄 更新 Root 项目')
    await updateProject(rootPath, branch, dryRun)
    console.log()
    
    // 更新所有 submodule
    await updateAllSubmodules(rootPath, dryRun)
  } else if (path) {
    // 更新指定路径
    const targetPath = resolve(path)
    logger.title('🔄 更新指定项目')
    await updateProject(targetPath, branch, dryRun)
  } else {
    // 更新当前目录
    const currentPath = resolve(process.cwd())
    logger.title('🔄 更新当前项目')
    await updateProject(currentPath, branch, dryRun)
  }
}

// 命令行接口
const program = new Command()

program
  .name('git-update')
  .description('更新项目到最新代码')
  .version('1.0.0')

program
  .argument('[path]', '目标路径 (默认为当前目录)')
  .option('-b, --branch <branch>', '目标分支')
  .option('-a, --all', '更新所有项目 (root + submodules)')
  .option('-d, --dry-run', '预览模式，不执行实际操作')
  .option('-f, --force', '强制更新，跳过确认')
  .action(async (path, options) => {
    if (!options.force && !options.dryRun) {
      const shouldContinue = await confirmAction('确定要更新项目吗？这可能会覆盖本地更改。')
      if (!shouldContinue) {
        logger.info('操作已取消')
        return
      }
    }
    
    await updateCode({ path, ...options })
  })

program.parse()
