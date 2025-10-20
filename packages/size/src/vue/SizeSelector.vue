<script setup lang="ts">
import type { SizeLocale } from '../locales'
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getLocale } from '../locales'
import { SIZE_CUSTOM_LOCALE_KEY, SIZE_LOCALE_KEY } from './plugin'
import { useSize } from './useSize'

const {
  currentPreset,
  applyPreset,
  presets: presetsRef
} = useSize()

const presets = computed(() => presetsRef.value || [])
const isOpen = ref(false)
const selectorRef = ref<HTMLElement>()

// 开发环境日志
if ((typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.NODE_ENV === 'development') || false) {
  console.info('[SizeSelector] 初始化', {
    currentPreset: currentPreset.value,
    presetsCount: presets.value.length,
    presets: presets.value.map((p: any) => ({ name: p.name, baseSize: p.baseSize }))
  })
}

// 如果没有预设选项，则不显示组件
const hasPresets = computed(() => presets.value.length > 0)

// 国际化 - 优先使用应用层的响应式 locale
// 使用标准的 'locale' key
const appLocale = inject<any>('locale', null)
const pluginLocale = inject(SIZE_LOCALE_KEY, 'zh-CN')
const customLocale = inject<Partial<SizeLocale> | undefined>(SIZE_CUSTOM_LOCALE_KEY, undefined)

// 调试日志已禁用以保持控制台干净

// 使用响应式 locale
const currentLocale = computed(() => {
  // 优先使用应用层的 locale
  if (appLocale && appLocale.value) {
    return appLocale.value
  }
  // 其次使用插件配置的 locale
  return pluginLocale
})

const t = computed(() => {
  const baseLocale = getLocale(currentLocale.value)
  if (!customLocale) return baseLocale

  // 合并自定义翻译
  return {
    ...baseLocale,
    title: customLocale.title || baseLocale.title,
    presets: { ...baseLocale.presets, ...customLocale.presets },
    descriptions: { ...baseLocale.descriptions, ...customLocale.descriptions }
  }
})

// 监听语言变化
watch(currentLocale, () => {
  // 响应式更新，无需日志
})

function getPresetLabel(name: string): string {
  return t.value.presets[name] || name
}

function getPresetDescription(name: string): string {
  return t.value.descriptions[name] || ''
}

function togglePanel() {
  isOpen.value = !isOpen.value
}

function closePanel() {
  isOpen.value = false
}

function selectPreset(name: string) {
  if ((typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.NODE_ENV === 'development') || false) {
    console.info('[SizeSelector] selectPreset 被调用:', name)
  }
  applyPreset(name)
  closePanel()
  if ((typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.NODE_ENV === 'development') || false) {
    console.info('[SizeSelector] selectPreset 完成')
  }
}

// 点击外部关闭
function handleClickOutside(event: MouseEvent) {
  if (selectorRef.value && !selectorRef.value.contains(event.target as Node)) {
    closePanel()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div v-if="hasPresets" ref="selectorRef" class="size-selector">
    <!-- 触发按钮 -->
    <button class="size-trigger" :aria-expanded="isOpen" :aria-label="t?.ariaLabel || '调整尺寸'" @click="togglePanel">
      <svg
        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
        class="lucide lucide-alarge-small-icon lucide-a-large-small"
      >
        <path d="m15 16 2.536-7.328a1.02 1.02 1 0 1 1.928 0L22 16" />
        <path d="M15.697 14h5.606" />
        <path d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16" />
        <path d="M3.304 13h6.392" />
      </svg>
    </button>

    <!-- 弹窗面板 -->
    <Transition name="size-panel">
      <div v-if="isOpen" class="size-panel">
        <div class="size-panel-header">
          <h3 class="size-panel-title">
            {{ t?.title || '选择尺寸' }}
          </h3>
          <button class="size-panel-close" :aria-label="t?.close || '关闭'" @click="closePanel">
            <svg
              xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div class="size-panel-content">
          <div
            v-for="preset in presets" :key="preset.name" class="size-option"
            :class="{ 'size-option-active': currentPreset === preset.name }" @click="selectPreset(preset.name)"
          >
            <div class="size-option-main">
              <div class="size-option-label">
                {{ getPresetLabel(preset.name) }}
              </div>
              <div class="size-option-desc">
                {{ getPresetDescription(preset.name) }}
              </div>
            </div>
            <div class="size-option-badge">
              {{ preset.baseSize }}px
            </div>
            <svg
              v-if="currentPreset === preset.name" class="size-option-check" xmlns="http://www.w3.org/2000/svg"
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.size-selector {
  position: relative;
  display: inline-block;
}

.size-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: currentColor;
  cursor: pointer;
  transition: all 0.2s ease;
}

.size-trigger:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.size-trigger:active {
  transform: translateY(0);
}

.size-trigger[aria-expanded="true"] {
  background: rgba(255, 255, 255, 0.25);
}

/* 弹窗面板 */
.size-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  z-index: 1000;
}

.size-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.size-panel-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.size-panel-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.15s ease;
}

.size-panel-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1a1a1a;
}

.size-panel-content {
  padding: 8px;
  max-height: 400px;
  overflow-y: auto;
}

/* 尺寸选项 */
.size-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 2px solid transparent;
}

.size-option:hover {
  background: rgba(0, 0, 0, 0.03);
}

.size-option-active {
  background: rgba(102, 126, 234, 0.08);
  border-color: rgba(102, 126, 234, 0.3);
}

.size-option-active:hover {
  background: rgba(102, 126, 234, 0.12);
}

.size-option-main {
  flex: 1;
  min-width: 0;
}

.size-option-label {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.size-option-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.size-option-badge {
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.05);
  font-size: 12px;
  font-weight: 500;
  color: #666;
  white-space: nowrap;
}

.size-option-active .size-option-badge {
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
}

.size-option-check {
  color: #667eea;
  flex-shrink: 0;
}

/* 动画 */
.size-panel-enter-active,
.size-panel-leave-active {
  transition: all 0.2s ease;
}

.size-panel-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.size-panel-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 响应式 */
@media (max-width: 640px) {
  .size-panel {
    left: 0;
    right: 0;
    min-width: auto;
    width: calc(100vw - 32px);
    max-width: 400px;
  }
}

/* 滚动条样式 */
.size-panel-content::-webkit-scrollbar {
  width: 6px;
}

.size-panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.size-panel-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.size-panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}
</style>
