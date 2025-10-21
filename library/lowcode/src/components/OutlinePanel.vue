<template>
  <div class="outline-panel">
    <div class="panel-header">
      <h3>{{ t('editor.outline.title') }}</h3>
    </div>
    
    <div class="panel-body">
      <div v-if="components.length === 0" class="empty-state-panel">
        <Icon name="Layers" :size="48" class="empty-icon" />
        <div class="empty-text">{{ t('editor.outline.empty') }}</div>
      </div>
      
      <div v-else class="tree-container">
        <OutlineTreeNode
          v-for="component in components"
          :key="component.id"
          :node="component"
          :selected-id="selectedId"
          :level="0"
          @select="handleSelect"
          @delete="handleDelete"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentNode } from '../types';
import { useI18n } from '../composables/useI18n';
import Icon from './Icon.vue';
import OutlineTreeNode from './OutlineTreeNode.vue';

/**
 * OutlinePanel 组件属性
 */
interface OutlinePanelProps {
  /** 组件列表 */
  components: ComponentNode[];
  /** 选中的组件 ID */
  selectedId?: string | null;
}

/**
 * OutlinePanel 组件事件
 */
interface OutlinePanelEmits {
  (e: 'select', id: string): void;
  (e: 'delete', id: string): void;
}

defineProps<OutlinePanelProps>();
const emit = defineEmits<OutlinePanelEmits>();

const { t } = useI18n();

/**
 * 选择组件
 */
function handleSelect(id: string) {
  emit('select', id);
}

/**
 * 删除组件
 */
function handleDelete(id: string) {
  emit('delete', id);
}
</script>

<style scoped lang="less">
.outline-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: var(--text-color);
    }
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }

  .tree-container {
    padding: 0;
  }

  .empty-state-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 32px 16px;
    color: var(--text-disabled);

    .empty-icon {
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 14px;
      text-align: center;
    }
  }

  // 滚动条样式
  .panel-body::-webkit-scrollbar {
    width: 6px;
  }

  .panel-body::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }

  .panel-body::-webkit-scrollbar-track {
    background: transparent;
  }
}
</style>


