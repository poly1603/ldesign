<!--
  I18nChain - 翻译链组件
  
  功能：
  - 支持翻译结果作为另一个翻译的键
  - 支持多级翻译链
  - 支持循环检测和防护
  - 支持链式参数传递
  
  使用示例：
  <I18nChain keypath="dynamic.key" :max-depth="3" />
  <I18nChain :chain="['level1', 'level2', 'level3']" />
-->

<template>
  <span :class="['i18n-chain', chainClass]" :title="debugInfo">
    {{ finalTranslation }}
  </span>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { I18nInjectionKey } from '../plugin'

/**
 * 翻译链组件属性
 */
interface Props {
  /** 初始翻译键路径 */
  keypath?: string
  /** 预定义的翻译链 */
  chain?: string[]
  /** 翻译参数 */
  params?: Record<string, unknown>
  /** 最大链深度（防止无限循环） */
  maxDepth?: number
  /** 链分隔符（用于解析链式键名） */
  separator?: string
  /** 是否启用调试模式 */
  debug?: boolean
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 链式参数传递模式 */
  paramMode?: 'merge' | 'replace' | 'accumulate'
  /** 循环检测模式 */
  circularDetection?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxDepth: 5,
  separator: '->',
  debug: false,
  enableCache: true,
  paramMode: 'merge',
  circularDetection: true
})

// 注入 I18n 实例
const i18n = inject(I18nInjectionKey)
if (!i18n) {
  throw new Error('I18nChain 组件必须在安装了 I18n 插件的 Vue 应用中使用')
}

// 翻译链缓存
const chainCache = ref<Map<string, string>>(new Map())
const translationChain = ref<string[]>([])
const circularKeys = ref<Set<string>>(new Set())

/**
 * 缓存键
 */
const cacheKey = computed(() => {
  const key = props.keypath || props.chain?.join('|') || ''
  const paramsKey = JSON.stringify(props.params || {})
  return `${key}:${paramsKey}`
})

/**
 * 解析翻译链
 */
function resolveChain(initialKey: string, params: Record<string, unknown> = {}, depth = 0): string {
  // 检查最大深度
  if (depth >= props.maxDepth) {
    if (props.debug) {
      console.warn('I18nChain: 达到最大链深度', depth, initialKey)
    }
    return initialKey
  }

  // 循环检测
  if (props.circularDetection && circularKeys.value.has(initialKey)) {
    if (props.debug) {
      console.warn('I18nChain: 检测到循环引用', initialKey)
    }
    return initialKey
  }

  // 添加到循环检测集合
  if (props.circularDetection) {
    circularKeys.value.add(initialKey)
  }

  // 记录翻译链
  translationChain.value.push(initialKey)

  try {
    // 获取翻译结果
    const translation = i18n.t(initialKey, params)
    
    // 如果翻译结果等于键名，说明没有找到翻译
    if (translation === initialKey) {
      return translation
    }

    // 检查翻译结果是否包含链分隔符
    if (translation.includes(props.separator)) {
      const nextKey = translation.split(props.separator)[0].trim()
      
      // 处理参数传递
      let nextParams = params
      if (props.paramMode === 'accumulate') {
        nextParams = { ...params, [`chain_${depth}`]: translation }
      } else if (props.paramMode === 'replace') {
        nextParams = {}
      }

      return resolveChain(nextKey, nextParams, depth + 1)
    }

    // 检查翻译结果是否本身就是一个键名（简单启发式检测）
    if (isLikelyTranslationKey(translation)) {
      return resolveChain(translation, params, depth + 1)
    }

    return translation
  } catch (error) {
    if (props.debug) {
      console.warn('I18nChain: 翻译链解析失败', initialKey, error)
    }
    return initialKey
  } finally {
    // 从循环检测集合中移除
    if (props.circularDetection) {
      circularKeys.value.delete(initialKey)
    }
  }
}

/**
 * 检查字符串是否像翻译键
 */
function isLikelyTranslationKey(str: string): boolean {
  // 简单的启发式规则：包含点号且不包含空格
  return /^[a-zA-Z][a-zA-Z0-9._-]*$/.test(str) && str.includes('.')
}

/**
 * 最终翻译结果
 */
const finalTranslation = computed(() => {
  // 重置状态
  translationChain.value = []
  circularKeys.value.clear()

  // 检查缓存
  if (props.enableCache && chainCache.value.has(cacheKey.value)) {
    return chainCache.value.get(cacheKey.value)!
  }

  let result: string

  if (props.chain && props.chain.length > 0) {
    // 使用预定义链
    result = resolvePreDefinedChain()
  } else if (props.keypath) {
    // 使用动态链
    result = resolveChain(props.keypath, props.params || {})
  } else {
    result = ''
  }

  // 缓存结果
  if (props.enableCache) {
    chainCache.value.set(cacheKey.value, result)
  }

  return result
})

/**
 * 解析预定义翻译链
 */
function resolvePreDefinedChain(): string {
  if (!props.chain || props.chain.length === 0) {
    return ''
  }

  let currentParams = props.params || {}
  let result = ''

  for (let i = 0; i < props.chain.length && i < props.maxDepth; i++) {
    const key = props.chain[i]
    translationChain.value.push(key)

    try {
      result = i18n.t(key, currentParams)
      
      // 处理参数传递
      if (props.paramMode === 'accumulate') {
        currentParams = { ...currentParams, [`chain_${i}`]: result }
      } else if (props.paramMode === 'replace') {
        currentParams = {}
      }
    } catch (error) {
      if (props.debug) {
        console.warn('I18nChain: 预定义链解析失败', key, error)
      }
      return key
    }
  }

  return result
}

/**
 * 样式类名
 */
const chainClass = computed(() => {
  return [
    `i18n-chain--depth-${translationChain.value.length}`,
    {
      'i18n-chain--cached': props.enableCache && chainCache.value.has(cacheKey.value),
      'i18n-chain--debug': props.debug
    }
  ]
})

/**
 * 调试信息
 */
const debugInfo = computed(() => {
  if (!props.debug) {
    return undefined
  }

  return `翻译链: ${translationChain.value.join(' -> ')}`
})

// 监听参数变化，清除缓存
watch(() => [props.keypath, props.params, props.chain], () => {
  if (props.enableCache) {
    chainCache.value.clear()
  }
}, { deep: true })
</script>

<script lang="ts">
/**
 * I18nChain - 翻译链组件
 * 
 * 支持翻译结果作为下一个翻译的键，实现动态翻译链：
 * - 多级翻译解析
 * - 循环检测
 * - 参数传递
 * - 缓存优化
 * 
 * @example
 * ```vue
 * <template>
 *   <!-- 动态翻译链 -->
 *   <I18nChain keypath="user.role" :params="{ userId: 123 }" />
 *   
 *   <!-- 预定义翻译链 -->
 *   <I18nChain :chain="['step1', 'step2', 'step3']" />
 *   
 *   <!-- 带调试的翻译链 -->
 *   <I18nChain 
 *     keypath="dynamic.message" 
 *     :max-depth="3"
 *     debug
 *     param-mode="accumulate"
 *   />
 * </template>
 * ```
 */
export default {
  name: 'I18nChain'
}
</script>

<style lang="less">
.i18n-chain {
  display: inline;
  
  &--debug {
    border-bottom: 1px dashed var(--ldesign-border-color);
    cursor: help;
  }
  
  &--cached {
    opacity: 0.9;
  }
  
  &--depth-1 { color: var(--ldesign-text-color-primary); }
  &--depth-2 { color: var(--ldesign-brand-color); }
  &--depth-3 { color: var(--ldesign-warning-color); }
  &--depth-4 { color: var(--ldesign-error-color); }
  &--depth-5 { color: var(--ldesign-text-color-placeholder); }
}
</style>
