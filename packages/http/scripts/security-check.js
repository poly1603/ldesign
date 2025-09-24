#!/usr/bin/env node

/**
 * 安全检查脚本
 *
 * 执行各种安全检查：
 * - 依赖漏洞扫描
 * - 代码安全分析
 * - 敏感信息检查
 * - 输入验证检查
 * - 配置安全检查
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// const __filename = fileURLToPath(import.meta.url)

// 颜色输出
const colors = {
  reset: '\x1B[0m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  magenta: '\x1B[35m',
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

function exec(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf8',
      ...options,
    })
  }
  catch (err) {
    return null
  }
}

// 检查依赖漏洞
function checkDependencyVulnerabilities() {
  info('检查依赖漏洞...')

  try {
    // 运行 npm audit
    const auditResult = exec('npm audit --audit-level=moderate --json')

    if (auditResult) {
      const audit = JSON.parse(auditResult)

      if (audit.vulnerabilities && Object.keys(audit.vulnerabilities).length > 0) {
        const vulnCount = Object.keys(audit.vulnerabilities).length
        const highVulns = Object.values(audit.vulnerabilities).filter(v =>
          v.severity === 'high' || v.severity === 'critical',
        ).length

        if (highVulns > 0) {
          error(`发现 ${highVulns} 个高危漏洞，总计 ${vulnCount} 个漏洞`)
          return false
        }
        else {
          warning(`发现 ${vulnCount} 个低/中危漏洞`)
          return true
        }
      }
      else {
        success('未发现依赖漏洞')
        return true
      }
    }
    else {
      success('依赖漏洞检查完成')
      return true
    }
  }
  catch (err) {
    warning(`依赖漏洞检查失败: ${err.message}`)
    return true // 不阻塞构建
  }
}

// 检查敏感信息
function checkSensitiveInformation() {
  info('检查敏感信息...')

  const sensitivePatterns = [
    { pattern: /password\s*[:=]\s*['"][^'"]+['"]/gi, desc: '密码' },
    { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, desc: 'API密钥' },
    { pattern: /secret\s*[:=]\s*['"][^'"]+['"]/gi, desc: '密钥' },
    { pattern: /token\s*[:=]\s*['"][^'"]+['"]/gi, desc: '令牌' },
    { pattern: /private[_-]?key/gi, desc: '私钥' },
    { pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/gi, desc: 'RSA私钥' },
  ]

  const filesToCheck = [
    'src/**/*.ts',
    'src/**/*.js',
    'tests/**/*.ts',
    'tests/**/*.js',
    '*.md',
    '*.json',
  ]

  let foundSensitive = false

  function checkFile(filePath) {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return
    }

    // 跳过测试文件中的模拟数据
    const isTestFile = filePath.includes('test') || filePath.includes('spec')

    try {
      const content = fs.readFileSync(filePath, 'utf8')

      sensitivePatterns.forEach(({ pattern, desc }) => {
        const matches = content.match(pattern)
        if (matches) {
          // 对于测试文件，检查是否是模拟数据
          if (isTestFile) {
            // 检查匹配的上下文
            const lines = content.split('\n')
            let isTestData = false

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i]
              if (pattern.test(line)) {
                // 检查前后几行是否包含测试相关关键词
                const contextLines = lines.slice(Math.max(0, i - 3), i + 4).join(' ')
                if (contextLines.includes('mock')
                  || contextLines.includes('Mock')
                  || contextLines.includes('test')
                  || contextLines.includes('expect')
                  || contextLines.includes('vi.')
                  || contextLines.includes('jest.')
                  || contextLines.includes('Promise.resolve')
                  || contextLines.includes('toHaveBeenCalledWith')) {
                  isTestData = true
                  break
                }
              }
            }

            if (isTestData) {
              // 这是测试中的模拟数据，跳过
              return
            }
          }
          error(`在 ${filePath} 中发现可能的${desc}: ${matches[0]}`)
          foundSensitive = true
        }
      })
    }
    catch (err) {
      // 忽略读取错误
    }
  }

  // 递归检查源代码目录
  function walkDir(dir) {
    if (!fs.existsSync(dir))
      return

    const files = fs.readdirSync(dir)
    files.forEach((file) => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath)
      }
      else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.md'))) {
        checkFile(filePath)
      }
    })
  }

  walkDir('src')
  walkDir('tests')
  checkFile('README.md')
  checkFile('package.json')

  if (!foundSensitive) {
    success('未发现敏感信息')
  }

  return !foundSensitive
}

// 检查输入验证
function checkInputValidation() {
  info('检查输入验证...')

  const srcDir = 'src'
  if (!fs.existsSync(srcDir)) {
    warning('源代码目录不存在')
    return true
  }

  let hasValidation = false
  let potentialIssues = 0

  function checkFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.js'))
      return

    try {
      const content = fs.readFileSync(filePath, 'utf8')

      // 检查是否有输入验证
      const validationPatterns = [
        /typeof\s+\w+\s*[!=]==?\s*['"][^'"]+['"]/g,
        /instanceof\s+\w+/g,
        /\.length\s*[><=]/g,
        /isNaN\(/g,
        /Number\.isNaN\(/g,
        /Array\.isArray\(/g,
      ]

      validationPatterns.forEach((pattern) => {
        if (pattern.test(content)) {
          hasValidation = true
        }
      })

      // 检查潜在的不安全操作
      const unsafePatterns = [
        { pattern: /eval\(/g, desc: 'eval() 调用' },
        { pattern: /new\s+Function\(/g, desc: 'Function() 构造器' },
        { pattern: /innerHTML\s*=/g, desc: 'innerHTML 赋值' },
        { pattern: /document\.write\(/g, desc: 'document.write() 调用' },
      ]

      unsafePatterns.forEach(({ pattern, desc }) => {
        const matches = content.match(pattern)
        if (matches) {
          warning(`在 ${filePath} 中发现潜在不安全操作: ${desc}`)
          potentialIssues++
        }
      })
    }
    catch (err) {
      // 忽略读取错误
    }
  }

  function walkDir(dir) {
    const files = fs.readdirSync(dir)
    files.forEach((file) => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory() && !file.startsWith('.')) {
        walkDir(filePath)
      }
      else if (stat.isFile()) {
        checkFile(filePath)
      }
    })
  }

  walkDir(srcDir)

  if (hasValidation) {
    success('发现输入验证代码')
  }
  else {
    warning('未发现明显的输入验证代码')
  }

  if (potentialIssues === 0) {
    success('未发现明显的安全问题')
  }

  return potentialIssues === 0
}

// 检查配置安全
function checkConfigurationSecurity() {
  info('检查配置安全...')

  let issues = 0

  // 检查 package.json
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))

    // 检查是否有不安全的脚本
    if (pkg.scripts) {
      Object.entries(pkg.scripts).forEach(([name, script]) => {
        if (script.includes('rm -rf') || script.includes('del /f')) {
          warning(`脚本 "${name}" 包含潜在危险的删除命令`)
          issues++
        }
        if (script.includes('curl') || script.includes('wget')) {
          warning(`脚本 "${name}" 包含网络下载命令`)
          issues++
        }
      })
    }

    // 检查依赖版本
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    Object.entries(deps).forEach(([name, version]) => {
      if (version === '*' || version === 'latest') {
        warning(`依赖 "${name}" 使用不固定版本: ${version}`)
        issues++
      }
    })
  }

  // 检查 TypeScript 配置
  if (fs.existsSync('tsconfig.json')) {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'))

    if (tsconfig.compilerOptions) {
      if (!tsconfig.compilerOptions.strict) {
        warning('TypeScript 未启用严格模式')
        issues++
      }

      if (tsconfig.compilerOptions.allowJs) {
        warning('TypeScript 允许 JavaScript 文件，可能降低类型安全性')
        issues++
      }
    }
  }

  if (issues === 0) {
    success('配置安全检查通过')
  }

  return issues === 0
}

// 运行所有安全检查
async function runSecurityChecks() {
  info('开始安全检查...')

  const checks = [
    { name: '依赖漏洞', fn: checkDependencyVulnerabilities },
    { name: '敏感信息', fn: checkSensitiveInformation },
    { name: '输入验证', fn: checkInputValidation },
    { name: '配置安全', fn: checkConfigurationSecurity },
  ]

  let allPassed = true
  const results = []

  for (const { name, fn } of checks) {
    info(`\n--- 检查 ${name} ---`)
    const passed = await fn()
    results.push({ name, passed })
    if (!passed) {
      allPassed = false
    }
  }

  // 输出总结
  info('\n--- 安全检查总结 ---')
  results.forEach(({ name, passed }) => {
    if (passed) {
      success(`${name}: 通过`)
    }
    else {
      error(`${name}: 失败`)
    }
  })

  if (allPassed) {
    success('\n🔒 所有安全检查通过！')
    return true
  }
  else {
    warning('\n⚠️  发现安全问题，请检查并修复。')
    return false
  }
}

// 主函数
async function main() {
  try {
    const isSecure = await runSecurityChecks()
    process.exit(isSecure ? 0 : 1)
  }
  catch (err) {
    error(`安全检查过程中发生错误: ${err.message}`)
    process.exit(1)
  }
}

// 直接运行主函数
main()

export {
  checkConfigurationSecurity,
  checkDependencyVulnerabilities,
  checkInputValidation,
  checkSensitiveInformation,
  runSecurityChecks,
}
