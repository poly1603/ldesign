<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="menuRef"
      class="context-menu"
      :style="menuStyle"
      @click.stop
    >
      <div
        v-for="(item, index) in items"
        :key="item.id || index"
        :class="[
          'context-menu-item',
          {
            'context-menu-item--disabled': item.disabled,
            'context-menu-item--divider': item.divider
          }
        ]"
        @click="handleItemClick(item)"
      >
        <span v-if="item.icon" class="context-menu-item__icon">{{ item.icon }}</span>
        <span class="context-menu-item__text">{{ item.text }}</span>
        <span v-if="item.shortcut" class="context-menu-item__shortcut">{{ item.shortcut }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import type { ContextMenuItem } from '@ldesign/calendar'

// Props
interface Props {
  visible: boolean
  x: number
  y: number
  items: ContextMenuItem[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  itemClick: [itemId: string]
}>()

// 响应式数据
const menuRef = ref<HTMLElement>()
const menuPosition = ref({ x: 0, y: 0 })

// 计算菜单样式
const menuStyle = computed(() => ({
  left: `${menuPosition.value.x}px`,
  top: `${menuPosition.value.y}px`,
  zIndex: 9999
}))

// 调整菜单位置，确保不超出视窗
const adjustMenuPosition = async () => {
  if (!menuRef.value) return

  await nextTick()

  const menu = menuRef.value
  const menuRect = menu.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let x = props.x
  let y = props.y

  // 水平方向调整
  if (x + menuRect.width > viewportWidth) {
    x = viewportWidth - menuRect.width - 10
  }
  if (x < 10) {
    x = 10
  }

  // 垂直方向调整
  if (y + menuRect.height > viewportHeight) {
    y = viewportHeight - menuRect.height - 10
  }
  if (y < 10) {
    y = 10
  }

  menuPosition.value = { x, y }
}

// 处理菜单项点击
const handleItemClick = (item: ContextMenuItem) => {
  if (item.disabled || item.divider) return

  emit('itemClick', item.id)
  emit('close')
}

// 监听位置变化
watch([() => props.x, () => props.y, () => props.visible], () => {
  if (props.visible) {
    menuPosition.value = { x: props.x, y: props.y }
    nextTick(() => {
      adjustMenuPosition()
    })
  }
}, { immediate: true })
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-base);
  box-shadow: var(--ldesign-shadow-2);
  padding: 4px 0;
  min-width: 160px;
  max-width: 240px;
  user-select: none;
  z-index: 9999;
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
  line-height: 1.4;
}

.context-menu-item:hover:not(.context-menu-item--disabled) {
  background-color: var(--ldesign-bg-color-container-hover);
}

.context-menu-item--disabled {
  color: var(--ldesign-text-color-disabled);
  cursor: not-allowed;
}

.context-menu-item--divider {
  height: 1px;
  background-color: var(--ldesign-border-level-1-color);
  margin: 4px 0;
  padding: 0;
}

.context-menu-item__icon {
  margin-right: 8px;
  font-size: 16px;
  width: 16px;
  text-align: center;
}

.context-menu-item__text {
  flex: 1;
}

.context-menu-item__shortcut {
  margin-left: 16px;
  font-size: 12px;
  color: var(--ldesign-text-color-secondary);
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .context-menu {
    background: var(--ldesign-bg-color-container);
    border-color: var(--ldesign-border-level-2-color);
  }
}
</style>
