<template>
  <div class="external-template-demo">
    <div class="demo-header">
      <h1>外部模板扩展演示</h1>
      <p>演示如何使用外部模板扩展默认模板系统</p>
    </div>

    <div class="demo-controls">
      <div class="control-group">
        <label>模板分类:</label>
        <select v-model="currentCategory" @change="handleCategoryChange">
          <option value="login">登录模板</option>
          <option value="dashboard">仪表板模板</option>
        </select>
      </div>

      <div class="control-group">
        <label>设备类型:</label>
        <select v-model="currentDeviceType">
          <option value="desktop">桌面端</option>
          <option value="tablet">平板端</option>
          <option value="mobile">移动端</option>
        </select>
      </div>
    </div>

    <div class="demo-content">
      <TemplateRenderer
        :template="currentTemplate"
        :category="currentCategory"
        :device-type="currentDeviceType"
        :external-templates="externalTemplates"
        :extension-options="extensionOptions"
        :show-selector="true"
        :selector-config="{ layout: 'header' }"
        @template-loaded="handleTemplateLoaded"
        @template-error="handleTemplateError"
        @template-selected="handleTemplateSelected"
      />
    </div>

    <div class="demo-info">
      <h3>扩展信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>外部模板数量:</strong>
          <span>{{ externalTemplates.length }}</span>
        </div>
        <div class="info-item">
          <strong>当前模板:</strong>
          <span>{{ currentTemplate }}</span>
        </div>
        <div class="info-item">
          <strong>扩展策略:</strong>
          <span>{{ extensionOptions.priorityStrategy }}</span>
        </div>
        <div class="info-item">
          <strong>合并冲突:</strong>
          <span>{{ extensionOptions.mergeConflicts ? '是' : '否' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createExternalTemplate } from '@ldesign/template'
import TemplateRenderer from '../../../src/vue/components/TemplateRenderer.vue'
import type { ExternalTemplate, DeviceType } from '@ldesign/template'
import CustomLogin from './external-templates/CustomLogin.vue'
import { customLoginConfig } from './external-templates/custom-login-config'

// 当前状态
const currentTemplate = ref('login')
const currentCategory = ref('login')
const currentDeviceType = ref<DeviceType>('desktop')

// 创建外部模板
const externalTemplates: ExternalTemplate[] = [
  createExternalTemplate(customLoginConfig, CustomLogin)
]

// 扩展选项
const extensionOptions = {
  overrideDefaults: false,
  mergeConflicts: true,
  priorityStrategy: 'external' as const
}

// 事件处理
const handleCategoryChange = () => {
  // 根据分类设置默认模板
  if (currentCategory.value === 'login') {
    currentTemplate.value = 'login'
  } else if (currentCategory.value === 'dashboard') {
    currentTemplate.value = 'dashboard'
  }
}

const handleTemplateLoaded = (component: any) => {
  console.log('模板加载成功:', component)
}

const handleTemplateError = (error: Error) => {
  console.error('模板加载失败:', error)
}

const handleTemplateSelected = (templateName: string) => {
  console.log('模板已选择:', templateName)
  currentTemplate.value = templateName
}
</script>

<style scoped>
.external-template-demo {
  min-height: 100vh;
  background: #f5f5f5;
}

.demo-header {
  background: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.demo-header h1 {
  margin: 0 0 0.5rem;
  color: #333;
  font-size: 2rem;
}

.demo-header p {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

.demo-controls {
  background: white;
  padding: 1.5rem 2rem;
  display: flex;
  gap: 2rem;
  border-bottom: 1px solid #e0e0e0;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 600;
  color: #333;
}

.control-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.demo-content {
  flex: 1;
}

.demo-info {
  background: white;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
}

.demo-info h3 {
  margin: 0 0 1rem;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.info-item strong {
  color: #333;
}

.info-item span {
  color: #666;
}
</style>
