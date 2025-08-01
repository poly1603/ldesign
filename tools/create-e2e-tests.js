#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 为包创建E2E测试
 */
function createE2ETests(packageName) {
  const packageDir = path.resolve(__dirname, '../packages', packageName)
  const e2eDir = path.join(packageDir, 'e2e')
  
  // 创建e2e目录
  if (!fs.existsSync(e2eDir)) {
    fs.mkdirSync(e2eDir, { recursive: true })
  }
  
  // 读取模板
  const templatePath = path.resolve(__dirname, 'e2e-template.spec.ts')
  const template = fs.readFileSync(templatePath, 'utf-8')
  
  // 替换模板变量
  const pascalCaseName = toPascalCase(packageName)
  const content = template
    .replace(/\{\{PACKAGE_NAME\}\}/g, packageName)
    .replace(/\{\{PACKAGE_NAME_PASCAL\}\}/g, pascalCaseName)
  
  // 写入测试文件
  const testFilePath = path.join(e2eDir, `${packageName}.spec.ts`)
  fs.writeFileSync(testFilePath, content)
  
  console.log(`✅ 创建 ${packageName} E2E 测试: ${testFilePath}`)
}

/**
 * 为所有包创建E2E测试
 */
function createAllE2ETests() {
  console.log('🚀 开始为所有包创建E2E测试...\n')
  
  const packagesDir = path.resolve(__dirname, '../packages')
  const packages = fs.readdirSync(packagesDir).filter(name => {
    const packagePath = path.join(packagesDir, name)
    return fs.statSync(packagePath).isDirectory() && fs.existsSync(path.join(packagePath, 'package.json'))
  })
  
  for (const packageName of packages) {
    try {
      createE2ETests(packageName)
    } catch (error) {
      console.error(`❌ 创建 ${packageName} E2E测试失败:`, error.message)
    }
  }
  
  console.log('\n🎉 所有E2E测试创建完成!')
}

// 工具函数
function toPascalCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    .replace(/^[a-z]/, (g) => g.toUpperCase())
}

// CLI 处理
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    createAllE2ETests()
  } else {
    const packageName = args[0]
    createE2ETests(packageName)
  }
}

export { createE2ETests, createAllE2ETests }
