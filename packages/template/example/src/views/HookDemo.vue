<script setup lang="ts">
import { useSimpleTemplate } from '@ldesign/template'
import { ref } from 'vue'

// 使用简化版 useTemplate hook
const {
  TemplateComponent,
  showSelector,
  selectedTemplate,
  openSelector,
  closeSelector,
  switchTemplate,
} = useSimpleTemplate({
  category: 'login',
  showSelector: true, // 默认隐藏选择器
  selectorConfig: {
    theme: 'default',
    animation: 'slide',
    showSearch: false,  // 简化配置：隐藏搜索
    showTags: false,    // 简化配置：隐藏标签
    showSort: false,    // 简化配置：隐藏排序
  },
  templateProps: {
    title: '用户登录',
    subtitle: '欢迎回来，请登录您的账户',
  },
})

// 当前模板显示名称
const currentTemplateName = ref('默认登录模板')

// 处理模板切换
function handleTemplateSwitch(templateName: string) {
  switchTemplate(templateName)
  // 更新显示名称
  const templateNames: Record<string, string> = {
    'default': '默认登录模板',
    'creative': '创意设计登录模板',
    'modern': '现代简约登录模板',
  }
  currentTemplateName.value = templateNames[templateName] || templateName
}

// 刷新模板
function refreshTemplates() {
  console.log('刷新模板列表')
  // 这里可以添加刷新逻辑
}
</script>

<template>
  <TemplateComponent/>
</template>
