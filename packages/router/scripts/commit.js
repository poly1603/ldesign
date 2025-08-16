#!/usr/bin/env node

/**
 * Git 提交助手脚本
 *
 * 提供交互式的提交信息生成和验证流程
 */

import { execSync } from 'node:child_process'
import readline from 'node:readline'

const colors = {
  reset: '\x1B[0m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  magenta: '\x1B[35m',
  cyan: '\x1B[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

const commitTypes = [
  { value: 'feat', description: '新功能' },
  { value: 'fix', description: '修复bug' },
  { value: 'docs', description: '文档更新' },
  { value: 'style', description: '代码格式（不影响功能）' },
  { value: 'refactor', description: '重构' },
  { value: 'perf', description: '性能优化' },
  { value: 'test', description: '测试相关' },
  { value: 'chore', description: '构建过程或辅助工具' },
  { value: 'ci', description: 'CI配置' },
  { value: 'build', description: '构建系统' },
  { value: 'revert', description: '回滚' },
]

const scopes = [
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

async function selectCommitType() {
  log(`\n${colors.cyan}📝 选择提交类型:${colors.reset}`)

  commitTypes.forEach((type, index) => {
    log(`${colors.yellow}${index + 1}.${colors.reset} ${colors.green}${type.value}${colors.reset} - ${type.description}`)
  })

  const answer = await question('\n请选择类型 (1-11): ')
  const index = Number.parseInt(answer) - 1

  if (index >= 0 && index < commitTypes.length) {
    return commitTypes[index].value
  }

  log(`${colors.red}无效选择，请重试${colors.reset}`)
  return selectCommitType()
}

async function selectScope() {
  log(`\n${colors.cyan}🎯 选择影响范围 (可选):${colors.reset}`)

  scopes.forEach((scope, index) => {
    log(`${colors.yellow}${index + 1}.${colors.reset} ${scope}`)
  })

  const answer = await question('\n请选择范围 (1-16, 回车跳过): ')

  if (!answer.trim()) {
    return ''
  }

  const index = Number.parseInt(answer) - 1

  if (index >= 0 && index < scopes.length) {
    return scopes[index]
  }

  log(`${colors.red}无效选择，跳过范围设置${colors.reset}`)
  return ''
}

async function getSubject() {
  log(`\n${colors.cyan}📄 输入提交描述:${colors.reset}`)

  const subject = await question('简短描述 (必填): ')

  if (!subject.trim()) {
    log(`${colors.red}描述不能为空，请重试${colors.reset}`)
    return getSubject()
  }

  if (subject.length > 50) {
    log(`${colors.yellow}⚠️  描述过长 (${subject.length} 字符)，建议控制在 50 字符以内${colors.reset}`)

    const confirm = await question('是否继续? (y/N): ')
    if (confirm.toLowerCase() !== 'y') {
      return getSubject()
    }
  }

  return subject.trim()
}

async function getBody() {
  log(`\n${colors.cyan}📝 输入详细描述 (可选):${colors.reset}`)

  const body = await question('详细描述 (回车跳过): ')
  return body.trim()
}

function buildCommitMessage(type, scope, subject, body) {
  let message = type

  if (scope) {
    message += `(${scope})`
  }

  message += `: ${subject}`

  if (body) {
    message += `\n\n${body}`
  }

  return message
}

async function confirmCommit(message) {
  log(`\n${colors.cyan}📋 提交信息预览:${colors.reset}`)
  log('='.repeat(50))
  log(message)
  log('='.repeat(50))

  const confirm = await question('\n确认提交? (Y/n): ')
  return confirm.toLowerCase() !== 'n'
}

async function runValidation() {
  log(`\n${colors.cyan}🔍 运行提交前验证...${colors.reset}`)

  try {
    // 运行快速验证
    execSync('pnpm validate:quick', { stdio: 'inherit' })
    log(`${colors.green}✅ 快速验证通过${colors.reset}`)

    // 询问是否运行完整验证
    const runFull = await question('\n是否运行完整验证 (包括测试和构建)? (Y/n): ')

    if (runFull.toLowerCase() !== 'n') {
      execSync('pnpm validate', { stdio: 'inherit' })
      log(`${colors.green}✅ 完整验证通过${colors.reset}`)
    }

    return true
  }
  catch (error) {
    log(`${colors.red}❌ 验证失败: ${error.message}${colors.reset}`)

    const force = await question('\n是否强制提交? (y/N): ')
    return force.toLowerCase() === 'y'
  }
}

async function commitChanges(message) {
  try {
    // 检查是否有暂存的文件
    const status = execSync('git status --porcelain --cached', { encoding: 'utf8' })

    if (!status.trim()) {
      log(`${colors.yellow}⚠️  没有暂存的文件，请先添加要提交的文件${colors.reset}`)

      const addAll = await question('是否添加所有修改的文件? (y/N): ')
      if (addAll.toLowerCase() === 'y') {
        execSync('git add .', { stdio: 'inherit' })
        log(`${colors.green}✅ 已添加所有文件${colors.reset}`)
      }
      else {
        log(`${colors.red}❌ 提交取消${colors.reset}`)
        return false
      }
    }

    // 执行提交
    execSync(`git commit -m "${message}"`, { stdio: 'inherit' })
    log(`${colors.green}🎉 提交成功！${colors.reset}`)

    return true
  }
  catch (error) {
    log(`${colors.red}❌ 提交失败: ${error.message}${colors.reset}`)
    return false
  }
}

async function main() {
  try {
    log(`${colors.cyan}🚀 Git 提交助手${colors.reset}`)

    // 1. 选择提交类型
    const type = await selectCommitType()

    // 2. 选择影响范围
    const scope = await selectScope()

    // 3. 输入提交描述
    const subject = await getSubject()

    // 4. 输入详细描述
    const body = await getBody()

    // 5. 构建提交信息
    const message = buildCommitMessage(type, scope, subject, body)

    // 6. 确认提交信息
    const confirmed = await confirmCommit(message)
    if (!confirmed) {
      log(`${colors.yellow}❌ 提交已取消${colors.reset}`)
      return
    }

    // 7. 运行验证
    const validationPassed = await runValidation()
    if (!validationPassed) {
      log(`${colors.red}❌ 验证失败，提交已取消${colors.reset}`)
      return
    }

    // 8. 执行提交
    const success = await commitChanges(message)

    if (success) {
      log(`\n${colors.green}🎉 提交完成！${colors.reset}`)

      // 询问是否推送
      const push = await question('是否推送到远程仓库? (y/N): ')
      if (push.toLowerCase() === 'y') {
        try {
          execSync('git push', { stdio: 'inherit' })
          log(`${colors.green}🚀 推送成功！${colors.reset}`)
        }
        catch (error) {
          log(`${colors.red}❌ 推送失败: ${error.message}${colors.reset}`)
        }
      }
    }
  }
  catch (error) {
    log(`${colors.red}❌ 提交助手执行失败: ${error.message}${colors.reset}`)
  }
  finally {
    rl.close()
  }
}

// 运行主函数
main()
