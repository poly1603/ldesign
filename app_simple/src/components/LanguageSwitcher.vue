<template>
  <div class="language-switcher">
    <button @click="toggleDropdown" class="language-button" :title="t('nav.language')">
      <span class="flag">{{ currentLocaleFlag }}</span>
      <span class="name">{{ currentLocaleName }}</span>
      <span class="arrow" :class="{ open: isOpen }">▼</span>
    </button>
    <transition name="dropdown">
      <div v-if="isOpen" class="language-dropdown" @click.stop>
        <button
          v-for="locale in availableLocales"
          :key="locale.code"
          @click="changeLocale(locale.code)"
          class="language-option"
          :class="{ active: currentLocale === locale.code }"
        >
          <span class="flag">{{ locale.flag }}</span>
          <span class="name">{{ locale.name }}</span>
          <span v-if="currentLocale === locale.code" class="check">✓</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/i18n'
import { availableLocales } from '@/locales'

const { locale, setLocale, t } = useI18n()
const isOpen = ref(false)

const currentLocale = computed(() => locale.value)
const currentLocaleData = computed(() => 
  availableLocales.find(l => l.code === currentLocale.value) || availableLocales[0]
)
const currentLocaleName = computed(() => currentLocaleData.value.name)
const currentLocaleFlag = computed(() => currentLocaleData.value.flag)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const changeLocale = async (newLocale: string) => {
  await setLocale(newLocale)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.language-switcher')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.language-switcher {
  position: relative;
}

.language-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--ld-color-primary-100);
  border: 1px solid var(--ld-color-primary-200);
  border-radius: 8px;
  color: var(--ld-color-gray-800);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.language-button:hover {
  background: var(--ld-color-primary-200);
  border-color: var(--ld-color-primary-300);
}

.flag {
  font-size: 18px;
}

.arrow {
  font-size: 10px;
  transition: transform 0.3s;
}

.arrow.open {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--ld-color-gray-50, white);
  border: 1px solid var(--ld-color-gray-200);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--ld-color-gray-300, rgba(0, 0, 0, 0.1));
  overflow: hidden;
  z-index: 1000;
  min-width: 160px;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  color: var(--ld-color-gray-800);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.language-option:hover {
  background: var(--ld-color-primary-100);
}

.language-option.active {
  background: var(--ld-color-primary-100);
  color: var(--ld-color-primary-500);
  font-weight: 600;
}

.language-option .name {
  flex: 1;
}

.check {
  color: var(--ld-color-primary-500);
  font-weight: bold;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>