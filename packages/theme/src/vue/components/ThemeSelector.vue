<template>
  <div class="ldesign-theme-selector" :class="props.class" :style="props.style">
    <!-- 下拉选择器 -->
    <select 
      v-if="type === 'dropdown'"
      :value="modelValue"
      @change="handleChange"
      :disabled="disabled"
      class="theme-dropdown"
    >
      <option v-for="theme in availableThemes" :key="theme" :value="theme">
        {{ getThemeName(theme) }}
      </option>
    </select>

    <!-- 标签页 -->
    <div v-else-if="type === 'tabs'" class="theme-tabs">
      <button
        v-for="theme in availableThemes"
        :key="theme"
        @click="selectTheme(theme)"
        :class="{ active: modelValue === theme }"
        :disabled="disabled"
        class="theme-tab"
      >
        {{ getThemeName(theme) }}
      </button>
    </div>

    <!-- 单选按钮 -->
    <div v-else-if="type === 'radio'" class="theme-radios">
      <label v-for="theme in availableThemes" :key="theme" class="theme-radio">
        <input
          type="radio"
          :value="theme"
          :checked="modelValue === theme"
          @change="selectTheme(theme)"
          :disabled="disabled"
        />
        <span>{{ getThemeName(theme) }}</span>
      </label>
    </div>

    <!-- 按钮组 -->
    <div v-else class="theme-buttons">
      <button
        v-for="theme in availableThemes"
        :key="theme"
        @click="selectTheme(theme)"
        :class="{ active: modelValue === theme }"
        :disabled="disabled"
        class="theme-button"
      >
        {{ getThemeName(theme) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @file ThemeSelector 组件
 * @description 主题选择器组件
 */

import { computed } from 'vue'
import type { ThemeSelectorProps } from '../types'
import { useTheme } from '../composables/useTheme'
import type { FestivalType } from '../../core/types'

// 组件属性
const props = withDefaults(defineProps<ThemeSelectorProps>(), {
  type: 'dropdown',
  showPreview: false,
  disabled: false
})

// 事件
const emit = defineEmits<{
  'update:modelValue': [value: FestivalType]
}>()

// 使用主题
const { availableThemes: allThemes, setTheme, getThemeConfig } = useTheme()

// 可用主题
const availableThemes = computed(() => {
  return props.themes || allThemes.value
})

// 获取主题名称
const getThemeName = (theme: FestivalType): string => {
  const config = getThemeConfig(theme)
  return config?.name || theme
}

// 选择主题
const selectTheme = async (theme: FestivalType) => {
  if (props.disabled) return
  
  emit('update:modelValue', theme)
  await setTheme(theme)
}

// 处理下拉选择变化
const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  selectTheme(target.value as FestivalType)
}
</script>

<style scoped>
.ldesign-theme-selector {
  display: inline-block;
}

.theme-dropdown {
  padding: 8px 12px;
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
  font-size: var(--ls-font-size-sm);
  cursor: pointer;
}

.theme-dropdown:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.theme-tabs {
  display: flex;
  border-bottom: 1px solid var(--ldesign-border-color);
}

.theme-tab {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--ldesign-text-color-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.theme-tab:hover {
  color: var(--ldesign-text-color-primary);
}

.theme-tab.active {
  color: var(--ldesign-brand-color);
  border-bottom-color: var(--ldesign-brand-color);
}

.theme-tab:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.theme-radios {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.theme-radio {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.theme-radio input {
  margin: 0;
}

.theme-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.theme-button {
  padding: 8px 16px;
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-button:hover {
  border-color: var(--ldesign-brand-color);
  color: var(--ldesign-brand-color);
}

.theme-button.active {
  background: var(--ldesign-brand-color);
  border-color: var(--ldesign-brand-color);
  color: var(--ldesign-font-white-1);
}

.theme-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
