#!/usr/bin/env node

/**
 * 发布前检查脚本
 * 确保包在发布前满足所有质量要求
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function error(message) {
  log(`❌ ${message}`, 'red')
}

function success(message) {
  log(`✅ ${message}`, 'green')
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue')
}

// 执行命令
function runCommand(command, description) {
  try {
    info(`执行: ${description}`)
    execSync(command, { cwd: rootDir, stdio: 'inherit' })
    success(`${description} 完成`)
    return true
  } catch (error) {
    error(`${description} 失败: ${error.message}`)
    return false
  }
}

// 检查文件
function checkFile(filePath, description) {
  const fullPath = path.join(rootDir, filePath)
  if (fs.existsSync(fullPath)) {
    success(`${description}: ${filePath}`)
    return true
  } else {
    error(`${description} 不存在: ${filePath}`)
    return false
  }
}

// 检查 package.json
function checkPackageJson() {
  info('检查 package.json...')
  
  const packagePath = path.join(rootDir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
  
  let passed = true
  
  // 必需字段
  const requiredFields = [
    'name',
    'version',
    'description',
    'main',
    'module',
    'types',
    'exports',
    'files',
    'scripts',
    'keywords',
    'author',
    'license',
  ]
  
  for (const field of requiredFields) {
    if (!packageJson[field]) {
      error(`package.json 缺少必需字段: ${field}`)
      passed = false
    } else {
      success(`package.json 包含字段: ${field}`)
    }
  }
  
  // 检查版本格式
  const versionRegex = /^\d+\.\d+\.\d+(-\w+\.\d+)?$/
  if (!versionRegex.test(packageJson.version)) {
    error(`版本号格式不正确: ${packageJson.version}`)
    passed = false
  } else {
    success(`版本号格式正确: ${packageJson.version}`)
  }
  
  // 检查关键词
  if (!Array.isArray(packageJson.keywords) || packageJson.keywords.length === 0) {
    error('package.json 缺少关键词')
    passed = false
  } else {
    success(`包含 ${packageJson.keywords.length} 个关键词`)
  }
  
  return passed
}

// 检查必需文件
function checkRequiredFiles() {
  info('检查必需文件...')
  
  const requiredFiles = [
    ['README.md', 'README 文档'],
    ['CHANGELOG.md', '更新日志'],
    ['package.json', '包配置文件'],
    ['ldesign.config.ts', '构建配置文件'],
    ['tsconfig.json', 'TypeScript 配置'],
    ['src/index.ts', '主入口文件'],
  ]
  
  let passed = true
  
  for (const [file, desc] of requiredFiles) {
    if (!checkFile(file, desc)) {
      passed = false
    }
  }
  
  return passed
}

// 检查代码质量
function checkCodeQuality() {
  info('检查代码质量...')
  
  let passed = true
  
  // TypeScript 类型检查
  if (!runCommand('pnpm run type-check', 'TypeScript 类型检查')) {
    passed = false
  }
  
  // ESLint 检查
  if (!runCommand('pnpm run lint:check', 'ESLint 代码检查')) {
    passed = false
  }
  
  return passed
}

// 运行测试
function runTests() {
  info('运行测试套件...')
  
  let passed = true
  
  // 单元测试
  if (!runCommand('pnpm run test:run', '单元测试')) {
    passed = false
  }
  
  // 测试覆盖率
  if (!runCommand('pnpm run test:coverage', '测试覆盖率')) {
    passed = false
  }
  
  return passed
}

// 构建检查
function checkBuild() {
  info('检查构建...')
  
  let passed = true
  
  // 清理旧构建
  if (!runCommand('pnpm run clean', '清理旧构建')) {
    passed = false
  }
  
  // 生产构建
  if (!runCommand('pnpm run build:prod', '生产构建')) {
    passed = false
  }
  
  // 构建验证
  if (!runCommand('node scripts/build-validate.js', '构建验证')) {
    passed = false
  }
  
  return passed
}

// 检查文档
function checkDocumentation() {
  info('检查文档...')
  
  let passed = true
  
  // README.md
  const readmePath = path.join(rootDir, 'README.md')
  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, 'utf-8')
    
    const requiredSections = [
      '# @ldesign/tree',
      '## 安装',
      '## 快速开始',
      '## API',
    ]
    
    for (const section of requiredSections) {
      if (readme.includes(section)) {
        success(`README 包含章节: ${section}`)
      } else {
        error(`README 缺少章节: ${section}`)
        passed = false
      }
    }
  } else {
    error('README.md 不存在')
    passed = false
  }
  
  // 构建文档
  if (!runCommand('pnpm run docs:build', '构建文档')) {
    passed = false
  }
  
  return passed
}

// 检查依赖
function checkDependencies() {
  info('检查依赖...')
  
  let passed = true
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'))
  
  // 检查是否有未使用的依赖
  try {
    execSync('npx depcheck', { cwd: rootDir, stdio: 'pipe' })
    success('依赖检查通过')
  } catch (error) {
    warning('依赖检查发现问题，请手动检查')
  }
  
  // 检查安全漏洞
  try {
    execSync('npm audit --audit-level=moderate', { cwd: rootDir, stdio: 'pipe' })
    success('安全检查通过')
  } catch (error) {
    warning('发现安全漏洞，请手动检查')
  }
  
  return passed
}

// 主函数
function prePublishCheck() {
  info('🚀 开始发布前检查...')
  
  const checks = [
    ['package.json 检查', checkPackageJson],
    ['必需文件检查', checkRequiredFiles],
    ['代码质量检查', checkCodeQuality],
    ['测试检查', runTests],
    ['构建检查', checkBuild],
    ['文档检查', checkDocumentation],
    ['依赖检查', checkDependencies],
  ]
  
  let allPassed = true
  
  for (const [name, checkFn] of checks) {
    info(`\n📋 ${name}`)
    if (!checkFn()) {
      allPassed = false
      error(`${name} 失败`)
    } else {
      success(`${name} 通过`)
    }
  }
  
  if (allPassed) {
    success('\n🎉 所有检查通过！包已准备好发布。')
    
    // 显示发布信息
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'))
    info(`\n📦 包信息:`)
    info(`   名称: ${packageJson.name}`)
    info(`   版本: ${packageJson.version}`)
    info(`   描述: ${packageJson.description}`)
    
    info(`\n🚀 发布命令:`)
    info(`   npm publish`)
    info(`   或`)
    info(`   pnpm publish`)
    
    process.exit(0)
  } else {
    error('\n❌ 发布前检查失败！请修复上述问题后重试。')
    process.exit(1)
  }
}

// 运行检查
prePublishCheck()
