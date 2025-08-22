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
    this.errorSuggestions.set(ERROR_CODES.PROJECT_TYPE_DETECTION_FAILED, '请确保项目根目录包含 package.json 文件，并检查依赖配置是否正确')

    this.errorSuggestions.set(ERROR_CODES.INVALID_CONFIG, '请检查 Vite 配置文件语法是否正确，参考官方文档进行配置')

    this.errorSuggestions.set(ERROR_CODES.PLUGIN_LOAD_FAILED, '请确保插件已正确安装，检查插件版本兼容性')

    this.errorSuggestions.set(ERROR_CODES.BUILD_FAILED, '请检查代码语法错误，确保所有依赖已正确安装')

    this.errorSuggestions.set(ERROR_CODES.DEV_SERVER_START_FAILED, '请检查端口是否被占用，或尝试使用其他端口号')

    this.errorSuggestions.set(ERROR_CODES.PREVIEW_SERVER_START_FAILED, '请先执行构建命令，确保构建产物存在')

    this.errorSuggestions.set(ERROR_CODES.CONFIG_MERGE_FAILED, '请检查配置对象结构是否正确，避免循环引用')

    this.errorSuggestions.set(ERROR_CODES.DEPENDENCY_NOT_FOUND, '请运行 npm install 或 yarn install 安装缺失的依赖')

    this.errorSuggestions.set(ERROR_CODES.UNSUPPORTED_FRAMEWORK, '当前框架暂不支持，请使用 Vue2/Vue3/React/Vanilla/Lit 中的一种')

    this.errorSuggestions.set(ERROR_CODES.INVALID_PROJECT_ROOT, '请确保项目根目录路径正确且可访问')
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
    // const stack = error.stack?.toLowerCase() || '';

    // 根据错误消息和上下文分类
    if (context?.includes('detection') || message.includes('detect')) {
      return ERROR_CODES.PROJECT_TYPE_DETECTION_FAILED
    }

    if (context?.includes('config') || message.includes('config')) {
      return ERROR_CODES.INVALID_CONFIG
    }

    if (context?.includes('plugin') || message.includes('plugin')) {
      return ERROR_CODES.PLUGIN_LOAD_FAILED
    }

    if (context?.includes('build') || message.includes('build')) {
      return ERROR_CODES.BUILD_FAILED
    }

    if (context?.includes('dev') || message.includes('dev server')) {
      return ERROR_CODES.DEV_SERVER_START_FAILED
    }

    if (context?.includes('preview') || message.includes('preview')) {
      return ERROR_CODES.PREVIEW_SERVER_START_FAILED
    }

    if (message.includes('eaddrinuse') || message.includes('port')) {
      return ERROR_CODES.DEV_SERVER_START_FAILED
    }

    if (message.includes('module not found') || message.includes('cannot resolve')) {
      return ERROR_CODES.DEPENDENCY_NOT_FOUND
    }

    if (message.includes('unsupported') || message.includes('not supported')) {
      return ERROR_CODES.UNSUPPORTED_FRAMEWORK
    }

    if (message.includes('enoent') || message.includes('no such file')) {
      return ERROR_CODES.INVALID_PROJECT_ROOT
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

    // 如果消息为空，使用默认消息
    if (!message.trim()) {
      message = '发生了未知错误'
    }

    return message
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
    const baseUrl = 'https://vitejs.dev/guide'

    switch (errorCode) {
      case ERROR_CODES.PROJECT_TYPE_DETECTION_FAILED:
        return `${baseUrl}/getting-started.html`
      case ERROR_CODES.INVALID_CONFIG:
        return `${baseUrl}/config.html`
      case ERROR_CODES.PLUGIN_LOAD_FAILED:
        return `${baseUrl}/using-plugins.html`
      case ERROR_CODES.BUILD_FAILED:
        return `${baseUrl}/build.html`
      case ERROR_CODES.DEV_SERVER_START_FAILED:
        return `${baseUrl}/dev-server.html`
      case ERROR_CODES.DEPENDENCY_NOT_FOUND:
        return `${baseUrl}/dep-pre-bundling.html`
      default:
        return `${baseUrl}/troubleshooting.html`
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
