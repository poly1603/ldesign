/**
 * 代码分割优化插件
 * 提供智能的代码分割策略
 */

import type { Plugin } from 'vite'
import type { CodeSplittingPluginConfig } from '../../types/plugins'

/**
 * 创建代码分割插件
 */
export function createCodeSplittingPlugin(config: CodeSplittingPluginConfig = {}): Plugin {
  const {
    enabled = true,
    options = {},
    apply = 'build',
    enforce,
  } = config

  const {
    strategy = 'vendor',
    minSize = 20000,
    maxSize = 244000,
    chunks = {},
    cacheGroups: _cacheGroups = {},
  } = options

  return {
    name: 'ldesign:code-splitting',
    apply,
    ...(enforce && { enforce }),

    config(config) {
      if (!enabled) return

      // 配置 Rollup 的代码分割选项
      config.build = config.build || {}
      config.build.rollupOptions = config.build.rollupOptions || {}
      config.build.rollupOptions.output = config.build.rollupOptions.output || {}

      const output = config.build.rollupOptions.output
      if (Array.isArray(output)) {
        output.forEach(o => applyCodeSplitting(o, strategy, chunks, minSize, maxSize))
      } else {
        applyCodeSplitting(output, strategy, chunks, minSize, maxSize)
      }

      console.log(`[Code Splitting] Using ${strategy} strategy`)
    },

    generateBundle(_options, bundle) {
      if (!enabled) return

      // 分析和优化代码分割结果
      analyzeChunks(bundle)
    },
  }
}

/**
 * 应用代码分割配置
 */
function applyCodeSplitting(
  output: any,
  strategy: string,
  chunks: Record<string, string[]>,
  _minSize: number,
  maxSize: number
) {
  switch (strategy) {
    case 'vendor':
      output.manualChunks = createVendorChunks()
      break
    case 'async':
      output.manualChunks = createAsyncChunks()
      break
    case 'manual':
      output.manualChunks = createManualChunks(chunks)
      break
    default:
      output.manualChunks = createVendorChunks()
  }

  // 设置块大小限制
  output.chunkSizeWarningLimit = maxSize / 1000 // 转换为 KB
}

/**
 * 创建供应商代码分割
 */
function createVendorChunks() {
  return (id: string) => {
    // 将 node_modules 中的依赖分离到 vendor 块
    if (id.includes('node_modules')) {
      // 进一步细分大型库
      if (id.includes('react') || id.includes('vue') || id.includes('lit')) {
        return 'framework'
      }
      if (id.includes('lodash') || id.includes('moment') || id.includes('date-fns')) {
        return 'utils'
      }
      if (id.includes('antd') || id.includes('element') || id.includes('@mui')) {
        return 'ui'
      }
      return 'vendor'
    }
    return undefined
  }
}

/**
 * 创建异步代码分割
 */
function createAsyncChunks() {
  return (id: string) => {
    // 基于路由或功能模块进行分割
    if (id.includes('/pages/') || id.includes('/views/')) {
      const match = id.match(/\/(pages|views)\/([^\/]+)/)
      if (match) {
        return `page-${match[2]}`
      }
    }

    if (id.includes('/components/')) {
      return 'components'
    }

    if (id.includes('node_modules')) {
      return 'vendor'
    }

    return undefined
  }
}

/**
 * 创建手动代码分割
 */
function createManualChunks(chunks: Record<string, string[]>) {
  return (id: string) => {
    for (const [chunkName, patterns] of Object.entries(chunks)) {
      for (const pattern of patterns) {
        if (id.includes(pattern)) {
          return chunkName
        }
      }
    }
    return undefined
  }
}

/**
 * 分析代码块
 */
function analyzeChunks(bundle: any) {
  const chunks: Array<{ name: string; size: number; modules: string[] }> = []

  for (const [fileName, chunk] of Object.entries(bundle)) {
    if ((chunk as any).type === 'chunk') {
      const chunkInfo = chunk as any
      chunks.push({
        name: fileName,
        size: chunkInfo.code ? Buffer.byteLength(chunkInfo.code, 'utf8') : 0,
        modules: chunkInfo.moduleIds || [],
      })
    }
  }

  // 排序并显示最大的代码块
  chunks.sort((a, b) => b.size - a.size)

  console.log('[Code Splitting] Chunk analysis:')
  chunks.slice(0, 10).forEach(chunk => {
    console.log(`  ${chunk.name}: ${formatBytes(chunk.size)} (${chunk.modules.length} modules)`)
  })

  // 检查是否有过大的代码块
  const oversizedChunks = chunks.filter(chunk => chunk.size > 500000) // 500KB
  if (oversizedChunks.length > 0) {
    console.warn('[Code Splitting] Warning: Large chunks detected:')
    oversizedChunks.forEach(chunk => {
      console.warn(`  ${chunk.name}: ${formatBytes(chunk.size)}`)
    })
  }
}

/**
 * 默认代码分割配置
 */
export const defaultCodeSplittingConfig: CodeSplittingPluginConfig = {
  enabled: true,
  apply: 'build',
  options: {
    strategy: 'vendor',
    minSize: 20000,
    maxSize: 244000,
    chunks: {},
    cacheGroups: {},
  },
}

/**
 * 创建 React 优化的代码分割
 */
export function createReactCodeSplittingPlugin(): Plugin {
  return createCodeSplittingPlugin({
    enabled: true,
    apply: 'build',
    options: {
      strategy: 'manual',
      chunks: {
        'react-vendor': ['react', 'react-dom', 'react-router'],
        'ui-vendor': ['antd', '@ant-design', '@mui'],
        'utils-vendor': ['lodash', 'moment', 'axios'],
      },
    },
  })
}

/**
 * 创建 Vue 优化的代码分割
 */
export function createVueCodeSplittingPlugin(): Plugin {
  return createCodeSplittingPlugin({
    enabled: true,
    apply: 'build',
    options: {
      strategy: 'manual',
      chunks: {
        'vue-vendor': ['vue', 'vue-router', 'vuex', 'pinia'],
        'ui-vendor': ['element-plus', 'ant-design-vue', 'vuetify'],
        'utils-vendor': ['lodash', 'moment', 'axios'],
      },
    },
  })
}

/**
 * 创建智能代码分割插件
 */
export function createSmartCodeSplittingPlugin(): Plugin {
  return createCodeSplittingPlugin({
    enabled: true,
    apply: 'build',
    options: {
      strategy: 'vendor',
      minSize: 10000,
      maxSize: 200000,
    },
  })
}

/**
 * 代码分割统计信息
 */
export interface CodeSplittingStats {
  /** 总代码块数量 */
  totalChunks: number
  /** 最大代码块大小 */
  maxChunkSize: number
  /** 最小代码块大小 */
  minChunkSize: number
  /** 平均代码块大小 */
  avgChunkSize: number
  /** 供应商代码块大小 */
  vendorChunkSize: number
  /** 应用代码块大小 */
  appChunkSize: number
}

/**
 * 创建带统计的代码分割插件
 */
export function createCodeSplittingPluginWithStats(
  config: CodeSplittingPluginConfig = {}
): { plugin: Plugin; getStats: () => CodeSplittingStats } {
  let stats: CodeSplittingStats = {
    totalChunks: 0,
    maxChunkSize: 0,
    minChunkSize: 0,
    avgChunkSize: 0,
    vendorChunkSize: 0,
    appChunkSize: 0,
  }

  const plugin = createCodeSplittingPlugin(config)

  // 重写 generateBundle 方法以收集统计信息
  const originalGenerateBundle = plugin.generateBundle
  plugin.generateBundle = function (options, bundle) {
    const chunks: number[] = []
    let vendorSize = 0
    let appSize = 0

    for (const [fileName, chunk] of Object.entries(bundle)) {
      if ((chunk as any).type === 'chunk') {
        const chunkInfo = chunk as any
        const size = chunkInfo.code ? Buffer.byteLength(chunkInfo.code, 'utf8') : 0
        chunks.push(size)

        if (fileName.includes('vendor') || fileName.includes('framework')) {
          vendorSize += size
        } else {
          appSize += size
        }
      }
    }

    stats = {
      totalChunks: chunks.length,
      maxChunkSize: Math.max(...chunks, 0),
      minChunkSize: Math.min(...chunks, 0),
      avgChunkSize: chunks.length > 0 ? chunks.reduce((a, b) => a + b, 0) / chunks.length : 0,
      vendorChunkSize: vendorSize,
      appChunkSize: appSize,
    }

    console.log(`[Code Splitting Stats] Chunks: ${stats.totalChunks}, Vendor: ${formatBytes(stats.vendorChunkSize)}, App: ${formatBytes(stats.appChunkSize)}`)

    return typeof originalGenerateBundle === 'function'
      ? originalGenerateBundle.call(this, options, bundle, true)
      : undefined
  }

  return {
    plugin,
    getStats: () => ({ ...stats }),
  }
}

/**
 * 格式化字节大小
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
