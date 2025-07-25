#!/usr/bin/env tsx

import chalk from 'chalk'

console.clear()
console.log(chalk.bold.magenta('🛠️ LDesign 项目管理工具'))
console.log()

async function main() {
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
  
  console.log(chalk.green(`你选择了: ${choice}`))
  
  switch (choice) {
    case 'dev':
      console.log(chalk.cyan('开发相关功能开发中...'))
      break
    case 'git':
      console.log(chalk.cyan('Git 管理功能开发中...'))
      break
    case 'submodule':
      console.log(chalk.cyan('Submodule 管理功能开发中...'))
      break
    case 'deploy':
      console.log(chalk.cyan('部署相关功能开发中...'))
      break
    case 'project':
      console.log(chalk.cyan('项目管理功能开发中...'))
      break
    case 'docs':
      console.log(chalk.cyan('文档相关功能开发中...'))
      break
    case 'test':
      console.log(chalk.cyan('测试相关功能开发中...'))
      break
    case 'help':
      console.log(chalk.yellow('帮助信息:'))
      console.log('这是一个统一的项目管理工具')
      break
    case 'exit':
      console.log(chalk.green('👋 再见！'))
      process.exit(0)
    default:
      console.log(chalk.red('未知选项'))
      break
  }
}

main().catch(console.error)
