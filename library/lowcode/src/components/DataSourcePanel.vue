<template>
  <div class="datasource-panel">
    <div class="panel-header">
      <h3>{{ t('editor.datasource.title') }}</h3>
      <button class="add-btn" @click="handleAdd" :title="t('editor.datasource.add')">
        <Icon name="Plus" :size="16" />
      </button>
    </div>
    
    <div class="panel-body">
      <div v-if="datasources.length === 0" class="empty-state-panel">
        <Icon name="Database" :size="48" class="empty-icon" />
        <div class="empty-text">{{ t('editor.datasource.title') }}</div>
        <button class="add-datasource-btn" @click="handleAdd">
          <Icon name="Plus" :size="16" />
          <span>{{ t('editor.datasource.add') }}</span>
        </button>
      </div>
      
      <div v-else class="datasource-list">
        <div
          v-for="ds in datasources"
          :key="ds.id"
          class="datasource-item"
          @click="handleSelect(ds.id)"
        >
          <div class="datasource-icon">
            <Icon name="Database" :size="20" />
          </div>
          <div class="datasource-info">
            <div class="datasource-name">{{ ds.name }}</div>
            <div class="datasource-type">{{ ds.type }}</div>
          </div>
          <div class="datasource-actions">
            <button class="action-btn" @click.stop="handleEdit(ds.id)" :title="t('common.edit')">
              <Icon name="Edit" :size="14" />
            </button>
            <button class="action-btn" @click.stop="handleDelete(ds.id)" :title="t('common.delete')">
              <Icon name="Trash2" :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DataSource } from '../types';
import { useI18n } from '../composables/useI18n';
import Icon from './Icon.vue';

/**
 * DataSourcePanel 组件属性
 */
interface DataSourcePanelProps {
  /** 数据源列表 */
  datasources: DataSource[];
}

/**
 * DataSourcePanel 组件事件
 */
interface DataSourcePanelEmits {
  (e: 'add'): void;
  (e: 'edit', id: string): void;
  (e: 'delete', id: string): void;
  (e: 'select', id: string): void;
}

defineProps<DataSourcePanelProps>();
const emit = defineEmits<DataSourcePanelEmits>();

const { t } = useI18n();

/**
 * 添加数据源
 */
function handleAdd() {
  emit('add');
}

/**
 * 编辑数据源
 */
function handleEdit(id: string) {
  emit('edit', id);
}

/**
 * 删除数据源
 */
function handleDelete(id: string) {
  emit('delete', id);
}

/**
 * 选择数据源
 */
function handleSelect(id: string) {
  emit('select', id);
}
</script>

<style scoped lang="less">
.datasource-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: var(--text-color);
    }

    .add-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background: var(--bg-color);
      color: var(--text-color);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--bg-hover);
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
    }
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
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
      margin-bottom: 16px;
      text-align: center;
    }

    .add-datasource-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 1px dashed var(--border-color);
      border-radius: 6px;
      background: var(--bg-color);
      color: var(--text-color);
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;

      &:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
    }
  }

  .datasource-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .datasource-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-color);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--primary-color);
      background: var(--bg-hover);

      .datasource-actions {
        opacity: 1;
      }
    }

    .datasource-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 6px;
      background: var(--bg-secondary);
      color: var(--primary-color);
      flex-shrink: 0;
    }

    .datasource-info {
      flex: 1;
      min-width: 0;

      .datasource-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-color);
        margin-bottom: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .datasource-type {
        font-size: 12px;
        color: var(--text-secondary);
        text-transform: uppercase;
      }
    }

    .datasource-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;

      .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        padding: 0;
        border: none;
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        color: var(--text-secondary);
        transition: all 0.2s;

        &:hover {
          background: var(--bg-active);
          color: var(--text-color);
        }

        &:last-child:hover {
          color: var(--error-color);
        }
      }
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


