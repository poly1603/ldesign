<!--
  I18nL 列表格式化组件

  用于格式化列表，支持不同的连接方式和样式

  @example
  <I18nL :items="['Apple', 'Banana', 'Orange']" />  <!-- "Apple, Banana, and Orange" -->
  <I18nL :items="['Red', 'Green']" type="disjunction" />  <!-- "Red or Green" -->

  <I18nL :items="tags" type="unit" />  <!-- "Apple, Banana, Orange" -->
-->

<script setup lang="ts">
import { computed, inject, useSlots } from 'vue'
import { I18nInjectionKey } from '../plugin'

/**
 * 列表格式化类型
 */
type ListType = 'conjunction' | 'disjunction' | 'unit'

/**
 * 列表格式化样式
 */
type ListStyle = 'long' | 'short' | 'narrow'

// 使用内联类型定义以避免私有 Props 名称泄漏
const props = withDefaults(defineProps<{
  /** 要格式化的列表项 */
  items: (string | number)[]
  /** 列表类型 */
  type?: ListType
  /** 格式化样式 */
  style?: ListStyle
  /** 渲染的 HTML 标签 */
  tag?: string
  /** 指定语言（可选） */
  locale?: string
  /** 是否使用插槽渲染项目 */
  useSlots?: boolean
  /** 最大显示项目数，超出部分显示省略 */
  maxItems?: number
  /** 省略文本的翻译键 */
  moreTextKey?: string
  /** 自定义分隔符 */
  customSeparators?: {
    /** 普通分隔符 */
    normal?: string
    /** 最后一个分隔符 */
    final?: string
  }
}>(), {
  type: 'conjunction',
  style: 'long',
  tag: 'span',
  useSlots: false,
  moreTextKey: 'common.and_more',
})

/**
 * 注入 I18n 实例
 */
const i18n = inject(I18nInjectionKey)!
if (!i18n) {
  throw new Error('I18nL 组件必须在安装了 I18n 插件的 Vue 应用中使用')
}

/**
 * 获取插槽
 */
const slots = useSlots()

/**
 * 是否有默认插槽
 */
const hasDefaultSlot = computed(() => !!slots.default)

/**
 * 当前语言
 */
const currentLocale = computed(() => {
  return props.locale || i18n.getCurrentLanguage()
})

/**
 * 列表格式化器
 */
const listFormatter = computed(() => {
  try {
    // 检查 Intl.ListFormat 是否可用
    if (typeof Intl !== 'undefined' && 'ListFormat' in Intl) {
      return new (Intl as any).ListFormat(currentLocale.value, {
        style: props.style,
        type: props.type,
      })
    }
    return null
  }
  catch (error) {
    console.warn('创建列表格式化器失败:', error)
    return null
  }
})

/**
 * 处理后的项目列表
 */
const processedItems = computed(() => {
  let items = props.items.map(item => String(item))

  // 如果设置了最大项目数且超出限制
  if (props.maxItems && items.length > props.maxItems) {
    const visibleItems = items.slice(0, props.maxItems)
    const remainingCount = items.length - props.maxItems

    // 获取"更多"文本
    let moreText = `+${remainingCount}`
    if (i18n.te(props.moreTextKey)) {
      moreText = i18n.t(props.moreTextKey, { count: remainingCount })
    }

    visibleItems.push(moreText)
    items = visibleItems
  }

  return items
})

/**
 * 格式化后的列表文本
 */
const formattedList = computed(() => {
  if (processedItems.value.length === 0) {
    return ''
  }

  if (processedItems.value.length === 1) {
    return processedItems.value[0]
  }

  // 使用 Intl.ListFormat
  if (listFormatter.value) {
    try {
      return listFormatter.value.format(processedItems.value)
    }
    catch (error) {
      console.warn('列表格式化失败:', error)
    }
  }

  // 降级处理：使用自定义分隔符或默认逻辑
  return formatListFallback(processedItems.value)
})

/**
 * 降级的列表格式化函数
 */
function formatListFallback(items: string[]): string {
  if (items.length === 0)
    return ''
  if (items.length === 1)
    return items[0]
  if (items.length === 2) {
    const connector = getConnector()
    return `${items[0]} ${connector} ${items[1]}`
  }

  const lastItem = items[items.length - 1]
  const otherItems = items.slice(0, -1)
  const connector = getConnector()

  if (props.customSeparators) {
    const normalSep = props.customSeparators.normal || ', '
    const finalSep = props.customSeparators.final || ` ${connector} `
    return `${otherItems.join(normalSep)}${finalSep}${lastItem}`
  }

  return `${otherItems.join(', ')} ${connector} ${lastItem}`
}

/**
 * 获取连接词
 */
function getConnector(): string {
  // 尝试从翻译中获取连接词
  const connectorKey = `common.list.${props.type}`
  if (i18n.te(connectorKey)) {
    return i18n.t(connectorKey)
  }

  // 默认连接词
  switch (props.type) {
    case 'conjunction':
      return 'and'
    case 'disjunction':
      return 'or'
    case 'unit':
      return ','
    default:
      return 'and'
  }
}

/**
 * 获取分隔符（用于插槽模式）
 */
function getSeparator(index: number): string {
  const isLast = index === processedItems.value.length - 2

  if (props.customSeparators) {
    return isLast
      ? (props.customSeparators.final || ` ${getConnector()} `)
      : (props.customSeparators.normal || ', ')
  }

  if (processedItems.value.length === 2) {
    return ` ${getConnector()} `
  }

  return isLast ? ` ${getConnector()} ` : ', '
}
</script>

<script lang="ts">
/**
 * 组件名称
 */
export default {
  name: 'I18nL',
  inheritAttrs: false,
}
</script>

<template>
  <component :is="tag">
    <template v-if="hasDefaultSlot">
      <!-- 使用插槽渲染每个项目 -->
      <template v-for="(item, index) in items" :key="index">
        <slot :item="item" :index="index" :is-last="index === items.length - 1">
          {{ item }}
        </slot>
        <span v-if="index < items.length - 1" class="i18n-list__separator">
          {{ getSeparator(index) }}
        </span>
      </template>
    </template>
    <template v-else>
      {{ formattedList }}
    </template>
  </component>
</template>

<style lang="less">
.i18n-list {
  display: inline;

  &__separator {
    color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.7));
  }

  &__item {
    display: inline;

    &--highlighted {
      font-weight: 600;
      color: var(--ldesign-brand-color-6, #7334cb);
    }

    &--muted {
      color: var(--ldesign-text-color-placeholder, rgba(0, 0, 0, 0.3));
    }
  }

  &__more {
    color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.7));
    font-style: italic;
    cursor: help;

    &:hover {
      color: var(--ldesign-brand-color-6, #7334cb);
    }
  }
}

/* 不同类型的样式 */
.i18n-list--conjunction {
  .i18n-list__separator:last-of-type {
    font-weight: 500;
  }
}

.i18n-list--disjunction {
  .i18n-list__separator {
    color: var(--ldesign-warning-color-6, #f0b80f);
    font-weight: 500;
  }
}

.i18n-list--unit {
  .i18n-list__separator {
    color: var(--ldesign-text-color-placeholder, rgba(0, 0, 0, 0.3));
  }
}

/* 不同样式的格式 */
.i18n-list--narrow {
  font-size: 0.9em;

  .i18n-list__separator {
    margin: 0 2px;
  }
}

.i18n-list--short {
  .i18n-list__separator {
    margin: 0 4px;
  }
}

.i18n-list--long {
  .i18n-list__separator {
    margin: 0 6px;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .i18n-list--long {
    .i18n-list__separator {
      margin: 0 4px;
    }
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .i18n-list {
    &__separator {
      color: rgba(255, 255, 255, 0.7);
    }

    &__item--muted {
      color: rgba(255, 255, 255, 0.3);
    }

    &__more {
      color: rgba(255, 255, 255, 0.7);

      &:hover {
        color: var(--ldesign-brand-color-4, #a67fdb);
      }
    }
  }

  .i18n-list--unit {
    .i18n-list__separator {
      color: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>
