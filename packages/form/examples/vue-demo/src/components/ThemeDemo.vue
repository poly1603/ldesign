<template>
  <div class="theme-demo">
    <div class="controls">
      <button
        v-for="theme in availableThemes"
        :key="theme.name"
        class="btn"
        :class="currentTheme === theme.name ? 'btn-primary' : 'btn-secondary'"
        @click="switchTheme(theme.name)"
      >
        {{ theme.label }}
      </button>
    </div>

    <div class="form-container" :data-theme="currentTheme">
      <DynamicForm
        v-model="themeFormData"
        :options="themeFormOptions"
        :theme="currentTheme"
        @submit="handleThemeSubmit"
      />
    </div>

    <div class="status-panel">
      <div class="status-title">主题系统状态</div>
      <div class="status-item">
        <span class="status-label">当前主题:</span>
        <span class="status-value highlight">{{ currentTheme }}</span>
      </div>
      <div class="status-item">
        <span class="status-label">可用主题:</span>
        <span class="status-value">{{ availableThemes.length }}</span>
      </div>
      <div class="status-item">
        <span class="status-label">主题类型:</span>
        <span class="status-value">{{ getCurrentThemeType() }}</span>
      </div>
    </div>

    <div class="data-display">
      <div class="data-title">主题表单数据</div>
      <div class="data-content">
        {{ JSON.stringify(themeFormData, null, 2) }}
      </div>
    </div>

    <div class="theme-preview">
      <div class="data-title">主题预览</div>
      <div class="theme-samples">
        <div
          class="theme-sample"
          v-for="theme in availableThemes"
          :key="theme.name"
        >
          <div class="theme-sample-header" :data-theme="theme.name">
            <h4>{{ theme.label }}</h4>
            <p>{{ theme.description }}</p>
          </div>
          <div class="theme-sample-content" :data-theme="theme.name">
            <div class="sample-input">
              <label>示例输入框</label>
              <input type="text" :placeholder="`${theme.label} 主题示例`" />
            </div>
            <div class="sample-button">
              <button class="btn btn-primary">主要按钮</button>
              <button class="btn btn-secondary">次要按钮</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="code-block">
      <div class="data-title">主题使用代码</div>
      <pre><code>&lt;template&gt;
  &lt;!-- 方式1: 通过 theme 属性 --&gt;
  &lt;DynamicForm
    v-model="formData"
    :options="formOptions"
    :theme="currentTheme"
  /&gt;
  
  &lt;!-- 方式2: 通过 CSS 类名 --&gt;
  &lt;div :class="\`form-theme-\${currentTheme}\`"&gt;
    &lt;DynamicForm v-model="formData" :options="formOptions" /&gt;
  &lt;/div&gt;
  
  &lt;!-- 方式3: 通过数据属性 --&gt;
  &lt;div :data-theme="currentTheme"&gt;
    &lt;DynamicForm v-model="formData" :options="formOptions" /&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref } from 'vue'
import { DynamicForm, getPresetTheme } from '@ldesign/form'

const currentTheme = ref('light')

// 获取预设主题
const lightTheme = getPresetTheme('light')
const darkTheme = getPresetTheme('dark')

// 切换主题
const switchTheme = (themeName: string) => {
  currentTheme.value = themeName
}
&lt;/script&gt;</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@ldesign/form'
import type { FormOptions } from '@ldesign/form'

// 响应式数据
const currentTheme = ref('light')
const themeFormData = ref<Record<string, any>>({})

// 可用主题列表
const availableThemes = [
  {
    name: 'light',
    label: '浅色主题',
    description: '经典的浅色主题，适合日间使用',
    type: 'light',
  },
  {
    name: 'dark',
    label: '暗色主题',
    description: '护眼的暗色主题，适合夜间使用',
    type: 'dark',
  },
  {
    name: 'blue',
    label: '蓝色主题',
    description: '专业的蓝色主题，适合商务场景',
    type: 'light',
  },
  {
    name: 'green',
    label: '绿色主题',
    description: '清新的绿色主题，适合自然风格',
    type: 'light',
  },
  {
    name: 'purple',
    label: '紫色主题',
    description: '优雅的紫色主题，适合创意场景',
    type: 'light',
  },
  {
    name: 'compact',
    label: '紧凑主题',
    description: '紧凑的布局主题，节省空间',
    type: 'light',
  },
  {
    name: 'comfortable',
    label: '宽松主题',
    description: '宽松的布局主题，舒适阅读',
    type: 'light',
  },
  {
    name: 'rounded',
    label: '圆角主题',
    description: '圆润的设计风格，现代感强',
    type: 'light',
  },
  {
    name: 'flat',
    label: '扁平主题',
    description: '简洁的扁平设计，极简风格',
    type: 'light',
  },
]

// 主题表单配置
const themeFormOptions: FormOptions = {
  title: '主题演示表单',
  description: '这个表单用于演示不同主题的视觉效果',
  fields: [
    {
      name: 'themeName',
      title: '主题名称',
      component: 'FormInput',
      required: true,
      placeholder: '请输入主题名称',
      rules: [{ type: 'required', message: '主题名称不能为空' }],
    },
    {
      name: 'themeType',
      title: '主题类型',
      component: 'FormSelect',
      options: [
        { label: '浅色主题', value: 'light' },
        { label: '暗色主题', value: 'dark' },
        { label: '彩色主题', value: 'colorful' },
      ],
    },
    {
      name: 'primaryColor',
      title: '主色调',
      component: 'FormInput',
      type: 'color',
      placeholder: '#1890ff',
    },
    {
      name: 'fontSize',
      title: '字体大小',
      component: 'FormSelect',
      options: [
        { label: '小号 (12px)', value: 'small' },
        { label: '中号 (14px)', value: 'medium' },
        { label: '大号 (16px)', value: 'large' },
      ],
    },
    {
      name: 'borderRadius',
      title: '圆角大小',
      component: 'FormInput',
      type: 'range',
      props: {
        min: 0,
        max: 20,
        step: 1,
      },
    },
    {
      name: 'animations',
      title: '启用动画',
      component: 'FormRadio',
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
    },
    {
      name: 'features',
      title: '主题特性',
      component: 'FormSelect',
      span: 2,
      props: {
        multiple: true,
      },
      options: [
        { label: '响应式设计', value: 'responsive' },
        { label: '暗色模式', value: 'dark_mode' },
        { label: '高对比度', value: 'high_contrast' },
        { label: '大字体支持', value: 'large_font' },
        { label: '无障碍访问', value: 'accessibility' },
        { label: '打印优化', value: 'print_optimized' },
      ],
    },
    {
      name: 'description',
      title: '主题描述',
      component: 'FormTextarea',
      span: 2,
      placeholder: '请描述这个主题的特点和适用场景',
      props: {
        rows: 4,
      },
    },
  ],
  layout: {
    columns: 2,
    horizontalGap: 16,
    verticalGap: 16,
  },
}

// 事件处理
const handleThemeSubmit = (data: any) => {
  console.log('主题表单提交:', data)
  alert('主题表单提交成功！请查看控制台输出。')
}

// 操作方法
const switchTheme = (themeName: string) => {
  currentTheme.value = themeName

  // 更新表单数据以反映当前主题
  const theme = availableThemes.find(t => t.name === themeName)
  if (theme) {
    themeFormData.value = {
      ...themeFormData.value,
      themeName: theme.label,
      themeType: theme.type,
      description: theme.description,
    }
  }

  console.log('切换主题:', themeName)
}

const getCurrentThemeType = () => {
  const theme = availableThemes.find(t => t.name === currentTheme.value)
  return theme?.type || 'light'
}

// 初始化主题数据
switchTheme('light')
</script>

<style scoped>
.theme-demo {
  position: relative;
}

.theme-preview {
  margin-top: 2rem;
}

.theme-samples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.theme-sample {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.theme-sample:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-sample-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.theme-sample-header h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.theme-sample-header p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.theme-sample-content {
  padding: 1rem;
}

.sample-input {
  margin-bottom: 1rem;
}

.sample-input label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.sample-input input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.sample-button {
  display: flex;
  gap: 0.5rem;
}

.sample-button .btn {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

/* 主题样式 */
[data-theme='dark'] {
  background-color: #1a1a1a;
  color: #ffffff;
}

[data-theme='dark'] .theme-sample-header,
[data-theme='dark'] .sample-input input {
  background-color: #2d2d2d;
  color: #ffffff;
  border-color: #404040;
}

[data-theme='blue'] {
  --primary-color: #1890ff;
}

[data-theme='green'] {
  --primary-color: #52c41a;
}

[data-theme='purple'] {
  --primary-color: #722ed1;
}

[data-theme='compact'] {
  font-size: 0.85rem;
}

[data-theme='compact'] .theme-sample-content {
  padding: 0.75rem;
}

[data-theme='comfortable'] {
  font-size: 1.1rem;
}

[data-theme='comfortable'] .theme-sample-content {
  padding: 1.5rem;
}

[data-theme='rounded'] .theme-sample {
  border-radius: 16px;
}

[data-theme='rounded'] .sample-input input,
[data-theme='rounded'] .sample-button .btn {
  border-radius: 12px;
}

[data-theme='flat'] .theme-sample {
  border-radius: 0;
  box-shadow: none;
}

[data-theme='flat'] .sample-input input,
[data-theme='flat'] .sample-button .btn {
  border-radius: 0;
}

@media (max-width: 768px) {
  .theme-samples {
    grid-template-columns: 1fr;
  }
}
</style>
