/**
 * v-watermark 指令实现
 */

import type { Directive, DirectiveBinding } from 'vue'
import { WatermarkCore } from '../../core'
import type { WatermarkConfig, WatermarkInstance } from '../../types'
import type { WatermarkDirectiveValue, WatermarkDirectiveModifiers } from '../types'

// 指令实例映射
const instanceMap = new WeakMap<HTMLElement, {
  core: WatermarkCore
  instance: WatermarkInstance | null
  config: WatermarkConfig
}>()

/**
 * 解析指令值
 */
function parseDirectiveValue(
  value: WatermarkDirectiveValue,
  modifiers: WatermarkDirectiveModifiers
): Partial<WatermarkConfig> {
  let config: Partial<WatermarkConfig> = {}

  // 处理不同类型的值
  if (typeof value === 'string') {
    config.content = value
  } else if (Array.isArray(value)) {
    config.content = value
  } else if (typeof value === 'object' && value !== null) {
    config = { ...value }
  }

  // 处理修饰符
  if (modifiers.secure) {
    config.security = {
      ...config.security,
      level: 'advanced'
    }
  }

  if (modifiers.responsive) {
    config.responsive = {
      ...config.responsive,
      enabled: true
    }
  }

  if (modifiers.canvas) {
    config.renderer = 'canvas'
  } else if (modifiers.svg) {
    config.renderer = 'svg'
  }

  return config
}

/**
 * 创建水印实例
 */
async function createWatermarkInstance(
  el: HTMLElement,
  binding: DirectiveBinding<WatermarkDirectiveValue>
): Promise<void> {
  const { value, modifiers } = binding
  
  if (!value) return

  try {
    // 解析配置
    const config = parseDirectiveValue(value, modifiers)
    
    // 创建核心实例
    const core = new WatermarkCore()
    await core.init()
    
    // 创建水印实例
    const instance = await core.create({
      ...config,
      container: el
    }, {
      enableSecurity: modifiers.secure !== false,
      enableResponsive: modifiers.responsive !== false,
      immediate: modifiers.immediate !== false
    })

    // 存储实例信息
    instanceMap.set(el, {
      core,
      instance,
      config: instance.config
    })

    // 添加调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('[v-watermark] Created watermark instance:', instance.id)
    }
  } catch (error) {
    console.error('[v-watermark] Failed to create watermark:', error)
  }
}

/**
 * 更新水印实例
 */
async function updateWatermarkInstance(
  el: HTMLElement,
  binding: DirectiveBinding<WatermarkDirectiveValue>
): Promise<void> {
  const { value, modifiers } = binding
  const instanceData = instanceMap.get(el)
  
  if (!instanceData || !instanceData.instance) {
    // 如果实例不存在，创建新实例
    await createWatermarkInstance(el, binding)
    return
  }

  if (!value) {
    // 如果值为空，销毁实例
    await destroyWatermarkInstance(el)
    return
  }

  try {
    // 解析新配置
    const newConfig = parseDirectiveValue(value, modifiers)
    
    // 更新实例
    await instanceData.core.update(instanceData.instance.id, newConfig)
    
    // 更新存储的配置
    instanceData.config = { ...instanceData.config, ...newConfig }

    // 添加调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('[v-watermark] Updated watermark instance:', instanceData.instance.id)
    }
  } catch (error) {
    console.error('[v-watermark] Failed to update watermark:', error)
  }
}

/**
 * 销毁水印实例
 */
async function destroyWatermarkInstance(el: HTMLElement): Promise<void> {
  const instanceData = instanceMap.get(el)
  
  if (!instanceData || !instanceData.instance) return

  try {
    await instanceData.core.destroy(instanceData.instance.id)
    instanceMap.delete(el)

    // 添加调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('[v-watermark] Destroyed watermark instance:', instanceData.instance.id)
    }
  } catch (error) {
    console.error('[v-watermark] Failed to destroy watermark:', error)
  }
}

/**
 * v-watermark 指令定义
 */
export const vWatermark: Directive<HTMLElement, WatermarkDirectiveValue> = {
  // 元素挂载时
  async mounted(el, binding) {
    await createWatermarkInstance(el, binding)
  },

  // 指令值更新时
  async updated(el, binding) {
    // 只有当值真正改变时才更新
    if (binding.value !== binding.oldValue) {
      await updateWatermarkInstance(el, binding)
    }
  },

  // 元素卸载前
  async beforeUnmount(el) {
    await destroyWatermarkInstance(el)
  }
}

// 默认导出
export default vWatermark

/**
 * 获取元素的水印实例（用于调试）
 */
export function getWatermarkInstance(el: HTMLElement): WatermarkInstance | null {
  const instanceData = instanceMap.get(el)
  return instanceData?.instance || null
}

/**
 * 手动销毁指定元素的水印（用于特殊情况）
 */
export async function destroyElementWatermark(el: HTMLElement): Promise<void> {
  await destroyWatermarkInstance(el)
}