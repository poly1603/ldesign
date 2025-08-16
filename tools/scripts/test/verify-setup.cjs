#!/usr/bin/env node

const { existsSync, readFileSync } = require('node:fs')
const process = require('node:process')

function log(message, level = 'info') {
  const prefix = level === 'success' ? '✅' : level === 'error' ? '❌' : 'ℹ️'
  console.log(`${prefix} ${message}`)
}

function test(name, condition, message) {
  return {
    name,
    passed: condition,
    message,
  }
}

function verifyProjectStructure() {
  log('验证项目结构...')
  const results = []

  // 检查根目录文件
  const rootFiles = [
    'README.md',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    'package.json',
    'pnpm-workspace.yaml',
    'tsconfig.json',
    'Dockerfile',
    'docker-compose.yml',
    '.gitignore',
    '.dockerignore',
  ]

  rootFiles.forEach(file => {
    results.push(
      test(
        `根目录文件: ${file}`,
        existsSync(file),
        `${file} ${existsSync(file) ? '存在' : '不存在'}`
      )
    )
  })

  // 检查目录结构
  const directories = [
    'packages',
    'docs',
    'tools',
    'tools/scripts',
    'tools/configs',
    'docker',
  ]

  directories.forEach(dir => {
    results.push(
      test(
        `目录: ${dir}`,
        existsSync(dir),
        `${dir} ${existsSync(dir) ? '存在' : '不存在'}`
      )
    )
  })

  return results
}

function verifyToolsStructure() {
  log('验证工具目录结构...')
  const results = []

  const toolsFiles = [
    'tools/README.md',
    'tools/scripts/build/build-manager.ts',
    'tools/scripts/build/version-manager.ts',
    'tools/scripts/deploy/publish-manager.ts',
    'tools/configs/publish.config.ts',
  ]

  toolsFiles.forEach(file => {
    results.push(
      test(
        `工具文件: ${file}`,
        existsSync(file),
        `${file} ${existsSync(file) ? '存在' : '不存在'}`
      )
    )
  })

  // 检查旧文件是否已移动
  const oldFiles = [
    'tools/git-commit.ts',
    'tools/build',
    'tools/deploy',
    'tools/package',
    'tools/release',
  ]

  oldFiles.forEach(file => {
    results.push(
      test(
        `旧文件已移动: ${file}`,
        !existsSync(file),
        `${file} ${existsSync(file) ? '仍然存在（应该已移动）' : '已移动'}`
      )
    )
  })

  return results
}

function verifyDocsStructure() {
  log('验证文档结构...')
  const results = []

  const docsFiles = [
    'docs/.vitepress/config.ts',
    'docs/guide/project-structure.md',
    'docs/reports',
    'docs/guide/DEVELOPMENT.md',
    'docs/guide/DEPLOYMENT.md',
  ]

  docsFiles.forEach(file => {
    results.push(
      test(
        `文档文件: ${file}`,
        existsSync(file),
        `${file} ${existsSync(file) ? '存在' : '不存在'}`
      )
    )
  })

  // 检查根目录是否已清理
  const rootDocsFiles = [
    'BUILD_REPORT.json',
    'BUILD_STATUS_REPORT.md',
    'DEPLOYMENT.md',
    'DEVELOPMENT.md',
    'README.en.md',
  ]

  rootDocsFiles.forEach(file => {
    results.push(
      test(
        `根目录文档已移动: ${file}`,
        !existsSync(file),
        `${file} ${
          existsSync(file) ? '仍在根目录（应该已移动）' : '已移动到docs'
        }`
      )
    )
  })

  return results
}

function verifyPackageJson() {
  log('验证package.json配置...')
  const results = []

  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))

    // 检查新的脚本
    const expectedScripts = [
      'build',
      'build:packages',
      'build:docs',
      'version:list',
      'publish',
      'publish:npm',
      'publish:private',
      'docker:build',
    ]

    expectedScripts.forEach(script => {
      results.push(
        test(
          `脚本: ${script}`,
          !!packageJson.scripts[script],
          `${script} ${packageJson.scripts[script] ? '已配置' : '未配置'}`
        )
      )
    })
  } catch (error) {
    results.push(
      test('package.json 解析', false, `无法解析 package.json: ${error}`)
    )
  }

  return results
}

function verifyDockerFiles() {
  log('验证Docker配置...')
  const results = []

  const dockerFiles = [
    'Dockerfile',
    'docker-compose.yml',
    'docker-compose.dev.yml',
    '.dockerignore',
    'docs/Dockerfile',
    'docker/nginx.conf',
    'docs/docker/nginx.conf',
  ]

  dockerFiles.forEach(file => {
    results.push(
      test(
        `Docker文件: ${file}`,
        existsSync(file),
        `${file} ${existsSync(file) ? '存在' : '不存在'}`
      )
    )
  })

  return results
}

function runVerification() {
  log('开始验证项目设置...', 'info')

  const allResults = [
    ...verifyProjectStructure(),
    ...verifyToolsStructure(),
    ...verifyDocsStructure(),
    ...verifyPackageJson(),
    ...verifyDockerFiles(),
  ]

  // 输出结果
  log('\n验证结果:', 'info')

  const passed = allResults.filter(r => r.passed).length
  const total = allResults.length

  allResults.forEach(result => {
    log(
      `${result.name}: ${result.message}`,
      result.passed ? 'success' : 'error'
    )
  })

  log(
    `\n总计: ${passed}/${total} 项检查通过`,
    passed === total ? 'success' : 'error'
  )

  if (passed < total) {
    log('存在问题需要修复', 'error')
    process.exit(1)
  } else {
    log('所有检查都通过了！', 'success')
  }
}

// 运行验证
if (require.main === module) {
  runVerification()
}

module.exports = { runVerification }
