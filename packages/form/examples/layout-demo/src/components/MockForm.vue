<template>
  <div class="mock-form" :class="formClasses" :style="formStyles">
    <div v-if="options.groups && showGroups" class="form-groups">
      <div
        v-for="group in options.groups"
        :key="group.title"
        class="form-group"
      >
        <h3 class="group-title">{{ group.title }}</h3>
        <div class="group-fields" :class="groupClasses" :style="groupStyles">
          <div
            v-for="fieldName in group.fields"
            :key="fieldName"
            class="form-field"
            :class="getFieldClasses(getFieldConfig(fieldName))"
            :style="getFieldStyles(getFieldConfig(fieldName))"
          >
            <MockField
              :config="getFieldConfig(fieldName)"
              :model-value="modelValue[fieldName]"
              @update:model-value="updateField(fieldName, $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="form-fields" :class="fieldClasses" :style="fieldStyles">
      <div
        v-for="field in options.fields"
        :key="field.name"
        class="form-field"
        :class="getFieldClasses(field)"
        :style="getFieldStyles(field)"
      >
        <MockField
          :config="field"
          :model-value="modelValue[field.name]"
          :label-position="props.options.layout?.labelPosition || 'top'"
          :label-width="getLabelWidth(field)"
          :label-align="props.options.layout?.labelAlign || 'left'"
          @update:model-value="updateField(field.name, $event)"
        />
      </div>
    </div>

    <div v-if="options.submitButton" class="form-submit">
      <button
        type="button"
        class="submit-button"
        :class="`submit-${options.submitButton.type || 'primary'}`"
        @click="handleSubmit"
      >
        {{ options.submitButton.text || '提交' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MockField from './MockField.vue'
import type { FormOptions, FieldConfig } from '@/types/form'

interface Props {
  modelValue: Record<string, any>
  options: FormOptions
}

interface Emits {
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'submit', value: Record<string, any>): void
  (e: 'validate', valid: boolean, errors: Record<string, string>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 是否显示分组
const showGroups = computed(
  () => props.options.groups && props.options.groups.length > 0
)

// 表单样式类
const formClasses = computed(() => {
  const classes = ['mock-form']
  if (props.options.layout?.className) {
    classes.push(props.options.layout.className)
  }
  return classes
})

// 表单样式
const formStyles = computed(() => {
  return {}
})

// 字段容器样式类
const fieldClasses = computed(() => {
  const classes = ['form-fields']
  const layout = props.options.layout

  if (layout?.columns) {
    if (typeof layout.columns === 'number') {
      classes.push(`cols-${layout.columns}`)
    }
  }

  return classes
})

// 字段容器样式
const fieldStyles = computed(() => {
  const layout = props.options.layout
  const styles: Record<string, any> = {}

  if (layout?.columns) {
    if (typeof layout.columns === 'number') {
      styles.gridTemplateColumns = `repeat(${layout.columns}, 1fr)`
    }
  }

  // 优先使用分离的间距设置
  if (layout?.rowGap !== undefined) {
    styles.rowGap =
      typeof layout.rowGap === 'number' ? `${layout.rowGap}px` : layout.rowGap
  } else if (layout?.gap) {
    styles.rowGap =
      typeof layout.gap === 'number' ? `${layout.gap}px` : layout.gap
  }

  if (layout?.columnGap !== undefined) {
    styles.columnGap =
      typeof layout.columnGap === 'number'
        ? `${layout.columnGap}px`
        : layout.columnGap
  } else if (layout?.gap) {
    styles.columnGap =
      typeof layout.gap === 'number' ? `${layout.gap}px` : layout.gap
  }

  return styles
})

// 分组样式类
const groupClasses = computed(() => fieldClasses.value)

// 分组样式
const groupStyles = computed(() => fieldStyles.value)

// 获取字段配置
const getFieldConfig = (fieldName: string): FieldConfig | undefined => {
  return props.options.fields.find(field => field.name === fieldName)
}

// 获取字段样式类
const getFieldClasses = (field?: FieldConfig) => {
  const classes = []

  if (field?.span) {
    if (field.span === 'full') {
      classes.push('span-full')
    } else if (typeof field.span === 'number') {
      classes.push(`span-${field.span}`)
    }
  }

  if (field?.className) {
    classes.push(field.className)
  }

  return classes
}

// 获取字段样式
const getFieldStyles = (field?: FieldConfig) => {
  const styles: Record<string, any> = {}

  if (field?.span) {
    if (field.span === 'full') {
      styles.gridColumn = '1 / -1'
    } else if (typeof field.span === 'number') {
      styles.gridColumn = `span ${field.span}`
    }
  }

  if (field?.style) {
    Object.assign(styles, field.style)
  }

  return styles
}

// 获取标签宽度
const getLabelWidth = (field: FieldConfig) => {
  const layout = props.options.layout

  if (layout?.labelPosition === 'top') {
    return 'auto'
  }

  if (layout?.autoLabelWidth && layout?.labelWidthByColumn) {
    // 计算字段在第几列
    const fieldIndex = props.options.fields.findIndex(
      f => f.name === field.name
    )
    const columns = typeof layout.columns === 'number' ? layout.columns : 2
    const columnIndex = fieldIndex % columns

    return layout.labelWidthByColumn[columnIndex] || layout.labelWidth || 'auto'
  }

  return layout?.labelWidth || 'auto'
}

// 更新字段值
const updateField = (fieldName: string, value: any) => {
  const newValue = { ...props.modelValue }
  newValue[fieldName] = value
  emit('update:modelValue', newValue)
}

// 处理提交
const handleSubmit = () => {
  emit('submit', props.modelValue)
}
</script>

<style scoped>
.mock-form {
  width: 100%;
}

.form-fields {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-fields.cols-1 {
  grid-template-columns: 1fr;
}

.form-fields.cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.form-fields.cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.form-fields.cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.form-field.span-full {
  grid-column: 1 / -1;
}

.form-field.span-2 {
  grid-column: span 2;
}

.form-field.span-3 {
  grid-column: span 3;
}

.form-field.span-4 {
  grid-column: span 4;
}

.form-group {
  margin-bottom: 2rem;
}

.group-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
  color: #333;
}

.group-fields {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-submit {
  margin-top: 2rem;
  text-align: center;
}

.submit-button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-primary {
  background: #667eea;
  color: white;
}

.submit-primary:hover {
  background: #5a6fd8;
}

.submit-secondary {
  background: #6c757d;
  color: white;
}

.submit-secondary:hover {
  background: #5a6268;
}

.submit-danger {
  background: #dc3545;
  color: white;
}

.submit-danger:hover {
  background: #c82333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-fields,
  .group-fields {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 992px) {
  .form-fields.cols-3,
  .form-fields.cols-4,
  .group-fields.cols-3,
  .group-fields.cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
