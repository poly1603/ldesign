<template>
  <div class="locale-selector">
    <button 
      class="locale-trigger"
      @click="isOpen = !isOpen"
      :aria-label="$t('common.changeLanguage')"
    >
      <span class="locale-icon">🌐</span>
      <span class="locale-label">{{ currentLocaleName }}</span>
      <span class="locale-arrow" :class="{ 'is-open': isOpen }">▼</span>
    </button>
    
    <transition name="dropdown">
      <div v-if="isOpen" class="locale-dropdown" @click="isOpen = false">
        <button
          v-for="option in localeOptions"
          :key="option.value"
          class="locale-option"
          :class="{ 'is-active': option.value === currentLocale }"
          @click="handleChange(option.value)"
        >
          <span class="locale-option-flag">{{ getFlag(option.value) }}</span>
          <span class="locale-option-label">{{ option.label }}</span>
          <span v-if="option.value === currentLocale" class="locale-option-check">✓</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLocaleSelector, useI18n } from '../composables/useI18n'
import type { SupportedLocale } from '../i18n'

// 使用语言选择器
const { currentLocale, localeOptions, changeLocale } = useLocaleSelector()

// 使用 i18n 获取国旗函数
const { getLocaleFlag } = useI18n()

// 下拉菜单状态
const isOpen = ref(false)

// 当前语言名称
const currentLocaleName = computed(() => {
  const option = localeOptions.value.find(opt => opt.value === currentLocale.value)
  return option?.label || currentLocale.value
})

// 获取国旗 emoji - 直接使用共享的方法
const getFlag = (locale: string) => getLocaleFlag(locale)

// 处理语言切换
const handleChange = async (locale: SupportedLocale) => {
  await changeLocale(locale)
  
  // 可选：显示切换成功提示
  if (import.meta.env.DEV) {
    console.log(`✅ 语言已切换至: ${locale}`)
  }
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.locale-selector')) {
    isOpen.value = false
  }
}

// 监听键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.locale-selector {
  position: relative;
  user-select: none;
}

.locale-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  transition: all 0.2s;
}

.locale-trigger:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.locale-trigger:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.locale-icon {
  font-size: 18px;
}

.locale-label {
  flex: 1;
  text-align: left;
}

.locale-arrow {
  font-size: 10px;
  transition: transform 0.2s;
}

.locale-arrow.is-open {
  transform: rotate(180deg);
}

.locale-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 180px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 4px;
  z-index: 1000;
}

.locale-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #4a5568;
  text-align: left;
  transition: all 0.2s;
}

.locale-option:hover {
  background: #f7fafc;
  color: #2d3748;
}

.locale-option.is-active {
  background: #edf2f7;
  color: #667eea;
  font-weight: 500;
}

.locale-option-flag {
  font-size: 20px;
}

.locale-option-label {
  flex: 1;
}

.locale-option-check {
  color: #48bb78;
  font-weight: bold;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .locale-trigger {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .locale-trigger:hover {
    background: #374151;
    border-color: #718096;
  }
  
  .locale-dropdown {
    background: #2d3748;
    border-color: #4a5568;
  }
  
  .locale-option {
    color: #cbd5e0;
  }
  
  .locale-option:hover {
    background: #374151;
    color: #e2e8f0;
  }
  
  .locale-option.is-active {
    background: #4a5568;
    color: #9f7aea;
  }
}

/* 移动端适配 */
@media (max-width: 640px) {
  .locale-trigger {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .locale-dropdown {
    min-width: 160px;
  }
  
  .locale-option {
    padding: 8px 10px;
    font-size: 13px;
  }
}
</style>