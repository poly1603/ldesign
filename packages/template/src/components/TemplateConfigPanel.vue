<template>
  <div class="template-config-panel" :class="{ 'config-panel--visible': panelVisible }">
    <!-- 配置面板触发按钮 -->
    <button v-if="!panelVisible" class="config-panel-trigger" @click="togglePanel" title="打开配置面板">
      <span class="config-icon">⚙️</span>
    </button>

    <!-- 配置面板内容 -->
    <div v-if="panelVisible" class="config-panel-content">
      <!-- 面板头部 -->
      <div class="config-panel-header">
        <h3 class="config-panel-title">配置面板</h3>
        <button class="config-panel-close" @click="togglePanel" title="关闭">
          <span class="close-icon">✕</span>
        </button>
      </div>

      <!-- 配置选项 -->
      <div class="config-panel-body">
        <!-- 模板选择器 -->
        <div class="config-section">
          <h4 class="config-section-title">模板选择</h4>
          <div class="config-section-content">
            <button class="config-button config-button--primary" @click="openTemplateSelector">
              选择模板
            </button>
            <p class="config-description">当前模板：{{ currentTemplateName }}</p>
          </div>
        </div>

        <!-- 配置组件插槽 - 由父组件传入真实的配置组件 -->
        <slot name="config-components" :on-language-change="handleLanguageChange" :on-theme-change="handleThemeChange"
          :on-dark-mode-change="handleDarkModeChange" :on-size-change="handleSizeChange">
          <!-- 默认内容：如果没有传入插槽，显示提示信息 -->
          <div class="config-placeholder">
            <div class="config-section">
              <h4 class="config-section-title">配置组件</h4>
              <div class="config-section-content">
                <p class="config-placeholder-text">请通过 config-components 插槽传入配置组件</p>
              </div>
            </div>
          </div>
        </slot>
      </div>
    </div>

    <!-- 模板选择器弹窗 -->
    <Teleport to="body">
      <TemplateSelector v-if="showTemplateSelector" :visible="showTemplateSelector" :category="templateCategory"
        :device="deviceType" :current-template="currentTemplate" @select="handleTemplateSelect"
        @close="closeTemplateSelector" />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { Teleport } from 'vue'
import type { DeviceType } from '../types/template'
import { TemplateSelector } from './TemplateSelector'

// 导入真实的组件
// 移除直接导入，改为通过插槽传入

// Props 定义
interface TemplateConfigPanelProps {
  /** 是否显示配置面板 */
  visible?: boolean
  /** 当前模板名称 */
  currentTemplate?: string
  /** 模板分类 */
  templateCategory?: string
  /** 设备类型 */
  deviceType?: DeviceType
  /** 模板切换函数 */
  onTemplateSwitch?: (templateName: string) => Promise<void>
}

const props = withDefaults(defineProps<TemplateConfigPanelProps>(), {
  visible: false,
  currentTemplate: '',
  templateCategory: 'dashboard',
  deviceType: 'desktop',
})

// Emits 定义
const emit = defineEmits<{
  'update:visible': [visible: boolean]
  'template-select': [templateName: string]
  'theme-change': [theme: string, mode: 'light' | 'dark']
  'language-change': [language: string]
  'dark-mode-change': [isDark: boolean]
  'size-change': [size: string]
}>()

// 尝试从父组件注入模板切换函数和模板信息
const injectedTemplateSwitch = inject<(templateName: string) => Promise<void>>('templateSwitch', undefined)
const injectedCurrentTemplate = inject<any>('currentTemplate', undefined)
const injectedAvailableTemplates = inject<any>('availableTemplates', undefined)

// 响应式状态
const panelVisible = ref(props.visible)
const showTemplateSelector = ref(false)

// 计算属性
const currentTemplateName = computed(() => {
  // 优先使用注入的当前模板信息
  if (injectedCurrentTemplate?.value?.name) {
    return injectedCurrentTemplate.value.name
  }
  return props.currentTemplate || '未选择模板'
})

// 方法
const togglePanel = () => {
  panelVisible.value = !panelVisible.value
  emit('update:visible', panelVisible.value)
}

const openTemplateSelector = () => {
  showTemplateSelector.value = true
}

const closeTemplateSelector = () => {
  showTemplateSelector.value = false
}

const handleTemplateSelect = async (templateName: string) => {
  console.log('模板选择:', templateName)

  // 尝试使用注入的模板切换函数
  if (injectedTemplateSwitch) {
    try {
      await injectedTemplateSwitch(templateName)
      console.log('模板切换成功:', templateName)
    } catch (error) {
      console.error('模板切换失败:', error)
    }
  } else if (props.onTemplateSwitch) {
    // 使用props传入的模板切换函数
    try {
      await props.onTemplateSwitch(templateName)
      console.log('模板切换成功:', templateName)
    } catch (error) {
      console.error('模板切换失败:', error)
    }
  } else {
    // 回退到发出事件
    emit('template-select', templateName)
  }

  closeTemplateSelector()
}

const handleThemeChange = (theme: string, mode: 'light' | 'dark') => {
  console.log('主题切换:', theme, mode)
  emit('theme-change', theme, mode)
}

const handleDarkModeChange = (isDark: boolean) => {
  console.log('暗黑模式切换:', isDark)
  emit('dark-mode-change', isDark)
}

const handleLanguageChange = (language: string) => {
  console.log('语言切换:', language)
  emit('language-change', language)
}

const handleSizeChange = (size: string) => {
  console.log('尺寸切换:', size)
  emit('size-change', size)
}
</script>

<style lang="less" scoped>
@import './TemplateConfigPanel.less';
</style>
