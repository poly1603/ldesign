/**
 * 测试 app 目录的 launcher 功能
 * 
 * 测试 dev、build、preview 和 npm 打包功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { execSync, spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const APP_DIR = path.resolve(__dirname, '../app')
const SITE_DIR = path.join(APP_DIR, 'site')
const NPM_DIST_DIR = path.join(APP_DIR, 'npm-dist')

console.log('🚀 开始测试 app 目录的 @ldesign/launcher 功能...\n')

/**
 * 执行命令并返回结果
 */
function runCommand(command, cwd = APP_DIR, timeout = 30000) {
  console.log(`📦 执行命令: ${command}`)
  console.log(`📁 工作目录: ${cwd}`)
  
  try {
    const result = execSync(command, {
      cwd,
      encoding: 'utf8',
      timeout,
      stdio: 'pipe'
    })
    return { success: true, output: result }
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout || '',
      stderr: error.stderr || ''
    }
  }
}

/**
 * 检查目录是否存在且包含文件
 */
function checkDirectory(dir, description) {
  console.log(`📂 检查 ${description}: ${dir}`)
  
  if (!fs.existsSync(dir)) {
    console.log(`❌ ${description} 不存在`)
    return false
  }
  
  const files = fs.readdirSync(dir)
  if (files.length === 0) {
    console.log(`❌ ${description} 为空`)
    return false
  }
  
  console.log(`✅ ${description} 存在，包含 ${files.length} 个文件/目录`)
  console.log(`   文件列表: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`)
  return true
}

/**
 * 测试构建功能
 */
function testBuild() {
  console.log('\n🏗️  测试构建功能...')
  
  // 清理之前的构建产物
  if (fs.existsSync(SITE_DIR)) {
    console.log('🧹 清理之前的 site 目录')
    fs.rmSync(SITE_DIR, { recursive: true, force: true })
  }
  
  // 执行构建
  const buildResult = runCommand('pnpm run build', APP_DIR, 60000)
  
  if (!buildResult.success) {
    console.log('❌ 构建失败:')
    console.log(buildResult.error)
    console.log('输出:', buildResult.output)
    console.log('错误:', buildResult.stderr)
    return false
  }
  
  console.log('✅ 构建成功')
  
  // 检查构建产物
  if (!checkDirectory(SITE_DIR, 'site 构建产物目录')) {
    return false
  }
  
  // 检查关键文件
  const indexHtml = path.join(SITE_DIR, 'index.html')
  if (!fs.existsSync(indexHtml)) {
    console.log('❌ 缺少 index.html 文件')
    return false
  }
  
  console.log('✅ 构建产物检查通过')
  return true
}

/**
 * 测试 npm 打包功能
 */
function testNpmBuild() {
  console.log('\n📦 测试 npm 打包功能...')
  
  // 清理之前的构建产物
  if (fs.existsSync(NPM_DIST_DIR)) {
    console.log('🧹 清理之前的 npm-dist 目录')
    fs.rmSync(NPM_DIST_DIR, { recursive: true, force: true })
  }
  
  // 执行 npm 打包
  const buildResult = runCommand('pnpm run build:builder', APP_DIR, 60000)
  
  if (!buildResult.success) {
    console.log('❌ npm 打包失败:')
    console.log(buildResult.error)
    console.log('输出:', buildResult.output)
    console.log('错误:', buildResult.stderr)
    return false
  }
  
  console.log('✅ npm 打包成功')
  
  // 检查构建产物
  if (!checkDirectory(NPM_DIST_DIR, 'npm-dist 构建产物目录')) {
    return false
  }
  
  // 检查关键文件
  const expectedFiles = ['index.js', 'index.cjs', 'index.d.ts']
  for (const file of expectedFiles) {
    const filePath = path.join(NPM_DIST_DIR, file)
    if (!fs.existsSync(filePath)) {
      console.log(`❌ 缺少 ${file} 文件`)
      return false
    }
  }
  
  console.log('✅ npm 打包产物检查通过')
  return true
}

/**
 * 测试配置文件
 */
function testConfigs() {
  console.log('\n⚙️  测试配置文件...')
  
  const launcherConfig = path.join(APP_DIR, '.ldesign/launcher.config.ts')
  const builderConfig = path.join(APP_DIR, '.ldesign/builder.config.ts')
  
  if (!fs.existsSync(launcherConfig)) {
    console.log('❌ launcher.config.ts 不存在')
    return false
  }
  
  if (!fs.existsSync(builderConfig)) {
    console.log('❌ builder.config.ts 不存在')
    return false
  }
  
  // 检查配置文件内容
  const launcherContent = fs.readFileSync(launcherConfig, 'utf8')
  if (!launcherContent.includes('preset: \'ldesign\'')) {
    console.log('❌ launcher.config.ts 未使用 ldesign 预设')
    return false
  }
  
  if (!launcherContent.includes('outDir: \'site\'')) {
    console.log('❌ launcher.config.ts 未配置 site 输出目录')
    return false
  }
  
  const builderContent = fs.readFileSync(builderConfig, 'utf8')
  if (!builderContent.includes('outDir: \'npm-dist\'')) {
    console.log('❌ builder.config.ts 未配置 npm-dist 输出目录')
    return false
  }
  
  console.log('✅ 配置文件检查通过')
  return true
}

/**
 * 主测试函数
 */
async function main() {
  const results = {
    config: false,
    build: false,
    npmBuild: false
  }
  
  try {
    // 测试配置文件
    results.config = testConfigs()
    
    // 测试构建功能
    results.build = testBuild()
    
    // 测试 npm 打包功能
    results.npmBuild = testNpmBuild()
    
    // 汇总结果
    console.log('\n📊 测试结果汇总:')
    console.log(`⚙️  配置文件: ${results.config ? '✅ 通过' : '❌ 失败'}`)
    console.log(`🏗️  构建功能: ${results.build ? '✅ 通过' : '❌ 失败'}`)
    console.log(`📦 npm 打包: ${results.npmBuild ? '✅ 通过' : '❌ 失败'}`)
    
    const successCount = Object.values(results).filter(Boolean).length
    const totalCount = Object.keys(results).length
    
    console.log(`\n🎯 总体成功率: ${successCount}/${totalCount} (${Math.round(successCount / totalCount * 100)}%)`)
    
    if (successCount === totalCount) {
      console.log('\n🎉 所有测试通过！app 目录的 launcher 功能工作正常！')
      process.exit(0)
    } else {
      console.log('\n❌ 部分测试失败，请检查上述错误信息')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n💥 测试过程中发生错误:', error.message)
    process.exit(1)
  }
}

// 运行测试
main()
