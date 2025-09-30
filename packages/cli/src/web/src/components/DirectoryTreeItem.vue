<!--
  DirectoryTreeItem 目录树项组件
  用于递归渲染目录树结构
-->
<template>
  <div class="tree-item">
    <div
      :class="['tree-item-content', { selected: selectedPath === directory.path }]"
      @click="handleSelect"
    >
      <!-- 展开/折叠按钮 -->
      <button
        v-if="directory.type === 'directory' || directory.type === 'drive'"
        @click.stop="handleToggle"
        class="toggle-btn"
        :class="{ expanded: isExpanded }"
      >
        <ChevronRight :size="16" />
      </button>
      <div v-else class="toggle-placeholder"></div>

      <!-- 图标 -->
      <component :is="getIcon()" :size="18" class="item-icon" />

      <!-- 名称 -->
      <span class="item-name">{{ directory.name }}</span>

      <!-- 加载状态 -->
      <Loader2 v-if="isLoading" :size="14" class="spinning" />
    </div>

    <!-- 子目录 -->
    <div v-if="isExpanded && directory.children" class="tree-children">
      <DirectoryTreeItem
        v-for="child in directory.children"
        :key="child.path"
        :directory="child"
        :selected-path="selectedPath"
        :expanded-paths="expandedPaths"
        :loading-paths="loadingPaths"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Folder, HardDrive, Home, ChevronRight, Loader2 } from 'lucide-vue-next'
import type { DirectoryItem } from './DirectoryPicker.vue'

/**
 * Props
 */
const props = defineProps<{
  directory: DirectoryItem
  selectedPath: string
  expandedPaths: Set<string>
  loadingPaths: Set<string>
}>()

/**
 * Emits
 */
const emit = defineEmits<{
  (e: 'select', path: string): void
  (e: 'toggle', directory: DirectoryItem): void
}>()

/**
 * 计算属性
 */
const isExpanded = computed(() => props.expandedPaths.has(props.directory.path))
const isLoading = computed(() => props.loadingPaths.has(props.directory.path))

/**
 * 获取图标
 */
const getIcon = () => {
  switch (props.directory.type) {
    case 'drive':
      return HardDrive
    case 'special':
      return Home
    default:
      return Folder
  }
}

/**
 * 处理选择
 */
const handleSelect = () => {
  emit('select', props.directory.path)
}

/**
 * 处理展开/折叠
 */
const handleToggle = () => {
  emit('toggle', props.directory)
}
</script>

<style scoped lang="less">
.tree-item {
  user-select: none;
}

.tree-item-content {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
  padding: var(--ls-padding-xs) var(--ls-padding-sm);
  cursor: pointer;
  border-radius: var(--ls-border-radius-sm);
  transition: all 0.2s ease;

  &:hover {
    background: var(--ldesign-bg-color-component-hover);
  }

  &.selected {
    background: var(--ldesign-brand-color-focus);
    color: var(--ldesign-brand-color);
    font-weight: 500;
  }
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--ls-border-radius-sm);
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--ldesign-bg-color-component-active);
  }

  svg {
    transition: transform 0.2s ease;
  }

  &.expanded svg {
    transform: rotate(90deg);
  }
}

.toggle-placeholder {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.item-icon {
  flex-shrink: 0;
  color: var(--ldesign-text-color-secondary);
}

.item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--ls-font-size-sm);
}

.spinning {
  animation: spin 1s linear infinite;
  color: var(--ldesign-brand-color);
  flex-shrink: 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.tree-children {
  padding-left: var(--ls-padding-lg);
}
</style>

