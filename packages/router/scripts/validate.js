#!/usr/bin/env node

/**
 * 完整的代码验证脚本
 * 
 * 在提交前运行所有必要的检查：
 * 1. TypeScript 类型检查
 * 2. ESLint 代码质量检查
 * 3. 单元测试
 * 4. 构建验证
 * 5. E2E 测试（可选）
 */

import { execSync } from 'child_process'
import { performance } from 'perf_hooks'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logStep(step, message) {
  log(`\n${colors.blue}[${step}]${colors.reset} ${message}`)
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
  const startTime = performance.now()
  
  try {
    logStep('RUNNING', description)
    execSync(command, { stdio: 'inherit' })
    
    const duration = ((performance.now() - startTime) / 1000).toFixed(2)
    logSuccess(`${description} completed in ${duration}s`)
    
    return true
  } catch (error) {
    const duration = ((performance.now() - startTime) / 1000).toFixed(2)
    logError(`${description} failed after ${duration}s`)
    logError(`Command: ${command}`)
    logError(`Error: ${error.message}`)
    
    return false
  }
}

async function main() {
  const startTime = performance.now()
  
  log(`${colors.cyan}🚀 开始代码验证流程...${colors.reset}`)
  
  const steps = [
    {
      command: 'pnpm type-check',
      description: 'TypeScript 类型检查',
      required: true,
    },
    {
      command: 'pnpm lint:check',
      description: 'ESLint 代码质量检查',
      required: true,
    },
    {
      command: 'pnpm test:run',
      description: '单元测试',
      required: true,
    },
    {
      command: 'pnpm build',
      description: '构建验证',
      required: true,
    },
  ]
  
  // 检查是否需要运行 E2E 测试
  const runE2E = process.argv.includes('--e2e')
  if (runE2E) {
    steps.push({
      command: 'pnpm test:e2e',
      description: 'E2E 测试',
      required: false,
    })
  }
  
  let allPassed = true
  const results = []
  
  for (const step of steps) {
    const success = runCommand(step.command, step.description)
    
    results.push({
      ...step,
      success,
    })
    
    if (!success && step.required) {
      allPassed = false
      break
    }
  }
  
  // 输出总结
  const totalTime = ((performance.now() - startTime) / 1000).toFixed(2)
  
  log(`\n${colors.cyan}📊 验证结果总结:${colors.reset}`)
  log('=' .repeat(50))
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌'
    const status = result.success ? '通过' : '失败'
    const required = result.required ? '(必需)' : '(可选)'
    
    log(`${icon} ${result.description}: ${status} ${required}`)
  })
  
  log('=' .repeat(50))
  log(`总耗时: ${totalTime}s`)
  
  if (allPassed) {
    logSuccess('🎉 所有验证步骤都通过了！代码可以安全提交。')
    process.exit(0)
  } else {
    logError('💥 验证失败！请修复问题后重试。')
    
    // 提供修复建议
    log(`\n${colors.yellow}💡 修复建议:${colors.reset}`)
    
    results.forEach(result => {
      if (!result.success) {
        switch (result.description) {
          case 'TypeScript 类型检查':
            log('  - 检查 TypeScript 类型错误，修复类型定义')
            log('  - 运行: pnpm type-check')
            break
          case 'ESLint 代码质量检查':
            log('  - 修复 ESLint 错误和警告')
            log('  - 运行: pnpm lint --fix')
            break
          case '单元测试':
            log('  - 修复失败的测试用例')
            log('  - 运行: pnpm test')
            break
          case '构建验证':
            log('  - 检查构建错误，确保代码可以正常编译')
            log('  - 运行: pnpm build')
            break
          case 'E2E 测试':
            log('  - 修复端到端测试失败')
            log('  - 运行: pnpm test:e2e')
            break
        }
      }
    })
    
    process.exit(1)
  }
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
  logError(`验证脚本执行失败: ${error.message}`)
  process.exit(1)
})
