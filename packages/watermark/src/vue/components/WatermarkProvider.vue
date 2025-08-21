<script setup lang="ts">
import type { PropType } from 'vue'
import type { WatermarkConfig } from '../../types'
import type { WatermarkProviderContext } from '../types'
import { computed, provide } from 'vue'
import { DEFAULT_WATERMARK_CONFIG } from '../../types/config'

// 组件属性（使用运行时声明以避免 TS 类型解析在构建时的限制）
const props = defineProps({
  config: Object as PropType<Partial<WatermarkConfig>>,
  globalSecurity: { type: Boolean, default: true },
  globalResponsive: { type: Boolean, default: true },
  globalStyle: Object as PropType<WatermarkConfig['style']>,
  globalLayout: Object as PropType<WatermarkConfig['layout']>,
})

// 全局配置
const globalConfig = computed((): Partial<WatermarkConfig> => {
  return {
    ...props.config,
    style: {
      ...props.config?.style,
      ...props.globalStyle,
    },
    layout: {
      ...props.config?.layout,
      ...props.globalLayout,
    },
  }
})

// 全局安全配置
const globalSecurity = computed(() => props.globalSecurity)

// 全局响应式配置
const globalResponsive = computed(() => props.globalResponsive)

/**
 * 合并配置的方法
 * 将局部配置与全局配置合并
 */
function mergeConfig(localConfig: Partial<WatermarkConfig>): WatermarkConfig {
  const merged = {
    // 默认配置
    ...DEFAULT_WATERMARK_CONFIG,
    // 全局配置
    ...globalConfig.value,
    // 局部配置
    ...localConfig,
    // 确保有content属性
    content: localConfig.content || globalConfig.value?.content || 'Watermark',
    // 样式合并
    style: {
      ...DEFAULT_WATERMARK_CONFIG.style,
      ...globalConfig.value.style,
      ...localConfig.style,
    },
    // 布局合并
    layout: {
      ...DEFAULT_WATERMARK_CONFIG.layout,
      ...globalConfig.value.layout,
      ...localConfig.layout,
    },
    // 安全配置合并
    security: {
      ...DEFAULT_WATERMARK_CONFIG.security,
      ...globalConfig.value.security,
      ...localConfig.security,
      // 如果全局启用安全，确保安全级别不为none
      level:
        globalSecurity.value
        && (!localConfig.security?.level || localConfig.security.level === 'none')
          ? 'basic'
          : localConfig.security?.level
            || DEFAULT_WATERMARK_CONFIG.security?.level
            || 'none',
    },
    // 响应式配置合并
    responsive: {
      ...DEFAULT_WATERMARK_CONFIG.responsive,
      ...globalConfig.value.responsive,
      ...localConfig.responsive,
      // 如果全局启用响应式，确保响应式功能开启
      enabled:
        globalResponsive.value
        || localConfig.responsive?.enabled
        || DEFAULT_WATERMARK_CONFIG.responsive?.enabled
        || false,
    },
    // 动画配置合并
    animation: {
      ...DEFAULT_WATERMARK_CONFIG.animation,
      ...globalConfig.value.animation,
      ...localConfig.animation,
    },
  } as WatermarkConfig

  return merged
}

// 提供上下文给子组件
const providerContext: WatermarkProviderContext = {
  globalConfig,
  mergeConfig,
  globalSecurity,
  globalResponsive,
}

provide('watermarkProvider', providerContext)

// 暴露给父组件
defineExpose({
  globalConfig,
  mergeConfig,
  globalSecurity,
  globalResponsive,
})
</script>

<template>
  <div class="watermark-provider">
    <slot />
  </div>
</template>

<style scoped>
.watermark-provider {
  width: 100%;
  height: 100%;
}
</style>
