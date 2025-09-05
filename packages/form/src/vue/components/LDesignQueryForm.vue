<!--
  LDesignQueryForm 查询表单组件
  
  @description
  专门用于查询场景的表单组件，支持展开/收起、智能按钮布局等功能
-->

<template>
  <div :class="queryFormClasses">
    <form
      :class="formClasses"
      @submit.prevent="handleSubmit"
      @reset.prevent="handleReset"
    >
      <FormProvider :form="form">
        <!-- 表单字段网格容器 -->
        <div
          ref="gridContainer"
          :class="gridClasses"
          :style="gridStyles"
        >
          <!-- 表单字段插槽 -->
          <template v-for="(item, index) in visibleFields" :key="item.key || index">
            <div
              :class="getFieldItemClasses(item, index)"
              :style="getFieldItemStyles(item)"
            >
              <slot
                :name="item.slot || 'field'"
                :item="item"
                :index="index"
                :field="getField(item.name)"
              >
                <LDesignFormItem
                  :name="item.name"
                  :label="item.label"
                  :required="item.required"
                  :rules="item.rules"
                  :help="item.help"
                  :disabled="item.disabled || disabled"
                  :readonly="item.readonly || readonly"
                  :size="item.size || size"
                >
                  <template #default="{ field, value, setValue }">
                    <slot
                      :name="`field-${item.name}`"
                      :item="item"
                      :field="field"
                      :value="value"
                      :setValue="setValue"
                    >
                      <!-- 默认渲染逻辑 -->
                      <component
                        v-if="item.component"
                        :is="item.component"
                        v-bind="item.props"
                        :value="value"
                        @update:value="setValue"
                      />
                    </slot>
                  </template>
                </LDesignFormItem>
              </slot>
            </div>
          </template>

          <!-- 按钮组 -->
          <div
            :class="actionClasses"
            :style="actionStyles"
          >
            <div class="ldesign-query-form__actions-content">
              <!-- 主要操作按钮 -->
              <div class="ldesign-query-form__primary-actions">
                <slot name="actions" :form="form" :collapsed="collapsed">
                  <button
                    type="submit"
                    :class="['ldesign-btn', 'ldesign-btn--primary']"
                    :disabled="isPending"
                  >
                    {{ submitText }}
                  </button>
                  <button
                    type="button"
                    :class="['ldesign-btn', 'ldesign-btn--default']"
                    @click="handleReset"
                  >
                    {{ resetText }}
                  </button>
                </slot>
              </div>

              <!-- 展开/收起按钮 -->
              <div
                v-if="showCollapseButton"
                class="ldesign-query-form__collapse-actions"
              >
                <button
                  type="button"
                  :class="['ldesign-btn', 'ldesign-btn--text']"
                  @click="toggleCollapse"
                >
                  <span>{{ collapsed ? expandText : collapseText }}</span>
                  <svg
                    :class="['ldesign-query-form__collapse-icon', { 'is-expanded': !collapsed }]"
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                  >
                    <path d="M8 10.5L4 6.5h8L8 10.5z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </FormProvider>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick, type PropType } from 'vue'
import { useForm } from '../hooks/useForm'
import { useField } from '../hooks/useField'
import FormProvider from './FormProvider.vue'
import LDesignFormItem from './LDesignFormItem.vue'
import type { 
  LDesignQueryFormProps, 
  LDesignQueryFormEmits, 
  LDesignQueryFormExpose,
  QueryFormField 
} from './types'

// === Props 定义 ===
const props = withDefaults(defineProps<LDesignQueryFormProps>(), {
  layout: 'horizontal',
  labelAlign: 'right',
  size: 'medium',
  collapsed: true,
  defaultRowCount: 2,
  colCount: 4,
  gutter: 16,
  submitText: '查询',
  resetText: '重置',
  expandText: '展开',
  collapseText: '收起',
  showCollapseButton: true,
  actionPosition: 'auto',
  actionAlign: 'left',
  responsive: true
})

// === Emits 定义 ===
const emit = defineEmits<LDesignQueryFormEmits>()

// === 响应式数据 ===
const gridContainer = ref<HTMLElement>()
const collapsed = ref(props.collapsed)
const isPending = ref(false)

// === 表单实例 ===
const form = useForm({
  initialValues: props.initialValues,
  defaultValues: props.defaultValues
})

// === 计算属性 ===
const queryFormClasses = computed(() => [
  'ldesign-query-form',
  `ldesign-query-form--${props.layout}`,
  `ldesign-query-form--${props.size}`,
  {
    'ldesign-query-form--collapsed': collapsed.value,
    'ldesign-query-form--expanded': !collapsed.value,
    'ldesign-query-form--disabled': props.disabled,
    'ldesign-query-form--readonly': props.readonly
  }
])

const formClasses = computed(() => [
  'ldesign-form',
  'ldesign-query-form__form'
])

const gridClasses = computed(() => [
  'ldesign-query-form__grid',
  `ldesign-query-form__grid--cols-${props.colCount}`
])

const gridStyles = computed(() => ({
  gap: `${props.gutter}px`,
  gridTemplateColumns: `repeat(${props.colCount}, 1fr)`
}))

// 可见字段列表
const visibleFields = computed(() => {
  if (!props.fields) return []
  
  if (!collapsed.value) {
    return props.fields
  }
  
  // 计算默认显示的字段数量
  const maxVisibleFields = props.defaultRowCount * props.colCount - 1 // 减1为按钮组预留位置
  return props.fields.slice(0, maxVisibleFields)
})

// 是否显示展开/收起按钮
const showCollapseButton = computed(() => {
  return props.showCollapseButton && 
         props.fields && 
         props.fields.length > props.defaultRowCount * props.colCount - 1
})

// 按钮组样式类
const actionClasses = computed(() => [
  'ldesign-query-form__actions',
  `ldesign-query-form__actions--${props.actionAlign}`,
  {
    'ldesign-query-form__actions--full-row': shouldActionFullRow.value
  }
])

// 按钮组样式
const actionStyles = computed(() => {
  if (shouldActionFullRow.value) {
    return {
      gridColumn: `1 / -1`
    }
  }
  
  // 计算按钮组应该占据的位置
  const totalFields = collapsed.value ? visibleFields.value.length : props.fields?.length || 0
  const currentRow = Math.ceil((totalFields + 1) / props.colCount)
  const currentCol = (totalFields % props.colCount) + 1
  
  return {
    gridColumn: `${currentCol} / -1`,
    gridRow: currentRow
  }
})

// 是否按钮组应该独占一行
const shouldActionFullRow = computed(() => {
  if (props.actionPosition === 'block') return true
  if (props.actionPosition === 'inline') return false
  
  // auto 模式：根据剩余空间自动判断
  const totalFields = collapsed.value ? visibleFields.value.length : props.fields?.length || 0
  const remainingCols = props.colCount - (totalFields % props.colCount)
  
  // 如果剩余空间少于2列，则独占一行
  return remainingCols < 2
})

// === 方法 ===
const getField = (name: string) => {
  return useField(name, { form: form.form })
}

const getFieldItemClasses = (item: QueryFormField, index: number) => [
  'ldesign-query-form__field',
  {
    'ldesign-query-form__field--hidden': collapsed.value && index >= visibleFields.value.length
  }
]

const getFieldItemStyles = (item: QueryFormField) => {
  const span = item.span || 1
  return {
    gridColumn: span > 1 ? `span ${span}` : undefined
  }
}

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
  emit('collapse', collapsed.value)
}

const handleSubmit = async () => {
  isPending.value = true
  
  try {
    const result = await form.submit()
    emit('submit', result.data, result.valid)
  } catch (error) {
    console.error('Query form submission error:', error)
    const data = form.getValues()
    emit('submit', data, false)
  } finally {
    isPending.value = false
  }
}

const handleReset = () => {
  form.reset()
  const data = form.getValues()
  emit('reset', data)
}

// === 监听器 ===
watch(
  () => props.collapsed,
  (newValue) => {
    collapsed.value = newValue
  }
)

watch(
  () => form.data.value,
  (newData) => {
    emit('update:modelValue', newData)
  },
  { deep: true }
)

// === 暴露的方法和属性 ===
defineExpose<LDesignQueryFormExpose>({
  form,
  collapsed: computed(() => collapsed.value),
  toggle: toggleCollapse,
  expand: () => { collapsed.value = false },
  collapse: () => { collapsed.value = true },
  submit: handleSubmit,
  reset: handleReset,
  validate: form.validate,
  clearValidation: form.clearValidation
})
</script>

<script lang="ts">
export default {
  name: 'LDesignQueryForm',
  inheritAttrs: false
}
</script>

<style lang="less" scoped>
@import './LDesignQueryForm.less';
</style>

<style lang="less" scoped>
@import './LDesignQueryForm.less';
</style>
