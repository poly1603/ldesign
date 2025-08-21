#!/usr/bin/env node

/**
 * 简单的提交信息验证脚本
 * 不依赖外部包，纯 Node.js 实现
 */

import { readFileSync } from 'node:fs'

const colors = {
  reset: '\x1B[0m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  cyan: '\x1B[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

// 提交类型定义
const commitTypes = {
  feat: '新功能',
  fix: '修复bug',
  docs: '文档更新',
  style: '代码格式（不影响功能）',
  refactor: '重构',
  perf: '性能优化',
  test: '测试相关',
  chore: '构建过程或辅助工具',
  ci: 'CI配置',
  build: '构建系统',
  revert: '回滚',
}

// 影响范围定义
const validScopes = [
  'core',
  'router',
  'matcher',
  'history',
  'components',
  'composables',
  'plugins',
  'device',
  'engine',
  'guards',
  'utils',
  'types',
  'docs',
  'test',
  'build',
  'ci',
]

function validateCommitMessage(message) {
  const errors = []
  const warnings = []

  // 基本格式检查: <type>(<scope>): <subject>
  const commitRegex
    = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?: .+/

  if (!commitRegex.test(message)) {
    errors.push('提交信息格式不正确')
    return { valid: false, errors, warnings }
  }

  // 解析提交信息
  const match = message.match(/^(\w+)(\(([^)]+)\))?: (.+)/)
  if (!match) {
    errors.push('无法解析提交信息')
    return { valid: false, errors, warnings }
  }

  const [, type, , scope, subject] = match

  // 验证类型
  if (!commitTypes[type]) {
    errors.push(`无效的提交类型: ${type}`)
  }

  // 验证范围（如果提供）
  if (scope && !validScopes.includes(scope)) {
    warnings.push(`未知的影响范围: ${scope}`)
  }

  // 验证主题
  if (!subject || subject.trim().length === 0) {
    errors.push('提交主题不能为空')
  }

  if (subject.length > 50) {
    warnings.push(`主题过长 (${subject.length} 字符)，建议控制在 50 字符以内`)
  }

  if (subject.endsWith('.')) {
    warnings.push('主题不应以句号结尾')
  }

  if (subject[0] === subject[0].toUpperCase()) {
    warnings.push('主题首字母建议小写')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    parsed: { type, scope, subject },
  }
}

function printValidationResult(result, message) {
  log('\n🔍 提交信息验证结果:', colors.cyan)
  log('='.repeat(50))

  log(`📝 提交信息: ${message}`)

  if (result.parsed) {
    const { type, scope, subject } = result.parsed
    log(`🏷️  类型: ${type} (${commitTypes[type] || '未知'})`)
    if (scope) {
      log(`🎯 范围: ${scope}`)
    }
    log(`📄 主题: ${subject}`)
  }

  if (result.errors.length > 0) {
    log('\n❌ 错误:', colors.red)
    result.errors.forEach((error) => {
      log(`  • ${error}`, colors.red)
    })
  }

  if (result.warnings.length > 0) {
    log('\n⚠️  警告:', colors.yellow)
    result.warnings.forEach((warning) => {
      log(`  • ${warning}`, colors.yellow)
    })
  }

  if (result.valid) {
    log('\n✅ 提交信息格式正确', colors.green)
  }
  else {
    log('\n❌ 提交信息格式不正确', colors.red)

    log('\n💡 正确格式:', colors.blue)
    log('  <type>(<scope>): <subject>')
    log('')
    log('📋 示例:', colors.blue)
    log('  feat(router): add new navigation method')
    log('  fix(cache): resolve memory leak issue')
    log('  docs(readme): update installation guide')
    log('')
    log('🏷️  有效类型:', colors.blue)
    Object.entries(commitTypes).forEach(([type, desc]) => {
      log(`  ${type.padEnd(10)} - ${desc}`)
    })
  }

  log('='.repeat(50))
}

function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    log('❌ 请提供提交信息文件路径', colors.red)
    log('用法: node validate-commit-msg.js <commit-msg-file>')
    process.exit(1)
  }

  const commitMsgFile = args[0]

  try {
    const message = readFileSync(commitMsgFile, 'utf8').trim()

    if (!message) {
      log('❌ 提交信息为空', colors.red)
      process.exit(1)
    }

    const result = validateCommitMessage(message)
    printValidationResult(result, message)

    if (!result.valid) {
      process.exit(1)
    }

    log('🎉 提交信息验证通过！', colors.green)
  }
  catch (error) {
    log(`❌ 读取提交信息文件失败: ${error.message}`, colors.red)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (process.argv[1] && process.argv[1].endsWith('validate-commit-msg.js')) {
  main()
}

export { validateCommitMessage }
