<!--
  FieldArray 组件
  
  @description
  数组字段组件，支持动态添加、删除、移动数组项
-->

<template>
  <div :class="fieldArrayClasses">
    <!-- 数组项列表 -->
    <div class="ldesign-field-array__list">
      <div
        v-for="(item, index) in fieldArray.items.value"
        :key="`item-${index}`"
        class="ldesign-field-array__item"
      >
        <!-- 项内容 -->
        <div class="ldesign-field-array__item-content">
          <slot
            :item="item"
            :index="index"
            :field="item"
            :value="item.value.value"
            :setValue="item.setValue"
            :remove="() => handleRemove(index)"
            :moveUp="index > 0 ? () => handleMove(index, index - 1) : undefined"
            :moveDown="index < fieldArray.length.value - 1 ? () => handleMove(index, index + 1) : undefined"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="ldesign-field-array__item-actions">
          <!-- 移动按钮 -->
          <div v-if="showMoveButton" class="ldesign-field-array__move-buttons">
            <button
              v-if="index > 0"
              type="button"
              class="ldesign-field-array__move-button ldesign-field-array__move-button--up"
              @click="handleMove(index, index - 1)"
              :disabled="disabled"
            >
              ↑
            </button>
            <button
              v-if="index < fieldArray.length.value - 1"
              type="button"
              class="ldesign-field-array__move-button ldesign-field-array__move-button--down"
              @click="handleMove(index, index + 1)"
              :disabled="disabled"
            >
              ↓
            </button>
          </div>

          <!-- 删除按钮 -->
          <button
            v-if="showRemoveButton && canRemove"
            type="button"
            class="ldesign-field-array__remove-button"
            @click="handleRemove(index)"
            :disabled="disabled"
          >
            {{ removeButtonText }}
          </button>
        </div>
      </div>
    </div>

    <!-- 添加按钮 -->
    <div v-if="showAddButton && canAdd" class="ldesign-field-array__add">
      <button
        type="button"
        class="ldesign-field-array__add-button"
        @click="handleAdd"
        :disabled="disabled"
      >
        {{ addButtonText }}
      </button>
    </div>

    <!-- 空状态 -->
    <div
      v-if="fieldArray.length.value === 0"
      class="ldesign-field-array__empty"
    >
      <slot name="empty">
        <div class="ldesign-field-array__empty-text">
          暂无数据，点击添加按钮开始
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, type PropType } from 'vue';
import { useFieldArray } from '../hooks/useFieldArray';
import type { FieldArrayProps, FieldArrayEmits, FieldArrayExpose } from './types';

// === Props 定义 ===
const props = withDefaults(defineProps<FieldArrayProps>(), {
  min: 0,
  max: Infinity,
  showAddButton: true,
  showRemoveButton: true,
  showMoveButton: false,
  addButtonText: '添加',
  removeButtonText: '删除'
});

// === Emits 定义 ===
const emit = defineEmits<FieldArrayEmits>();

// === 字段数组实例 ===
const fieldArray = useFieldArray(props.name, {
  defaultItem: props.defaultItem
});

// === 计算属性 ===
const fieldArrayClasses = computed(() => [
  'ldesign-field-array',
  {
    'ldesign-field-array--disabled': props.disabled,
    'ldesign-field-array--readonly': props.readonly,
    'ldesign-field-array--empty': fieldArray.length.value === 0
  }
]);

const canAdd = computed(() => {
  return !props.disabled && 
         !props.readonly && 
         fieldArray.length.value < props.max;
});

const canRemove = computed(() => {
  return !props.disabled && 
         !props.readonly && 
         fieldArray.length.value > props.min;
});

// === 事件处理 ===
const handleAdd = () => {
  if (!canAdd.value) return;
  
  const newItem = fieldArray.push(props.defaultItem);
  const newValue = fieldArray.getArrayValue();
  
  emit('update:modelValue', newValue);
  emit('change', newValue, props.name);
  emit('add', fieldArray.length.value - 1, newItem.value.value);
};

const handleRemove = (index: number) => {
  if (!canRemove.value) return;
  
  const removedItem = fieldArray.remove(index);
  const newValue = fieldArray.getArrayValue();
  
  emit('update:modelValue', newValue);
  emit('change', newValue, props.name);
  
  if (removedItem) {
    emit('remove', index, removedItem.value.value);
  }
};

const handleMove = (fromIndex: number, toIndex: number) => {
  if (props.disabled || props.readonly) return;
  
  fieldArray.move(fromIndex, toIndex);
  const newValue = fieldArray.getArrayValue();
  
  emit('update:modelValue', newValue);
  emit('change', newValue, props.name);
  emit('move', fromIndex, toIndex);
};

// === 监听数组变化 ===
watch(
  () => fieldArray.value.value,
  (newValue) => {
    if (Array.isArray(newValue)) {
      emit('update:modelValue', newValue);
      emit('change', newValue, props.name);
    }
  },
  { deep: true }
);

// === 暴露的方法和属性 ===
defineExpose<FieldArrayExpose>({
  fieldArray: fieldArray as any,
  push: fieldArray.push,
  pop: fieldArray.pop,
  insert: fieldArray.insert,
  remove: fieldArray.remove,
  move: fieldArray.move
});
</script>

<script lang="ts">
export default {
  name: 'FieldArray',
  inheritAttrs: false
};
</script>

<style lang="less">
.ldesign-field-array {
  // 基础样式
  position: relative;

  // 列表样式
  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--ls-spacing-sm);
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: var(--ls-spacing-sm);
    padding: var(--ls-spacing-sm);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-base);
    background: var(--ldesign-bg-color-component);
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--ldesign-border-color-hover);
      background: var(--ldesign-bg-color-component-hover);
    }
  }

  &__item-content {
    flex: 1;
    min-width: 0;
  }

  &__item-actions {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    flex-shrink: 0;
  }

  // 移动按钮
  &__move-buttons {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__move-button {
    width: 24px;
    height: 24px;
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-sm);
    background: var(--ldesign-bg-color-component);
    color: var(--ldesign-text-color-secondary);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--ldesign-brand-color);
      color: var(--ldesign-brand-color);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  // 删除按钮
  &__remove-button {
    padding: var(--ls-spacing-xs) var(--ls-spacing-sm);
    border: 1px solid var(--ldesign-error-color);
    border-radius: var(--ls-border-radius-base);
    background: transparent;
    color: var(--ldesign-error-color);
    font-size: var(--ls-font-size-xs);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: var(--ldesign-error-color);
      color: white;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  // 添加区域
  &__add {
    margin-top: var(--ls-spacing-sm);
    text-align: center;
  }

  &__add-button {
    padding: var(--ls-spacing-sm) var(--ls-spacing-base);
    border: 1px dashed var(--ldesign-brand-color);
    border-radius: var(--ls-border-radius-base);
    background: transparent;
    color: var(--ldesign-brand-color);
    font-size: var(--ls-font-size-sm);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: var(--ldesign-brand-color-focus);
      border-style: solid;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  // 空状态
  &__empty {
    padding: var(--ls-spacing-lg);
    text-align: center;
    color: var(--ldesign-text-color-placeholder);
    border: 1px dashed var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-base);
  }

  &__empty-text {
    font-size: var(--ls-font-size-sm);
  }

  // 状态样式
  &--disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  &--readonly {
    .ldesign-field-array__item-actions {
      display: none;
    }

    .ldesign-field-array__add {
      display: none;
    }
  }

  &--empty {
    .ldesign-field-array__list {
      display: none;
    }
  }
}
</style>
