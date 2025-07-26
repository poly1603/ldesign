#!/usr/bin/env tsx

import chalk from 'chalk'
import { execCommand, logger } from './utils/common.js'

interface MenuOption {
  name: string
  value: string
  description: string
  action?: () => Promise<void>
}

/**
 * 执行命令并显示结果
 */
async function runCommand(
  command: string,
  args: string[] = [],
  description?: string
): Promise<void> {
  if (description) {
    logger.step(description)
  }

  const result = await execCommand(command, args, { stdio: 'inherit' })

  if (result.exitCode === 0) {
    logger.success('操作完成')
  } else {
    logger.error('操作失败')
  }

  await waitForUser()
}

/**
 * 等待用户按键继续
 */
async function waitForUser(): Promise<void> {
  const { default: inquirer } = await import('inquirer')
  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: '按 Enter 键继续...',
    },
  ])
}

/**
 * 获取用户输入
 */
async function getUserInput(
  message: string,
  defaultValue?: string
): Promise<string> {
  const { default: inquirer } = await import('inquirer')
  const { input } = await inquirer.prompt([
    {
      type: 'input',
      name: 'input',
      message,
      default: defaultValue,
    },
  ])
  return input
}

/**
 * 确认操作
 */
async function confirm(message: string): Promise<boolean> {
  const { default: inquirer } = await import('inquirer')
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: false,
    },
  ])
  return confirmed
}

/**
 * 开发相关操作
 */
const DEV_ACTIONS: Record<string, () => Promise<void>> = {
  'dev-start': () => runCommand('pnpm', ['dev'], '🚀 启动开发服务器...'),
  build: () => runCommand('pnpm', ['build'], '🏗️ 构建项目...'),
  clean: () => runCommand('pnpm', ['clean'], '🧹 清理项目...'),
  reset: () => runCommand('pnpm', ['reset'], '🔄 重置项目...'),
  install: () => runCommand('pnpm', ['install'], '📦 安装依赖...'),
  typecheck: () => runCommand('pnpm', ['typecheck'], '🔍 类型检查...'),
  format: () => runCommand('pnpm', ['format'], '🎨 格式化代码...'),
  lint: () => runCommand('pnpm', ['lint'], '🔧 代码检查...'),
}

/**
 * Git 相关操作
 */
const GIT_ACTIONS: Record<string, () => Promise<void>> = {
  commit: async () => {
    const message = await getUserInput('请输入提交信息 (可选):')
    const commitArgs = message ? ['-m', message] : []
    await runCommand(
      'pnpm',
      ['script:commit', ...commitArgs],
      '📝 智能提交代码...'
    )
  },
  'update-current': () =>
    runCommand('pnpm', ['script:update'], '🔄 更新当前项目...'),
  'update-all': () =>
    runCommand('pnpm', ['script:update', '--all'], '🔄 更新所有项目...'),
  status: async () => {
    await runCommand('git', ['status'], '📊 查看 Git 状态...')
    await runCommand(
      'git',
      ['submodule', 'status'],
      '📦 查看 Submodule 状态...'
    )
  },
  log: () =>
    runCommand('git', ['log', '--oneline', '-10'], '📋 查看最近 10 次提交...'),
  checkout: async () => {
    const branch = await getUserInput('请输入要切换的分支名:')
    if (branch) {
      await runCommand(
        'git',
        ['checkout', branch],
        `🌿 切换到分支 ${branch}...`
      )
    }
  },
}

/**
 * Submodule 相关操作
 */
const SUBMODULE_ACTIONS: Record<string, () => Promise<void>> = {
  list: () =>
    runCommand(
      'pnpm',
      ['script:submodule', 'list'],
      '📋 列出所有 Submodule...'
    ),
  add: async () => {
    const url = await getUserInput('请输入 Submodule URL:')
    const path = await getUserInput('请输入 Submodule 路径:')
    const branch = await getUserInput('请输入分支名 (默认 main):', 'main')
    if (url && path) {
      await runCommand(
        'pnpm',
        ['script:submodule', 'add', url, path, branch],
        '➕ 添加 Submodule...'
      )
    }
  },
  remove: async () => {
    const removePath = await getUserInput('请输入要删除的 Submodule 路径:')
    if (removePath) {
      await runCommand(
        'pnpm',
        ['script:submodule', 'remove', removePath],
        '🗑️ 删除 Submodule...'
      )
    }
  },
  'update-all': () =>
    runCommand('pnpm', ['script:update', '--all'], '🔄 更新所有 Submodule...'),
  reinit: async () => {
    const shouldReinit = await confirm(
      '确定要重新初始化所有 Submodule 吗？这将重置所有本地更改。'
    )
    if (shouldReinit) {
      await runCommand(
        'git',
        ['submodule', 'deinit', '--all'],
        '🔧 反初始化 Submodule...'
      )
      await runCommand(
        'git',
        ['submodule', 'update', '--init', '--recursive'],
        '🔧 重新初始化 Submodule...'
      )
    }
  },
}

/**
 * 部署相关操作
 */
const DEPLOY_ACTIONS: Record<string, () => Promise<void>> = {
  'github-pages': async () => {
    await runCommand('pnpm', ['docs:build'], '🏗️ 构建文档...')
    await runCommand(
      'git',
      ['add', 'docs/.vitepress/dist'],
      '📄 添加构建文件...'
    )
    await runCommand(
      'git',
      ['commit', '-m', 'docs: deploy to github pages'],
      '📄 提交构建文件...'
    )
    await runCommand('git', ['push'], '📄 推送到远程仓库...')
  },
  'vercel-deploy': () =>
    runCommand('npx', ['vercel', '--prod'], '⚡ 部署到 Vercel 生产环境...'),
  'vercel-link': () =>
    runCommand('npx', ['vercel', 'link'], '🔗 连接 Vercel 项目...'),
  'vercel-status': () =>
    runCommand('npx', ['vercel', 'ls'], '📊 查看 Vercel 部署状态...'),
  'preview-deploy': () => runCommand('npx', ['vercel'], '🌐 创建预览部署...'),
  'production-deploy': async () => {
    const shouldDeploy = await confirm('确定要部署到生产环境吗？')
    if (shouldDeploy) {
      await runCommand('npx', ['vercel', '--prod'], '🏷️ 部署到生产环境...')
    }
  },
}

/**
 * 项目管理操作
 */
const PROJECT_ACTIONS: Record<string, () => Promise<void>> = {
  init: () => runCommand('pnpm', ['script:init'], '🚀 初始化项目...'),
  'quick-init': () =>
    runCommand('pnpm', ['script:init', '--skip-deps'], '🔧 快速初始化...'),
  info: async () => {
    logger.step('📊 显示项目信息...')
    await runCommand('git', ['remote', '-v'], '远程仓库信息:')
    await runCommand('git', ['branch', '-a'], '分支信息:')
    await runCommand('pnpm', ['list', '--depth=0'], '依赖信息:')
    await runCommand('node', ['--version'], 'Node.js 版本:')
    await runCommand('pnpm', ['--version'], 'pnpm 版本:')
  },
  'health-check': async () => {
    logger.step('🔍 项目健康检查...')
    await runCommand('pnpm', ['typecheck'], '类型检查...')
    await runCommand('pnpm', ['lint'], '代码检查...')
    await runCommand('pnpm', ['test', '--run'], '测试检查...')
  },
  'deep-clean': async () => {
    const shouldClean = await confirm(
      '确定要执行深度清理吗？这将删除所有缓存和临时文件。'
    )
    if (shouldClean) {
      await runCommand('pnpm', ['clean'], '🧹 清理构建产物...')
      await runCommand('rm', ['-rf', 'node_modules/.cache'], '🧹 清理缓存...')
      await runCommand(
        'rm',
        ['-rf', '.vitepress/cache'],
        '🧹 清理 VitePress 缓存...'
      )
    }
  },
  'update-deps': async () => {
    const shouldUpdate = await confirm(
      '确定要更新所有依赖吗？这可能会引入破坏性更改。'
    )
    if (shouldUpdate) {
      await runCommand('pnpm', ['update', '--latest'], '📦 更新依赖...')
    }
  },
}

/**
 * 文档相关操作
 */
const DOCS_ACTIONS: Record<string, () => Promise<void>> = {
  'docs-dev': () => runCommand('pnpm', ['docs:dev'], '🚀 启动文档服务器...'),
  'docs-build': () => runCommand('pnpm', ['docs:build'], '🏗️ 构建文档...'),
  'docs-preview': () => runCommand('pnpm', ['docs:preview'], '👀 预览文档...'),
  'api-docs': async () => {
    logger.info('📝 API 文档生成功能开发中...')
    await waitForUser()
  },
  'check-links': async () => {
    logger.info('🔍 链接检查功能开发中...')
    await waitForUser()
  },
}

/**
 * 测试相关操作
 */
const TEST_ACTIONS: Record<string, () => Promise<void>> = {
  'test-unit': () => runCommand('pnpm', ['test'], '🧪 运行单元测试...'),
  'test-e2e': () => runCommand('pnpm', ['test:e2e'], '🎭 运行 E2E 测试...'),
  'test-coverage': () =>
    runCommand('pnpm', ['test:coverage'], '📊 生成覆盖率报告...'),
  'test-ui': () => runCommand('pnpm', ['test:ui'], '👀 启动测试 UI...'),
  'test-benchmark': async () => {
    logger.info('⚡ 性能基准测试功能开发中...')
    await waitForUser()
  },
  'test-watch': () =>
    runCommand('pnpm', ['test', '--watch'], '🔄 监听模式测试...'),
}

/**
 * 主菜单选项
 */
const MAIN_MENU: MenuOption[] = [
  {
    name: '🚀 开发相关',
    value: 'dev',
    description: '启动开发服务器、构建、测试等',
  },
  {
    name: '📝 Git 管理',
    value: 'git',
    description: '提交代码、更新项目、管理分支',
  },
  {
    name: '📦 Submodule 管理',
    value: 'submodule',
    description: '添加、删除、更新 submodule',
  },
  {
    name: '🌐 部署相关',
    value: 'deploy',
    description: 'GitHub Pages、Vercel 部署',
  },
  {
    name: '🔧 项目管理',
    value: 'project',
    description: '初始化、清理、重置项目',
  },
  { name: '📚 文档相关', value: 'docs', description: '文档开发、构建、预览' },
  {
    name: '🧪 测试相关',
    value: 'test',
    description: '单元测试、E2E 测试、覆盖率',
  },
  { name: '❓ 帮助信息', value: 'help', description: '查看帮助和使用说明' },
  { name: '🚪 退出', value: 'exit', description: '退出脚本' },
]

/**
 * 开发相关菜单
 */
const DEV_MENU: MenuOption[] = [
  {
    name: '🚀 启动开发服务器',
    value: 'dev-start',
    description: 'pnpm dev',
    action: DEV_ACTIONS['dev-start'],
  },
  {
    name: '🏗️ 构建项目',
    value: 'build',
    description: 'pnpm build',
    action: DEV_ACTIONS.build,
  },
  {
    name: '🧹 清理项目',
    value: 'clean',
    description: '清理构建产物和依赖',
    action: DEV_ACTIONS.clean,
  },
  {
    name: '🔄 重置项目',
    value: 'reset',
    description: '清理并重新安装依赖',
    action: DEV_ACTIONS.reset,
  },
  {
    name: '📦 安装依赖',
    value: 'install',
    description: 'pnpm install',
    action: DEV_ACTIONS.install,
  },
  {
    name: '🔍 类型检查',
    value: 'typecheck',
    description: 'pnpm typecheck',
    action: DEV_ACTIONS.typecheck,
  },
  {
    name: '🎨 代码格式化',
    value: 'format',
    description: 'pnpm format',
    action: DEV_ACTIONS.format,
  },
  {
    name: '🔧 代码检查',
    value: 'lint',
    description: 'pnpm lint',
    action: DEV_ACTIONS.lint,
  },
  { name: '⬅️ 返回主菜单', value: 'back', description: '' },
]

/**
 * Git 管理菜单
 */
const GIT_MENU: MenuOption[] = [
  {
    name: '📝 智能提交代码',
    value: 'commit',
    description: '自动 stash、pull、commit、push',
    action: GIT_ACTIONS.commit,
  },
  {
    name: '🔄 更新当前项目',
    value: 'update-current',
    description: '更新当前目录到最新代码',
    action: GIT_ACTIONS['update-current'],
  },
  {
    name: '🔄 更新所有项目',
    value: 'update-all',
    description: '更新 root + 所有 submodule',
    action: GIT_ACTIONS['update-all'],
  },
  {
    name: '🌿 查看分支状态',
    value: 'status',
    description: '查看 Git 状态和分支信息',
    action: GIT_ACTIONS.status,
  },
  {
    name: '📊 查看提交历史',
    value: 'log',
    description: '查看最近的提交记录',
    action: GIT_ACTIONS.log,
  },
  {
    name: '🔀 切换分支',
    value: 'checkout',
    description: '切换到其他分支',
    action: GIT_ACTIONS.checkout,
  },
  { name: '⬅️ 返回主菜单', value: 'back', description: '' },
]

/**
 * Submodule 管理菜单
 */
const SUBMODULE_MENU: MenuOption[] = [
  {
    name: '📋 列出所有 Submodule',
    value: 'list',
    description: '显示所有 submodule 状态',
    action: SUBMODULE_ACTIONS.list,
  },
  {
    name: '➕ 添加新 Submodule',
    value: 'add',
    description: '添加新的 submodule',
    action: SUBMODULE_ACTIONS.add,
  },
  {
    name: '🗑️ 删除 Submodule',
    value: 'remove',
    description: '删除指定的 submodule',
    action: SUBMODULE_ACTIONS.remove,
  },
  {
    name: '🔄 更新所有 Submodule',
    value: 'update-all',
    description: '更新所有 submodule',
    action: SUBMODULE_ACTIONS['update-all'],
  },
  {
    name: '🔧 重新初始化 Submodule',
    value: 'reinit',
    description: '重新初始化所有 submodule',
    action: SUBMODULE_ACTIONS.reinit,
  },
  { name: '⬅️ 返回主菜单', value: 'back', description: '' },
]

/**
 * 部署相关菜单
 */
const DEPLOY_MENU: MenuOption[] = [
  {
    name: '📄 部署到 GitHub Pages',
    value: 'github-pages',
    description: '构建并部署文档到 GitHub Pages',
    action: DEPLOY_ACTIONS['github-pages'],
  },
  {
    name: '⚡ 部署到 Vercel',
    value: 'vercel-deploy',
    description: '部署到 Vercel',
    action: DEPLOY_ACTIONS['vercel-deploy'],
  },
  {
    name: '🔗 连接 Vercel 项目',
    value: 'vercel-link',
    description: '连接到 Vercel 项目',
    action: DEPLOY_ACTIONS['vercel-link'],
  },
  {
    name: '📊 查看 Vercel 部署状态',
    value: 'vercel-status',
    description: '查看 Vercel 部署状态',
    action: DEPLOY_ACTIONS['vercel-status'],
  },
  {
    name: '🌐 预览部署',
    value: 'preview-deploy',
    description: '创建预览部署',
    action: DEPLOY_ACTIONS['preview-deploy'],
  },
  {
    name: '🏷️ 生产部署',
    value: 'production-deploy',
    description: '部署到生产环境',
    action: DEPLOY_ACTIONS['production-deploy'],
  },
  { name: '⬅️ 返回主菜单', value: 'back', description: '' },
]

/**
 * 项目管理菜单
 */
const PROJECT_MENU: MenuOption[] = [
  {
    name: '🚀 初始化项目',
    value: 'init',
    description: '完整初始化项目（适用于新克隆）',
    action: PROJECT_ACTIONS.init,
  },
  {
    name: '🔧 快速初始化',
    value: 'quick-init',
    description: '跳过依赖安装的快速初始化',
    action: PROJECT_ACTIONS['quick-init'],
  },
  {
    name: '📊 项目信息',
    value: 'info',
    description: '显示项目详细信息',
    action: PROJECT_ACTIONS.info,
  },
  {
    name: '🔍 健康检查',
    value: 'health-check',
    description: '检查项目配置和依赖',
    action: PROJECT_ACTIONS['health-check'],
  },
  {
    name: '🧹 深度清理',
    value: 'deep-clean',
    description: '清理所有缓存和临时文件',
    action: PROJECT_ACTIONS['deep-clean'],
  },
  {
    name: '📦 更新依赖',
    value: 'update-deps',
    description: '更新所有依赖到最新版本',
    action: PROJECT_ACTIONS['update-deps'],
  },
  { name: '⬅️ 返回主菜单', value: 'back', description: '' },
]

/**
 * 文档相关菜单
 */
const DOCS_MENU: MenuOption[] = [
  {
    name: '🚀 启动文档服务器',
    value: 'docs-dev',
    description: 'pnpm docs:dev',
    action: DOCS_ACTIONS['docs-dev'],
  },
  {
    name: '🏗️ 构建文档',
    value: 'docs-build',
    description: 'pnpm docs:build',
    action: DOCS_ACTIONS['docs-build'],
  },
  {
    name: '👀 预览文档',
    value: 'docs-preview',
    description: 'pnpm docs:preview',
    action: DOCS_ACTIONS['docs-preview'],
  },
  {
    name: '📝 生成 API 文档',
    value: 'api-docs',
    description: '自动生成 API 文档',
    action: DOCS_ACTIONS['api-docs'],
  },
  {
    name: '🔍 检查文档链接',
    value: 'check-links',
    description: '检查文档中的链接',
    action: DOCS_ACTIONS['check-links'],
  },
  { name: '⬅️ 返回主菜单', value: 'back', description: '' },
]

/**
 * 测试相关菜单
 */
const TEST_MENU: MenuOption[] = [
  {
    name: '🧪 运行单元测试',
    value: 'test-unit',
    description: 'pnpm test',
    action: TEST_ACTIONS['test-unit'],
  },
  {
    name: '🎭 运行 E2E 测试',
    value: 'test-e2e',
    description: 'pnpm test:e2e',
    action: TEST_ACTIONS['test-e2e'],
  },
  {
    name: '📊 生成覆盖率报告',
    value: 'test-coverage',
    description: 'pnpm test:coverage',
    action: TEST_ACTIONS['test-coverage'],
  },
  {
    name: '👀 测试 UI 界面',
    value: 'test-ui',
    description: 'pnpm test:ui',
    action: TEST_ACTIONS['test-ui'],
  },
  {
    name: '⚡ 性能基准测试',
    value: 'test-benchmark',
    description: '运行性能测试',
    action: TEST_ACTIONS['test-benchmark'],
  },
  {
    name: '🔄 监听模式测试',
    value: 'test-watch',
    description: '监听文件变化运行测试',
    action: TEST_ACTIONS['test-watch'],
  },
  { name: '⬅️ 返回主菜单', value: 'back', description: '' },
]

/**
 * 显示菜单并获取用户选择
 */
async function showMenu(title: string, options: MenuOption[]): Promise<string> {
  const { default: inquirer } = await import('inquirer')

  console.clear()
  logger.title(`🛠️ LDesign 项目管理工具 - ${title}`)
  console.log()

  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: '请选择要执行的操作:',
      choices: options.map(option => ({
        name: `${option.name}${option.description ? ` - ${chalk.gray(option.description)}` : ''}`,
        value: option.value,
      })),
      pageSize: 15,
    },
  ])

  return choice
}

/**
 * 执行菜单操作
 */
async function executeMenuAction(
  choice: string,
  menu: MenuOption[]
): Promise<void> {
  const option = menu.find(item => item.value === choice)
  if (option?.action) {
    await option.action()
  }
}

/**
 * 显示帮助信息
 */
async function showHelp(): Promise<void> {
  console.clear()
  logger.title('🛠️ LDesign 项目管理工具 - 帮助信息')
  console.log()

  console.log(chalk.cyan('这是一个统一的项目管理工具，提供以下功能：'))
  console.log()

  console.log(chalk.yellow('🚀 开发相关:'))
  console.log('  - 启动开发服务器、构建项目')
  console.log('  - 代码检查、格式化、类型检查')
  console.log('  - 依赖管理、项目清理')
  console.log()

  console.log(chalk.yellow('📝 Git 管理:'))
  console.log('  - 智能提交代码（自动 stash、pull、push）')
  console.log('  - 项目更新、分支管理')
  console.log('  - 查看状态和提交历史')
  console.log()

  console.log(chalk.yellow('📦 Submodule 管理:'))
  console.log('  - 添加、删除、修改 submodule')
  console.log('  - 批量更新和重新初始化')
  console.log('  - 状态查看和管理')
  console.log()

  console.log(chalk.yellow('🌐 部署相关:'))
  console.log('  - GitHub Pages 自动部署')
  console.log('  - Vercel 部署和管理')
  console.log('  - 预览和生产环境部署')
  console.log()

  console.log(chalk.yellow('🔧 项目管理:'))
  console.log('  - 项目初始化和健康检查')
  console.log('  - 依赖更新和深度清理')
  console.log('  - 项目信息查看')
  console.log()

  console.log(chalk.yellow('📚 文档相关:'))
  console.log('  - 文档开发、构建、预览')
  console.log('  - API 文档生成')
  console.log('  - 链接检查')
  console.log()

  console.log(chalk.yellow('🧪 测试相关:'))
  console.log('  - 单元测试、E2E 测试')
  console.log('  - 覆盖率报告、性能测试')
  console.log('  - 测试 UI 和监听模式')
  console.log()

  console.log(chalk.green('使用方法:'))
  console.log('  pnpm script:main  # 启动交互式菜单')
  console.log('  或者直接运行: tsx scripts/main.ts')
  console.log()

  await waitForUser()
}

/**
 * 主程序入口
 */
async function main(): Promise<void> {
  try {
    while (true) {
      const choice = await showMenu('主菜单', MAIN_MENU)

      switch (choice) {
        case 'dev':
          while (true) {
            const devChoice = await showMenu('开发相关', DEV_MENU)
            if (devChoice === 'back') break
            await executeMenuAction(devChoice, DEV_MENU)
          }
          break

        case 'git':
          while (true) {
            const gitChoice = await showMenu('Git 管理', GIT_MENU)
            if (gitChoice === 'back') break
            await executeMenuAction(gitChoice, GIT_MENU)
          }
          break

        case 'submodule':
          while (true) {
            const submoduleChoice = await showMenu(
              'Submodule 管理',
              SUBMODULE_MENU
            )
            if (submoduleChoice === 'back') break
            await executeMenuAction(submoduleChoice, SUBMODULE_MENU)
          }
          break

        case 'deploy':
          while (true) {
            const deployChoice = await showMenu('部署相关', DEPLOY_MENU)
            if (deployChoice === 'back') break
            await executeMenuAction(deployChoice, DEPLOY_MENU)
          }
          break

        case 'project':
          while (true) {
            const projectChoice = await showMenu('项目管理', PROJECT_MENU)
            if (projectChoice === 'back') break
            await executeMenuAction(projectChoice, PROJECT_MENU)
          }
          break

        case 'docs':
          while (true) {
            const docsChoice = await showMenu('文档相关', DOCS_MENU)
            if (docsChoice === 'back') break
            await executeMenuAction(docsChoice, DOCS_MENU)
          }
          break

        case 'test':
          while (true) {
            const testChoice = await showMenu('测试相关', TEST_MENU)
            if (testChoice === 'back') break
            await executeMenuAction(testChoice, TEST_MENU)
          }
          break

        case 'help':
          await showHelp()
          break

        case 'exit':
          logger.success('👋 再见！')
          process.exit(0)

        default:
          logger.warning('未知选项')
          break
      }
    }
  } catch (error) {
    logger.error('程序执行出错:')
    console.error(error)
    process.exit(1)
  }
}

// 启动主程序
if (import.meta.url.includes(process.argv[1]?.replace(/\\/g, '/') || '')) {
  main()
}

export { main }
