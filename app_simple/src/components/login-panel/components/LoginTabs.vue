<template>
  <div class="login-tabs">
    <div class="tabs-header">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-item', { active: activeTab === tab.key }]"
        @click="handleTabClick(tab.key)"
      >
        <span v-if="tab.icon" class="tab-icon">
          <i :class="tab.icon"></i>
        </span>
        <span class="tab-label">{{ tab.label }}</span>
      </div>
      <div 
        class="tab-indicator"
        :style="indicatorStyle"
      ></div>
    </div>
    <div class="tabs-content">
      <transition name="tab-fade" mode="out-in">
        <div :key="activeTab" class="tab-panel">
          <slot :name="activeTab"></slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TabItem } from '../types'

interface Props {
  modelValue?: string
  tabs: TabItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const activeTab = ref(props.modelValue || props.tabs[0]?.key || '')

const activeIndex = computed(() => {
  return props.tabs.findIndex(tab => tab.key === activeTab.value)
})

const indicatorStyle = computed(() => {
  const index = activeIndex.value
  const width = 100 / props.tabs.length
  return {
    width: `${width}%`,
    transform: `translateX(${index * 100}%)`
  }
})

const handleTabClick = (key: string) => {
  activeTab.value = key
  emit('update:modelValue', key)
  emit('change', key)
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    activeTab.value = newVal
  }
})
</script>

<style scoped>
.login-tabs {
  width: 100%;
}

.tabs-header {
  position: relative;
  display: flex;
  background-color: #f5f5f7;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 24px;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  z-index: 1;
}

.tab-item:hover {
  color: #333;
}

.tab-item.active {
  color: #1677ff;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tab-icon {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.tab-label {
  white-space: nowrap;
}

.tab-indicator {
  position: absolute;
  bottom: 4px;
  left: 4px;
  height: calc(100% - 8px);
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.tabs-content {
  min-height: 200px;
}

.tab-panel {
  width: 100%;
}

/* 切换动画 */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* 图标样式 */
.icon-user::before {
  content: '👤';
}

.icon-phone::before {
  content: '📱';
}
</style>