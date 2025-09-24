#!/usr/bin/env node

/**
 * 依赖分析脚本
 * 检查未使用的依赖、版本冲突等问题
 */

import { readdirSync, readFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const packageRoot = join(__dirname, '..')

/**
 * 读取 package.json
 */
function readPackageJson() {
  const packagePath = join(packageRoot, 'package.json')
  return JSON.parse(readFileSync(packagePath, 'utf8'))
}

/**
 * 扫描源代码中的导入
 */
function scanImports(dir, imports = new Set()) {
  const files = readdirSync(dir, { withFileTypes: true })

  for (const file of files) {
    const filePath = join(dir, file.name)

    if (file.isDirectory()) {
      // 跳过 node_modules 等目录
      if (['node_modules', 'dist', 'es', 'lib', 'coverage', '__tests__'].includes(file.name)) {
        continue
      }
      scanImports(filePath, imports)
    }
    else if (file.isFile()) {
      const ext = extname(file.name)
      if (['.ts', '.js', '.vue'].includes(ext)) {
        try {
          const content = readFileSync(filePath, 'utf8')

          // 匹配 import 语句
          const importRegex = /import\s+(?:[\w{},*]+(?:\s+as\s+\w+)?\s+from\s+)?['"]([^'"]+)['"]/g
          const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g

          let match
          let importMatch = importRegex.exec(content)
          while (importMatch !== null) {
            match = importMatch
            const importPath = match[1]
            if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
              // 提取包名（处理 scoped packages）
              const packageName = importPath.startsWith('@')
                ? importPath.split('/').slice(0, 2).join('/')
                : importPath.split('/')[0]
              imports.add(packageName)
            }
            importMatch = importRegex.exec(content)
          }

          let requireMatch = requireRegex.exec(content)
          while (requireMatch !== null) {
            match = requireMatch
            const importPath = match[1]
            if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
              const packageName = importPath.startsWith('@')
                ? importPath.split('/').slice(0, 2).join('/')
                : importPath.split('/')[0]
              imports.add(packageName)
            }
            requireMatch = requireRegex.exec(content)
          }
        }
        catch (error) {
          // 忽略读取错误
        }
      }
    }
  }

  return imports
}

/**
 * 分析依赖使用情况
 */
function analyzeDependencies() {
  const pkg = readPackageJson()
  const srcDir = join(packageRoot, 'src')

  // 扫描源代码中的导入
  const usedImports = scanImports(srcDir)

  // 获取所有依赖
  const dependencies = Object.keys(pkg.dependencies || {})
  const devDependencies = Object.keys(pkg.devDependencies || {})
  const peerDependencies = Object.keys(pkg.peerDependencies || {})

  // 分析结果
  const analysis = {
    used: {
      dependencies: [],
      devDependencies: [],
      peerDependencies: [],
    },
    unused: {
      dependencies: [],
      devDependencies: [],
      peerDependencies: [],
    },
    missing: [],
  }

  // 检查 dependencies
  for (const dep of dependencies) {
    if (usedImports.has(dep)) {
      analysis.used.dependencies.push(dep)
    }
    else {
      analysis.unused.dependencies.push(dep)
    }
  }

  // 检查 devDependencies（只检查在源代码中使用的）
  for (const dep of devDependencies) {
    if (usedImports.has(dep)) {
      analysis.used.devDependencies.push(dep)
    }
    else {
      analysis.unused.devDependencies.push(dep)
    }
  }

  // 检查 peerDependencies
  for (const dep of peerDependencies) {
    if (usedImports.has(dep)) {
      analysis.used.peerDependencies.push(dep)
    }
    else {
      analysis.unused.peerDependencies.push(dep)
    }
  }

  // 检查缺失的依赖
  const allDeclaredDeps = new Set([...dependencies, ...devDependencies, ...peerDependencies])
  for (const importedPkg of usedImports) {
    if (!allDeclaredDeps.has(importedPkg) && !importedPkg.startsWith('node:')) {
      analysis.missing.push(importedPkg)
    }
  }

  return analysis
}

/**
 * 生成依赖报告
 */
function generateReport() {
  console.log('📦 依赖分析报告')
  console.log('='.repeat(50))

  const analysis = analyzeDependencies()

  // 使用中的依赖
  console.log('\n✅ 使用中的依赖:')
  if (analysis.used.dependencies.length > 0) {
    console.log('   生产依赖:')
    analysis.used.dependencies.forEach(dep => console.log(`     - ${dep}`))
  }
  if (analysis.used.devDependencies.length > 0) {
    console.log('   开发依赖:')
    analysis.used.devDependencies.forEach(dep => console.log(`     - ${dep}`))
  }
  if (analysis.used.peerDependencies.length > 0) {
    console.log('   对等依赖:')
    analysis.used.peerDependencies.forEach(dep => console.log(`     - ${dep}`))
  }

  // 未使用的依赖
  const hasUnused = analysis.unused.dependencies.length > 0
    || analysis.unused.devDependencies.length > 0
    || analysis.unused.peerDependencies.length > 0

  if (hasUnused) {
    console.log('\n⚠️  可能未使用的依赖:')
    if (analysis.unused.dependencies.length > 0) {
      console.log('   生产依赖:')
      analysis.unused.dependencies.forEach(dep => console.log(`     - ${dep}`))
    }
    if (analysis.unused.devDependencies.length > 0) {
      console.log('   开发依赖:')
      analysis.unused.devDependencies.forEach(dep => console.log(`     - ${dep}`))
    }
    if (analysis.unused.peerDependencies.length > 0) {
      console.log('   对等依赖:')
      analysis.unused.peerDependencies.forEach(dep => console.log(`     - ${dep}`))
    }
  }
  else {
    console.log('\n✅ 没有发现未使用的依赖')
  }

  // 缺失的依赖
  if (analysis.missing.length > 0) {
    console.log('\n❌ 缺失的依赖:')
    analysis.missing.forEach(dep => console.log(`   - ${dep}`))
  }
  else {
    console.log('\n✅ 没有发现缺失的依赖')
  }

  // 总结
  console.log('\n📊 总结:')
  console.log(`   总依赖数: ${analysis.used.dependencies.length + analysis.used.devDependencies.length + analysis.used.peerDependencies.length + analysis.unused.dependencies.length + analysis.unused.devDependencies.length + analysis.unused.peerDependencies.length}`)
  console.log(`   使用中: ${analysis.used.dependencies.length + analysis.used.devDependencies.length + analysis.used.peerDependencies.length}`)
  console.log(`   未使用: ${analysis.unused.dependencies.length + analysis.unused.devDependencies.length + analysis.unused.peerDependencies.length}`)
  console.log(`   缺失: ${analysis.missing.length}`)

  return analysis
}

// 主函数
function main() {
  generateReport()
}

// 直接执行
main()

export { analyzeDependencies, generateReport }
