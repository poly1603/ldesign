<template>
  <div class="form-group" :class="groupClasses">
    <!-- 分组标题 -->
    <div
      v-if="showHeader"
      class="form-group__header"
      :class="headerClasses"
      @click="handleHeaderClick"
    >
      <div class="form-group__title">
        <span class="form-group__title-text">{{ group.title }}</span>
        <span v-if="group.description" class="form-group__description">{{
          group.description
        }}</span>
      </div>

      <div v-if="group.collapsible" class="form-group__toggle">
        <span
          class="form-group__toggle-icon"
          :class="{ 'form-group__toggle-icon--expanded': expanded }"
        >
          ▼
        </span>
      </div>

      <div v-if="showValidationStatus" class="form-group__status">
        <span
          v-if="groupState.validating"
          class="form-group__status-icon form-group__status-icon--validating"
        >
          ⟳
        </span>
        <span
          v-else-if="!groupState.valid"
          class="form-group__status-icon form-group__status-icon--error"
        >
          ✕
        </span>
        <span
          v-else-if="groupState.dirty"
          class="form-group__status-icon form-group__status-icon--dirty"
        >
          ●
        </span>
        <span
          v-else
          class="form-group__status-icon form-group__status-icon--clean"
        >
          ✓
        </span>
      </div>
    </div>

    <!-- 分组内容 -->
    <div v-if="expanded" class="form-group__content" :class="contentClasses">
      <div class="form-group__fields" :style="fieldsStyle">
        <div
          v-for="(field, index) in group.fields"
          :key="field.name"
          class="form-group__field"
          :class="getFieldClasses(field)"
          :style="getFieldStyle(field, index)"
        >
          <component
            :is="getFieldComponent(field)"
            v-model="fieldValues[field.name]"
            v-bind="getFieldProps(field)"
            :label="field.title"
            :required="field.required"
            :disabled="field.disabled || disabled"
            :readonly="field.readonly || readonly"
            :placeholder="field.placeholder"
            :error-message="getFieldError(field.name)"
            :show-error="!!getFieldError(field.name)"
            @change="handleFieldChange(field.name, $event)"
            @focus="handleFieldFocus(field.name, $event)"
            @blur="handleFieldBlur(field.name, $event)"
          />
        </div>
      </div>

      <!-- 分组错误信息 -->
      <div
        v-if="showGroupErrors && groupErrors.length > 0"
        class="form-group__errors"
      >
        <div
          v-for="error in groupErrors"
          :key="error"
          class="form-group__error"
        >
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch, inject } from 'vue'
import type { FormGroupConfig, GroupState } from '../types/group'
import type { FormItemConfig } from '../types/field'
import type { FormData } from '../types/form'
import type { GroupManager } from '../core/GroupManager'
import FormInput from './FormInput.vue'
import FormSelect from './FormSelect.vue'
import FormTextarea from './FormTextarea.vue'
import FormRadio from './FormRadio.vue'

interface Props {
  group: FormGroupConfig
  modelValue?: FormData
  disabled?: boolean
  readonly?: boolean
  showHeader?: boolean
  showValidationStatus?: boolean
  showGroupErrors?: boolean
  layout?: {
    columns?: number
    horizontalGap?: number
    verticalGap?: number
  }
}

interface Emits {
  (e: 'update:modelValue', value: FormData): void
  (e: 'expand'): void
  (e: 'collapse'): void
  (e: 'fieldChange', name: string, value: any): void
  (e: 'fieldFocus', name: string, event: FocusEvent): void
  (e: 'fieldBlur', name: string, event: FocusEvent): void
  (e: 'validate', valid: boolean, errors: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showValidationStatus: true,
  showGroupErrors: true,
  layout: () => ({ columns: 2, horizontalGap: 16, verticalGap: 16 }),
})

const emit = defineEmits<Emits>()

// 注入分组管理器
const groupManager = inject<GroupManager>('groupManager', null)

// 响应式数据
const fieldValues = reactive<FormData>({})
const groupState = reactive<GroupState>({
  name: props.group.name,
  expanded: !props.group.collapsed,
  visible: true,
  data: {},
  errors: {},
  valid: true,
  validating: false,
  dirty: false,
  fieldStates: {},
})

// 初始化字段值
props.group.fields.forEach(field => {
  fieldValues[field.name] = props.modelValue?.[field.name] ?? field.defaultValue
})

// 计算属性
const expanded = computed({
  get: () => groupState.expanded,
  set: (value: boolean) => {
    groupState.expanded = value
    if (value) {
      emit('expand')
    } else {
      emit('collapse')
    }
  },
})

const groupClasses = computed(() => [
  'form-group',
  `form-group--${props.group.name}`,
  {
    'form-group--expanded': expanded.value,
    'form-group--collapsed': !expanded.value,
    'form-group--collapsible': props.group.collapsible,
    'form-group--disabled': props.disabled,
    'form-group--readonly': props.readonly,
    'form-group--invalid': !groupState.valid,
    'form-group--validating': groupState.validating,
    'form-group--dirty': groupState.dirty,
  },
])

const headerClasses = computed(() => [
  'form-group__header',
  {
    'form-group__header--clickable': props.group.collapsible,
  },
])

const contentClasses = computed(() => [
  'form-group__content',
  {
    'form-group__content--animated': props.group.collapsible,
  },
])

const fieldsStyle = computed(() => {
  const { columns = 2, horizontalGap = 16, verticalGap = 16 } = props.layout

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${verticalGap}px ${horizontalGap}px`,
  }
})

const groupErrors = computed(() => {
  return Object.values(groupState.errors).flat()
})

// 方法
const getFieldComponent = (field: FormItemConfig) => {
  const componentMap: Record<string, any> = {
    FormInput,
    FormSelect,
    FormTextarea,
    FormRadio,
  }

  if (typeof field.component === 'string') {
    return componentMap[field.component] || FormInput
  }

  return field.component || FormInput
}

const getFieldProps = (field: FormItemConfig) => {
  return {
    ...field.props,
    name: field.name,
    id: `${props.group.name}_${field.name}`,
  }
}

const getFieldClasses = (field: FormItemConfig) => [
  'form-group__field',
  `form-group__field--${field.name}`,
  field.className,
]

const getFieldStyle = (field: FormItemConfig, index: number) => {
  const span = field.span || 1
  return {
    gridColumn: `span ${Math.min(span, props.layout.columns || 2)}`,
  }
}

const getFieldError = (fieldName: string): string => {
  const fieldState = groupState.fieldStates[fieldName]
  return fieldState?.errors?.[0] || ''
}

const handleHeaderClick = () => {
  if (props.group.collapsible) {
    expanded.value = !expanded.value
  }
}

const handleFieldChange = (fieldName: string, value: any) => {
  fieldValues[fieldName] = value

  // 更新字段状态
  if (!groupState.fieldStates[fieldName]) {
    groupState.fieldStates[fieldName] = {
      value,
      dirty: false,
      touched: false,
      valid: true,
      errors: [],
    }
  }

  groupState.fieldStates[fieldName].value = value
  groupState.fieldStates[fieldName].dirty = true
  groupState.fieldStates[fieldName].touched = true
  groupState.dirty = true

  // 同步到分组管理器
  if (groupManager) {
    groupManager.updateGroupFieldData(props.group.name, fieldName, value)
  }

  // 发出事件
  emit('update:modelValue', { ...props.modelValue, [fieldName]: value })
  emit('fieldChange', fieldName, value)
}

const handleFieldFocus = (fieldName: string, event: FocusEvent) => {
  // 标记字段为已访问
  if (groupState.fieldStates[fieldName]) {
    groupState.fieldStates[fieldName].touched = true
  }

  emit('fieldFocus', fieldName, event)
}

const handleFieldBlur = (fieldName: string, event: FocusEvent) => {
  emit('fieldBlur', fieldName, event)
}

// 监听器
watch(
  () => props.modelValue,
  newValue => {
    if (newValue) {
      Object.assign(fieldValues, newValue)
    }
  },
  { deep: true }
)

watch(
  fieldValues,
  newValues => {
    groupState.data = { ...newValues }
  },
  { deep: true }
)

// 如果有分组管理器，同步状态
if (groupManager) {
  const existingState = groupManager.getGroupState(props.group.name)
  if (existingState) {
    Object.assign(groupState, existingState)
    Object.assign(fieldValues, existingState.data)
  } else {
    groupManager.addGroup(props.group)
  }
}
</script>

<style scoped>
.form-group {
  border: 1px solid var(--form-border-default, #d9d9d9);
  border-radius: var(--form-border-radius-base, 4px);
  background: var(--form-bg-primary, #ffffff);
  margin-bottom: var(--form-spacing-base, 16px);
  overflow: hidden;
  transition: all var(--form-animation-duration-normal, 300ms);
}

.form-group--invalid {
  border-color: var(--form-border-error, #f5222d);
}

.form-group--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.form-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--form-spacing-base, 16px);
  background: var(--form-bg-secondary, #fafafa);
  border-bottom: 1px solid var(--form-border-default, #d9d9d9);
  transition: background-color var(--form-animation-duration-fast, 150ms);
}

.form-group__header--clickable {
  cursor: pointer;
}

.form-group__header--clickable:hover {
  background: var(--form-bg-hover, #f5f5f5);
}

.form-group__title {
  flex: 1;
}

.form-group__title-text {
  font-size: var(--form-font-size-lg, 18px);
  font-weight: var(--form-font-weight-medium, 500);
  color: var(--form-text-primary, #262626);
}

.form-group__description {
  display: block;
  font-size: var(--form-font-size-sm, 14px);
  color: var(--form-text-secondary, #595959);
  margin-top: var(--form-spacing-xs, 4px);
}

.form-group__toggle {
  margin-left: var(--form-spacing-base, 16px);
}

.form-group__toggle-icon {
  display: inline-block;
  transition: transform var(--form-animation-duration-normal, 300ms);
  color: var(--form-text-secondary, #595959);
}

.form-group__toggle-icon--expanded {
  transform: rotate(180deg);
}

.form-group__status {
  margin-left: var(--form-spacing-sm, 8px);
}

.form-group__status-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  text-align: center;
  line-height: 16px;
  font-size: 12px;
  border-radius: 50%;
}

.form-group__status-icon--validating {
  color: var(--form-color-info, #1890ff);
  animation: spin 1s linear infinite;
}

.form-group__status-icon--error {
  color: var(--form-color-error, #f5222d);
  background: rgba(245, 34, 45, 0.1);
}

.form-group__status-icon--dirty {
  color: var(--form-color-warning, #faad14);
}

.form-group__status-icon--clean {
  color: var(--form-color-success, #52c41a);
}

.form-group__content {
  padding: var(--form-spacing-base, 16px);
}

.form-group__content--animated {
  transition: all var(--form-animation-duration-normal, 300ms);
}

.form-group__fields {
  margin-bottom: var(--form-spacing-base, 16px);
}

.form-group__field {
  display: flex;
  flex-direction: column;
}

.form-group__errors {
  margin-top: var(--form-spacing-base, 16px);
  padding: var(--form-spacing-sm, 8px) var(--form-spacing-base, 16px);
  background: rgba(245, 34, 45, 0.05);
  border: 1px solid var(--form-border-error, #f5222d);
  border-radius: var(--form-border-radius-base, 4px);
}

.form-group__error {
  color: var(--form-color-error, #f5222d);
  font-size: var(--form-font-size-sm, 14px);
  margin: var(--form-spacing-xs, 4px) 0;
}

.form-group--collapsed .form-group__content {
  display: none;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-group__fields {
    grid-template-columns: 1fr !important;
  }

  .form-group__field {
    grid-column: span 1 !important;
  }
}
</style>
