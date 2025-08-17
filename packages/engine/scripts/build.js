#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

// 颜色输出
const colors = {
  reset: '\x1B[0m',
  bright: '\x1B[1m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  magenta: '\x1B[35m',
  cyan: '\x1B[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'cyan')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

// 执行命令
function exec(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: rootDir,
      stdio: 'inherit',
      ...options,
    })
    return result
  }
  catch (error) {
    logError(`Command failed: ${command}`)
    throw error
  }
}

// 清理目录
function cleanDirs() {
  logStep('CLEAN', '清理构建目录...')

  const dirsToClean = ['dist', 'lib', 'es', 'types']

  dirsToClean.forEach((dir) => {
    const dirPath = resolve(rootDir, dir)
    if (existsSync(dirPath)) {
      exec(`rimraf ${dir}`)
      log(`  已清理: ${dir}`, 'yellow')
    }
  })

  logSuccess('构建目录清理完成')
}

// 类型检查
function typeCheck() {
  logStep('TYPE', '执行类型检查...')

  try {
    exec('npx tsc --noEmit --skipLibCheck')
    logSuccess('类型检查通过')
  }
  catch (error) {
    logError('类型检查失败')
    throw error
  }
}

// 执行构建
function build() {
  logStep('BUILD', '执行 Rollup 构建...')

  try {
    exec('npx rollup -c')
    logSuccess('Rollup 构建完成')
  }
  catch (error) {
    logError('Rollup 构建失败')
    throw error
  }
}

// 生成类型定义
function generateTypes() {
  logStep('TYPES', '生成类型定义文件...')

  try {
    // 确保 types 目录存在
    const typesDir = resolve(rootDir, 'types')
    if (!existsSync(typesDir)) {
      mkdirSync(typesDir, { recursive: true })
    }

    // 生成类型定义
    exec('npx tsc --declaration --emitDeclarationOnly --outDir types')
    logSuccess('类型定义生成完成')
  }
  catch (error) {
    logError('类型定义生成失败')
    throw error
  }
}

// 复制额外文件
function copyFiles() {
  logStep('COPY', '复制额外文件...')

  const filesToCopy = [
    { src: 'README.md', dest: 'dist/README.md' },
    { src: 'package.json', dest: 'dist/package.json' },
    { src: '../../LICENSE', dest: 'dist/LICENSE' },
  ]

  filesToCopy.forEach(({ src, dest }) => {
    const srcPath = resolve(rootDir, src)
    const destPath = resolve(rootDir, dest)

    if (existsSync(srcPath)) {
      try {
        const content = readFileSync(srcPath, 'utf-8')

        // 确保目标目录存在
        const destDir = dirname(destPath)
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true })
        }

        writeFileSync(destPath, content)
        log(`  已复制: ${src} -> ${dest}`, 'yellow')
      }
      catch (error) {
        logWarning(`复制文件失败: ${src}`)
      }
    }
  })

  logSuccess('文件复制完成')
}

// 生成包信息
function generatePackageInfo() {
  logStep('INFO', '生成包信息...')

  try {
    const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8'))

    const buildInfo = {
      name: pkg.name,
      version: pkg.version,
      buildTime: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    }

    writeFileSync(
      resolve(rootDir, 'dist/build-info.json'),
      JSON.stringify(buildInfo, null, 2),
    )

    logSuccess('包信息生成完成')
  }
  catch (error) {
    logWarning('包信息生成失败')
  }
}

// 验证构建结果
function validateBuild() {
  logStep('VALIDATE', '验证构建结果...')

  const requiredFiles = [
    'dist/index.js',
    'dist/ldesign-engine.js',
    'dist/ldesign-engine.min.js',
    'lib/index.js',
    'types/index.d.ts',
  ]

  let allValid = true

  requiredFiles.forEach((file) => {
    const filePath = resolve(rootDir, file)
    if (existsSync(filePath)) {
      log(`  ✅ ${file}`, 'green')
    }
    else {
      log(`  ❌ ${file}`, 'red')
      allValid = false
    }
  })

  if (allValid) {
    logSuccess('构建结果验证通过')
  }
  else {
    logError('构建结果验证失败')
    throw new Error('Missing required build files')
  }
}

// 分析包大小
function analyzeBundleSize() {
  logStep('ANALYZE', '分析包大小...')

  try {
    const files = [
      'dist/index.js',
      'dist/ldesign-engine.js',
      'dist/ldesign-engine.min.js',
    ]

    files.forEach((file) => {
      const filePath = resolve(rootDir, file)
      if (existsSync(filePath)) {
        const stats = readFileSync(filePath)
        const sizeKB = (stats.length / 1024).toFixed(2)
        log(`  ${file}: ${sizeKB} KB`, 'blue')
      }
    })

    logSuccess('包大小分析完成')
  }
  catch (error) {
    logWarning('包大小分析失败')
  }
}

// 主构建流程
async function main() {
  const startTime = Date.now()

  log('🚀 开始构建 LDesign Engine...', 'bright')
  log('', 'reset')

  try {
    // 1. 清理
    cleanDirs()

    // 2. 类型检查
    typeCheck()

    // 3. 构建
    build()

    // 4. 生成类型定义
    generateTypes()

    // 5. 复制文件
    copyFiles()

    // 6. 生成包信息
    generatePackageInfo()

    // 7. 验证构建结果
    validateBuild()

    // 8. 分析包大小
    analyzeBundleSize()

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    log('', 'reset')
    log(`🎉 构建完成! 耗时: ${duration}s`, 'bright')
  }
  catch (error) {
    log('', 'reset')
    logError('构建失败!')
    console.error(error)
    process.exit(1)
  }
}

// 处理命令行参数
const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
LDesign Engine 构建脚本

用法:
  node scripts/build.js [选项]

选项:
  --help, -h     显示帮助信息
  --clean        仅清理构建目录
  --types        仅生成类型定义
  --analyze      仅分析包大小

示例:
  node scripts/build.js          # 完整构建
  node scripts/build.js --clean  # 仅清理
  node scripts/build.js --types  # 仅生成类型
`)
  process.exit(0)
}

if (args.includes('--clean')) {
  cleanDirs()
  process.exit(0)
}

if (args.includes('--types')) {
  generateTypes()
  process.exit(0)
}

if (args.includes('--analyze')) {
  analyzeBundleSize()
  process.exit(0)
}

// 执行主构建流程
main()
