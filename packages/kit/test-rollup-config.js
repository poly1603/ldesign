#!/usr/bin/env node

/**
 * Rollup 配置测试脚本
 * 用于验证动态入口发现功能
 */

import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { glob } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 模拟配置参数
const BUILD_CONFIG = {
  entryPatterns: ['src/*/index.ts', 'src/*/*/index.ts', 'src/**/*.entry.ts'],

  excludes: {
    modules: ['archive', 'test', 'types'],
    patterns: ['**/test/**', '**/*.test.ts', '**/*.spec.ts', '**/*.d.ts'],
  },

  verbose: true,
}

/**
 * 高级模块发现函数
 */
function discoverEntries(patterns, options = {}) {
  const {
    excludeModules = [],
    excludePatterns = [],
    baseDir = __dirname,
    verbose = false,
  } = options

  try {
    const allPatterns = Array.isArray(patterns) ? patterns : [patterns]
    const allFiles = []

    allPatterns.forEach((pattern) => {
      const files = glob.sync(pattern, {
        cwd: baseDir,
        ignore: [...excludeModules.map(module => `src/${module}/**`), ...excludePatterns],
      })
      allFiles.push(...files)
    })

    const uniqueFiles = [...new Set(allFiles)]
    const entries = uniqueFiles
      .map((file) => {
        const moduleInfo = extractModuleInfo(file)
        if (!moduleInfo)
          return null

        const fullPath = resolve(baseDir, file)
        if (!existsSync(fullPath)) {
          if (verbose)
            console.warn(`文件不存在: ${file}`)
          return null
        }

        return {
          name: moduleInfo.name,
          path: moduleInfo.path,
          input: file,
          isNested: moduleInfo.isNested,
          isCustomEntry: moduleInfo.isCustomEntry,
        }
      })
      .filter(Boolean)

    if (verbose) {
      console.log(`\n🔍 发现 ${entries.length} 个入口文件:`)
      entries.forEach((entry, index) => {
        const icon = entry.isCustomEntry ? '📌' : entry.isNested ? '📂' : '📄'
        console.log(`  ${index + 1}. ${icon} ${entry.name}`)
        console.log(`     输入: ${entry.input}`)
        console.log(`     输出: dist/${entry.isNested ? entry.path : entry.name}/`)
        console.log('')
      })
    }

    return entries
  }
  catch (error) {
    console.error('发现入口文件时出错:', error.message)
    return []
  }
}

/**
 * 从文件路径中提取模块信息
 */
function extractModuleInfo(filePath) {
  // 规范化路径分隔符（Windows 兼容）
  const normalizedPath = filePath.replace(/\\/g, '/')

  // 标准模块: src/module/index.ts
  let match = normalizedPath.match(/src\/([^/]+)\/index\.ts$/)
  if (match) {
    return {
      name: match[1],
      path: match[1],
      isNested: false,
      isCustomEntry: false,
    }
  }

  // 嵌套模块: src/category/module/index.ts
  match = normalizedPath.match(/src\/([^/]+)\/([^/]+)\/index\.ts$/)
  if (match) {
    return {
      name: `${match[1]}-${match[2]}`,
      path: `${match[1]}/${match[2]}`,
      isNested: true,
      isCustomEntry: false,
    }
  }

  // 自定义入口: src/path/file.entry.ts
  match = normalizedPath.match(/src\/(.+)\/([^/]+)\.entry\.ts$/)
  if (match) {
    const dirPath = match[1].replace(/\//g, '-')
    const fileName = match[2]
    return {
      name: `${dirPath}-${fileName}`,
      path: `${match[1]}/${fileName}`,
      isNested: true,
      isCustomEntry: true,
    }
  }

  return null
}

// 执行测试
console.log('🚀 测试 Rollup 动态配置...\n')

const discoveredEntries = discoverEntries(BUILD_CONFIG.entryPatterns, {
  excludeModules: BUILD_CONFIG.excludes.modules,
  excludePatterns: BUILD_CONFIG.excludes.patterns,
  verbose: BUILD_CONFIG.verbose,
})

// 统计信息
const standardModules = discoveredEntries.filter(entry => !entry.isNested && !entry.isCustomEntry)
const nestedModules = discoveredEntries.filter(entry => entry.isNested && !entry.isCustomEntry)
const customEntries = discoveredEntries.filter(entry => entry.isCustomEntry)

console.log('📊 统计信息:')
console.log(`  标准模块: ${standardModules.length}`)
console.log(`  嵌套模块: ${nestedModules.length}`)
console.log(`  自定义入口: ${customEntries.length}`)
console.log(`  总计: ${discoveredEntries.length}`)

console.log('\n✨ 测试完成!')

// 如果有环境变量，也可以显示会生成的配置数量
if (process.env.SHOW_CONFIG_COUNT) {
  const configCount = discoveredEntries.length * 2 + 2 // 每个入口2个配置 + 主配置 + DTS配置
  console.log(`\n📦 将生成 ${configCount} 个 Rollup 配置`)
}
