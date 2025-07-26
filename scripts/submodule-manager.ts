#!/usr/bin/env tsx

import { join, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { Command } from 'commander'
import {
  confirmAction,
  execCommand,
  getSubmodules,
  getUserInput,
  logger,
} from './utils/common.js'

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
async function addSubmodule(
  url: string,
  path: string,
  branch = 'main',
  dryRun = false
): Promise<void> {
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
    // 添加 submodule，增加重试机制
    logger.step('添加 submodule...')
    const addResult = await execCommand(
      'git',
      ['submodule', 'add', '-b', branch, url, path],
      {
        cwd: rootPath,
        dryRun,
      }
    )

    // 如果网络连接失败，尝试使用不同的协议或提供解决建议
    if (addResult.exitCode !== 0) {
      if (
        addResult.stderr.includes('Failed to connect') ||
        addResult.stderr.includes('unable to access')
      ) {
        logger.warning('网络连接失败，可能的解决方案：')
        logger.info('1. 检查网络连接是否正常')
        logger.info('2. 尝试使用 SSH 协议：git@github.com:用户名/仓库名.git')
        logger.info(
          '3. 配置代理：git config --global http.proxy http://proxy:port'
        )
        logger.info('4. 检查防火墙设置')

        // 如果是 HTTPS URL，建议尝试 SSH
        if (url.startsWith('https://github.com/')) {
          const sshUrl = `${url.replace('https://github.com/', 'git@github.com:').replace('.git', '')}.git`
          logger.info(`5. 尝试使用 SSH URL: ${sshUrl}`)
        }
      }
      logger.error(`添加 submodule 失败: ${addResult.stderr}`)
      process.exit(1)
    }

    // 初始化并更新 submodule
    logger.step('初始化 submodule...')
    await execCommand('git', ['submodule', 'update', '--init', path], {
      cwd: rootPath,
      dryRun,
    })

    // 切换到指定分支
    logger.step(`切换到分支 ${branch}...`)
    await execCommand('git', ['checkout', branch], {
      cwd: targetPath,
      dryRun,
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

  const shouldContinue = await confirmAction(
    `确定要删除 submodule ${path} 吗？此操作不可逆。`
  )
  if (!shouldContinue) {
    logger.info('操作已取消')
    return
  }

  try {
    // 反初始化 submodule
    logger.step('反初始化 submodule...')
    await execCommand('git', ['submodule', 'deinit', '-f', path], {
      cwd: rootPath,
      dryRun,
    })

    // 从 Git 中删除 submodule
    logger.step('从 Git 中删除...')
    await execCommand('git', ['rm', '-f', path], {
      cwd: rootPath,
      dryRun,
    })

    // 删除 .git/modules 中的目录（跨平台兼容）
    logger.step('清理 Git 模块...')
    const modulesPath = join(rootPath, '.git', 'modules', path)
    if (existsSync(modulesPath)) {
      if (process.platform === 'win32') {
        // Windows 系统使用 PowerShell 命令
        await execCommand(
          'powershell',
          ['-Command', `Remove-Item -Recurse -Force "${modulesPath}"`],
          {
            cwd: rootPath,
            dryRun,
          }
        )
      } else {
        // Unix/Linux 系统使用 rm 命令
        await execCommand('rm', ['-rf', modulesPath], {
          cwd: rootPath,
          dryRun,
        })
      }
      logger.info(`已清理 .git/modules/${path} 目录`)
    }

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
      cwd: submodulePath,
    })

    const hasChanges = statusResult.stdout.trim().length > 0
    const statusIcon = hasChanges ? '🔄' : '✅'

    // 获取最新提交信息
    const logResult = await execCommand(
      'git',
      ['log', '-1', '--pretty=format:%h %s'],
      {
        cwd: submodulePath,
      }
    )

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
  const newBranch = await getUserInput(
    '新的分支 (留空保持不变):',
    submodule.branch
  )

  if (newUrl !== submodule.url) {
    logger.step('更新 URL...')
    await execCommand(
      'git',
      ['config', '--file', '.gitmodules', `submodule.${path}.url`, newUrl],
      {
        cwd: rootPath,
      }
    )
    await execCommand('git', ['config', `submodule.${path}.url`, newUrl], {
      cwd: rootPath,
    })
  }

  if (newBranch !== submodule.branch) {
    logger.step('更新分支...')
    await execCommand(
      'git',
      [
        'config',
        '--file',
        '.gitmodules',
        `submodule.${path}.branch`,
        newBranch,
      ],
      {
        cwd: rootPath,
      }
    )
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
  .action(async path => {
    await modifySubmodule(path)
  })

program.parse()
