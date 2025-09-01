<script setup lang="ts">
import { TemplateRenderer } from '@ldesign/template'
import { computed, ref } from 'vue'

// 响应式数据
const selectedTemplate = ref<string>('default')

// 计算属性

// 简化的模板属性
const templateProps = computed(() => ({
  title: '用户登录',
  subtitle: '欢迎回来，请登录您的账户',
}))

// 简化的模板选择器配置
const selectorConfig = computed(() => ({
  theme: 'default',
  animation: 'scale',
  showSearch: false,   // 隐藏搜索框
  showTags: false,     // 隐藏标签筛选
  showSort: false,     // 隐藏排序选项
}))

// 简化的方法
function handleTemplateChange(template: any) {
  console.log('模板变化:', template)
  if (template?.name) {
    selectedTemplate.value = template.name
  }
}

function handleTemplateLoaded(template: any) {
  console.log('模板加载成功:', template)
}

function handleError(error: any) {
  console.error('模板加载错误:', error)
}
</script>

<template>
  <TemplateRenderer
    category="login"
    :show-selector="true"
    :props="templateProps"
    :selector-config="selectorConfig"
    @template-change="handleTemplateChange"
    @load-success="handleTemplateLoaded"
    @load-error="handleError"
  />
</template>