#!/usr/bin/env node

/**
 * Git Hooks 安装脚本
 * 
 * 自动设置 Git hooks 和相关配置
 */

import { execSync } from 'child_process'
import { existsSync, chmodSync } from 'fs'
import path from 'path'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logStep(message) {
  log(`\n${colors.blue}🔧 ${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`)
}

function logError(message) {
  log(`${colors.red}❌ ${message}${colors.reset}`)
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`)
}

function runCommand(command, description) {
  try {
    logStep(description)
    execSync(command, { stdio: 'inherit' })
    logSuccess(`${description} 完成`)
    return true
  } catch (error) {
    logError(`${description} 失败: ${error.message}`)
    return false
  }
}

function makeExecutable(filePath) {
  try {
    if (existsSync(filePath)) {
      chmodSync(filePath, 0o755)
      logSuccess(`设置 ${filePath} 为可执行`)
      return true
    } else {
      logWarning(`文件不存在: ${filePath}`)
      return false
    }
  } catch (error) {
    logError(`设置文件权限失败: ${error.message}`)
    return false
  }
}

async function main() {
  log(`${colors.cyan}🚀 开始设置 Git Hooks...${colors.reset}`)
  
  // 1. 检查 Git 仓库
  try {
    execSync('git rev-parse --git-dir', { stdio: 'pipe' })
    logSuccess('Git 仓库检查通过')
  } catch (error) {
    logError('当前目录不是 Git 仓库')
    process.exit(1)
  }
  
  // 2. 安装 Husky
  if (!runCommand('npx husky install', '安装 Husky')) {
    process.exit(1)
  }
  
  // 3. 设置 hooks 文件权限
  const hooksDir = '.husky'
  const hooks = ['pre-commit', 'commit-msg']
  
  hooks.forEach(hook => {
    const hookPath = path.join(hooksDir, hook)
    makeExecutable(hookPath)
  })
  
  // 4. 设置 Git 配置
  const gitConfigs = [
    ['core.hooksPath', '.husky'],
    ['commit.template', '.gitmessage'],
  ]
  
  gitConfigs.forEach(([key, value]) => {
    try {
      execSync(`git config ${key} ${value}`, { stdio: 'pipe' })
      logSuccess(`设置 Git 配置: ${key} = ${value}`)
    } catch (error) {
      logWarning(`设置 Git 配置失败: ${key}`)
    }
  })
  
  // 5. 创建提交信息模板
  const commitTemplate = `# 提交信息格式: <type>(<scope>): <subject>
#
# type 类型:
#   feat:     新功能
#   fix:      修复bug
#   docs:     文档更新
#   style:    代码格式（不影响功能）
#   refactor: 重构
#   perf:     性能优化
#   test:     测试相关
#   chore:    构建过程或辅助工具
#   ci:       CI配置
#   build:    构建系统
#   revert:   回滚
#
# scope 范围 (可选):
#   core, router, matcher, history, components, composables,
#   plugins, device, engine, guards, utils, types, docs, test, build, ci
#
# subject 描述:
#   - 使用现在时态
#   - 首字母小写
#   - 不要以句号结尾
#   - 控制在 50 字符以内
#
# 示例:
#   feat(router): add new navigation method
#   fix(cache): resolve memory leak issue
#   docs(readme): update installation guide
`
  
  try {
    const fs = await import('fs')
    fs.writeFileSync('.gitmessage', commitTemplate)
    logSuccess('创建提交信息模板')
  } catch (error) {
    logWarning('创建提交信息模板失败')
  }
  
  // 6. 验证安装
  logStep('验证 Hooks 安装')
  
  const validations = [
    {
      command: 'npx husky --version',
      description: 'Husky 版本检查',
    },
    {
      command: 'npx commitlint --version',
      description: 'Commitlint 版本检查',
    },
    {
      command: 'npx lint-staged --version',
      description: 'Lint-staged 版本检查',
    },
  ]
  
  let allValid = true
  
  validations.forEach(({ command, description }) => {
    try {
      execSync(command, { stdio: 'pipe' })
      logSuccess(description)
    } catch (error) {
      logError(`${description} 失败`)
      allValid = false
    }
  })
  
  // 7. 输出使用说明
  log(`\n${colors.cyan}📋 使用说明:${colors.reset}`)
  log('=' .repeat(50))
  
  log(`${colors.green}✨ Git Hooks 已成功安装！${colors.reset}`)
  log('')
  log('现在你可以使用以下命令:')
  log('')
  log(`${colors.yellow}📝 提交代码:${colors.reset}`)
  log('  pnpm commit:interactive  # 交互式提交助手')
  log('  git add . && git commit  # 传统提交（会自动验证）')
  log('')
  log(`${colors.yellow}🔍 手动验证:${colors.reset}`)
  log('  pnpm validate:quick      # 快速验证（类型检查 + ESLint）')
  log('  pnpm validate           # 完整验证（包括测试和构建）')
  log('  pnpm validate:full      # 使用验证脚本')
  log('  pnpm validate:e2e       # 包括 E2E 测试的完整验证')
  log('')
  log(`${colors.yellow}🎯 提交规范:${colors.reset}`)
  log('  格式: <type>(<scope>): <subject>')
  log('  示例: feat(router): add new navigation method')
  log('  查看: cat .gitmessage')
  log('')
  
  if (allValid) {
    log(`${colors.green}🎉 所有工具都已正确安装和配置！${colors.reset}`)
  } else {
    log(`${colors.yellow}⚠️  部分工具可能需要手动安装依赖${colors.reset}`)
    log('请运行: pnpm install')
  }
  
  log('=' .repeat(50))
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logError(`未捕获的异常: ${error.message}`)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logError(`未处理的 Promise 拒绝: ${reason}`)
  process.exit(1)
})

// 运行主函数
main().catch((error) => {
  logError(`安装脚本执行失败: ${error.message}`)
  process.exit(1)
})
