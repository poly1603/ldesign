/**
 * HTTP服务器
 * 提供HTTP服务器功能，支持中间件、路由、静态文件服务等
 */

import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import type { HttpContext, HttpServerOptions, Middleware, RouteHandler } from '../types'
import { EventEmitter } from 'node:events'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { createServer as createHttpsServer } from 'node:https'
import { extname, join } from 'node:path'
import { NetworkError } from '../types'

/**
 * HTTP服务器类
 */
export class HttpServer extends EventEmitter {
  private server: Server | null = null
  private options: (
    HttpServerOptions & {
      port: number
      host: string
      https: boolean
      cors: any
      compression: boolean
      bodyParser: boolean
      maxBodySize: number
      timeout: number
      keepAliveTimeout: number
      httpsOptions?: any
    }
  )

  private routes: Map<string, Map<string, RouteHandler>> = new Map()
  private middlewares: Middleware[] = []
  private staticDirs: Map<string, string> = new Map()

  constructor(options: HttpServerOptions = {}) {
    super()

    this.options = {
      port: 3000,
      host: 'localhost',
      https: false,
      cors: false,
      compression: false,
      bodyParser: true,
      maxBodySize: 1024 * 1024, // 1MB
      timeout: 30000,
      keepAliveTimeout: 5000,
      ...options,
    }

    this.initializeRoutes()
  }

  /**
   * 初始化路由映射
   */
  private initializeRoutes(): void {
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
    for (const method of methods) {
      this.routes.set(method, new Map())
    }
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    if (this.server) {
      throw new NetworkError('Server is already running', undefined, undefined)
    }

    return new Promise((resolve, reject) => {
      try {
        this.server = this.options.https
          ? createHttpsServer(this.options.httpsOptions || {}, this.handleRequest.bind(this))
          : createServer(this.handleRequest.bind(this))

        this.server.timeout = this.options.timeout
        this.server.keepAliveTimeout = this.options.keepAliveTimeout

        this.server.on('error', (error) => {
          this.emit('error', error)
          reject(error)
        })

        this.server.on('listening', () => {
          const address = this.server!.address()
          this.emit('listening', address)
          resolve()
        })

        this.server.on('connection', (socket) => {
          this.emit('connection', socket)
        })

        this.server.on('close', () => {
          this.emit('close')
        })

        this.server.listen(this.options.port, this.options.host)
      }
      catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 停止服务器
   */
  async stop(): Promise<void> {
    if (!this.server) {
      return
    }

    return new Promise((resolve, reject) => {
      this.server!.close((error) => {
        if (error) {
          reject(error)
        }
        else {
          this.server = null
          resolve()
        }
      })
    })
  }

  /**
   * 处理HTTP请求
   */
  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const startTime = Date.now()

    try {
      // 创建上下文
      const context = await this.createContext(req, res)

      this.emit('request', context)

      // 应用CORS
      if (this.options.cors) {
        this.applyCors(context)
      }

      // 执行中间件和路由处理
      await this.executeMiddlewares(context)

      if (!context.response.headersSent) {
        await this.executeRoute(context)
      }

      // 如果没有响应，返回404
      if (!context.response.headersSent) {
        context.response.status(404).send('Not Found')
      }

      const duration = Date.now() - startTime
      this.emit('response', { context, duration })
    }
    catch (error) {
      this.handleError(error as Error, req, res)
    }
  }

  /**
   * 创建请求上下文
   */
  private async createContext(req: IncomingMessage, res: ServerResponse): Promise<HttpContext> {
    const base = `${this.options.https ? 'https' : 'http'}://${this.options.host}:${this.options.port}`
    const parsedUrl = new URL(req.url || '/', base)

    // 解析请求体
    let body: any = null
    if (this.options.bodyParser && req.method !== 'GET' && req.method !== 'HEAD') {
      body = await this.parseBody(req)
    }

    const context: HttpContext = {
      request: {
        method: req.method || 'GET',
        url: req.url || '/',
        path: parsedUrl.pathname || '/',
        query: Object.fromEntries(parsedUrl.searchParams.entries()),
        headers: req.headers,
        body,
        params: {},
        ip: req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
      },
      response: {
        status: (code: number) => {
          res.statusCode = code
          return context.response
        },
        header: (name: string, value: string) => {
          res.setHeader(name, value)
          return context.response
        },
        headers: (headers: Record<string, string>) => {
          for (const [name, value] of Object.entries(headers)) {
            res.setHeader(name, value)
          }
          return context.response
        },
        send: (data: any) => {
          if (typeof data === 'object') {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
          }
          else {
            res.end(String(data))
          }
        },
        json: (data: any) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        },
        file: (filePath: string) => {
          this.sendFile(filePath, res)
        },
        redirect: (url: string, status = 302) => {
          res.statusCode = status
          res.setHeader('Location', url)
          res.end()
        },
        headersSent: false,
      },
      state: {},
    }

    // 更新headersSent状态
    Object.defineProperty(context.response, 'headersSent', {
      get: () => res.headersSent,
    })

    return context
  }

  /**
   * 解析请求体
   */
  private async parseBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = ''
      let size = 0

      req.on('data', (chunk) => {
        size += chunk.length
        if (size > this.options.maxBodySize) {
          reject(new NetworkError('Request body too large', undefined, undefined))
          return
        }
        body += chunk.toString()
      })

      req.on('end', () => {
        try {
          const contentType = req.headers['content-type'] || ''

          if (contentType.includes('application/json')) {
            resolve(JSON.parse(body))
          }
          else if (contentType.includes('application/x-www-form-urlencoded')) {
            const params = new URLSearchParams(body)
            const result: Record<string, any> = {}
            for (const [key, value] of params) {
              result[key] = value
            }
            resolve(result)
          }
          else {
            resolve(body)
          }
        }
        catch (error) {
          reject(error)
        }
      })

      req.on('error', reject)
    })
  }

  /**
   * 应用CORS
   */
  private applyCors(context: HttpContext): void {
    const corsOptions = typeof this.options.cors === 'object' ? this.options.cors : {}

    context.response.header('Access-Control-Allow-Origin', corsOptions.origin || '*')
    context.response.header(
      'Access-Control-Allow-Methods',
      corsOptions.methods || 'GET,HEAD,PUT,PATCH,POST,DELETE',
    )
    context.response.header(
      'Access-Control-Allow-Headers',
      corsOptions.headers || 'Content-Type,Authorization',
    )

    if (corsOptions.credentials) {
      context.response.header('Access-Control-Allow-Credentials', 'true')
    }

    // 处理预检请求
    if (context.request.method === 'OPTIONS') {
      context.response.status(204).send('')
    }
  }

  /**
   * 执行中间件
   */
  private async executeMiddlewares(context: HttpContext): Promise<void> {
    for (const middleware of this.middlewares) {
      let nextCalled = false

      const next = () => {
        nextCalled = true
      }

      await middleware(context, next)

      if (!nextCalled || context.response.headersSent) {
        break
      }
    }
  }

  /**
   * 执行路由处理
   */
  private async executeRoute(context: HttpContext): Promise<void> {
    const methodRoutes = this.routes.get(context.request.method)
    if (!methodRoutes) {
      return
    }

    // 检查静态文件
    if (context.request.method === 'GET') {
      const staticFile = this.findStaticFile(context.request.path)
      if (staticFile) {
        context.response.file(staticFile)
        return
      }
    }

    // 查找匹配的路由
    for (const [pattern, handler] of methodRoutes) {
      const params = this.matchRoute(pattern, context.request.path)
      if (params !== null) {
        context.request.params = params
        await handler(context)
        return
      }
    }
  }

  /**
   * 匹配路由
   */
  private matchRoute(pattern: string, path: string): Record<string, string> | null {
    // 简单的路由匹配实现
    const patternParts = pattern.split('/')
    const pathParts = path.split('/')

    if (patternParts.length !== pathParts.length) {
      return null
    }

    const params: Record<string, string> = {}

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i]!
      const pathPart = pathParts[i]!

      if (patternPart.startsWith(':')) {
        // 参数匹配
        const paramName = patternPart.slice(1)
        params[paramName] = pathPart
      }
      else if (patternPart !== pathPart) {
        // 字面量不匹配
        return null
      }
    }

    return params
  }

  /**
   * 查找静态文件
   */
  private findStaticFile(path: string): string | null {
    for (const [prefix, dir] of this.staticDirs) {
      if (path.startsWith(prefix)) {
        const relativePath = path.slice(prefix.length)
        const filePath = join(dir, relativePath)

        if (existsSync(filePath) && statSync(filePath).isFile()) {
          return filePath
        }
      }
    }

    return null
  }

  /**
   * 发送文件
   */
  private sendFile(filePath: string, res: ServerResponse): void {
    if (!existsSync(filePath)) {
      res.statusCode = 404
      res.end('File not found')
      return
    }

    const stat = statSync(filePath)
    if (!stat.isFile()) {
      res.statusCode = 404
      res.end('Not a file')
      return
    }

    // 设置Content-Type
    const ext = extname(filePath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
    }

    const contentType = mimeTypes[ext] || 'application/octet-stream'
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', stat.size)

    // 流式传输文件
    const stream = createReadStream(filePath)
    stream.pipe(res)

    stream.on('error', () => {
      res.statusCode = 500
      res.end('Internal Server Error')
    })
  }

  /**
   * 处理错误
   */
  private handleError(error: Error, _req: IncomingMessage, res: ServerResponse): void {
    this.emit('error', error)

    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error.message,
        }),
      )
    }
  }

  /**
   * 添加中间件
   * @param middleware 中间件函数
   */
  use(middleware: Middleware): void {
    this.middlewares.push(middleware)
  }

  /**
   * 添加GET路由
   * @param path 路径
   * @param handler 处理函数
   */
  get(path: string, handler: RouteHandler): void {
    this.routes.get('GET')!.set(path, handler)
  }

  /**
   * 添加POST路由
   * @param path 路径
   * @param handler 处理函数
   */
  post(path: string, handler: RouteHandler): void {
    this.routes.get('POST')!.set(path, handler)
  }

  /**
   * 添加PUT路由
   * @param path 路径
   * @param handler 处理函数
   */
  put(path: string, handler: RouteHandler): void {
    this.routes.get('PUT')!.set(path, handler)
  }

  /**
   * 添加PATCH路由
   * @param path 路径
   * @param handler 处理函数
   */
  patch(path: string, handler: RouteHandler): void {
    this.routes.get('PATCH')!.set(path, handler)
  }

  /**
   * 添加DELETE路由
   * @param path 路径
   * @param handler 处理函数
   */
  delete(path: string, handler: RouteHandler): void {
    this.routes.get('DELETE')!.set(path, handler)
  }

  /**
   * 添加静态文件服务
   * @param prefix URL前缀
   * @param directory 目录路径
   */
  static(prefix: string, directory: string): void {
    this.staticDirs.set(prefix, directory)
  }

  /**
   * 获取服务器地址
   */
  getAddress(): { port: number, host: string, protocol: string } | null {
    if (!this.server || !this.server.listening) {
      return null
    }

    const address = this.server.address()
    if (typeof address === 'string') {
      return { port: 0, host: address, protocol: this.options.https ? 'https' : 'http' }
    }

    return {
      port: address?.port || this.options.port,
      host: address?.address || this.options.host,
      protocol: this.options.https ? 'https' : 'http',
    }
  }

  /**
   * 获取服务器URL
   */
  getUrl(): string | null {
    const address = this.getAddress()
    if (!address) {
      return null
    }

    return `${address.protocol}://${address.host}:${address.port}`
  }

  /**
   * 创建HTTP服务器实例
   * @param options 选项
   */
  static create(options: HttpServerOptions = {}): HttpServer {
    return new HttpServer(options)
  }
}
