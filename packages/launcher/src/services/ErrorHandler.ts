import type {
  ErrorCode,
  IErrorHandler,
  LauncherError,
} from '../types/index.js'
import pc from 'picocolors'
import { ERROR_CODES } from '../types/index.js'

/**
 * 错误处理器实现类
 * 提供统一的错误处理、格式化和日志记录功能
 */
export class ErrorHandler implements IErrorHandler {
  private errorSuggestions: Map<string, string> = new Map()

  constructor() {
    this.initializeErrorSuggestions()
  }

  /**
   * 初始化错误建议映射
   */
  private initializeErrorSuggestions(): void {
    // 项目检测相关错误
    this.errorSuggestions.set(
      ERROR_CODES.PROJECT_TYPE_DETECTION_FAILED, 
      '请确保项目根目录包含 package.json 文件。如果是新项目，请运行 "npm init" 初始化。检查依赖配置是否正确，确保所需框架依赖已正确安装。'
    )

    // 配置相关错误
    this.errorSuggestions.set(
      ERROR_CODES.INVALID_CONFIG, 
      '请检查 ldesign.config.ts 或 vite.config.ts 文件语法是否正确。使用 "defineConfig" 函数可以获得类型提示。参考官方文档进行配置。'
    )

    // 插件相关错误
    this.errorSuggestions.set(
      ERROR_CODES.PLUGIN_LOAD_FAILED, 
      '请确保插件已正确安装："npm install -D [plugin-name]"。检查插件版本与 Vite 版本的兼容性。尝试清除 node_modules 并重新安装。'
    )

    // 构建相关错误
    this.errorSuggestions.set(
      ERROR_CODES.BUILD_FAILED, 
      '检查代码语法错误，确保所有依赖已正确安装。运行 "npm run lint" 检查代码质量。如果使用 TypeScript，检查 tsconfig.json 配置。'
    )

    // 开发服务器相关错误
    this.errorSuggestions.set(
      ERROR_CODES.DEV_SERVER_START_FAILED, 
      '检查端口是否被占用："netstat -ano | findstr :[port]" (Windows) 或 "lsof -i :[port]" (macOS/Linux)。尝试使用其他端口号或设置 port: 0 自动分配端口。'
    )

    // 预览服务器相关错误
    this.errorSuggestions.set(
      ERROR_CODES.PREVIEW_SERVER_START_FAILED, 
      '首先执行构建命令："npm run build" 或 "vite build"。确保 dist 目录存在且包含构建产物。检查构建输出目录配置。'
    )

    // 配置合并相关错误
    this.errorSuggestions.set(
      ERROR_CODES.CONFIG_MERGE_FAILED, 
      '检查配置对象结构是否正确，避免循环引用。使用 JSON.stringify 检查配置对象是否包含不可序列化的属性。'
    )

    // 依赖相关错误
    this.errorSuggestions.set(
      ERROR_CODES.DEPENDENCY_NOT_FOUND, 
      '安装缺失的依赖："npm install" 或 "yarn install" 或 "pnpm install"。检查 package.json 中的依赖是否正确。尝试清除缓存："npm cache clean --force"。'
    )

    // 框架支持相关错误
    this.errorSuggestions.set(
      ERROR_CODES.UNSUPPORTED_FRAMEWORK, 
      '当前支持的框架：Vue 2/3、React、Lit、Svelte、Vanilla JS/TS、原生 HTML。如果您的项目使用其他框架，请手动配置 vite.config.ts。'
    )

    // 项目路径相关错误
    this.errorSuggestions.set(
      ERROR_CODES.INVALID_PROJECT_ROOT, 
      '检查项目路径是否正确且存在。确保您有足够的文件系统权限访问该目录。如果目录不为空，使用 force: true 选项覆盖。'
    )

    // 构建输出相关错误
    this.errorSuggestions.set(
      ERROR_CODES.BUILD_OUTPUT_NOT_FOUND, 
      '请先运行构建命令："npm run build"。检查 vite.config.ts 中的 build.outDir 配置是否正确。确保构建过程没有错误。'
    )
  }

  /**
   * 处理错误，将原始错误转换为结构化的启动器错误
   * @param error 原始错误对象
   * @param context 错误上下文信息
   * @returns 结构化的启动器错误
   */
  handleError(error: Error, context?: string): LauncherError {
    const errorCode = this.classifyError(error, context)
    const suggestion = this.getSuggestion(errorCode)
    const docUrl = this.getDocumentationUrl(errorCode)

    const errorDetails = this.extractErrorDetails(error, context)
    const launcherError: LauncherError = {
      code: errorCode,
      message: this.extractErrorMessage(error),
      originalError: error,
      ...(errorDetails && { details: errorDetails }),
      ...(suggestion && { suggestion }),
      ...(docUrl && { docUrl }),
    }

    return launcherError
  }

  /**
   * 格式化错误信息为用户友好的字符串
   * @param error 启动器错误对象
   * @returns 格式化的错误信息
   */
  formatError(error: LauncherError): string {
    const lines: string[] = []

    // 错误标题
    lines.push(pc.red(`❌ ${error.message}`))

    // 错误代码
    lines.push(pc.gray(`错误代码: ${error.code}`))

    // 错误详情
    if (error.details) {
      lines.push('')
      lines.push(pc.yellow('详细信息:'))
      lines.push(pc.gray(error.details))
    }

    // 解决建议
    if (error.suggestion) {
      lines.push('')
      lines.push(pc.cyan('💡 解决建议:'))
      lines.push(pc.white(error.suggestion))
    }

    // 文档链接
    if (error.docUrl) {
      lines.push('')
      lines.push(pc.blue(`📖 相关文档: ${error.docUrl}`))
    }

    return lines.join('\n')
  }

  /**
   * 记录错误日志
   * @param error 启动器错误对象
   */
  logError(error: LauncherError): void {
    const formattedError = this.formatError(error)
    console.error(formattedError)

    // 如果有原始错误的堆栈信息，也记录下来（仅在开发模式）
    if (process.env.NODE_ENV === 'development' && error.originalError?.stack) {
      console.error(pc.gray('\n原始错误堆栈:'))
      console.error(pc.gray(error.originalError.stack))
    }
  }

  /**
   * 获取错误建议
   * @param errorCode 错误代码
   * @returns 错误建议文本
   */
  getSuggestion(errorCode: string): string | undefined {
    return this.errorSuggestions.get(errorCode)
  }

  /**
   * 分类错误，确定错误代码
   * @param error 原始错误对象
   * @param context 错误上下文
   * @returns 错误代码
   */
  private classifyError(error: Error, context?: string): ErrorCode {
    const message = error.message.toLowerCase()
    const stack = error.stack?.toLowerCase() || ''

    // 根据错误消息和上下文分类
    if (context?.includes('detection') || message.includes('detect') || message.includes('unknown project')) {
      return ERROR_CODES.PROJECT_TYPE_DETECTION_FAILED
    }

    if (context?.includes('config') || message.includes('config') || message.includes('invalid configuration')) {
      return ERROR_CODES.INVALID_CONFIG
    }

    if (context?.includes('plugin') || message.includes('plugin') || message.includes('cannot resolve plugin')) {
      return ERROR_CODES.PLUGIN_LOAD_FAILED
    }

    if (context?.includes('build') || message.includes('build') || message.includes('rollup')) {
      return ERROR_CODES.BUILD_FAILED
    }

    if (context?.includes('dev') || context?.includes('serve') || message.includes('dev server') || message.includes('failed to start server')) {
      return ERROR_CODES.DEV_SERVER_START_FAILED
    }

    if (context?.includes('preview') || message.includes('preview') || message.includes('preview server')) {
      return ERROR_CODES.PREVIEW_SERVER_START_FAILED
    }

    // 网络相关错误
    if (message.includes('eaddrinuse') || message.includes('port') || message.includes('address already in use')) {
      return ERROR_CODES.DEV_SERVER_START_FAILED
    }

    // 依赖相关错误
    if (message.includes('module not found') || 
        message.includes('cannot resolve') || 
        message.includes('failed to resolve') ||
        message.includes('package not found') ||
        stack.includes('module resolution')) {
      return ERROR_CODES.DEPENDENCY_NOT_FOUND
    }

    // 框架支持相关错误
    if (message.includes('unsupported') || 
        message.includes('not supported') || 
        message.includes('unknown framework') ||
        message.includes('invalid framework')) {
      return ERROR_CODES.UNSUPPORTED_FRAMEWORK
    }

    // 文件系统相关错误
    if (message.includes('enoent') || 
        message.includes('no such file') || 
        message.includes('cannot access') ||
        message.includes('permission denied') ||
        message.includes('file not found')) {
      return ERROR_CODES.INVALID_PROJECT_ROOT
    }

    // 构建输出相关错误
    if (message.includes('build output not found') || 
        message.includes('dist directory') ||
        context?.includes('preview') && message.includes('not found')) {
      return ERROR_CODES.BUILD_OUTPUT_NOT_FOUND
    }

    // 默认返回配置错误
    return ERROR_CODES.INVALID_CONFIG
  }

  /**
   * 提取错误消息
   * @param error 原始错误对象
   * @returns 清理后的错误消息
   */
  private extractErrorMessage(error: Error): string {
    let message = error.message

    // 清理常见的技术性前缀
    message = message.replace(/^Error: /, '')
    message = message.replace(/^TypeError: /, '')
    message = message.replace(/^ReferenceError: /, '')
    message = message.replace(/^SyntaxError: /, '')
    message = message.replace(/^RangeError: /, '')
    
    // 清理 Vite 相关的技术性信息
    message = message.replace(/\[vite\]/gi, '')
    message = message.replace(/\[plugin:\w+\]/gi, '')
    
    // 翻译常见的英文错误信息
    const translations: Record<string, string> = {
      'port already in use': '端口已被占用',
      'address already in use': '地址已被占用',
      'module not found': '模块未找到',
      'cannot resolve': '无法解析',
      'failed to resolve': '解析失败',
      'no such file or directory': '文件或目录不存在',
      'permission denied': '权限被拒绝',
      'syntax error': '语法错误',
      'unexpected token': '意外的标识符',
      'build failed': '构建失败',
      'compilation failed': '编译失败',
    }
    
    for (const [en, zh] of Object.entries(translations)) {
      if (message.toLowerCase().includes(en)) {
        message = message.replace(new RegExp(en, 'gi'), zh)
      }
    }

    // 如果消息为空，使用默认消息
    if (!message.trim()) {
      message = '发生了未知错误'
    }

    return message.trim()
  }

  /**
   * 提取错误详情
   * @param error 原始错误对象
   * @param context 错误上下文
   * @returns 错误详情文本
   */
  private extractErrorDetails(error: Error, context?: string): string | undefined {
    const details: string[] = []

    if (context) {
      details.push(`上下文: ${context}`)
    }

    if (error.name && error.name !== 'Error') {
      details.push(`错误类型: ${error.name}`)
    }

    // 提取有用的堆栈信息（第一行通常最有用）
    if (error.stack) {
      const stackLines = error.stack.split('\n')
      const relevantLine = stackLines.find(line =>
        line.includes('.ts:') || line.includes('.js:') || line.includes('.vue:'),
      )
      if (relevantLine) {
        details.push(`位置: ${relevantLine.trim()}`)
      }
    }

    return details.length > 0 ? details.join('\n') : undefined
  }

  /**
   * 获取文档链接
   * @param errorCode 错误代码
   * @returns 文档URL
   */
  private getDocumentationUrl(errorCode: string): string | undefined {
    const viteBaseUrl = 'https://vitejs.dev/guide'
    const ldesignBaseUrl = 'https://ldesign.dev/docs/launcher'

    switch (errorCode) {
      case ERROR_CODES.PROJECT_TYPE_DETECTION_FAILED:
        return `${ldesignBaseUrl}/troubleshooting#project-detection`
      case ERROR_CODES.INVALID_CONFIG:
        return `${ldesignBaseUrl}/configuration`
      case ERROR_CODES.PLUGIN_LOAD_FAILED:
        return `${ldesignBaseUrl}/plugins`
      case ERROR_CODES.BUILD_FAILED:
        return `${viteBaseUrl}/build.html`
      case ERROR_CODES.DEV_SERVER_START_FAILED:
        return `${ldesignBaseUrl}/troubleshooting#dev-server`
      case ERROR_CODES.PREVIEW_SERVER_START_FAILED:
        return `${ldesignBaseUrl}/troubleshooting#preview-server`
      case ERROR_CODES.DEPENDENCY_NOT_FOUND:
        return `${viteBaseUrl}/dep-pre-bundling.html`
      case ERROR_CODES.UNSUPPORTED_FRAMEWORK:
        return `${ldesignBaseUrl}/supported-frameworks`
      case ERROR_CODES.INVALID_PROJECT_ROOT:
        return `${ldesignBaseUrl}/troubleshooting#invalid-path`
      case ERROR_CODES.BUILD_OUTPUT_NOT_FOUND:
        return `${ldesignBaseUrl}/troubleshooting#build-output`
      default:
        return `${ldesignBaseUrl}/troubleshooting`
    }
  }

  /**
   * 创建自定义错误
   * @param code 错误代码
   * @param message 错误消息
   * @param details 错误详情
   * @returns 启动器错误对象
   */
  static createError(
    code: ErrorCode,
    message: string,
    details?: string,
  ): LauncherError {
    const handler = new ErrorHandler()
    const error: LauncherError = {
      code,
      message,
    }

    if (details !== undefined) {
      error.details = details
    }

    const suggestion = handler.getSuggestion(code)
    if (suggestion !== undefined) {
      error.suggestion = suggestion
    }

    const docUrl = handler.getDocumentationUrl(code)
    if (docUrl !== undefined) {
      error.docUrl = docUrl
    }

    return error
  }

  /**
   * 包装异步函数，自动处理错误
   * @param fn 异步函数
   * @param context 错误上下文
   * @returns 包装后的函数
   */
  static wrapAsync<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string,
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args)
      }
      catch (error) {
        const handler = new ErrorHandler()
        const launcherError = handler.handleError(error as Error, context)
        handler.logError(launcherError)
        throw launcherError
      }
    }
  }
}

/**
 * 默认错误处理器实例
 */
export const errorHandler = new ErrorHandler()
