<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  createField,
  createFormConfig,
  createRule,
  FormBuilder,
} from '../../../src/index'

// 表单数据
const formData = ref({
  name: '',
  email: '',
  gender: '',
  interests: [],
  description: '',
  agreeTerms: false,
})

// 当前主题
const currentTheme = ref('default')

// 主题配置
const themes = [
  {
    name: 'default',
    label: '默认主题',
    description: '简洁清爽的默认样式',
    primaryColor: '#3b82f6',
    features: ['简洁设计', '清晰布局', '良好对比度', '易于阅读'],
  },
  {
    name: 'dark',
    label: '深色主题',
    description: '护眼的深色模式',
    primaryColor: '#1f2937',
    features: ['深色背景', '护眼设计', '现代感强', '夜间友好'],
  },
  {
    name: 'colorful',
    label: '彩色主题',
    description: '活泼的彩色样式',
    primaryColor: '#10b981',
    features: ['丰富色彩', '活泼设计', '视觉冲击', '年轻化风格'],
  },
  {
    name: 'minimal',
    label: '极简主题',
    description: '极简主义设计风格',
    primaryColor: '#6b7280',
    features: ['极简设计', '留白充足', '专注内容', '优雅简约'],
  },
  {
    name: 'business',
    label: '商务主题',
    description: '专业的商务风格',
    primaryColor: '#1e40af',
    features: ['专业外观', '商务风格', '严谨布局', '企业级设计'],
  },
]

// 自定义主题
const customTheme = ref({
  primaryColor: '#3b82f6',
  borderRadius: 8,
  fontSize: '14px',
})

// 当前主题配置
const currentThemeConfig = computed(() => {
  return themes.find(theme => theme.name === currentTheme.value) || themes[0]
})

// 主题样式类
const themeClasses = computed(() => {
  const baseClasses = 'transition-all duration-300'

  switch (currentTheme.value) {
    case 'dark':
      return `${baseClasses} bg-gray-800 text-white`
    case 'colorful':
      return `${baseClasses} bg-gradient-to-br from-green-50 to-blue-50`
    case 'minimal':
      return `${baseClasses} bg-gray-50 border border-gray-200`
    case 'business':
      return `${baseClasses} bg-blue-50 border border-blue-100`
    default:
      return baseClasses
  }
})

// 表单配置
const formConfig = createFormConfig({
  fields: [
    createField({
      key: 'name',
      label: '姓名',
      type: 'input',
      required: true,
      rules: [
        createRule('required', '请输入姓名'),
        createRule('minLength', '姓名至少2个字符', { min: 2 }),
      ],
      props: {
        placeholder: '请输入您的姓名',
      },
    }),
    createField({
      key: 'email',
      label: '邮箱',
      type: 'input',
      required: true,
      rules: [
        createRule('required', '请输入邮箱'),
        createRule('email', '请输入有效的邮箱地址'),
      ],
      props: {
        type: 'email',
        placeholder: '请输入邮箱地址',
      },
    }),
    createField({
      key: 'gender',
      label: '性别',
      type: 'radio',
      required: true,
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '其他', value: 'other' },
      ],
      rules: [createRule('required', '请选择性别')],
    }),
    createField({
      key: 'interests',
      label: '兴趣爱好',
      type: 'checkbox',
      options: [
        { label: '阅读', value: 'reading' },
        { label: '运动', value: 'sports' },
        { label: '音乐', value: 'music' },
        { label: '旅行', value: 'travel' },
        { label: '摄影', value: 'photography' },
        { label: '编程', value: 'programming' },
      ],
    }),
    createField({
      key: 'description',
      label: '个人描述',
      type: 'textarea',
      props: {
        placeholder: '请简单介绍一下自己',
        rows: 4,
      },
    }),
    createField({
      key: 'agreeTerms',
      label: '同意条款',
      type: 'checkbox',
      required: true,
      rules: [createRule('required', '请同意用户协议')],
      props: {
        label: '我已阅读并同意用户协议和隐私政策',
      },
    }),
  ],
  layout: {
    type: 'vertical',
    labelWidth: '100px',
    gutter: 16,
  },
  actions: {
    submit: {
      text: '提交表单',
      type: 'primary',
    },
    reset: {
      text: '重置表单',
      type: 'default',
    },
  },
})

// 更新自定义主题
function updateCustomTheme() {
  // 这里可以实时更新主题样式
  console.log('自定义主题更新:', customTheme.value)
}

// 应用自定义主题
function applyCustomTheme() {
  // 创建自定义主题
  const customThemeConfig = {
    name: 'custom',
    label: '自定义主题',
    description: '用户自定义的主题样式',
    primaryColor: customTheme.value.primaryColor,
    features: ['自定义配色', '个性化设计', '用户定制', '独特风格'],
  }

  // 添加到主题列表（如果不存在）
  const existingIndex = themes.findIndex(theme => theme.name === 'custom')
  if (existingIndex >= 0) {
    themes[existingIndex] = customThemeConfig
  }
  else {
    themes.push(customThemeConfig)
  }

  // 切换到自定义主题
  currentTheme.value = 'custom'

  // 应用自定义样式
  const root = document.documentElement
  root.style.setProperty('--primary-color', customTheme.value.primaryColor)
  root.style.setProperty(
    '--border-radius',
    `${customTheme.value.borderRadius}px`,
  )
  root.style.setProperty('--font-size', customTheme.value.fontSize)

  console.log('应用自定义主题:', customThemeConfig)
}

// 事件处理
function handleSubmit(data: any) {
  console.log('主题演示表单提交:', data)
  alert(
    `表单提交成功！\n当前主题: ${currentThemeConfig.value.label}\n请查看控制台输出`,
  )
}

function handleChange(key: string, value: any) {
  console.log('字段变化:', key, value)
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        主题演示
      </h1>
      <p class="text-gray-600">
        展示不同主题样式和自定义主题功能
      </p>
    </div>

    <!-- 主题切换器 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">
        主题切换
      </h2>
      <div class="flex flex-wrap gap-4">
        <button
          v-for="theme in themes"
          :key="theme.name"
          class="px-4 py-2 rounded-lg border transition-all duration-200"
          :class="{
            'bg-blue-500 text-white border-blue-500':
              currentTheme === theme.name,
            'bg-white text-gray-700 border-gray-300 hover:border-blue-300':
              currentTheme !== theme.name,
          }"
          @click="currentTheme = theme.name"
        >
          {{ theme.label }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 表单区域 -->
      <div class="bg-white rounded-lg shadow p-6" :class="themeClasses">
        <h2 class="text-xl font-semibold mb-4">
          {{ currentThemeConfig.label }}主题表单
        </h2>

        <FormBuilder
          v-model="formData"
          :config="formConfig"
          :theme="currentTheme"
          @submit="handleSubmit"
          @change="handleChange"
        />
      </div>

      <!-- 主题信息区域 -->
      <div class="space-y-6">
        <!-- 当前主题信息 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">
            当前主题信息
          </h3>
          <div class="space-y-3">
            <div>
              <span class="font-medium">主题名称:</span>
              <span class="ml-2">{{ currentThemeConfig.label }}</span>
            </div>
            <div>
              <span class="font-medium">主题描述:</span>
              <span class="ml-2">{{ currentThemeConfig.description }}</span>
            </div>
            <div>
              <span class="font-medium">主色调:</span>
              <div class="ml-2 inline-flex items-center space-x-2">
                <div
                  class="w-6 h-6 rounded border"
                  :style="{ backgroundColor: currentThemeConfig.primaryColor }"
                />
                <span>{{ currentThemeConfig.primaryColor }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 主题特性 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">
            主题特性
          </h3>
          <div class="space-y-2">
            <div
              v-for="feature in currentThemeConfig.features"
              :key="feature"
              class="flex items-center space-x-2"
            >
              <div class="w-2 h-2 bg-green-500 rounded-full" />
              <span class="text-sm">{{ feature }}</span>
            </div>
          </div>
        </div>

        <!-- 自定义主题配置 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">
            自定义主题配置
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">主色调</label>
              <input
                v-model="customTheme.primaryColor"
                type="color"
                class="w-full h-10 rounded border"
                @change="updateCustomTheme"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">圆角大小</label>
              <input
                v-model="customTheme.borderRadius"
                type="range"
                min="0"
                max="20"
                class="w-full"
                @input="updateCustomTheme"
              >
              <span class="text-xs text-gray-500">{{ customTheme.borderRadius }}px</span>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">字体大小</label>
              <select
                v-model="customTheme.fontSize"
                class="w-full p-2 border rounded"
                @change="updateCustomTheme"
              >
                <option value="12px">
                  小号 (12px)
                </option>
                <option value="14px">
                  默认 (14px)
                </option>
                <option value="16px">
                  大号 (16px)
                </option>
                <option value="18px">
                  特大 (18px)
                </option>
              </select>
            </div>
            <button
              class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              @click="applyCustomTheme"
            >
              应用自定义主题
            </button>
          </div>
        </div>

        <!-- 表单数据 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">
            表单数据
          </h3>
          <pre class="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-32">{{
            JSON.stringify(formData, null, 2)
          }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义主题样式变量 */
:root {
  --primary-color: #3b82f6;
  --border-radius: 8px;
  --font-size: 14px;
}

/* 主题样式应用 */
.custom-theme {
  --primary-color: var(--primary-color);
  border-radius: var(--border-radius);
  font-size: var(--font-size);
}

/* 深色主题样式 */
.dark-theme {
  background-color: #1f2937;
  color: #f9fafb;
}

.dark-theme input,
.dark-theme textarea,
.dark-theme select {
  background-color: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark-theme input:focus,
.dark-theme textarea:focus,
.dark-theme select:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

/* 彩色主题样式 */
.colorful-theme {
  background: linear-gradient(135deg, #ecfdf5 0%, #eff6ff 100%);
}

.colorful-theme .form-field {
  border-left: 4px solid #10b981;
  padding-left: 12px;
}

/* 极简主题样式 */
.minimal-theme {
  background-color: #fafafa;
  border: 1px solid #e5e7eb;
}

.minimal-theme input,
.minimal-theme textarea,
.minimal-theme select {
  border: none;
  border-bottom: 1px solid #d1d5db;
  border-radius: 0;
  background: transparent;
}

.minimal-theme input:focus,
.minimal-theme textarea:focus,
.minimal-theme select:focus {
  border-bottom-color: #6b7280;
  box-shadow: none;
}

/* 商务主题样式 */
.business-theme {
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
}

.business-theme .form-label {
  font-weight: 600;
  color: #1e40af;
}

.business-theme input,
.business-theme textarea,
.business-theme select {
  border-color: #cbd5e1;
}

.business-theme input:focus,
.business-theme textarea:focus,
.business-theme select:focus {
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}
</style>
