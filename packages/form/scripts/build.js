#!/usr/bin/env node

const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

console.log('🚀 开始构建 @ldesign/form...')

// 清理 dist 目录
console.log('🧹 清理构建目录...')
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true })
}

// 跳过类型检查，直接构建
console.log('⚠️  跳过类型检查，直接构建...')

// 运行 Vite 构建
console.log('📦 构建库文件...')
try {
  execSync('npx vite build', { stdio: 'inherit' })
  console.log('✅ 库文件构建完成')
} catch (error) {
  console.error('❌ 构建失败')
  process.exit(1)
}

// 复制额外文件
console.log('📋 复制额外文件...')
const filesToCopy = ['README.md', 'LICENSE', 'CHANGELOG.md']

filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('dist', file))
    console.log(`✅ 复制 ${file}`)
  }
})

// 生成 package.json
console.log('📝 生成 package.json...')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

// 清理开发依赖和脚本
const distPackageJson = {
  ...packageJson,
  main: './index.cjs',
  module: './index.mjs',
  types: './index.d.ts',
  exports: {
    '.': {
      import: './index.mjs',
      require: './index.cjs',
      types: './index.d.ts',
    },
    './vanilla': {
      import: './vanilla.mjs',
      require: './vanilla.cjs',
      types: './vanilla.d.ts',
    },
    './components': {
      import: './components.mjs',
      require: './components.cjs',
      types: './components.d.ts',
    },
    './composables': {
      import: './composables.mjs',
      require: './composables.cjs',
      types: './composables.d.ts',
    },
    './utils': {
      import: './utils.mjs',
      require: './utils.cjs',
      types: './utils.d.ts',
    },
    './themes': {
      import: './themes.mjs',
      require: './themes.cjs',
      types: './themes.d.ts',
    },
    './style.css': './index.css',
  },
  files: ['dist', '*.d.ts', '*.mjs', '*.cjs', '*.js', '*.css'],
}

// 移除开发相关字段
delete distPackageJson.devDependencies
delete distPackageJson.scripts
delete distPackageJson.private

fs.writeFileSync(
  path.join('dist', 'package.json'),
  JSON.stringify(distPackageJson, null, 2)
)

console.log('✅ package.json 生成完成')

// 验证构建结果
console.log('🔍 验证构建结果...')
const distFiles = fs.readdirSync('dist')
const expectedFiles = ['index.mjs', 'index.cjs', 'index.css', 'package.json']

const missingFiles = expectedFiles.filter(file => !distFiles.includes(file))
if (missingFiles.length > 0) {
  console.error('❌ 缺少文件:', missingFiles)
  process.exit(1)
}

console.log('✅ 构建验证通过')
console.log('🎉 构建完成！')

// 显示构建统计
const stats = fs.statSync('dist')
console.log(`📊 构建统计:`)
console.log(`   - 输出目录: dist/`)
console.log(`   - 文件数量: ${distFiles.length}`)
console.log(`   - 构建时间: ${new Date().toLocaleString()}`)

// 显示文件大小
console.log(`📁 文件列表:`)
distFiles.forEach(file => {
  const filePath = path.join('dist', file)
  const stat = fs.statSync(filePath)
  const size = (stat.size / 1024).toFixed(2)
  console.log(`   - ${file}: ${size} KB`)
})
