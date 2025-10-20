<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from '../composables/useI18n';

interface Props {
  mode?: 'dropdown' | 'buttons' | 'tabs';
  displayNames?: Record<string, string>;
  flags?: Record<string, string>;
  showFlags?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'dropdown',
  showFlags: true,
  displayNames: () => ({
    'zh-CN': '简体中文',
    'en-US': 'English',
    'ja-JP': '日本語',
  }),
  flags: () => ({
    'zh-CN': '🇨🇳',
    'en-US': '🇺🇸',
    'ja-JP': '🇯🇵',
  })
});

const emit = defineEmits<{
  change: [locale: string];
}>();

const { locale, availableLocales, setLocale } = useI18n();
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement>();

const getLocaleName = (loc: string): string => {
  return props.displayNames[loc] || loc;
};

const getShortName = (loc: string): string => {
  return loc.split('-')[0].toUpperCase();
};

const getFlag = (loc: string): string => {
  if (!props.showFlags) return '';
  return props.flags[loc] || '🌐';
};

const getCurrentLabel = (): string => {
  return getLocaleName(locale.value);
};

const getCurrentFlag = (): string => {
  return getFlag(locale.value);
};

const isCurrentLocale = (loc: string): boolean => {
  return locale.value === loc;
};

const selectLocale = async (loc: string) => {
  await setLocale(loc);
  emit('change', loc);
  isOpen.value = false;
};

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  if (props.mode === 'dropdown') {
    document.addEventListener('click', handleClickOutside);
  }
});

onBeforeUnmount(() => {
  if (props.mode === 'dropdown') {
    document.removeEventListener('click', handleClickOutside);
  }
});
</script>

<template>
  <div class="locale-switcher-wrapper">
    <!-- 下拉选择器样式 -->
    <div v-if="mode === 'dropdown'" ref="dropdownRef" class="locale-dropdown">
      <button 
        class="locale-dropdown-trigger"
        :aria-expanded="isOpen"
        @click="toggleDropdown"
      >
        <span class="locale-icon">{{ getCurrentFlag() }}</span>
        <span class="locale-label">{{ getCurrentLabel() }}</span>
        <svg class="locale-arrow" :class="{ 'rotate': isOpen }" width="12" height="12" viewBox="0 0 12 12">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        </svg>
      </button>
      
      <transition name="dropdown">
        <div v-if="isOpen" class="locale-dropdown-menu">
          <button
            v-for="loc in availableLocales"
            :key="loc"
            class="locale-option"
            :class="{ 'active': isCurrentLocale(loc) }"
            @click="selectLocale(loc)"
          >
            <span class="locale-option-flag">{{ getFlag(loc) }}</span>
            <span class="locale-option-label">{{ getLocaleName(loc) }}</span>
            <svg v-if="isCurrentLocale(loc)" class="locale-check" width="16" height="16" viewBox="0 0 16 16">
              <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            </svg>
          </button>
        </div>
      </transition>
    </div>

    <!-- 按钮组样式 -->
    <div v-else-if="mode === 'buttons'" class="locale-buttons">
      <button
        v-for="loc in availableLocales"
        :key="loc"
        class="locale-button"
        :class="{ 'active': isCurrentLocale(loc) }"
        :title="getLocaleName(loc)"
        @click="selectLocale(loc)"
      >
        <span class="locale-button-flag">{{ getFlag(loc) }}</span>
        <span class="locale-button-label">{{ getShortName(loc) }}</span>
      </button>
    </div>

    <!-- 标签样式 -->
    <div v-else-if="mode === 'tabs'" class="locale-tabs">
      <button
        v-for="loc in availableLocales"
        :key="loc"
        class="locale-tab"
        :class="{ 'active': isCurrentLocale(loc) }"
        @click="selectLocale(loc)"
      >
        {{ getLocaleName(loc) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.locale-switcher-wrapper {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 下拉选择器样式 */
.locale-dropdown {
  position: relative;
  display: inline-block;
}

.locale-dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #24292e;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 120px;
}

.locale-dropdown-trigger:hover {
  background: #f6f8fa;
  border-color: #d1d5da;
}

.locale-dropdown-trigger:focus {
  outline: none;
  border-color: #0366d6;
  box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.1);
}

.locale-icon {
  font-size: 18px;
  line-height: 1;
}

.locale-arrow {
  transition: transform 0.2s ease;
  color: #586069;
  margin-left: auto;
}

.locale-arrow.rotate {
  transform: rotate(180deg);
}

.locale-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 180px;
  background: white;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.2);
  z-index: 1000;
  padding: 4px;
  max-height: 320px;
  overflow-y: auto;
}

.locale-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #24292e;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
  border-radius: 6px;
  white-space: nowrap;
}

.locale-option:hover {
  background: #f6f8fa;
}

.locale-option.active {
  background: #e7f3ff;
  color: #0366d6;
  font-weight: 500;
}

.locale-option-flag {
  font-size: 18px;
  line-height: 1;
}

.locale-option-label {
  flex: 1;
}

.locale-check {
  color: #0366d6;
  margin-left: auto;
}

/* 按钮组样式 */
.locale-buttons {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: #f6f8fa;
  border-radius: 8px;
}

.locale-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #586069;
  cursor: pointer;
  transition: all 0.2s ease;
}

.locale-button:hover {
  background: white;
  color: #24292e;
}

.locale-button.active {
  background: white;
  color: #0366d6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.locale-button-flag {
  font-size: 16px;
  line-height: 1;
}

.locale-button-label {
  text-transform: uppercase;
  font-size: 12px;
}

/* 标签样式 */
.locale-tabs {
  display: inline-flex;
  border-bottom: 2px solid #e1e4e8;
}

.locale-tab {
  padding: 8px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #586069;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.locale-tab:hover {
  color: #24292e;
}

.locale-tab.active {
  color: #0366d6;
}

.locale-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #0366d6;
}

/* 过渡动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .locale-dropdown-trigger {
    background: #1f2937;
    border-color: #374151;
    color: #f3f4f6;
  }

  .locale-dropdown-trigger:hover {
    background: #374151;
    border-color: #4b5563;
  }

  .locale-dropdown-menu {
    background: #1f2937;
    border-color: #374151;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .locale-option {
    color: #f3f4f6;
  }

  .locale-option:hover {
    background: #374151;
  }

  .locale-option.active {
    background: #1e3a5f;
    color: #60a5fa;
  }
}
</style>