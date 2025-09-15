/**
 * 全局类型声明文件
 * 确保所有类型在整个项目中都可用
 */

declare global {
  /**
   * Web Crypto API 扩展
   */
  interface Window {
    crypto: Crypto
  }

  /**
   * Web Workers 支持
   */
  interface Worker {
    postMessage: (message: any, transfer?: Transferable[]) => void
    onmessage: ((this: Worker, ev: MessageEvent) => any) | null
    onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null
    terminate: () => void
  }

  /**
   * 性能 API
   */
  interface Performance {
    now: () => number
    mark: (markName: string) => void
    measure: (measureName: string, startMark?: string, endMark?: string) => void
  }
}

/**
 * 模块声明
 *
 * 说明：'crypto-js' 与 'node-forge' 均自带类型或由 @types 提供，避免在此重复声明以防冲突。
 */

/**
 * Vue 3 类型扩展
 */
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $crypto?: import('../core/manager').CryptoManager
  }

  interface GlobalProperties {
    $crypto?: import('../core/manager').CryptoManager
  }
}

/**
 * 环境变量类型
 */
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    DEBUG?: string
  }
}

export { }
