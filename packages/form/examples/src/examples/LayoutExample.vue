<!--
布局系统示例
-->

<template>
  <div class="example-container">
    <div class="example-header">
      <h2>布局系统示例</h2>
      <p>展示响应式栅格布局、字段分组和自适应布局功能</p>
    </div>

    <div class="layout-controls">
      <h3>布局控制</h3>
      <div class="controls">
        <label>
          布局类型:
          <select v-model="currentLayout" @change="updateLayout">
            <option value="grid">栅格布局</option>
            <option value="flex">弹性布局</option>
            <option value="inline">内联布局</option>
          </select>
        </label>
        <label>
          列数:
          <input 
            v-model.number="columns" 
            type="number" 
            min="1" 
            max="6" 
            @change="updateLayout"
          />
        </label>
        <label>
          间距:
          <input 
            v-model.number="gap" 
            type="number" 
            min="0" 
            max="50" 
            @change="updateLayout"
          />
        </label>
        <label>
          <input 
            v-model="responsive" 
            type="checkbox" 
            @change="updateLayout"
          />
          响应式布局
        </label>
      </div>
    </div>

    <div class="example-content">
      <div class="form-section">
        <h3>{{ layoutTitles[currentLayout] }}</h3>
        <DynamicForm
          v-model="formData"
          :config="formConfig"
          @submit="handleSubmit"
        />
      </div>

      <div class="info-section">
        <h3>布局信息</h3>
        <div class="layout-info">
          <div class="info-item">
            <span class="label">当前布局:</span>
            <span class="value">{{ layoutTitles[currentLayout] }}</span>
          </div>
          <div class="info-item">
            <span class="label">列数:</span>
            <span class="value">{{ columns }}</span>
          </div>
          <div class="info-item">
            <span class="label">间距:</span>
            <span class="value">{{ gap }}px</span>
          </div>
          <div class="info-item">
            <span class="label">响应式:</span>
            <span class="value">{{ responsive ? '启用' : '禁用' }}</span>
          </div>
          <div class="info-item">
            <span class="label">当前断点:</span>
            <span class="value">{{ currentBreakpoint }}</span>
          </div>
        </div>

        <div class="breakpoint-info">
          <h4>响应式断点</h4>
          <div class="breakpoint-list">
            <div 
              v-for="(bp, key) in breakpoints" 
              :key="key"
              :class="['breakpoint-item', { active: currentBreakpoint === key }]"
            >
              <span class="bp-name">{{ key.toUpperCase() }}</span>
              <span class="bp-width">{{ bp.value }}px+</span>
              <span class="bp-columns">{{ bp.columns }}列</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { DynamicForm } from '@lemonform/form'
import type { FormConfig, LayoutConfig } from '@lemonform/form'

// 表单数据
const formData = ref({})

// 布局控制
const currentLayout = ref<'grid' | 'flex' | 'inline'>('grid')
const columns = ref(3)
const gap = ref(16)
const responsive = ref(true)
const currentBreakpoint = ref('md')

// 布局标题
const layoutTitles = {
  grid: '栅格布局',
  flex: '弹性布局',
  inline: '内联布局'
}

// 断点配置
const breakpoints = {
  xs: { value: 0, name: 'xs', columns: 1 },
  sm: { value: 576, name: 'sm', columns: 2 },
  md: { value: 768, name: 'md', columns: 3 },
  lg: { value: 992, name: 'lg', columns: 4 },
  xl: { value: 1200, name: 'xl', columns: 5 }
}

// 基础字段配置
const baseFields = [
  {
    type: 'group',
    name: 'personal',
    title: '个人信息',
    fields: [
      {
        type: 'input',
        name: 'firstName',
        label: '名',
        component: 'input',
        required: true,
        placeholder: '请输入名'
      },
      {
        type: 'input',
        name: 'lastName',
        label: '姓',
        component: 'input',
        required: true,
        placeholder: '请输入姓'
      },
      {
        type: 'input',
        name: 'email',
        label: '邮箱',
        component: 'input',
        required: true,
        placeholder: '请输入邮箱'
      },
      {
        type: 'input',
        name: 'phone',
        label: '电话',
        component: 'input',
        placeholder: '请输入电话'
      }
    ]
  },
  {
    type: 'group',
    name: 'address',
    title: '地址信息',
    fields: [
      {
        type: 'select',
        name: 'country',
        label: '国家',
        component: 'select',
        props: {
          options: [
            { label: '中国', value: 'china' },
            { label: '美国', value: 'usa' },
            { label: '日本', value: 'japan' }
          ]
        }
      },
      {
        type: 'select',
        name: 'province',
        label: '省份',
        component: 'select',
        props: {
          options: [
            { label: '北京', value: 'beijing' },
            { label: '上海', value: 'shanghai' },
            { label: '广东', value: 'guangdong' }
          ]
        }
      },
      {
        type: 'input',
        name: 'city',
        label: '城市',
        component: 'input',
        placeholder: '请输入城市'
      },
      {
        type: 'textarea',
        name: 'address',
        label: '详细地址',
        component: 'textarea',
        placeholder: '请输入详细地址',
        props: {
          rows: 3
        }
      }
    ]
  },
  {
    type: 'group',
    name: 'preferences',
    title: '偏好设置',
    fields: [
      {
        type: 'radio',
        name: 'theme',
        label: '主题',
        component: 'radio',
        props: {
          options: [
            { label: '浅色', value: 'light' },
            { label: '深色', value: 'dark' },
            { label: '自动', value: 'auto' }
          ]
        }
      },
      {
        type: 'checkbox',
        name: 'notifications',
        label: '通知类型',
        component: 'checkbox',
        props: {
          options: [
            { label: '邮件通知', value: 'email' },
            { label: '短信通知', value: 'sms' },
            { label: '推送通知', value: 'push' }
          ]
        }
      },
      {
        type: 'switch',
        name: 'newsletter',
        label: '订阅邮件',
        component: 'switch',
        defaultValue: true
      }
    ]
  },
  {
    type: 'actions',
    buttons: [
      { type: 'submit', text: '保存设置', variant: 'primary' },
      { type: 'reset', text: '重置', variant: 'secondary' }
    ]
  }
]

// 响应式表单配置
const formConfig = computed((): FormConfig => ({
  fields: baseFields,
  layout: {
    type: currentLayout.value,
    columns: columns.value,
    gap: gap.value,
    responsive: responsive.value ? {
      enabled: true,
      breakpoints: breakpoints,
      defaultBreakpoint: 'md'
    } : undefined
  } as LayoutConfig
}))

// 更新布局
const updateLayout = () => {
  // 触发重新渲染
  console.log('布局更新:', {
    type: currentLayout.value,
    columns: columns.value,
    gap: gap.value,
    responsive: responsive.value
  })
}

// 检测当前断点
const detectBreakpoint = () => {
  const width = window.innerWidth
  
  if (width >= breakpoints.xl.value) {
    currentBreakpoint.value = 'xl'
  } else if (width >= breakpoints.lg.value) {
    currentBreakpoint.value = 'lg'
  } else if (width >= breakpoints.md.value) {
    currentBreakpoint.value = 'md'
  } else if (width >= breakpoints.sm.value) {
    currentBreakpoint.value = 'sm'
  } else {
    currentBreakpoint.value = 'xs'
  }
}

// 窗口大小变化监听
const handleResize = () => {
  detectBreakpoint()
}

// 生命周期
onMounted(() => {
  detectBreakpoint()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 事件处理
const handleSubmit = (data: any) => {
  console.log('表单提交:', data)
  alert('设置保存成功！')
}
</script>

<style scoped>
.example-container {
  max-width: 1200px;
  margin: 0 auto;
}

.example-header {
  text-align: center;
  margin-bottom: 30px;
}

.example-header h2 {
  color: #333;
  margin-bottom: 10px;
}

.example-header p {
  color: #666;
  font-size: 16px;
}

.layout-controls {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.layout-controls h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.controls {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #666;
}

.controls select,
.controls input[type="number"] {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 80px;
}

.example-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.form-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.info-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.layout-info {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.info-item .label {
  font-weight: 500;
  color: #666;
}

.info-item .value {
  font-weight: 600;
  color: #333;
}

.breakpoint-info h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 14px;
}

.breakpoint-list {
  display: grid;
  gap: 5px;
}

.breakpoint-item {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  padding: 6px 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.2s;
}

.breakpoint-item.active {
  background: #e7f3ff;
  border: 1px solid #1890ff;
}

.bp-name {
  font-weight: 600;
  color: #333;
}

.bp-width {
  color: #666;
}

.bp-columns {
  color: #f39c12;
  font-weight: 500;
}

@media (max-width: 768px) {
  .example-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .controls {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
