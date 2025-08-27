<!--
动态表单组件 - 模拟 LemonForm 的核心功能
-->

<template>
  <div class="dynamic-form">
    <form @submit.prevent="handleSubmit" @reset.prevent="handleReset">
      <div
        v-for="field in config.fields"
        :key="field.name || field.type"
        :class="['form-field', `field-${field.type}`]"
      >
        <!-- 字段组 -->
        <template v-if="field.type === 'group'">
          <div class="field-group">
            <h4 class="group-title">{{ field.title }}</h4>
            <p v-if="field.description" class="group-description">{{ field.description }}</p>
            <div class="group-fields">
              <div
                v-for="subField in field.fields"
                :key="subField.name"
                :class="['form-field', `field-${subField.type}`]"
              >
                <FormField
                  :field="subField"
                  :value="modelValue[subField.name]"
                  @update:value="updateField(subField.name, $event)"
                  @change="handleFieldChange(subField.name, $event)"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- 操作按钮 -->
        <template v-else-if="field.type === 'actions'">
          <div class="form-actions">
            <button
              v-for="button in field.buttons"
              :key="button.type"
              :type="button.type"
              :class="['btn', `btn-${button.variant || 'default'}`]"
            >
              {{ button.text }}
            </button>
          </div>
        </template>

        <!-- 普通字段 -->
        <template v-else>
          <FormField
            :field="field"
            :value="modelValue[field.name]"
            @update:value="updateField(field.name, $event)"
            @change="handleFieldChange(field.name, $event)"
          />
        </template>
      </div>
    </form>

    <!-- 调试面板 -->
    <div v-if="debug" class="debug-panel">
      <h4>🐛 调试信息</h4>
      <div class="debug-content">
        <div class="debug-section">
          <h5>表单配置</h5>
          <pre>{{ JSON.stringify(config, null, 2) }}</pre>
        </div>
        <div class="debug-section">
          <h5>表单数据</h5>
          <pre>{{ JSON.stringify(modelValue, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FormField from './FormField.vue'

// Props
interface Props {
  modelValue: Record<string, any>
  config: any
  debug?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  debug: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'submit': [data: Record<string, any>]
  'reset': []
  'field-change': [event: { field: string; value: any }]
  'validation': [result: { valid: boolean; errors: any[] }]
}>()

// 更新字段值
const updateField = (name: string, value: any) => {
  const newValue = { ...props.modelValue, [name]: value }
  emit('update:modelValue', newValue)
}

// 字段变化处理
const handleFieldChange = (field: string, value: any) => {
  emit('field-change', { field, value })
}

// 表单提交
const handleSubmit = () => {
  // 简单验证
  const errors: any[] = []
  let valid = true

  // 这里可以添加验证逻辑
  
  emit('validation', { valid, errors })
  
  if (valid) {
    emit('submit', props.modelValue)
  }
}

// 表单重置
const handleReset = () => {
  emit('update:modelValue', {})
  emit('reset')
}
</script>

<style scoped>
.dynamic-form {
  width: 100%;
}

.form-field {
  margin-bottom: 20px;
}

.field-group {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background: #fafafa;
}

.group-title {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
}

.group-description {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

.group-fields {
  display: grid;
  gap: 15px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  background: white;
  color: #333;
}

.btn-primary {
  background: #f39c12;
  color: white;
  border-color: #f39c12;
}

.btn-primary:hover {
  background: #e67e22;
  border-color: #e67e22;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background: #5a6268;
  border-color: #545b62;
}

.debug-panel {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.debug-panel h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.debug-content {
  display: grid;
  gap: 20px;
}

.debug-section h5 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 0.9rem;
}

.debug-section pre {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-size: 11px;
  overflow: auto;
  max-height: 200px;
  margin: 0;
}
</style>
