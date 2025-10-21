<template>
  <div class="ldesign-select-field">
    <div
      ref="selectRef"
      class="ldesign-select"
      :class="selectClass"
      @click="toggleDropdown"
    >
      <div class="ldesign-select-selector">
        <div v-if="!selectedOptions.length" class="ldesign-select-placeholder">
          {{ placeholder }}
        </div>
        <div v-else class="ldesign-select-values">
          <template v-if="multiple">
            <span
              v-for="option in selectedOptions"
              :key="option.value"
              class="ldesign-select-tag"
            >
              {{ option.label }}
              <span
                class="ldesign-select-tag-close"
                @click.stop="removeOption(option)"
              >
                ✕
              </span>
            </span>
          </template>
          <template v-else>
            {{ selectedOptions[0]?.label }}
          </template>
        </div>
        <span class="ldesign-select-arrow" :class="{ 'is-reverse': dropdownVisible }">
          ▼
        </span>
      </div>
    </div>

    <!-- 下拉菜单 -->
    <teleport to="body">
      <div
        v-if="dropdownVisible"
        ref="dropdownRef"
        class="ldesign-select-dropdown"
        :style="dropdownStyle"
      >
        <!-- 搜索框 -->
        <div v-if="filterable" class="ldesign-select-search">
          <input
            v-model="searchKeyword"
            type="text"
            class="ldesign-select-search-input"
            placeholder="搜索..."
            @click.stop
          />
        </div>

        <!-- 选项列表 -->
        <div class="ldesign-select-options" :style="optionsStyle">
          <template v-if="loading">
            <div class="ldesign-select-loading">加载中...</div>
          </template>
          <template v-else-if="!filteredOptions.length">
            <div class="ldesign-select-empty">暂无数据</div>
          </template>
          <template v-else>
            <template v-for="(option, index) in displayedOptions" :key="option.value">
              <!-- 分组标题 -->
              <div v-if="option.isGroup" class="ldesign-select-group-title">
                {{ option.label }}
              </div>
              <!-- 普通选项 -->
              <div
                v-else
                class="ldesign-select-option"
                :class="{
                  'is-selected': isSelected(option),
                  'is-disabled': option.disabled
                }"
                @click="selectOption(option)"
              >
                <span class="ldesign-select-option-label">{{ option.label }}</span>
                <span v-if="isSelected(option)" class="ldesign-select-option-check">✓</span>
              </div>
            </template>
          </template>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

export interface SelectOption {
  label: string
  value: any
  disabled?: boolean
  group?: string
  isGroup?: boolean
}

interface Props {
  modelValue?: any | any[]
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  multiple?: boolean
  filterable?: boolean
  loading?: boolean
  loadOptions?: () => Promise<SelectOption[]>
  maxHeight?: number
  virtualScroll?: boolean
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false,
  multiple: false,
  filterable: false,
  loading: false,
  maxHeight: 300,
  virtualScroll: false,
  error: false,
  options: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: any | any[]]
  'change': [value: any | any[], option: SelectOption | SelectOption[]]
  'visibleChange': [visible: boolean]
}>()

const selectRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const dropdownVisible = ref(false)
const searchKeyword = ref('')
const dropdownStyle = ref({})
const internalOptions = ref<SelectOption[]>(props.options)

const selectClass = computed(() => ({
  'is-disabled': props.disabled,
  'is-open': dropdownVisible.value,
  'is-error': props.error,
  'is-multiple': props.multiple
}))

// 处理分组选项
const groupedOptions = computed(() => {
  const grouped: SelectOption[] = []
  const groups = new Map<string, SelectOption[]>()

  internalOptions.value.forEach(option => {
    if (option.group) {
      if (!groups.has(option.group)) {
        groups.set(option.group, [])
      }
      groups.get(option.group)!.push(option)
    } else {
      grouped.push(option)
    }
  })

  // 将分组展开
  groups.forEach((options, groupName) => {
    grouped.push({ label: groupName, value: groupName, isGroup: true })
    grouped.push(...options)
  })

  return grouped
})

// 过滤选项
const filteredOptions = computed(() => {
  if (!searchKeyword.value) {
    return groupedOptions.value
  }

  const keyword = searchKeyword.value.toLowerCase()
  return groupedOptions.value.filter(option => 
    !option.isGroup && option.label.toLowerCase().includes(keyword)
  )
})

// 显示的选项（虚拟滚动）
const displayedOptions = computed(() => {
  if (props.virtualScroll) {
    // TODO: 实现虚拟滚动逻辑
    return filteredOptions.value.slice(0, 100)
  }
  return filteredOptions.value
})

const optionsStyle = computed(() => ({
  maxHeight: `${props.maxHeight}px`,
  overflowY: 'auto'
}))

// 已选中的选项
const selectedOptions = computed(() => {
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? props.modelValue : []
    return internalOptions.value.filter(opt => values.includes(opt.value))
  } else {
    const option = internalOptions.value.find(opt => opt.value === props.modelValue)
    return option ? [option] : []
  }
})

// 监听外部选项变化
watch(() => props.options, (newOptions) => {
  internalOptions.value = newOptions
}, { immediate: true })

// 加载远程选项
const loadRemoteOptions = async () => {
  if (props.loadOptions) {
    try {
      const options = await props.loadOptions()
      internalOptions.value = options
    } catch (error) {
      console.error('Failed to load options:', error)
    }
  }
}

const toggleDropdown = () => {
  if (props.disabled) return
  
  dropdownVisible.value = !dropdownVisible.value
  emit('visibleChange', dropdownVisible.value)
  
  if (dropdownVisible.value) {
    nextTick(() => {
      updateDropdownPosition()
    })
  }
}

const isSelected = (option: SelectOption) => {
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? props.modelValue : []
    return values.includes(option.value)
  }
  return props.modelValue === option.value
}

const selectOption = (option: SelectOption) => {
  if (option.disabled) return

  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = values.indexOf(option.value)
    
    if (index > -1) {
      values.splice(index, 1)
    } else {
      values.push(option.value)
    }
    
    emit('update:modelValue', values)
    emit('change', values, selectedOptions.value)
  } else {
    emit('update:modelValue', option.value)
    emit('change', option.value, option)
    dropdownVisible.value = false
  }
}

const removeOption = (option: SelectOption) => {
  if (!props.multiple) return
  
  const values = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const index = values.indexOf(option.value)
  
  if (index > -1) {
    values.splice(index, 1)
    emit('update:modelValue', values)
    emit('change', values, selectedOptions.value)
  }
}

const updateDropdownPosition = () => {
  if (!selectRef.value || !dropdownRef.value) return

  const selectRect = selectRef.value.getBoundingClientRect()
  const dropdownHeight = dropdownRef.value.offsetHeight
  const viewportHeight = window.innerHeight

  const spaceBelow = viewportHeight - selectRect.bottom
  const spaceAbove = selectRect.top

  let top = selectRect.bottom + window.scrollY
  
  // 如果下方空间不足，显示在上方
  if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
    top = selectRect.top + window.scrollY - dropdownHeight
  }

  dropdownStyle.value = {
    position: 'absolute',
    top: `${top}px`,
    left: `${selectRect.left + window.scrollX}px`,
    width: `${selectRect.width}px`,
    zIndex: '1000'
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (
    dropdownVisible.value &&
    selectRef.value &&
    dropdownRef.value &&
    !selectRef.value.contains(event.target as Node) &&
    !dropdownRef.value.contains(event.target as Node)
  ) {
    dropdownVisible.value = false
    emit('visibleChange', false)
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', updateDropdownPosition)
  window.addEventListener('resize', updateDropdownPosition)
  
  // 加载远程选项
  if (props.loadOptions && !props.options.length) {
    loadRemoteOptions()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', updateDropdownPosition)
  window.removeEventListener('resize', updateDropdownPosition)
})

defineExpose({
  loadRemoteOptions
})
</script>

<style lang="less" scoped>
.ldesign-select-field {
  width: 100%;
}

.ldesign-select {
  position: relative;
  display: inline-block;
  width: 100%;
  cursor: pointer;
  user-select: none;
}

.ldesign-select-selector {
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 4px 11px;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  transition: all 0.3s;

  .ldesign-select:hover:not(.is-disabled) & {
    border-color: #722ED1;
  }

  .ldesign-select.is-open & {
    border-color: #722ED1;
    box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.1);
  }

  .ldesign-select.is-error & {
    border-color: #ff4d4f;

    &:hover,
    .ldesign-select.is-open & {
      border-color: #ff4d4f;
    }
  }

  .ldesign-select.is-disabled & {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
}

.ldesign-select-placeholder {
  flex: 1;
  color: #bfbfbf;
  font-size: 14px;
}

.ldesign-select-values {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

.ldesign-select-tag {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  background-color: #f5f5f5;
  border-radius: 2px;
  font-size: 12px;
  line-height: 20px;
}

.ldesign-select-tag-close {
  margin-left: 4px;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: rgba(0, 0, 0, 0.85);
  }
}

.ldesign-select-arrow {
  margin-left: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.25);
  transition: transform 0.3s;

  &.is-reverse {
    transform: rotate(180deg);
  }
}

.ldesign-select-dropdown {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
}

.ldesign-select-search {
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.ldesign-select-search-input {
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

.ldesign-select-options {
  padding: 4px 0;
}

.ldesign-select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover:not(.is-disabled) {
    background-color: #f5f5f5;
  }

  &.is-selected {
    background-color: #f0e5ff;
    color: #722ED1;
  }

  &.is-disabled {
    color: rgba(0, 0, 0, 0.25);
    cursor: not-allowed;
  }
}

.ldesign-select-option-check {
  color: #722ED1;
}

.ldesign-select-group-title {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.45);
}

.ldesign-select-loading,
.ldesign-select-empty {
  padding: 12px;
  text-align: center;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}
</style>






