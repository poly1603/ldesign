/**
 * Custom Error Classes
 *
 * 提供专门的错误类型，用于更精确的错误处理和调试
 *
 * 特性：
 * - 继承自原生 Error
 * - 包含详细的错误信息
 * - 支持错误码
 * - 便于错误分类和处理
 */

/**
 * 错误详情类型
 * 用于提供额外的错误上下文信息
 * 使用 Record<string, unknown> 而非 any 以提升类型安全性
 */
export type ErrorDetails = Record<string, unknown> | undefined

/**
 * 错误代码枚举
 */
export enum CryptoErrorCode {
  // 通用错误 (1xxx)
  UNKNOWN_ERROR = 1000,
  INVALID_INPUT = 1001,
  INVALID_PARAMETER = 1002,
  NOT_SUPPORTED = 1003,

  // 加密错误 (2xxx)
  ENCRYPTION_FAILED = 2000,
  INVALID_KEY = 2001,
  INVALID_IV = 2002,
  INVALID_MODE = 2003,
  INVALID_PADDING = 2004,
  KEY_SIZE_MISMATCH = 2005,

  // 解密错误 (3xxx)
  DECRYPTION_FAILED = 3000,
  CORRUPTED_DATA = 3001,
  WRONG_KEY = 3002,
  WRONG_IV = 3003,
  INVALID_CIPHERTEXT = 3004,

  // 哈希错误 (4xxx)
  HASH_FAILED = 4000,
  INVALID_ALGORITHM = 4001,
  INVALID_HASH = 4002,

  // 密钥管理错误 (5xxx)
  KEY_GENERATION_FAILED = 5000,
  KEY_NOT_FOUND = 5001,
  KEY_EXPIRED = 5002,
  KEY_DERIVATION_FAILED = 5003,

  // 编码错误 (6xxx)
  ENCODING_FAILED = 6000,
  DECODING_FAILED = 6001,
  INVALID_ENCODING = 6002,

  // 限流错误 (7xxx)
  RATE_LIMIT_EXCEEDED = 7000,

  // 存储错误 (8xxx)
  STORAGE_FAILED = 8000,
  STORAGE_NOT_AVAILABLE = 8001,
}

/**
 * 基础加密错误类
 */
export class CryptoError extends Error {
  public readonly code: CryptoErrorCode
  public readonly algorithm?: string
  public readonly details?: ErrorDetails
  public readonly timestamp: number

  constructor(
    message: string,
    code: CryptoErrorCode = CryptoErrorCode.UNKNOWN_ERROR,
    algorithm?: string,
    details?: ErrorDetails,
  ) {
    super(message)
    this.name = 'CryptoError'
    this.code = code
    this.algorithm = algorithm
    this.details = details
    this.timestamp = Date.now()

    // 维护正确的原型链
    Object.setPrototypeOf(this, CryptoError.prototype)
  }

  /**
   * 获取格式化的错误信息
   */
  getFormattedMessage(): string {
    let msg = `[${this.name}:${this.code}] ${this.message}`
    if (this.algorithm) {
      msg += ` (Algorithm: ${this.algorithm})`
    }
    return msg
  }

  /**
   * 转换为JSON格式
   */
  toJSON(): object {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      algorithm: this.algorithm,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    }
  }
}

/**
 * 加密错误
 */
export class EncryptionError extends CryptoError {
  constructor(message: string, code: CryptoErrorCode = CryptoErrorCode.ENCRYPTION_FAILED, algorithm?: string, details?: ErrorDetails) {
    super(message, code, algorithm, details)
    this.name = 'EncryptionError'
    Object.setPrototypeOf(this, EncryptionError.prototype)
  }
}

/**
 * 解密错误
 */
export class DecryptionError extends CryptoError {
  constructor(message: string, code: CryptoErrorCode = CryptoErrorCode.DECRYPTION_FAILED, algorithm?: string, details?: ErrorDetails) {
    super(message, code, algorithm, details)
    this.name = 'DecryptionError'
    Object.setPrototypeOf(this, DecryptionError.prototype)
  }
}

/**
 * 哈希错误
 */
export class HashError extends CryptoError {
  constructor(message: string, code: CryptoErrorCode = CryptoErrorCode.HASH_FAILED, algorithm?: string, details?: ErrorDetails) {
    super(message, code, algorithm, details)
    this.name = 'HashError'
    Object.setPrototypeOf(this, HashError.prototype)
  }
}

/**
 * 密钥管理错误
 */
export class KeyManagementError extends CryptoError {
  constructor(message: string, code: CryptoErrorCode = CryptoErrorCode.KEY_GENERATION_FAILED, algorithm?: string, details?: ErrorDetails) {
    super(message, code, algorithm, details)
    this.name = 'KeyManagementError'
    Object.setPrototypeOf(this, KeyManagementError.prototype)
  }
}

/**
 * 编码错误
 */
export class EncodingError extends CryptoError {
  constructor(message: string, code: CryptoErrorCode = CryptoErrorCode.ENCODING_FAILED, algorithm?: string, details?: ErrorDetails) {
    super(message, code, algorithm, details)
    this.name = 'EncodingError'
    Object.setPrototypeOf(this, EncodingError.prototype)
  }
}

/**
 * 限流错误
 */
export class RateLimitError extends CryptoError {
  public readonly retryAfter?: number

  constructor(message: string, retryAfter?: number, details?: ErrorDetails) {
    super(message, CryptoErrorCode.RATE_LIMIT_EXCEEDED, undefined, details)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }

  getFormattedMessage(): string {
    let msg = super.getFormattedMessage()
    if (this.retryAfter) {
      msg += ` (Retry after ${this.retryAfter}ms)`
    }
    return msg
  }
}

/**
 * 验证错误
 */
export class ValidationError extends CryptoError {
  public readonly field?: string

  constructor(message: string, field?: string, details?: ErrorDetails) {
    super(message, CryptoErrorCode.INVALID_INPUT, undefined, details)
    this.name = 'ValidationError'
    this.field = field
    Object.setPrototypeOf(this, ValidationError.prototype)
  }

  getFormattedMessage(): string {
    let msg = super.getFormattedMessage()
    if (this.field) {
      msg += ` (Field: ${this.field})`
    }
    return msg
  }
}

/**
 * 存储错误
 */
export class StorageError extends CryptoError {
  constructor(message: string, code: CryptoErrorCode = CryptoErrorCode.STORAGE_FAILED, details?: ErrorDetails) {
    super(message, code, undefined, details)
    this.name = 'StorageError'
    Object.setPrototypeOf(this, StorageError.prototype)
  }
}

/**
 * 错误工厂函数
 */
export class CryptoErrorFactory {
  /**
   * 创建加密错误
   */
  static createEncryptionError(
    message: string,
    options?: {
      code?: CryptoErrorCode
      algorithm?: string
      details?: ErrorDetails
    },
  ): EncryptionError {
    return new EncryptionError(
      message,
      options?.code || CryptoErrorCode.ENCRYPTION_FAILED,
      options?.algorithm,
      options?.details,
    )
  }

  /**
   * 创建解密错误
   */
  static createDecryptionError(
    message: string,
    options?: {
      code?: CryptoErrorCode
      algorithm?: string
      details?: ErrorDetails
    },
  ): DecryptionError {
    return new DecryptionError(
      message,
      options?.code || CryptoErrorCode.DECRYPTION_FAILED,
      options?.algorithm,
      options?.details,
    )
  }

  /**
   * 创建哈希错误
   */
  static createHashError(
    message: string,
    options?: {
      code?: CryptoErrorCode
      algorithm?: string
      details?: ErrorDetails
    },
  ): HashError {
    return new HashError(
      message,
      options?.code || CryptoErrorCode.HASH_FAILED,
      options?.algorithm,
      options?.details,
    )
  }

  /**
   * 创建密钥管理错误
   */
  static createKeyManagementError(
    message: string,
    options?: {
      code?: CryptoErrorCode
      algorithm?: string
      details?: ErrorDetails
    },
  ): KeyManagementError {
    return new KeyManagementError(
      message,
      options?.code || CryptoErrorCode.KEY_GENERATION_FAILED,
      options?.algorithm,
      options?.details,
    )
  }

  /**
   * 创建编码错误
   */
  static createEncodingError(
    message: string,
    options?: {
      code?: CryptoErrorCode
      algorithm?: string
      details?: ErrorDetails
    },
  ): EncodingError {
    return new EncodingError(
      message,
      options?.code || CryptoErrorCode.ENCODING_FAILED,
      options?.algorithm,
      options?.details,
    )
  }

  /**
   * 创建限流错误
   */
  static createRateLimitError(
    message: string,
    retryAfter?: number,
    details?: ErrorDetails,
  ): RateLimitError {
    return new RateLimitError(message, retryAfter, details)
  }

  /**
   * 创建验证错误
   */
  static createValidationError(
    message: string,
    field?: string,
    details?: ErrorDetails,
  ): ValidationError {
    return new ValidationError(message, field, details)
  }

  /**
   * 创建存储错误
   */
  static createStorageError(
    message: string,
    code?: CryptoErrorCode,
    details?: ErrorDetails,
  ): StorageError {
    return new StorageError(
      message,
      code || CryptoErrorCode.STORAGE_FAILED,
      details,
    )
  }

  /**
   * 从原生错误转换
   */
  static fromNativeError(error: Error, defaultMessage?: string): CryptoError {
    return new CryptoError(
      error.message || defaultMessage || 'Unknown error',
      CryptoErrorCode.UNKNOWN_ERROR,
      undefined,
      { originalError: error },
    )
  }
}

/**
 * 错误处理辅助函数
 */
export class ErrorHandler {
  /**
   * 判断是否为加密错误
   */
  static isCryptoError(error: unknown): error is CryptoError {
    return error instanceof CryptoError
  }

  /**
   * 判断是否为加密操作错误
   */
  static isEncryptionError(error: unknown): error is EncryptionError {
    return error instanceof EncryptionError
  }

  /**
   * 判断是否为解密错误
   */
  static isDecryptionError(error: unknown): error is DecryptionError {
    return error instanceof DecryptionError
  }

  /**
   * 判断是否为限流错误
   */
  static isRateLimitError(error: unknown): error is RateLimitError {
    return error instanceof RateLimitError
  }

  /**
   * 安全地处理错误
   */
  static handle(error: unknown, fallbackMessage: string = 'An error occurred'): string {
    if (this.isCryptoError(error)) {
      return error.getFormattedMessage()
    }
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return fallbackMessage
  }

  /**
   * 记录错误（可扩展为发送到日志服务）
   */
  static log(error: unknown, context?: string): void {
    const message = this.handle(error)
    const prefix = context ? `[${context}]` : ''
    console.error(`${prefix} ${message}`)

    if (this.isCryptoError(error) && error.stack) {
      console.error(error.stack)
    }
  }
}
