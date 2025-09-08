import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { glob } from 'glob'
import { defineConfig } from 'rollup'
import { dts } from 'rollup-plugin-dts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

// 外部依赖
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'node:fs',
  'node:fs/promises',
  'node:path',
  'node:crypto',
  'node:os',
  'node:process',
  'node:child_process',
  'node:util',
  'node:stream',
  'node:events',
  'node:url',
  'node:buffer',
  'node:zlib',
  'node:http',
  'node:https',
  'node:net',
  'node:tls',
  'node:readline',
  'node:perf_hooks',
  'node:worker_threads',
  'node:cluster',
  'node:dgram',
  'node:dns',
  'node:timers',
  'node:timers/promises',
]

// 通用插件配置
const plugins = [
  nodeResolve({
    preferBuiltins: true,
    exportConditions: ['node'],
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: false,
    declarationMap: false,
  }),
]

// 主模块配置
const mainConfig = defineConfig({
  input: 'src/index.ts',
  external,
  plugins,
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
})

// ===================
// 高级配置选项
// ===================

// 构建配置
const BUILD_CONFIG = {
  // 支持的入口模式
  entryPatterns: [
    'src/*/index.ts', // 标准子模块入口
    'src/*/*/index.ts', // 嵌套子模块入口
    'src/**/*.entry.ts', // 自定义入口文件
  ],

  // 排除的模块和文件
  excludes: {
    modules: [
      'archive', // 暂时禁用，需要修复类型错误
      'test', // 测试目录
      'types', // 仅类型定义目录
      // 在这里添加其他需要排除的模块
    ],
    patterns: ['**/test/**', '**/*.test.ts', '**/*.spec.ts', '**/*.d.ts'],
  },

  // 输出配置
  output: {
    preserveModules: false, // 是否保持模块结构
    sourcemap: true, // 是否生成 sourcemap
    minify: false, // 是否压缩代码
  },

  // 是否启用详细日志
  verbose: process.env.ROLLUP_VERBOSE === 'true',
}

/**
 * 高级模块发现函数
 * @param {string|string[]} patterns - glob 模式（支持多个模式）
 * @param {object} options - 配置选项
 * @returns {object[]} 发现的模块配置数组
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

    // 收集所有匹配的文件
    allPatterns.forEach((pattern) => {
      const files = glob.sync(pattern, {
        cwd: baseDir,
        ignore: [...excludeModules.map(module => `src/${module}/**`), ...excludePatterns],
      })
      allFiles.push(...files)
    })

    // 去重并转换为模块配置
    const uniqueFiles = [...new Set(allFiles)]
    const entries = uniqueFiles
      .map((file) => {
        // 提取模块信息
        const moduleInfo = extractModuleInfo(file)
        if (!moduleInfo)
          return null

        // 验证文件是否存在
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
      console.log(`发现 ${entries.length} 个入口文件:`)
      entries.forEach((entry) => {
        console.log(`  - ${entry.name} (${entry.input})`)
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
 * @param {string} filePath - 文件路径
 * @returns {object | null} 模块信息
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

// 发现所有入口文件
const discoveredEntries = discoverEntries(BUILD_CONFIG.entryPatterns, {
  excludeModules: BUILD_CONFIG.excludes.modules,
  excludePatterns: BUILD_CONFIG.excludes.patterns,
  verbose: BUILD_CONFIG.verbose,
})

// 提取子模块名称（保持向后兼容）
const subModules = discoveredEntries.filter(entry => !entry.isCustomEntry).map(entry => entry.name)

if (BUILD_CONFIG.verbose || process.env.NODE_ENV !== 'production') {
  console.log('🎯 发现的模块入口:')
  console.log('├─ 标准模块:', subModules.length)
  console.log('├─ 自定义入口:', discoveredEntries.filter(e => e.isCustomEntry).length)
  console.log('└─ 总计:', discoveredEntries.length)
}

// 生成所有发现的入口配置
const dynamicConfigs = discoveredEntries.map((entry) => {
  const outputDir = entry.isNested ? entry.path : entry.name

  return defineConfig({
    input: entry.input,
    external,
    plugins,
    output: [
      {
        file: `dist/${outputDir}/index.cjs`,
        format: 'cjs',
        sourcemap: BUILD_CONFIG.output.sourcemap,
        exports: 'named',
        inlineDynamicImports: true,
      },
      {
        file: `dist/${outputDir}/index.js`,
        format: 'es',
        sourcemap: BUILD_CONFIG.output.sourcemap,
        inlineDynamicImports: true,
      },
    ],
  })
})

// 保持向后兼容的子模块配置（仅为标准模块）
const subModuleConfigs = subModules.map(module =>
  defineConfig({
    input: `src/${module}/index.ts`,
    external,
    plugins,
    output: [
      {
        file: `dist/${module}/index.cjs`,
        format: 'cjs',
        sourcemap: BUILD_CONFIG.output.sourcemap,
        exports: 'named',
        inlineDynamicImports: true,
      },
      {
        file: `dist/${module}/index.js`,
        format: 'es',
        sourcemap: BUILD_CONFIG.output.sourcemap,
        inlineDynamicImports: true,
      },
    ],
  }),
)

// 类型声明文件配置
const dtsConfig = defineConfig({
  input: 'src/index.ts',
  external,
  plugins: [dts()],
  output: {
    file: pkg.types,
    format: 'es',
  },
})

// 所有入口的类型声明配置
const dynamicDtsConfigs = discoveredEntries.map((entry) => {
  const outputDir = entry.isNested ? entry.path : entry.name

  return defineConfig({
    input: entry.input,
    external,
    plugins: [dts()],
    output: {
      file: `dist/${outputDir}/index.d.ts`,
      format: 'es',
    },
  })
})

// 保持向后兼容的子模块类型声明配置
const subModuleDtsConfigs = subModules.map(module =>
  defineConfig({
    input: `src/${module}/index.ts`,
    external,
    plugins: [dts()],
    output: {
      file: `dist/${module}/index.d.ts`,
      format: 'es',
    },
  }),
)

// 根据环境变量选择使用动态配置或传统配置
const USE_DYNAMIC_CONFIG = process.env.ROLLUP_DYNAMIC !== 'false'

if (BUILD_CONFIG.verbose) {
  console.log(`🔧 使用${USE_DYNAMIC_CONFIG ? '动态' : '传统'}配置模式`)
}

export default USE_DYNAMIC_CONFIG
  ? [mainConfig, ...dynamicConfigs, dtsConfig, ...dynamicDtsConfigs]
  : [mainConfig, ...subModuleConfigs, dtsConfig, ...subModuleDtsConfigs]
