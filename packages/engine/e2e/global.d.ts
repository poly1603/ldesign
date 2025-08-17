/**
 * E2E 测试全局类型定义
 */

import type { Engine } from '../src/types'

declare global {
  interface Window {
    LDesignEngine?: unknown
    engine: Engine
    __VUE_APP__?: {
      $engine?: Engine
    }
  }
}

export { }
