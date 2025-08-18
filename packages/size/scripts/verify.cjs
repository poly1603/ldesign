#!/usr/bin/env node

/**
 * 项目验证脚本
 * 验证项目的完整性和正确性
 */

const fs = require('node:fs')
const path = require('node:path')

console.log('🔍 开始验证 @ldesign/size 项目...\n')

// 验证项目结构
function verifyProjectStructure() {
  console.log('📁 验证项目结构...')

  const requiredDirs = [
    'src',
    'src/core',
    'src/vue',
    'src/utils',
    'src/types',
    'src/__tests__',
    'dist',
    'es',
    'lib',
    'types',
    'docs',
    'examples',
    'summary',
  ]

  const requiredFiles = [
    'package.json',
    'README.md',
    'tsconfig.json',
    'rollup.config.js',
    'vitest.config.ts',
    'src/index.ts',
    'src/core/presets.ts',
    'src/core/css-generator.ts',
    'src/core/css-injector.ts',
    'src/core/size-manager.ts',
    'src/vue/index.ts',
    'src/vue/plugin.ts',
    'src/vue/composables.ts',
    'src/vue/SizeSwitcher.tsx',
  ]

  let allExists = true

  // 检查目录
  requiredDirs.forEach((dir) => {
    if (fs.existsSync(path.join(__dirname, '..', dir))) {
      console.log(`  ✅ ${dir}/`)
    }
    else {
      console.log(`  ❌ ${dir}/ (缺失)`)
      allExists = false
    }
  })

  // 检查文件
  requiredFiles.forEach((file) => {
    if (fs.existsSync(path.join(__dirname, '..', file))) {
      console.log(`  ✅ ${file}`)
    }
    else {
      console.log(`  ❌ ${file} (缺失)`)
      allExists = false
    }
  })

  return allExists
}

// 验证构建产物
function verifyBuildArtifacts() {
  console.log('\n🏗️ 验证构建产物...')

  const buildArtifacts = [
    'dist/index.js',
    'dist/index.d.ts',
    'es/index.js',
    'lib/index.js',
    'types/index.d.ts',
  ]

  let allExists = true

  buildArtifacts.forEach((artifact) => {
    if (fs.existsSync(path.join(__dirname, '..', artifact))) {
      console.log(`  ✅ ${artifact}`)
    }
    else {
      console.log(`  ❌ ${artifact} (缺失)`)
      allExists = false
    }
  })

  return allExists
}

// 验证package.json
function verifyPackageJson() {
  console.log('\n📦 验证 package.json...')

  const packagePath = path.join(__dirname, '..', 'package.json')
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

  const requiredFields = [
    'name',
    'version',
    'description',
    'main',
    'module',
    'types',
    'exports',
  ]
  const requiredScripts = ['build', 'dev', 'test', 'test:run', 'type-check']

  let isValid = true

  // 检查必需字段
  requiredFields.forEach((field) => {
    if (pkg[field]) {
      console.log(
        `  ✅ ${field}: ${
          typeof pkg[field] === 'string' ? pkg[field] : 'defined'
        }`,
      )
    }
    else {
      console.log(`  ❌ ${field} (缺失)`)
      isValid = false
    }
  })

  // 检查脚本
  requiredScripts.forEach((script) => {
    if (pkg.scripts && pkg.scripts[script]) {
      console.log(`  ✅ scripts.${script}`)
    }
    else {
      console.log(`  ❌ scripts.${script} (缺失)`)
      isValid = false
    }
  })

  return isValid
}

// 验证文档
function verifyDocumentation() {
  console.log('\n📚 验证文档...')

  const docFiles = [
    'README.md',
    'docs/README.md',
    'docs/getting-started/installation.md',
    'docs/api/core.md',
    'summary/project-overview.md',
    'summary/design-philosophy.md',
    'summary/architecture-design.md',
    'summary/implementation-details.md',
    'summary/usage-guide.md',
    'summary/extensibility-design.md',
    'summary/project-summary.md',
  ]

  let allExists = true

  docFiles.forEach((file) => {
    const filePath = path.join(__dirname, '..', file)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      if (content.length > 100) {
        console.log(`  ✅ ${file} (${Math.round(content.length / 1024)}KB)`)
      }
      else {
        console.log(`  ⚠️ ${file} (内容过少)`)
      }
    }
    else {
      console.log(`  ❌ ${file} (缺失)`)
      allExists = false
    }
  })

  return allExists
}

// 验证示例项目
function verifyExamples() {
  console.log('\n🎯 验证示例项目...')

  const examples = [
    'examples/vue/package.json',
    'examples/vue/src/App.vue',
    'examples/vue/src/main.ts',
    'examples/vanilla/package.json',
    'examples/vanilla/src/main.ts',
    'examples/vanilla/index.html',
  ]

  let allExists = true

  examples.forEach((file) => {
    if (fs.existsSync(path.join(__dirname, '..', file))) {
      console.log(`  ✅ ${file}`)
    }
    else {
      console.log(`  ❌ ${file} (缺失)`)
      allExists = false
    }
  })

  return allExists
}

// 主验证函数
function main() {
  const results = [
    verifyProjectStructure(),
    verifyBuildArtifacts(),
    verifyPackageJson(),
    verifyDocumentation(),
    verifyExamples(),
  ]

  const allPassed = results.every(result => result)

  console.log(`\n${'='.repeat(50)}`)

  if (allPassed) {
    console.log('🎉 所有验证通过！项目结构完整且正确。')
    console.log('\n📊 项目统计:')

    // 统计代码行数
    const srcFiles = getAllFiles(
      path.join(__dirname, '..', 'src'),
      '.ts',
      '.tsx',
    )
    const totalLines = srcFiles.reduce((total, file) => {
      const content = fs.readFileSync(file, 'utf8')
      return total + content.split('\n').length
    }, 0)

    console.log(`  - 源代码文件: ${srcFiles.length} 个`)
    console.log(`  - 代码总行数: ${totalLines} 行`)

    // 统计文档
    const docFiles = getAllFiles(path.join(__dirname, '..'), '.md')
    const docWords = docFiles.reduce((total, file) => {
      const content = fs.readFileSync(file, 'utf8')
      return total + content.length
    }, 0)

    console.log(`  - 文档文件: ${docFiles.length} 个`)
    console.log(`  - 文档总字数: ${Math.round(docWords / 1024)}KB`)

    console.log('\n🚀 项目已准备就绪，可以发布！')
    process.exit(0)
  }
  else {
    console.log('❌ 验证失败！请修复上述问题后重试。')
    process.exit(1)
  }
}

// 辅助函数：获取所有指定扩展名的文件
function getAllFiles(dir, ...extensions) {
  const files = []

  function traverse(currentDir) {
    if (!fs.existsSync(currentDir))
      return

    const items = fs.readdirSync(currentDir)

    items.forEach((item) => {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)

      if (
        stat.isDirectory()
        && !item.startsWith('.')
        && item !== 'node_modules'
      ) {
        traverse(fullPath)
      }
      else if (stat.isFile()) {
        const ext = path.extname(item)
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    })
  }

  traverse(dir)
  return files
}

// 运行验证
main()
