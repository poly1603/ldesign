#!/usr/bin/env tsx

import { resolve } from 'node:path'
import { Command } from 'commander'
import {
  confirmAction,
  execCommand,
  getGitStatus,
  getUserInput,
  logger,
} from './utils/common.js'

interface CommitOptions {
  path?: string
  message?: string
  dryRun?: boolean
  force?: boolean
}

/**
 * 智能提交代码到 GitHub
 */
async function commitCode(options: CommitOptions): Promise<void> {
  const targetPath = resolve(options.path || process.cwd())
  const { dryRun = false, force = false } = options

  logger.title('🚀 Git 智能提交工具')
  logger.info(`目标路径: ${targetPath}`)

  // 检查 Git 状态
  const gitStatus = await getGitStatus(targetPath)

  if (!gitStatus.isGitRepo) {
    logger.error('当前目录不是 Git 仓库')
    process.exit(1)
  }

  logger.info(
    `仓库类型: ${gitStatus.isSubmodule ? 'Submodule' : 'Root Repository'}`
  )
  logger.info(`当前分支: ${gitStatus.currentBranch}`)

  if (!gitStatus.currentBranch) {
    logger.error('无法获取当前分支信息')
    process.exit(1)
  }

  // 检查是否有未提交的更改
  if (!gitStatus.hasUncommittedChanges && !force) {
    logger.warning('没有检测到未提交的更改')
    const shouldContinue = await confirmAction('是否继续执行提交流程？')
    if (!shouldContinue) {
      logger.info('操作已取消')
      return
    }
  }

  try {
    // 步骤 1: 保存本地更改
    logger.step('1. 保存本地未提交的更改...')
    const stashResult = await execCommand(
      'git',
      ['stash', 'push', '-m', 'auto-stash-before-commit'],
      {
        cwd: targetPath,
        dryRun,
      }
    )

    const hasStash =
      stashResult.exitCode === 0 &&
      !stashResult.stdout.includes('No local changes to save')

    // 步骤 2: 拉取最新代码
    logger.step('2. 拉取最新代码...')
    const pullResult = await execCommand(
      'git',
      ['pull', 'origin', gitStatus.currentBranch],
      {
        cwd: targetPath,
        dryRun,
      }
    )

    if (pullResult.exitCode !== 0) {
      logger.error('拉取代码失败:')
      console.log(pullResult.stderr)

      if (hasStash) {
        logger.step('恢复本地更改...')
        await execCommand('git', ['stash', 'pop'], { cwd: targetPath, dryRun })
      }
      process.exit(1)
    }

    // 步骤 3: 恢复本地更改
    if (hasStash) {
      logger.step('3. 恢复本地更改...')
      const popResult = await execCommand('git', ['stash', 'pop'], {
        cwd: targetPath,
        dryRun,
      })

      if (popResult.exitCode !== 0) {
        logger.error('恢复本地更改时发生冲突:')
        console.log(popResult.stderr)
        logger.warning('请手动解决冲突后重新运行脚本')
        process.exit(1)
      }
    }

    // 步骤 4: 清理 stash
    logger.step('4. 清理 stash...')
    await execCommand('git', ['stash', 'clear'], {
      cwd: targetPath,
      dryRun,
    })

    // 步骤 5: 获取提交信息
    let commitMessage = options.message
    if (!commitMessage) {
      commitMessage = await getUserInput('请输入提交信息:', 'feat: update code')
    }

    if (!commitMessage.trim()) {
      logger.error('提交信息不能为空')
      process.exit(1)
    }

    // 步骤 6: 添加文件
    logger.step('5. 添加文件到暂存区...')
    const addResult = await execCommand('git', ['add', '.'], {
      cwd: targetPath,
      dryRun,
    })

    if (addResult.exitCode !== 0) {
      logger.error('添加文件失败:')
      console.log(addResult.stderr)
      process.exit(1)
    }

    // 检查是否有文件被添加
    const statusResult = await execCommand(
      'git',
      ['status', '--porcelain', '--cached'],
      {
        cwd: targetPath,
      }
    )

    if (!statusResult.stdout.trim() && !force) {
      logger.warning('没有文件需要提交')
      return
    }

    // 步骤 7: 提交代码
    logger.step('6. 提交代码...')
    const commitResult = await execCommand(
      'git',
      ['commit', '-m', commitMessage],
      {
        cwd: targetPath,
        dryRun,
      }
    )

    if (commitResult.exitCode !== 0) {
      logger.error('提交失败:')
      console.log(commitResult.stderr)
      process.exit(1)
    }

    // 步骤 8: 推送代码
    logger.step('7. 推送代码到远程仓库...')
    const pushResult = await execCommand(
      'git',
      ['push', 'origin', gitStatus.currentBranch],
      {
        cwd: targetPath,
        dryRun,
      }
    )

    if (pushResult.exitCode !== 0) {
      logger.error('推送失败:')
      console.log(pushResult.stderr)
      process.exit(1)
    }

    logger.success('✨ 代码提交成功!')
    logger.info(`提交信息: ${commitMessage}`)
    logger.info(`分支: ${gitStatus.currentBranch}`)
  } catch (error) {
    logger.error('提交过程中发生错误:')
    console.error(error)
    process.exit(1)
  }
}

// 命令行接口
const program = new Command()

program.name('git-commit').description('智能提交代码到 GitHub').version('1.0.0')

program
  .argument('[path]', '目标路径 (默认为当前目录)')
  .option('-m, --message <message>', '提交信息')
  .option('-d, --dry-run', '预览模式，不执行实际操作')
  .option('-f, --force', '强制执行，即使没有更改')
  .action(async (path, options) => {
    await commitCode({ path, ...options })
  })

program.parse()
