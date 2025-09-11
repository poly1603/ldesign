#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 开始构建所有格式...')

// 清理之前的构建产物
console.log('🗑️  清理构建目录...')
const dirsToClean = ['es', 'cjs', 'dist']
dirsToClean.forEach(dir => {
  const dirPath = path.resolve(process.cwd(), dir)
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true })
    console.log(`   已清理: ${dir}/`)
  }
})

// 构建函数
function buildFormat(format) {
  console.log(`📦 构建${format.toUpperCase()}格式...`)
  
  // 创建临时配置文件
  const configContent = `
import { createPackageViteConfig } from '@ldesign/builder'

export default createPackageViteConfig({
  format: '${format}',
  enableCSS: true,
  lessOptions: {
    javascriptEnabled: true,
    additionalData: \`
      @import "@/styles/variables.less";
      @import "@/styles/mixins.less";
    \`,
    modifyVars: {}
  },
  external: ['lucide-vue-next'],
  globals: {
    'lucide-vue-next': 'LucideVueNext'
  }
})
`
  
  const tempConfigFile = `vite.config.${format}.ts`
  fs.writeFileSync(tempConfigFile, configContent)
  
  try {
    execSync(`npx vite build --config ${tempConfigFile}`, { 
      stdio: 'inherit',
      cwd: process.cwd() 
    })
    console.log(`✅ ${format.toUpperCase()}格式构建完成`)
  } catch (error) {
    console.error(`❌ ${format.toUpperCase()}格式构建失败:`, error.message)
  } finally {
    // 删除临时配置文件
    if (fs.existsSync(tempConfigFile)) {
      fs.unlinkSync(tempConfigFile)
    }
  }
}

// 构建所有格式
const formats = ['es', 'cjs']

// 检查是否存在 index-lib.ts，如果存在则构建 UMD
if (fs.existsSync(path.resolve('src', 'index-lib.ts'))) {
  formats.push('umd')
}

formats.forEach(format => {
  buildFormat(format)
})

console.log('🎉 所有格式构建完成!')

// 显示构建结果
console.log('\n📁 构建产物:')
formats.forEach(format => {
  const outputDir = format === 'umd' ? 'dist' : format
  if (fs.existsSync(outputDir)) {
    console.log(`\n📂 ${outputDir}/`)
    const files = fs.readdirSync(outputDir)
    files.forEach(file => {
      const filePath = path.join(outputDir, file)
      const stats = fs.statSync(filePath)
      if (stats.isFile()) {
        const size = (stats.size / 1024).toFixed(2)
        console.log(`   - ${file} (${size}KB)`)
      } else if (stats.isDirectory()) {
        console.log(`   - ${file}/`)
      }
    })
  }
})
