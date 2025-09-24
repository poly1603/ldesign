/**
 * Vue 3 类型声明文件
 *
 * 这个文件包含了 Vue 3 的类型扩展，仅在使用 Vue 时生效
 */

import type { useCrypto, useHash, useSignature } from './composables'

/**
 * 全局 Crypto 对象接口
 */
export interface GlobalCrypto {
  useCrypto: typeof useCrypto
  useHash: typeof useHash
  useSignature: typeof useSignature
}

/**
 * Vue 3 模块声明扩展
 * 仅在 Vue 环境中生效
 */
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $crypto?: GlobalCrypto
  }

  interface GlobalProperties {
    $crypto?: GlobalCrypto
  }
}

export {}
