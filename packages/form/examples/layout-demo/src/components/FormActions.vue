<template>
  <div class="form-actions" :class="`label-${labelPosition}`">
    <button
      v-if="showQuery"
      type="button"
      class="action-button query-button"
      @click="handleQuery"
    >
      查询
    </button>

    <button
      v-if="showReset"
      type="button"
      class="action-button reset-button"
      @click="handleReset"
    >
      重置
    </button>

    <button
      v-if="showExpand"
      type="button"
      class="action-button expand-button"
      @click="handleExpand"
    >
      {{ expandText }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  showQuery?: boolean
  showReset?: boolean
  showExpand?: boolean
  expandText?: string
  labelPosition?: 'top' | 'left' | 'right'
  onQuery?: () => void
  onReset?: () => void
  onExpand?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  showQuery: true,
  showReset: true,
  showExpand: true,
  expandText: '展开',
  labelPosition: 'top',
})

const handleQuery = () => {
  props.onQuery?.()
}

const handleReset = () => {
  props.onReset?.()
}

const handleExpand = () => {
  props.onExpand?.()
}
</script>

<style scoped>
.form-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end; /* 默认右对齐 */
  flex-wrap: wrap;
  min-height: 40px; /* 确保与输入框高度一致 */
}

/* 标签位置为顶部时：按钮组与输入框底部对齐 */
.form-actions.label-top {
  align-items: flex-end;
  padding-top: 6px; /* 与输入框对齐 */
}

/* 标签位置为左侧或右侧时：按钮组与输入框垂直居中对齐 */
.form-actions.label-left,
.form-actions.label-right {
  align-items: center;
  padding-top: 6px; /* 与标签和输入框的对齐基线一致 */
}

.action-button {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: white;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-button:hover {
  border-color: #667eea;
  color: #667eea;
}

.query-button {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.query-button:hover {
  background: #5a6fd8;
  border-color: #5a6fd8;
  color: white;
}

.reset-button:hover {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.expand-button {
  color: #1890ff;
  border-color: #1890ff;
}

.expand-button:hover {
  background: #1890ff;
  color: white;
}

@media (max-width: 768px) {
  .form-actions {
    width: 100%;
    justify-content: center;
  }

  .action-button {
    flex: 1;
    min-width: 60px;
  }
}
</style>
