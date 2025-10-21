/**
 * 快速构建优化插件
 * 
 * 提供构建加速、缓存优化、并行处理等功能
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import type { Plugin, ResolvedConfig } from 'vite'
import { createHash } from 'crypto'
import fs from 'fs-extra'
import path from 'path'
import { Worker } from 'worker_threads'
import os from 'os'
import { Logger } from '../utils/logger'

export interface FastBuildOptions {
  // 缓存配置
  cache?: {
    enabled?: boolean
    directory?: string
    ttl?: number // 缓存有效期（毫秒）
  }
  // 并行配置
  parallel?: {
    enabled?: boolean
    workers?: number
  }
  // 预构建配置
  prebuild?: {
    enabled?: boolean
    include?: string[]
    exclude?: string[]
  }
  // 优化配置
  optimize?: {
    minify?: boolean
    treeshaking?: boolean
    splitChunks?: boolean
    compression?: boolean
  }
}

interface CacheEntry {
  hash: string
  content: any
  timestamp: number
}

/**
 * 快速构建插件
 */
export class FastBuildPlugin {
  private options: Required<FastBuildOptions>
  private cacheDir: string
  private cacheMap: Map<string, CacheEntry> = new Map()
  private logger: Logger
  private workers: Worker[] = []
  private workerPool: Worker[] = []
  private buildStartTime: number = 0

  constructor(options: FastBuildOptions = {}) {
    this.logger = new Logger('FastBuild', {
      level: 'info',
      compact: true
    })

    // 默认配置
    this.options = {
      cache: {
        enabled: true,
        directory: path.join(process.cwd(), 'node_modules', '.launcher-cache'),
        ttl: 7 * 24 * 60 * 60 * 1000, // 7天
        ...options.cache
      },
      parallel: {
        enabled: true,
        workers: Math.max(1, os.cpus().length - 1),
        ...options.parallel
      },
      prebuild: {
        enabled: true,
        include: [],
        exclude: [],
        ...options.prebuild
      },
      optimize: {
        minify: true,
        treeshaking: true,
        splitChunks: true,
        compression: true,
        ...options.optimize
      }
    }

    this.cacheDir = this.options.cache.directory!
    
    // 初始化缓存目录
    if (this.options.cache.enabled) {
      this.initCache()
    }
  }

  /**
   * 初始化缓存
   */
  private async initCache(): Promise<void> {
    try {
      await fs.ensureDir(this.cacheDir)
      
      // 加载现有缓存
      const cacheFile = path.join(this.cacheDir, 'build-cache.json')
      if (await fs.pathExists(cacheFile)) {
        const data = await fs.readJson(cacheFile)
        const now = Date.now()
        
        // 清理过期缓存
        for (const [key, entry] of Object.entries(data)) {
          const cacheEntry = entry as CacheEntry
          if (now - cacheEntry.timestamp < this.options.cache.ttl!) {
            this.cacheMap.set(key, cacheEntry)
          }
        }
        
        this.logger.info(`缓存已加载: ${this.cacheMap.size} 项`)
      }
    } catch (error) {
      this.logger.warn('缓存初始化失败', error)
    }
  }

  /**
   * 保存缓存
   */
  private async saveCache(): Promise<void> {
    if (!this.options.cache.enabled) return

    try {
      const cacheFile = path.join(this.cacheDir, 'build-cache.json')
      const data: Record<string, CacheEntry> = {}
      
      for (const [key, value] of this.cacheMap.entries()) {
        data[key] = value
      }
      
      await fs.writeJson(cacheFile, data, { spaces: 2 })
    } catch (error) {
      this.logger.warn('缓存保存失败', error)
    }
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(id: string, content: string): string {
    const hash = createHash('md5')
    hash.update(id)
    hash.update(content)
    return hash.digest('hex')
  }

  /**
   * 获取缓存
   */
  private getCache(key: string): any {
    if (!this.options.cache.enabled) return null

    const entry = this.cacheMap.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > this.options.cache.ttl!) {
      this.cacheMap.delete(key)
      return null
    }

    return entry.content
  }

  /**
   * 设置缓存
   */
  private setCache(key: string, content: any): void {
    if (!this.options.cache.enabled) return

    this.cacheMap.set(key, {
      hash: key,
      content,
      timestamp: Date.now()
    })
  }

  /**
   * 创建 Vite 插件
   */
  createPlugin(): Plugin {
    const self = this

    return {
      name: 'launcher:fast-build',
      enforce: 'pre',

      configResolved(config: ResolvedConfig) {
        // 应用构建优化配置
        if (config.build) {
          // 启用代码分割
          if (self.options.optimize.splitChunks) {
            config.build.rollupOptions = config.build.rollupOptions || {}
            config.build.rollupOptions.output = config.build.rollupOptions.output || {}
            
            if (typeof config.build.rollupOptions.output === 'object') {
              config.build.rollupOptions.output.manualChunks = (id: string) => {
                // 智能代码分割策略
                if (id.includes('node_modules')) {
                  // 框架核心
                  if (id.includes('vue') || id.includes('@vue')) {
                    return 'vue'
                  }
                  if (id.includes('react') || id.includes('react-dom')) {
                    return 'react'
                  }
                  
                  // UI 库
                  if (id.includes('element-plus') || id.includes('ant-design') || id.includes('arco-design')) {
                    return 'ui'
                  }
                  
                  // 工具库
                  if (id.includes('lodash') || id.includes('moment') || id.includes('date-fns') || id.includes('dayjs')) {
                    return 'utils'
                  }
                  
                  // 图表库
                  if (id.includes('echarts') || id.includes('chart')) {
                    return 'charts'
                  }
                  
                  // 编辑器
                  if (id.includes('monaco') || id.includes('codemirror')) {
                    return 'editor'
                  }
                  
                  // @ldesign 包
                  if (id.includes('@ldesign')) {
                    return 'ldesign'
                  }
                  
                  // 其他第三方库
                  return 'vendor'
                }
              }

              // 优化chunk大小
              config.build.rollupOptions.output.chunkFileNames = (chunkInfo) => {
                const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk'
                return `js/[name]-${facadeModuleId}-[hash].js`
              }
            }
          }

          // 启用压缩
          if (self.options.optimize.minify) {
            config.build.minify = 'terser'
            config.build.terserOptions = {
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.debug'],
                passes: 2
              },
              format: {
                comments: false
              }
            }
          }

          // 启用 tree-shaking
          if (self.options.optimize.treeshaking) {
            config.build.rollupOptions = config.build.rollupOptions || {}
            config.build.rollupOptions.treeshake = {
              moduleSideEffects: false,
              propertyReadSideEffects: false,
              tryCatchDeoptimization: false
            }
          }

          // 设置更高的chunk大小警告阈值
          config.build.chunkSizeWarningLimit = 1000 // 1MB
        }
      },

      buildStart() {
        self.buildStartTime = Date.now()
        self.logger.time('build')
        self.logger.start('构建开始...')
      },

      async transform(code: string, id: string) {
        // 跳过node_modules
        if (id.includes('node_modules')) {
          return null
        }

        // 检查缓存
        const cacheKey = self.getCacheKey(id, code)
        const cached = self.getCache(cacheKey)
        if (cached) {
          return cached
        }

        // 这里可以添加代码转换逻辑
        // 例如：移除调试代码、优化导入等

        return null
      },

      async buildEnd() {
        const duration = Date.now() - self.buildStartTime
        self.logger.timeEnd('build', `构建完成`)
        
        // 保存缓存
        await self.saveCache()
        
        // 输出构建统计
        self.logger.success(`构建耗时: ${(duration / 1000).toFixed(2)}s`)
        self.logger.info(`缓存项数: ${self.cacheMap.size}`)
      },

      async closeBundle() {
        // 清理资源
        for (const worker of self.workers) {
          await worker.terminate()
        }
        self.workers = []
      }
    }
  }

  /**
   * 创建预构建插件
   */
  createPrebuildPlugin(): Plugin {
    const self = this

    return {
      name: 'launcher:prebuild',
      enforce: 'pre',

      async configResolved(config: ResolvedConfig) {
        if (!self.options.prebuild.enabled) return

        const deps = await self.scanDependencies(config.root)
        
        // 添加到优化依赖中
        config.optimizeDeps = config.optimizeDeps || {}
        config.optimizeDeps.include = config.optimizeDeps.include || []
        
        // 合并依赖
        const toInclude = [
          ...config.optimizeDeps.include,
          ...deps.filter(dep => !self.options.prebuild.exclude?.includes(dep)),
          ...self.options.prebuild.include!
        ]
        
        // 去重
        config.optimizeDeps.include = [...new Set(toInclude)]
        
        if (config.optimizeDeps.include.length > 0) {
          self.logger.info(`预构建依赖: ${config.optimizeDeps.include.length} 个`)
        }
      }
    }
  }

  /**
   * 扫描项目依赖
   */
  private async scanDependencies(root: string): Promise<string[]> {
    const deps: string[] = []
    
    try {
      const pkgPath = path.join(root, 'package.json')
      if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJson(pkgPath)
        
        // 收集生产依赖
        if (pkg.dependencies) {
          deps.push(...Object.keys(pkg.dependencies))
        }
        
        // 可选：也包括开发依赖中的常用库
        if (pkg.devDependencies) {
          const commonDevDeps = ['@vitejs/plugin-vue', '@vitejs/plugin-react']
          for (const dep of commonDevDeps) {
            if (pkg.devDependencies[dep]) {
              deps.push(dep)
            }
          }
        }
      }
    } catch (error) {
      this.logger.warn('扫描依赖失败', error)
    }
    
    return deps
  }

  /**
   * 清理缓存
   */
  async clearCache(): Promise<void> {
    if (await fs.pathExists(this.cacheDir)) {
      await fs.remove(this.cacheDir)
      this.logger.success('缓存已清理')
    }
    this.cacheMap.clear()
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { count: number; size: number } {
    let totalSize = 0
    
    for (const entry of this.cacheMap.values()) {
      totalSize += JSON.stringify(entry.content).length
    }
    
    return {
      count: this.cacheMap.size,
      size: totalSize
    }
  }
}

/**
 * 创建快速构建插件
 */
export function createFastBuildPlugin(options?: FastBuildOptions): Plugin[] {
  const fastBuild = new FastBuildPlugin(options)
  
  return [
    fastBuild.createPlugin(),
    fastBuild.createPrebuildPlugin()
  ]
}