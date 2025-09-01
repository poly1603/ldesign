/**
 * E2E 测试全局类型声明
 */

import type { Engine } from '../../src/types'

declare global {
  interface Window {
    engine: Engine
  }
}

export {}
