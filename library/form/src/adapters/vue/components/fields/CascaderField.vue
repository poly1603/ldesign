<template>
  <div class="ldesign-cascader-field">
    <div
      ref="triggerRef"
      class="ldesign-cascader-trigger"
      :class="triggerClass"
      @click="togglePicker"
    >
      <span v-if="!displayValue" class="ldesign-cascader-placeholder">
        {{ placeholder }}
      </span>
      <span v-else class="ldesign-cascader-value">
        {{ displayValue }}
      </span>
      <span class="ldesign-cascader-arrow" :class="{ 'is-reverse': pickerVisible }">▼</span>
      <span
        v-if="clearable && selectedPath.length && !disabled"
        class="ldesign-cascader-clear"
        @click.stop="handleClear"
      >
        ✕
      </span>
    </div>

    <!-- 级联选择器面板 -->
    <teleport to="body">
      <div
        v-if="pickerVisible"
        ref="pickerRef"
        class="ldesign-cascader-panel"
        :style="pickerStyle"
      >
        <!-- 搜索框 -->
        <div v-if="filterable" class="ldesign-cascader-search">
          <input
            v-model="searchKeyword"
            type="text"
            class="ldesign-cascader-search-input"
            placeholder="搜索..."
            @click.stop
          />
        </div>

        <!-- 级联菜单 -->
        <div class="ldesign-cascader-menus">
          <div
            v-for="(menu, level) in visibleMenus"
            :key="level"
            class="ldesign-cascader-menu"
          >
            <div
              v-for="option in menu"
              :key="option.value"
              class="ldesign-cascader-option"
              :class="{
                'is-selected': isSelected(option, level),
                'is-active': isActive(option, level),
                'is-disabled': option.disabled,
                'has-children': hasChildren(option)
              }"
              @click="selectOption(option, level)"
              @mouseenter="handleOptionHover(option, level)"
            >
              <span class="ldesign-cascader-option-label">{{ option.label }}</span>
              <span v-if="hasChildren(option)" class="ldesign-cascader-option-arrow">›</span>
              <span v-if="isSelected(option, level) && !hasChildren(option)" class="ldesign-cascader-option-check">✓</span>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

export interface CascaderOption {
  label: string
  value: any
  disabled?: boolean
  children?: CascaderOption[]
  // 异步加载子节点
  loadChildren?: () => Promise<CascaderOption[]>
}

interface Props {
  modelValue?: any[]
  options?: CascaderOption[]
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  filterable?: boolean
  changeOnSelect?: boolean
  separator?: string
  expandTrigger?: 'click' | 'hover'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  options: () => [],
  placeholder: '请选择',
  disabled: false,
  clearable: true,
  filterable: false,
  changeOnSelect: false,
  separator: ' / ',
  expandTrigger: 'click'
})

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
  'change': [value: any[], selectedOptions: CascaderOption[]]
}>()

const triggerRef = ref<HTMLElement>()
const pickerRef = ref<HTMLElement>()
const pickerVisible = ref(false)
const pickerStyle = ref({})
const searchKeyword = ref('')

const selectedPath = ref<CascaderOption[]>([])
const activePath = ref<CascaderOption[]>([])

const triggerClass = computed(() => ({
  'is-disabled': props.disabled,
  'is-open': pickerVisible.value
}))

const displayValue = computed(() => {
  if (!selectedPath.value.length) return ''
  return selectedPath.value.map(opt => opt.label).join(props.separator)
})

// 可见的菜单列表
const visibleMenus = computed(() => {
  const menus: CascaderOption[][] = []
  
  // 第一级菜单
  menus.push(props.options)
  
  // 后续级别菜单
  activePath.value.forEach(option => {
    if (option.children && option.children.length > 0) {
      menus.push(option.children)
    }
  })
  
  return menus
})

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.length > 0) {
    updateSelectedPath(newVal)
  } else {
    selectedPath.value = []
    activePath.value = []
  }
}, { immediate: true })

function updateSelectedPath(values: any[]) {
  const path: CascaderOption[] = []
  let currentOptions = props.options
  
  for (const value of values) {
    const option = currentOptions.find(opt => opt.value === value)
    if (option) {
      path.push(option)
      if (option.children) {
        currentOptions = option.children
      }
    } else {
      break
    }
  }
  
  selectedPath.value = path
  activePath.value = [...path]
}

const togglePicker = () => {
  if (props.disabled) return
  
  pickerVisible.value = !pickerVisible.value
  
  if (pickerVisible.value) {
    updatePickerPosition()
  }
}

const updatePickerPosition = () => {
  if (!triggerRef.value || !pickerRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const pickerHeight = 300

  const spaceBelow = window.innerHeight - triggerRect.bottom
  const spaceAbove = triggerRect.top

  let top = triggerRect.bottom + window.scrollY + 4

  if (spaceBelow < pickerHeight && spaceAbove > spaceBelow) {
    top = triggerRect.top + window.scrollY - pickerHeight - 4
  }

  pickerStyle.value = {
    position: 'absolute',
    top: `${top}px`,
    left: `${triggerRect.left + window.scrollX}px`,
    zIndex: '1000'
  }
}

const isSelected = (option: CascaderOption, level: number): boolean => {
  return selectedPath.value[level]?.value === option.value
}

const isActive = (option: CascaderOption, level: number): boolean => {
  return activePath.value[level]?.value === option.value
}

const hasChildren = (option: CascaderOption): boolean => {
  return !!(option.children && option.children.length > 0) || !!option.loadChildren
}

const selectOption = async (option: CascaderOption, level: number) => {
  if (option.disabled) return
  
  // 更新激活路径
  activePath.value = activePath.value.slice(0, level)
  activePath.value.push(option)
  
  // 如果有异步加载子节点
  if (option.loadChildren && !option.children) {
    try {
      option.children = await option.loadChildren()
    } catch (error) {
      console.error('Failed to load children:', error)
      return
    }
  }
  
  // 如果没有子节点或允许选择任意级别
  if (!hasChildren(option) || props.changeOnSelect) {
    selectedPath.value = [...activePath.value]
    const values = selectedPath.value.map(opt => opt.value)
    
    emit('update:modelValue', values)
    emit('change', values, selectedPath.value)
    
    if (!hasChildren(option)) {
      pickerVisible.value = false
    }
  }
}

const handleOptionHover = (option: CascaderOption, level: number) => {
  if (props.expandTrigger === 'hover' && !option.disabled) {
    activePath.value = activePath.value.slice(0, level)
    activePath.value.push(option)
  }
}

const handleClear = () => {
  selectedPath.value = []
  activePath.value = []
  emit('update:modelValue', [])
  emit('change', [], [])
}

const handleClickOutside = (event: MouseEvent) => {
  if (
    pickerVisible.value &&
    triggerRef.value &&
    pickerRef.value &&
    !triggerRef.value.contains(event.target as Node) &&
    !pickerRef.value.contains(event.target as Node)
  ) {
    pickerVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', updatePickerPosition)
  window.addEventListener('resize', updatePickerPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', updatePickerPosition)
  window.removeEventListener('resize', updatePickerPosition)
})
</script>

<style lang="less" scoped>
.ldesign-cascader-field {
  display: inline-block;
  width: 100%;
}

.ldesign-cascader-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 11px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(.is-disabled) {
    border-color: #722ED1;
  }

  &.is-open {
    border-color: #722ED1;
    box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.1);
  }

  &.is-disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
}

.ldesign-cascader-placeholder {
  flex: 1;
  color: #bfbfbf;
  font-size: 14px;
}

.ldesign-cascader-value {
  flex: 1;
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;
}

.ldesign-cascader-arrow {
  margin-left: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.25);
  transition: transform 0.3s;

  &.is-reverse {
    transform: rotate(180deg);
  }
}

.ldesign-cascader-clear {
  margin-left: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: rgba(0, 0, 0, 0.65);
  }
}

.ldesign-cascader-panel {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
}

.ldesign-cascader-search {
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.ldesign-cascader-search-input {
  width: 100%;
  padding: 4px 11px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;

  &:focus {
    border-color: #722ED1;
  }
}

.ldesign-cascader-menus {
  display: flex;
}

.ldesign-cascader-menu {
  min-width: 150px;
  max-height: 200px;
  overflow-y: auto;
  border-right: 1px solid #f0f0f0;

  &:last-child {
    border-right: none;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
}

.ldesign-cascader-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(.is-disabled) {
    background: #f5f5f5;
  }

  &.is-active {
    background: #f0e5ff;
    color: #722ED1;
  }

  &.is-selected {
    font-weight: 600;
  }

  &.is-disabled {
    color: rgba(0, 0, 0, 0.25);
    cursor: not-allowed;

    &:hover {
      background: transparent;
    }
  }
}

.ldesign-cascader-option-label {
  flex: 1;
}

.ldesign-cascader-option-arrow,
.ldesign-cascader-option-check {
  margin-left: 8px;
  color: rgba(0, 0, 0, 0.45);
}

.ldesign-cascader-option-check {
  color: #722ED1;
}
</style>




