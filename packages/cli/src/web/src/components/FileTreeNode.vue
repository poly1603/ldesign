<template>
  <div class="file-tree-node">
    <div
      class="node-content"
      :class="{ directory: node.type === 'directory', file: node.type === 'file' }"
      :style="{ paddingLeft: level * 20 + 'px' }"
      @click="handleClick"
    >
      <!-- 展开/收起图标 -->
      <div class="expand-icon" v-if="node.type === 'directory'">
        <ChevronRight
          :size="16"
          :class="{ expanded: isExpanded }"
        />
      </div>
      <div class="expand-icon placeholder" v-else></div>

      <!-- 文件/文件夹图标 -->
      <div class="node-icon">
        <Folder v-if="node.type === 'directory' && !isExpanded" :size="16" class="folder-icon" />
        <FolderOpen v-else-if="node.type === 'directory' && isExpanded" :size="16" class="folder-open-icon" />
        <FileIcon v-else :size="16" :extension="node.extension" />
      </div>

      <!-- 文件/文件夹名称 -->
      <span class="node-name">{{ node.name }}</span>

      <!-- 文件大小 -->
      <span class="node-size">{{ formatSize(node.size) }}</span>
    </div>

    <!-- 子节点 -->
    <div v-if="node.type === 'directory' && isExpanded && node.children" class="node-children">
      <FileTreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :level="level + 1"
        :expanded-keys="expandedKeys"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Folder, FolderOpen, ChevronRight } from 'lucide-vue-next'
import FileIcon from './FileIcon.vue'

interface Props {
  node: {
    name: string
    path: string
    size: number
    type: 'file' | 'directory'
    extension?: string
    children?: any[]
  }
  level: number
  expandedKeys: Set<string>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  toggle: [path: string]
}>()

// 是否展开
const isExpanded = computed(() => {
  return props.expandedKeys.has(props.node.path)
})

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 点击处理
const handleClick = () => {
  if (props.node.type === 'directory') {
    emit('toggle', props.node.path)
  }
}
</script>

<style lang="less" scoped>
.file-tree-node {
  .node-content {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    padding: 4px 8px;
    border-radius: var(--ls-radius-sm);
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;

    &:hover {
      background: var(--ldesign-bg-color-component-hover);
    }

    &.directory {
      font-weight: 500;
    }

    .expand-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      color: var(--ldesign-text-color-tertiary);
      transition: transform 0.2s;

      &.placeholder {
        opacity: 0;
      }

      svg.expanded {
        transform: rotate(90deg);
      }
    }

    .node-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      flex-shrink: 0;

      .folder-icon {
        color: #FFA726;
      }

      .folder-open-icon {
        color: #FFB74D;
      }
    }

    .node-name {
      flex: 1;
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .node-size {
      font-size: var(--ls-font-size-xs);
      color: var(--ldesign-text-color-tertiary);
      font-family: 'Consolas', 'Monaco', monospace;
      flex-shrink: 0;
    }
  }

  .node-children {
    // 子节点容器
  }
}
</style>