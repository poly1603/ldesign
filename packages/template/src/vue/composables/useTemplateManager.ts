/**
 * 模板管理器 Composable
 */

import type { TemplateManager } from '../../runtime/manager'
import type { SystemConfig } from '../../types'
import { inject, readonly, ref } from 'vue'
import { createTemplateManager } from '../../runtime'

export function useTemplateManager(config?: SystemConfig) {
  // 尝试从依赖注入获取 TemplateManager
  const injectedManager = inject<TemplateManager | undefined>('templateManager', undefined)

  // 如果有注入的 manager，使用它；否则创建新的
  const manager = injectedManager ?? createTemplateManager(config)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  return {
    manager,
    loading: readonly(loading),
    error: readonly(error),
  }
}
