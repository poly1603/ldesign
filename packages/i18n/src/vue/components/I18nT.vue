<!--
  I18nT 翻译组件

  用于声明式翻译的 Vue 组件

  @example
  <I18nT keypath="hello" />
  <I18nT keypath="welcome" :params="{ name: 'Vue' }" />
  <I18nT keypath="user.profile.name" tag="span" />
-->

<script setup lang="ts">
import { computed, inject } from 'vue'
import { I18nInjectionKey } from '../plugin'

/**
 * 插值部分类型
 */
interface InterpolationPart {
  type: 'text' | 'component' | 'slot'
  content: string
  component?: any
  props?: Record<string, unknown>
  name?: string
}

// 使用内联类型定义以避免私有 Props 名称泄漏
const props = withDefaults(defineProps<{
  /** 翻译键路径 */
  keypath: string
  /** 插值参数 */
  params?: Record<string, unknown>
  /** 渲染的 HTML 标签 */
  tag?: string
  /** 指定语言（可选） */
  locale?: string
  /** 是否启用 HTML 渲染 */
  html?: boolean
  /** 组件插值映射 */
  components?: Record<string, any>
  /** 是否启用组件插值 */
  enableComponentInterpolation?: boolean
}>(), {
  tag: 'span',
  html: false,
  enableComponentInterpolation: false,
})

/**
 * 注入 I18n 实例
 */
const i18n = inject(I18nInjectionKey)
if (!i18n) {
  throw new Error('I18nT 组件必须在安装了 I18n 插件的 Vue 应用中使用')
}

/**
 * 计算翻译文本
 */
const translatedText = computed(() => {
  try {
    if (props.locale) {
      // 如果指定了语言，临时切换语言进行翻译
      const currentLocale = i18n.getCurrentLanguage()
      if (currentLocale !== props.locale) {
        // 这里需要实现临时语言切换的逻辑
        // 暂时使用当前语言翻译
        return i18n.t(props.keypath, props.params)
      }
    }

    return i18n.t(props.keypath, props.params)
  }
  catch (error) {
    console.warn(`I18nT 翻译失败: ${props.keypath}`, error)
    return props.keypath // 降级显示键名
  }
})
/**
 * 是否应该渲染
 */
const shouldRender = computed(() => {
  return translatedText.value && translatedText.value.length > 0
})

/**
 * 是否有组件插值
 */
const hasComponentInterpolation = computed(() => {
  return props.enableComponentInterpolation
    && translatedText.value
    && (translatedText.value.includes('<') || translatedText.value.includes('{'))
})

/**
 * 解析插值部分
 */
const interpolatedParts = computed((): InterpolationPart[] => {
  if (!hasComponentInterpolation.value) {
    return [{ type: 'text', content: translatedText.value }]
  }

  const text = translatedText.value
  const parts: InterpolationPart[] = []

  // 解析组件标签 <ComponentName>content</ComponentName>
  const componentRegex = /<(\w+)([^>]*)>(.*?)<\/\1>/g
  // 解析插槽标签 {slotName}
  const slotRegex = /\{(\w+)\}/g

  let lastIndex = 0
  let match

  // 处理组件标签
  while ((match = componentRegex.exec(text)) !== null) {
    const [fullMatch, componentName, attributes, content] = match
    const startIndex = match.index!

    // 添加前面的文本
    if (startIndex > lastIndex) {
      const textContent = text.slice(lastIndex, startIndex)
      if (textContent) {
        parts.push({ type: 'text', content: textContent })
      }
    }

    // 解析属性
    const props: Record<string, unknown> = {}
    if (attributes) {
      const attrRegex = /(\w+)=["']([^"']*)["']/g
      let attrMatch
      while ((attrMatch = attrRegex.exec(attributes)) !== null) {
        props[attrMatch[1]] = attrMatch[2]
      }
    }

    // 添加组件部分
    const component = (props.components as Record<string, any>)?.[componentName] || componentName
    parts.push({
      type: 'component',
      content,
      component,
      props,
    })

    lastIndex = startIndex + fullMatch.length
  }

  // 处理插槽标签
  componentRegex.lastIndex = 0 // 重置正则表达式
  const workingText = text
  const offset = 0

  while ((match = slotRegex.exec(text)) !== null) {
    const [fullMatch, slotName] = match
    const startIndex = match.index! + offset

    // 检查是否在组件标签内
    let inComponent = false
    for (const part of parts) {
      if (part.type === 'component' && part.content.includes(fullMatch)) {
        inComponent = true
        break
      }
    }

    if (!inComponent) {
      // 添加前面的文本
      if (startIndex > lastIndex) {
        const textContent = workingText.slice(lastIndex - offset, startIndex - offset)
        if (textContent) {
          parts.push({ type: 'text', content: textContent })
        }
      }

      // 添加插槽部分
      parts.push({
        type: 'slot',
        content: slotName,
        name: slotName,
      })

      lastIndex = startIndex + fullMatch.length
    }
  }

  // 添加剩余的文本
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex)
    if (remainingText) {
      parts.push({ type: 'text', content: remainingText })
    }
  }

  // 如果没有找到任何插值，返回原始文本
  if (parts.length === 0) {
    parts.push({ type: 'text', content: text })
  }

  return parts
})
</script>

<script lang="ts">
/**
 * 组件名称
 */
export default {
  name: 'I18nT',
  inheritAttrs: false,
}
</script>

<template>
  <component :is="tag" v-if="shouldRender">
    <!-- HTML 渲染模式 -->
    <span v-if="html" v-html="translatedText"></span>

    <!-- 组件插值模式 -->
    <template v-else-if="hasComponentInterpolation">
      <template v-for="(part, index) in interpolatedParts" :key="index">
        <!-- 文本部分 -->
        <template v-if="part.type === 'text'">{{ part.content }}</template>

        <!-- 组件部分 -->
        <component v-else-if="part.type === 'component'" :is="part.component" v-bind="part.props">
          {{ part.content }}
        </component>

        <!-- 插槽部分 -->
        <slot v-else-if="part.type === 'slot'" :name="part.name" :content="part.content" :index="index">
          {{ part.content }}
        </slot>
      </template>
    </template>

    <!-- 普通文本模式 -->
    <template v-else>
      {{ translatedText }}
    </template>
  </component>
</template>
