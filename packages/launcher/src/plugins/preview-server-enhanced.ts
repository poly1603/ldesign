/**
 * 增强的预览服务器插件
 * 
 * 提供 GZIP 压缩、HTTP/2 支持、静态资源缓存等功能
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import type { Plugin, PreviewServer } from 'vite'
import compression from 'compression'
import { createReadStream, statSync } from 'fs'
import { extname, join } from 'path'
import { createHash } from 'crypto'
import { gzipSync, brotliCompressSync } from 'zlib'
import { Logger } from '../utils/logger'
import type { IncomingMessage, ServerResponse } from 'http'

export interface PreviewServerOptions {
  // 压缩配置
  compression?: {
    enabled?: boolean
    gzip?: boolean
    brotli?: boolean
    threshold?: number // 压缩阈值（字节）
  }
  // 缓存配置
  cache?: {
    enabled?: boolean
    maxAge?: number // 缓存时间（秒）
    etag?: boolean
    lastModified?: boolean
  }
  // HTTP/2 配置
  http2?: {
    enabled?: boolean
    push?: boolean
  }
  // 安全配置
  security?: {
    headers?: boolean
    csp?: string // Content Security Policy
  }
  // CORS 配置
  cors?: {
    enabled?: boolean
    origin?: string | string[]
    credentials?: boolean
  }
}

// MIME 类型映射
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
}

/**
 * 增强的预览服务器类
 */
export class EnhancedPreviewServer {
  private options: Required<PreviewServerOptions>
  private logger: Logger
  private etagCache: Map<string, string> = new Map()
  private compressionCache: Map<string, Buffer> = new Map()

  constructor(options: PreviewServerOptions = {}) {
    this.logger = new Logger('PreviewServer', {
      level: 'info',
      compact: true
    })

    // 默认配置
    this.options = {
      compression: {
        enabled: true,
        gzip: true,
        brotli: true,
        threshold: 1024, // 1KB
        ...options.compression
      },
      cache: {
        enabled: true,
        maxAge: 31536000, // 1年
        etag: true,
        lastModified: true,
        ...options.cache
      },
      http2: {
        enabled: false, // 需要 HTTPS
        push: false,
        ...options.http2
      },
      security: {
        headers: true,
        csp: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
        ...options.security
      },
      cors: {
        enabled: true,
        origin: '*',
        credentials: false,
        ...options.cors
      }
    }
  }

  /**
   * 创建预览服务器插件
   */
  createPlugin(): Plugin {
    const self = this

    return {
      name: 'launcher:preview-server-enhanced',
      
      configurePreviewServer(server: PreviewServer) {
        // 添加中间件
        server.middlewares.use((req, res, next) => {
          // 应用安全头
          if (self.options.security.headers) {
            self.applySecurityHeaders(res)
          }

          // 应用 CORS 头
          if (self.options.cors.enabled) {
            self.applyCorsHeaders(req, res)
          }

          // 处理静态资源
          if (req.method === 'GET' && req.url) {
            const handled = self.handleStaticAsset(req, res, server.config.build.outDir)
            if (handled) {
              return
            }
          }

          next()
        })

        // 启用压缩
        if (self.options.compression.enabled) {
          server.middlewares.use(compression({
            threshold: self.options.compression.threshold,
            level: 6
          }))
        }

        self.logger.success('预览服务器增强功能已启用')
        
        // 输出配置信息
        const features = []
        if (self.options.compression.enabled) {
          features.push('压缩')
        }
        if (self.options.cache.enabled) {
          features.push('缓存')
        }
        if (self.options.security.headers) {
          features.push('安全头')
        }
        if (self.options.cors.enabled) {
          features.push('CORS')
        }
        
        if (features.length > 0) {
          self.logger.info(`已启用: ${features.join(', ')}`)
        }
      }
    }
  }

  /**
   * 处理静态资源
   */
  private handleStaticAsset(req: IncomingMessage, res: ServerResponse, outDir: string): boolean {
    const url = req.url!
    const filePath = join(outDir, url)

    try {
      const stats = statSync(filePath)
      
      if (!stats.isFile()) {
        return false
      }

      // 设置 MIME 类型
      const ext = extname(filePath)
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream'
      res.setHeader('Content-Type', mimeType)

      // 处理缓存
      if (this.options.cache.enabled) {
        // 生成 ETag
        if (this.options.cache.etag) {
          const etag = this.generateETag(filePath, stats)
          res.setHeader('ETag', etag)

          // 检查 If-None-Match
          if (req.headers['if-none-match'] === etag) {
            res.statusCode = 304
            res.end()
            return true
          }
        }

        // 设置 Last-Modified
        if (this.options.cache.lastModified) {
          const lastModified = stats.mtime.toUTCString()
          res.setHeader('Last-Modified', lastModified)

          // 检查 If-Modified-Since
          const ifModifiedSince = req.headers['if-modified-since']
          if (ifModifiedSince && new Date(ifModifiedSince) >= stats.mtime) {
            res.statusCode = 304
            res.end()
            return true
          }
        }

        // 设置 Cache-Control
        const isImmutable = /\.[a-f0-9]{8,}\./i.test(url) // 带 hash 的文件
        if (isImmutable) {
          res.setHeader('Cache-Control', `public, max-age=${this.options.cache.maxAge}, immutable`)
        } else {
          res.setHeader('Cache-Control', `public, max-age=3600`) // 1小时
        }
      }

      // 处理压缩
      if (this.options.compression.enabled && stats.size > this.options.compression.threshold) {
        const acceptEncoding = req.headers['accept-encoding'] || ''
        
        if (this.options.compression.brotli && acceptEncoding.includes('br')) {
          const compressed = this.compressFile(filePath, 'br')
          res.setHeader('Content-Encoding', 'br')
          res.setHeader('Content-Length', compressed.length)
          res.end(compressed)
          return true
        } else if (this.options.compression.gzip && acceptEncoding.includes('gzip')) {
          const compressed = this.compressFile(filePath, 'gzip')
          res.setHeader('Content-Encoding', 'gzip')
          res.setHeader('Content-Length', compressed.length)
          res.end(compressed)
          return true
        }
      }

      // 发送原始文件
      res.setHeader('Content-Length', stats.size)
      createReadStream(filePath).pipe(res)
      return true

    } catch (error) {
      return false
    }
  }

  /**
   * 生成 ETag
   */
  private generateETag(filePath: string, stats: any): string {
    const cacheKey = `${filePath}:${stats.size}:${stats.mtime.getTime()}`
    
    if (this.etagCache.has(cacheKey)) {
      return this.etagCache.get(cacheKey)!
    }

    const hash = createHash('md5')
    hash.update(cacheKey)
    const etag = `"${hash.digest('hex')}"`
    
    this.etagCache.set(cacheKey, etag)
    return etag
  }

  /**
   * 压缩文件
   */
  private compressFile(filePath: string, encoding: 'gzip' | 'br'): Buffer {
    const cacheKey = `${filePath}:${encoding}`
    
    if (this.compressionCache.has(cacheKey)) {
      return this.compressionCache.get(cacheKey)!
    }

    const content = require('fs').readFileSync(filePath)
    const compressed = encoding === 'br' 
      ? brotliCompressSync(content)
      : gzipSync(content)
    
    this.compressionCache.set(cacheKey, compressed)
    return compressed
  }

  /**
   * 应用安全头
   */
  private applySecurityHeaders(res: ServerResponse): void {
    // 基本安全头
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Content Security Policy
    if (this.options.security.csp) {
      res.setHeader('Content-Security-Policy', this.options.security.csp)
    }

    // 其他安全相关
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  }

  /**
   * 应用 CORS 头
   */
  private applyCorsHeaders(req: IncomingMessage, res: ServerResponse): void {
    const origin = req.headers.origin

    if (Array.isArray(this.options.cors.origin)) {
      if (origin && this.options.cors.origin.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin)
      }
    } else {
      res.setHeader('Access-Control-Allow-Origin', this.options.cors.origin!)
    }

    if (this.options.cors.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true')
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    // 处理预检请求
    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
    }
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.etagCache.clear()
    this.compressionCache.clear()
    this.logger.info('缓存已清理')
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { etags: number; compressed: number; size: number } {
    let totalSize = 0
    
    for (const buffer of this.compressionCache.values()) {
      totalSize += buffer.length
    }
    
    return {
      etags: this.etagCache.size,
      compressed: this.compressionCache.size,
      size: totalSize
    }
  }
}

/**
 * 创建增强的预览服务器插件
 */
export function createEnhancedPreviewServerPlugin(options?: PreviewServerOptions): Plugin {
  const server = new EnhancedPreviewServer(options)
  return server.createPlugin()
}