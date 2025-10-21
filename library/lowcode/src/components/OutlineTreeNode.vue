<template>
  <div class="tree-node-wrapper">
    <div
      class="tree-node"
      :class="{ 
        selected: node.id === selectedId,
        'has-children': hasChildren
      }"
      :style="{ paddingLeft: `${level * 16 + 12}px` }"
      @click="handleClick"
    >
      <!-- 展开/折叠图标 -->
      <div v-if="hasChildren" class="expand-icon" @click.stop="toggleExpand">
        <Icon :name="expanded ? 'ChevronDown' : 'ChevronRight'" :size="16" />
      </div>
      <div v-else class="expand-icon-placeholder"></div>
      
      <!-- 组件图标 -->
      <Icon :name="getComponentIcon(node.type)" :size="16" class="component-icon" />
      
      <!-- 组件名称 -->
      <span class="node-label">{{ getComponentLabel(node) }}</span>
      
      <!-- 操作按钮 -->
      <div class="node-actions">
        <button class="action-btn" @click.stop="handleDelete" :title="t('common.delete')">
          <Icon name="Trash2" :size="14" />
        </button>
      </div>
    </div>
    
    <!-- 子节点 -->
    <div v-if="hasChildren && expanded" class="tree-children">
      <OutlineTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selected-id="selectedId"
        :level="level + 1"
        @select="handleSelect"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ComponentNode } from '../types';
import { useI18n } from '../composables/useI18n';
import Icon from './Icon.vue';

/**
 * TreeNode 组件属性
 */
interface TreeNodeProps {
  /** 节点数据 */
  node: ComponentNode;
  /** 选中的节点 ID */
  selectedId?: string | null;
  /** 层级 */
  level: number;
}

/**
 * TreeNode 组件事件
 */
interface TreeNodeEmits {
  (e: 'select', id: string): void;
  (e: 'delete', id: string): void;
}

const props = defineProps<TreeNodeProps>();
const emit = defineEmits<TreeNodeEmits>();

const { t } = useI18n();

// 展开状态
const expanded = ref(true);

/**
 * 是否有子节点
 */
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0;
});

/**
 * 切换展开/折叠
 */
function toggleExpand() {
  expanded.value = !expanded.value;
}

/**
 * 点击节点
 */
function handleClick() {
  emit('select', props.node.id);
}

/**
 * 选择节点（从子节点冒泡上来）
 */
function handleSelect(id: string) {
  emit('select', id);
}

/**
 * 删除节点
 */
function handleDelete() {
  emit('delete', props.node.id);
}

/**
 * 获取组件图标
 */
function getComponentIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'LButton': 'MousePointer',
    'LInput': 'Type',
    'LText': 'Type',
    'LImage': 'Image',
    'LTable': 'Table',
    'LList': 'List',
    'LContainer': 'Box',
    'LLayout': 'Layout',
    'LCard': 'Square',
    'LForm': 'FileText'
  };
  
  return iconMap[type] || 'Box';
}

/**
 * 获取组件标签
 */
function getComponentLabel(node: ComponentNode): string {
  // 优先使用 props 中的 text、label、title 等
  if (node.props) {
    if (node.props.text) return node.props.text;
    if (node.props.label) return node.props.label;
    if (node.props.title) return node.props.title;
  }
  
  // 使用组件类型
  return node.type;
}
</script>

<style scoped lang="less">
.tree-node-wrapper {
  .tree-node {
    display: flex;
    align-items: center;
    height: 32px;
    padding-right: 8px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;
    color: var(--text-color);

    &:hover {
      background: var(--bg-hover);

      .node-actions {
        opacity: 1;
      }
    }

    &.selected {
      background: var(--bg-active);
      color: var(--primary-color);

      .node-actions {
        opacity: 1;
      }
    }
  }

  .expand-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    cursor: pointer;
    border-radius: 2px;
    color: var(--text-secondary);

    &:hover {
      background: var(--bg-hover);
      color: var(--text-color);
    }
  }

  .expand-icon-placeholder {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .component-icon {
    margin: 0 6px;
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .node-label {
    flex: 1;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .node-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      padding: 0;
      border: none;
      background: transparent;
      border-radius: 3px;
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.2s;

      &:hover {
        background: var(--bg-hover);
        color: var(--error-color);
      }
    }
  }

  .tree-children {
    // 子节点容器
  }
}
</style>


