#!/usr/bin/env tsx

import chalk from 'chalk'

console.clear()
console.log(chalk.bold.magenta('🛠️ LDesign 项目管理工具'))
console.log()

async function main() {
  try {
    const { default: inquirer } = await import('inquirer')
    
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: '请选择要执行的操作:',
        choices: [
          { name: '🚀 开发相关 - 启动开发服务器、构建、测试等', value: 'dev' },
          { name: '📝 Git 管理 - 提交代码、更新项目、管理分支', value: 'git' },
          { name: '📦 Submodule 管理 - 添加、删除、更新 submodule', value: 'submodule' },
          { name: '🌐 部署相关 - GitHub Pages、Vercel 部署', value: 'deploy' },
          { name: '🔧 项目管理 - 初始化、清理、重置项目', value: 'project' },
          { name: '📚 文档相关 - 文档开发、构建、预览', value: 'docs' },
          { name: '🧪 测试相关 - 单元测试、E2E 测试、覆盖率', value: 'test' },
          { name: '❓ 帮助信息 - 查看帮助和使用说明', value: 'help' },
          { name: '🚪 退出', value: 'exit' }
        ],
        pageSize: 15
      }
    ])
    
    console.log()
    console.log(chalk.green(`✅ 你选择了: ${choice}`))
    console.log()
    
    switch (choice) {
      case 'dev':
        console.log(chalk.cyan('🚀 开发相关功能:'))
        console.log('  - 启动开发服务器: pnpm dev')
        console.log('  - 构建项目: pnpm build')
        console.log('  - 代码检查: pnpm lint')
        console.log('  - 类型检查: pnpm typecheck')
        break
      case 'git':
        console.log(chalk.cyan('📝 Git 管理功能:'))
        console.log('  - 智能提交: pnpm script:commit')
        console.log('  - 更新项目: pnpm script:update')
        console.log('  - 查看状态: git status')
        break
      case 'submodule':
        console.log(chalk.cyan('📦 Submodule 管理功能:'))
        console.log('  - 列出 submodule: pnpm script:submodule list')
        console.log('  - 添加 submodule: pnpm script:submodule add <url> <path>')
        console.log('  - 删除 submodule: pnpm script:submodule remove <path>')
        break
      case 'deploy':
        console.log(chalk.cyan('🌐 部署相关功能:'))
        console.log('  - GitHub Pages: 构建并部署文档')
        console.log('  - Vercel 部署: npx vercel --prod')
        console.log('  - 预览部署: npx vercel')
        break
      case 'project':
        console.log(chalk.cyan('🔧 项目管理功能:'))
        console.log('  - 初始化项目: pnpm script:init')
        console.log('  - 清理项目: pnpm clean')
        console.log('  - 重置项目: pnpm reset')
        break
      case 'docs':
        console.log(chalk.cyan('📚 文档相关功能:'))
        console.log('  - 启动文档服务器: pnpm docs:dev')
        console.log('  - 构建文档: pnpm docs:build')
        console.log('  - 预览文档: pnpm docs:preview')
        break
      case 'test':
        console.log(chalk.cyan('🧪 测试相关功能:'))
        console.log('  - 运行单元测试: pnpm test')
        console.log('  - E2E 测试: pnpm test:e2e')
        console.log('  - 覆盖率报告: pnpm test:coverage')
        break
      case 'help':
        console.log(chalk.yellow('❓ 帮助信息:'))
        console.log('这是一个统一的项目管理工具，提供以下功能：')
        console.log('- 开发相关：启动服务器、构建、测试')
        console.log('- Git 管理：智能提交、更新、分支管理')
        console.log('- Submodule 管理：添加、删除、更新')
        console.log('- 部署相关：GitHub Pages、Vercel')
        console.log('- 项目管理：初始化、清理、健康检查')
        console.log('- 文档相关：开发、构建、预览')
        console.log('- 测试相关：单元测试、E2E、覆盖率')
        console.log()
        console.log('使用方法：pnpm script:main')
        break
      case 'exit':
        console.log(chalk.green('👋 再见！'))
        process.exit(0)
      default:
        console.log(chalk.red('❌ 未知选项'))
        break
    }
    
    console.log()
    console.log(chalk.gray('💡 提示：你可以直接使用上面显示的命令来执行相应操作'))
    
  } catch (error) {
    console.error(chalk.red('❌ 程序执行出错:'), error)
    process.exit(1)
  }
}

main()
