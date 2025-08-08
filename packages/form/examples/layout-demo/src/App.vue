<template>
  <div id="app">
    <!-- 头部 -->
    <header class="header">
      <div class="container">
        <h1>表单布局演示</h1>
        <p>@ldesign/form 布局系统功能展示</p>
      </div>
    </header>

    <div class="container">
      <!-- 控制面板 -->
      <div class="control-panel">
        <h3>布局控制</h3>

        <!-- 布局预设 -->
        <div class="control-group">
          <div class="control-item">
            <label>布局预设：</label>
            <select @change="handlePresetChange">
              <option value="">选择预设布局</option>
              <option
                v-for="preset in layoutPresets"
                :key="preset.name"
                :value="preset.name"
              >
                {{ preset.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- 布局参数 -->
        <div class="control-group">
          <div class="control-item">
            <label>列数：</label>
            <select
              :value="currentLayout.columns"
              @change="updateLayout('columns', Number($event.target.value))"
            >
              <option :value="1">1列</option>
              <option :value="2">2列</option>
              <option :value="3">3列</option>
              <option :value="4">4列</option>
            </select>
          </div>

          <div class="control-item">
            <label>间距：</label>
            <input
              type="range"
              min="8"
              max="32"
              step="4"
              :value="currentLayout.gap"
              @input="updateLayout('gap', Number($event.target.value))"
            />
            <span>{{ currentLayout.gap }}px</span>
          </div>

          <div class="control-item">
            <label>标签位置：</label>
            <select
              :value="currentLayout.labelPosition"
              @change="updateLayout('labelPosition', $event.target.value)"
            >
              <option value="top">顶部</option>
              <option value="left">左侧</option>
              <option value="right">右侧</option>
            </select>
          </div>

          <div
            class="control-item"
            v-if="currentLayout.labelPosition !== 'top'"
          >
            <label>标签宽度：</label>
            <input
              type="number"
              min="80"
              max="200"
              step="10"
              :value="currentLayout.labelWidth"
              @input="updateLayout('labelWidth', Number($event.target.value))"
            />
          </div>

          <div
            class="control-item"
            v-if="currentLayout.labelPosition !== 'top'"
          >
            <label>标签对齐：</label>
            <select
              :value="currentLayout.labelAlign"
              @change="updateLayout('labelAlign', $event.target.value)"
            >
              <option value="left">左对齐</option>
              <option value="center">居中</option>
              <option value="right">右对齐</option>
            </select>
          </div>
        </div>

        <!-- 功能开关 -->
        <div class="control-group">
          <div class="control-item">
            <button :class="{ active: showGroups }" @click="toggleGroups">
              {{ showGroups ? '隐藏分组' : '显示分组' }}
            </button>
          </div>

          <div class="control-item">
            <button
              :class="{ active: showValidation }"
              @click="toggleValidation"
            >
              {{ showValidation ? '隐藏验证' : '显示验证' }}
            </button>
          </div>

          <div class="control-item">
            <button @click="resetForm">重置表单</button>
          </div>

          <div class="control-item">
            <button @click="fillMockData">填充示例数据</button>
          </div>
        </div>
      </div>

      <!-- 主要内容 -->
      <div class="main-content">
        <!-- 表单容器 -->
        <div class="form-container">
          <h2>用户信息表单</h2>
          <Transition name="fade" mode="out-in">
            <MockForm
              :key="formKey"
              v-model="formData"
              :options="formOptions"
              @submit="handleSubmit"
              @validate="handleValidate"
            />
          </Transition>
        </div>

        <!-- 数据预览 -->
        <div class="data-preview">
          <h3>表单数据预览</h3>
          <pre>{{ JSON.stringify(formData, null, 2) }}</pre>

          <h3 style="margin-top: 1.5rem">当前布局配置</h3>
          <pre>{{ JSON.stringify(currentLayout, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import MockForm from '@/components/MockForm.vue'
import { useFormConfig } from '@/composables/useFormConfig'
import { mockFormData } from '@/data/mockData'
import type { FormData } from '@/types/form'

// 使用表单配置
const {
  currentLayout,
  showGroups,
  showValidation,
  layoutPresets,
  formOptions,
  applyLayoutPreset,
  updateLayout,
  toggleGroups,
  toggleValidation,
} = useFormConfig()

// 表单数据
const formData = reactive<Partial<FormData>>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  birthDate: '',
  country: '',
  province: '',
  city: '',
  address: '',
  zipCode: '',
  company: '',
  position: '',
  industry: '',
  experience: '',
  salary: undefined,
  interests: [],
  newsletter: false,
  notifications: true,
  language: 'zh',
  bio: '',
  website: '',
  socialMedia: '',
})

// 表单重新渲染的 key
const formKey = ref(0)

// 处理预设布局变化
const handlePresetChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const presetName = target.value

  if (presetName) {
    const preset = layoutPresets.find(p => p.name === presetName)
    if (preset) {
      applyLayoutPreset(preset)
      formKey.value++ // 强制重新渲染表单
    }
  }

  // 重置选择框
  target.value = ''
}

// 重置表单
const resetForm = () => {
  Object.keys(formData).forEach(key => {
    const typedKey = key as keyof FormData
    if (typeof formData[typedKey] === 'boolean') {
      ;(formData as any)[typedKey] = false
    } else if (Array.isArray(formData[typedKey])) {
      ;(formData as any)[typedKey] = []
    } else if (typeof formData[typedKey] === 'number') {
      ;(formData as any)[typedKey] = undefined
    } else {
      ;(formData as any)[typedKey] = ''
    }
  })

  // 特殊处理一些默认值
  formData.notifications = true
  formData.language = 'zh'
}

// 填充示例数据
const fillMockData = () => {
  Object.assign(formData, mockFormData)
}

// 处理表单提交
const handleSubmit = (data: any) => {
  console.log('表单提交:', data)
  alert('表单提交成功！请查看控制台输出。')
}

// 处理表单验证
const handleValidate = (valid: boolean, errors: any) => {
  console.log('表单验证:', { valid, errors })
  if (!valid) {
    console.warn('表单验证失败:', errors)
  }
}
</script>
