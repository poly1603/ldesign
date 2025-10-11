<!--
  I18nP 复数化翻译组件

  用于处理复数形式的翻译，支持多种复数规则

  @example
  <I18nP keypath="item" :count="1" />  <!-- "1 item" -->
  <I18nP keypath="item" :count="5" />  <!-- "5 items" -->

  <I18nP keypath="user.message" :count="0" :params="{ name: 'John' }" />
-->

<script setup lang="ts">
import { computed, inject } from 'vue'
import { I18nInjectionKey } from '../plugin'

/**
 * 复数化规则类型
 */
type PluralRule = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

// 使用内联类型定义以避免私有 Props 名称泄漏
const props = withDefaults(defineProps<{
  /** 翻译键路径 */
  keypath: string
  /** 数量值，用于确定复数形式 */
  count: number
  /** 插值参数 */
  params?: Record<string, unknown>
  /** 渲染的 HTML 标签 */
  tag?: string
  /** 指定语言（可选） */
  locale?: string
  /** 自定义复数规则映射 */
  pluralRules?: Partial<Record<PluralRule, string>>
  /** 是否在参数中自动包含 count */
  includeCount?: boolean
}>(), {
  tag: 'span',
  includeCount: true,
})

/**
 * 注入 I18n 实例
 */
const i18n = inject(I18nInjectionKey)
if (!i18n) {
  throw new Error('I18nP 组件必须在安装了 I18n 插件的 Vue 应用中使用')
}

/**
 * 获取复数规则
 */
function getPluralRule(count: number, locale: string): PluralRule {
  try {
    const pluralRules = new Intl.PluralRules(locale)
    return pluralRules.select(count) as PluralRule
  }
  catch (error) {
    console.warn('获取复数规则失败，使用默认规则:', error)
    // 默认英语规则
    if (count === 0)
      return 'zero'
    if (count === 1)
      return 'one'
    if (count === 2)
      return 'two'
    return 'other'
  }
}

/**
 * 构建复数化键名
 */
function buildPluralKey(baseKey: string, rule: PluralRule): string {
  return `${baseKey}.${rule}`
}

/**
 * 获取降级键名列表
 */
function getFallbackKeys(baseKey: string, rule: PluralRule): string[] {
  const keys = [buildPluralKey(baseKey, rule)]

  // 添加常见的降级规则
  if (rule !== 'other') {
    keys.push(buildPluralKey(baseKey, 'other'))
  }

  // 如果是 zero，尝试 one
  if (rule === 'zero') {
    keys.push(buildPluralKey(baseKey, 'one'))
  }

  // 如果是 few 或 many，尝试 other
  if (rule === 'few' || rule === 'many') {
    keys.push(buildPluralKey(baseKey, 'other'))
  }

  // 最后尝试基础键名（可能包含管道分隔的复数形式）
  keys.push(baseKey)

  return keys
}

/**
 * 处理管道分隔的复数形式
 * 例如: "item | items" 或 "no items | one item | {count} items"
 */
function processPipeDelimitedPlural(text: string, count: number): string {
  const parts = text.split('|').map(part => part.trim())

  if (parts.length === 1) {
    return text
  }

  // 简单的二元复数形式 "item | items"
  if (parts.length === 2) {
    return count === 1 ? parts[0] : parts[1]
  }

  // 复杂的多元复数形式 "no items | one item | {count} items"
  if (parts.length >= 3) {
    if (count === 0 && parts[0])
      return parts[0]
    if (count === 1 && parts[1])
      return parts[1]
    return parts[2] || parts[parts.length - 1]
  }

  return text
}

/**
 * 计算翻译文本
 */
const translatedText = computed(() => {
  try {
    const currentLocale = props.locale || i18n.getCurrentLanguage()
    const rule = getPluralRule(props.count, currentLocale)

    // 构建参数对象
    const translationParams = {
      ...props.params,
      ...(props.includeCount ? { count: props.count } : {}),
    }

    // 如果提供了自定义复数规则映射
    if (props.pluralRules && props.pluralRules[rule]) {
      const customKey = props.pluralRules[rule]!
      if (i18n.te(customKey)) {
        return i18n.t(customKey, translationParams)
      }
    }

    // 尝试标准的复数化键名
    const fallbackKeys = getFallbackKeys(props.keypath, rule)

    for (const key of fallbackKeys) {
      if (i18n.te(key)) {
        const text = i18n.t(key, translationParams)

        // 如果是基础键名，可能包含管道分隔的复数形式
        if (key === props.keypath && text.includes('|')) {
          return processPipeDelimitedPlural(text, props.count)
        }

        return text
      }
    }

    // 都不存在，返回键名作为降级
    console.warn(`I18nP 复数化翻译失败: ${props.keypath} (count: ${props.count}, rule: ${rule})`)
    return `${props.keypath} (${props.count})`
  }
  catch (error) {
    console.warn(`I18nP 翻译失败: ${props.keypath}`, error)
    return `${props.keypath} (${props.count})`
  }
})
</script>

<script lang="ts">
/**
 * 组件名称
 */
export default {
  name: 'I18nP',
  inheritAttrs: false,
}
</script>

<template>
  <component :is="tag" v-if="translatedText">
    {{ translatedText }}
  </component>
</template>

<style lang="less">
.i18n-plural {
  display: inline;

  &--missing {
    color: var(--ldesign-error-color-5, #e54848);
    font-style: italic;

    &::before {
      content: '⚠️ ';
      font-style: normal;
    }
  }
}

/* 开发模式样式 */
.i18n-plural--dev {
  position: relative;

  &::after {
    content: attr(data-plural-info);
    position: absolute;
    bottom: 100%;
    left: 0;
    background: var(--ldesign-gray-color-10, #242424);
    color: var(--ldesign-font-white-1, white);
    padding: 4px 8px;
    border-radius: var(--ls-border-radius-sm, 3px);
    font-size: var(--ls-font-size-xs, 12px);
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 1000;
  }

  &:hover::after {
    opacity: 1;
  }
}
</style>
