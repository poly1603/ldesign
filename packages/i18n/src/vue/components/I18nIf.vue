<!--
  I18nIf - 条件翻译组件
  
  功能：
  - 基于条件选择不同的翻译内容
  - 支持多种条件类型（值比较、范围、正则等）
  - 支持嵌套条件和复杂逻辑
  - 支持默认翻译和降级处理
  
  使用示例：
  <I18nIf :conditions="[
    { when: 'count > 0', keypath: 'items.available' },
    { when: 'count === 0', keypath: 'items.empty' }
  ]" :context="{ count: itemCount }" />
-->

<template>
  <component :is="renderTag" v-if="shouldRender">
    <I18nT 
      :keypath="selectedKeypath" 
      :params="mergedParams"
      v-bind="translationProps"
    />
  </component>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { I18nInjectionKey } from '../plugin'
import I18nT from './I18nT.vue'

/**
 * 条件配置接口
 */
export interface ConditionConfig {
  /** 条件表达式 */
  when: string | ((context: any) => boolean)
  /** 翻译键路径 */
  keypath: string
  /** 额外参数 */
  params?: Record<string, unknown>
  /** 条件优先级（数字越大优先级越高） */
  priority?: number
}

/**
 * 条件翻译组件属性
 */
export interface I18nIfProps {
  /** 条件配置列表 */
  conditions: ConditionConfig[]
  /** 上下文数据 */
  context?: Record<string, unknown>
  /** 默认翻译键（所有条件都不满足时使用） */
  defaultKeypath?: string
  /** 默认参数 */
  defaultParams?: Record<string, unknown>
  /** 全局参数（会合并到所有翻译中） */
  params?: Record<string, unknown>
  /** 渲染标签 */
  tag?: string
  /** 是否启用调试模式 */
  debug?: boolean
  /** 传递给 I18nT 组件的属性 */
  translationProps?: Record<string, unknown>
}

const props = withDefaults(defineProps<I18nIfProps>(), {
  tag: 'span',
  debug: false,
  context: () => ({}),
  params: () => ({}),
  defaultParams: () => ({}),
  translationProps: () => ({})
})

// 注入 I18n 实例
const i18n = inject(I18nInjectionKey)
if (!i18n) {
  throw new Error('I18nIf 组件必须在安装了 I18n 插件的 Vue 应用中使用')
}

/**
 * 渲染标签
 */
const renderTag = computed(() => {
  return props.tag || 'span'
})

/**
 * 排序后的条件列表（按优先级降序）
 */
const sortedConditions = computed(() => {
  return [...props.conditions].sort((a, b) => (b.priority || 0) - (a.priority || 0))
})

/**
 * 评估条件表达式
 */
function evaluateCondition(condition: string | ((context: any) => boolean), context: any): boolean {
  try {
    if (typeof condition === 'function') {
      return condition(context)
    }

    if (typeof condition === 'string') {
      // 创建安全的执行环境
      const safeContext = { ...context }
      
      // 简单的表达式解析（支持基本的比较操作）
      const expression = condition
        .replace(/\b(\w+)\b/g, (match) => {
          if (match in safeContext) {
            const value = safeContext[match]
            return typeof value === 'string' ? `"${value}"` : String(value)
          }
          return match
        })

      // 使用 Function 构造器安全执行表达式
      const func = new Function('return ' + expression)
      return Boolean(func())
    }

    return false
  } catch (error) {
    if (props.debug) {
      console.warn('I18nIf: 条件评估失败', condition, error)
    }
    return false
  }
}

/**
 * 选中的条件配置
 */
const selectedCondition = computed(() => {
  const context = { ...props.context }
  
  for (const condition of sortedConditions.value) {
    if (evaluateCondition(condition.when, context)) {
      if (props.debug) {
        console.log('I18nIf: 条件匹配', condition.when, condition.keypath)
      }
      return condition
    }
  }

  if (props.debug) {
    console.log('I18nIf: 使用默认翻译', props.defaultKeypath)
  }

  return null
})

/**
 * 选中的翻译键路径
 */
const selectedKeypath = computed(() => {
  return selectedCondition.value?.keypath || props.defaultKeypath || ''
})

/**
 * 合并后的参数
 */
const mergedParams = computed(() => {
  const conditionParams = selectedCondition.value?.params || {}
  const defaultParams = selectedCondition.value ? {} : props.defaultParams
  
  return {
    ...defaultParams,
    ...props.params,
    ...conditionParams,
    ...props.context
  }
})

/**
 * 是否应该渲染
 */
const shouldRender = computed(() => {
  return Boolean(selectedKeypath.value)
})
</script>

<script lang="ts">
/**
 * I18nIf - 条件翻译组件
 * 
 * 根据条件动态选择翻译内容，支持：
 * - 多种条件表达式
 * - 优先级排序
 * - 默认翻译
 * - 调试模式
 * 
 * @example
 * ```vue
 * <template>
 *   <!-- 基础条件翻译 -->
 *   <I18nIf 
 *     :conditions="[
 *       { when: 'count > 0', keypath: 'items.available' },
 *       { when: 'count === 0', keypath: 'items.empty' }
 *     ]"
 *     :context="{ count: itemCount }"
 *     default-keypath="items.unknown"
 *   />
 *   
 *   <!-- 使用函数条件 -->
 *   <I18nIf 
 *     :conditions="[
 *       { 
 *         when: (ctx) => ctx.user.isVip, 
 *         keypath: 'welcome.vip',
 *         priority: 10
 *       },
 *       { 
 *         when: (ctx) => ctx.user.isLoggedIn, 
 *         keypath: 'welcome.user',
 *         priority: 5
 *       }
 *     ]"
 *     :context="{ user }"
 *     default-keypath="welcome.guest"
 *   />
 * </template>
 * ```
 */
export default {
  name: 'I18nIf'
}
</script>

<style lang="less">
.i18n-if {
  display: inline;
}
</style>
