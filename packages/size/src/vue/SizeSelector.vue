<template>
  <div class="ld-size-selector">
    <!-- Trigger button -->
    <button
      class="ld-size-trigger"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      :title="$t?.('size.selector.title') || 'Size Settings'"
    >
      <svg class="ld-size-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 4L7 16M7 4L5 6M7 4L9 6M13 16L13 4M13 16L11 14M13 16L15 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="4" cy="10" r="1" fill="currentColor"/>
        <circle cx="10" cy="10" r="1" fill="currentColor"/>
        <circle cx="16" cy="10" r="1" fill="currentColor"/>
      </svg>
      <span class="ld-size-label">
        {{ currentPresetLabel }}
        <span v-if="scale !== 1" class="ld-size-scale">({{ Math.round(scale * 100) }}%)</span>
      </span>
    </button>

    <!-- Dropdown panel -->
    <Transition name="ld-dropdown">
      <div
        v-if="isOpen"
        class="ld-size-dropdown"
        ref="dropdown"
        @click.stop
      >
        <!-- Preset selector -->
        <div class="ld-size-section">
          <h4 class="ld-size-section-title">{{ $t?.('size.presets.title') || 'Size Presets' }}</h4>
          <div class="ld-size-presets">
            <button
              v-for="preset in presets"
              :key="preset.name"
              class="ld-size-preset"
              :class="{
                'ld-size-preset--active': currentPreset === preset.name
              }"
              @click="selectPreset(preset.name)"
              :title="preset.description"
            >
              <span class="ld-size-preset-name">{{ preset.label }}</span>
              <svg v-if="currentPreset === preset.name" class="ld-size-check" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Scale adjuster -->
        <div class="ld-size-section">
          <h4 class="ld-size-section-title">{{ $t?.('size.scale.title') || 'Scale Adjustment' }}</h4>
          <div class="ld-size-scale-controls">
            <button
              class="ld-size-scale-btn"
              @click="handleDecreaseScale"
              :disabled="scale <= 0.5"
              :title="$t?.('size.scale.decrease') || 'Decrease size'"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            <div class="ld-size-scale-display">
              <input
                type="range"
                class="ld-size-scale-slider"
                :value="scale"
                @input="handleScaleChange"
                min="0.5"
                max="2"
                step="0.1"
              />
              <span class="ld-size-scale-value">{{ Math.round(scale * 100) }}%</span>
            </div>
            <button
              class="ld-size-scale-btn"
              @click="handleIncreaseScale"
              :disabled="scale >= 2"
              :title="$t?.('size.scale.increase') || 'Increase size'"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 4V12M4 8H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            <button
              class="ld-size-scale-btn ld-size-scale-reset"
              @click="handleResetScale"
              :disabled="scale === 1"
              :title="$t?.('size.scale.reset') || 'Reset to default'"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8C2 4.68629 4.68629 2 8 2C10.1648 2 12.0456 3.17157 13.0711 4.87868M14 8C14 11.3137 11.3137 14 8 14C5.83517 14 3.95443 12.8284 2.92893 11.1213" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M13 2V5H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 14V11H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Preview -->
        <div class="ld-size-section ld-size-preview-section">
          <h4 class="ld-size-section-title">{{ $t?.('size.preview.title') || 'Preview' }}</h4>
          <div class="ld-size-preview">
            <p class="ld-size-preview-text ld-size-preview-xs">Extra Small Text (xs)</p>
            <p class="ld-size-preview-text ld-size-preview-sm">Small Text (sm)</p>
            <p class="ld-size-preview-text ld-size-preview-base">Base Text (base)</p>
            <p class="ld-size-preview-text ld-size-preview-lg">Large Text (lg)</p>
            <p class="ld-size-preview-text ld-size-preview-xl">Extra Large Text (xl)</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useSize } from './useSize'

const props = defineProps({
  /**
   * Placement of the dropdown
   */
  placement: {
    type: String as () => 'bottom' | 'top' | 'left' | 'right',
    default: 'bottom'
  }
})

// i18n support (optional)
const $t = inject<any>('$t', null)

// Size composable
const {
  currentPreset,
  presets,
  scale,
  applyPreset,
  setScale,
  increaseScale,
  decreaseScale,
  resetScale
} = useSize()

// Local state
const isOpen = ref(false)
const dropdown = ref<HTMLElement>()

// Computed
const currentPresetLabel = computed(() => {
  const preset = presets.value.find(p => p.name === currentPreset.value)
  return preset?.label || currentPreset.value
})

// Methods
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectPreset = async (name: string) => {
  await applyPreset(name)
}

const handleScaleChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value)
  await setScale(value)
}

const handleIncreaseScale = async () => {
  await increaseScale()
}

const handleDecreaseScale = async () => {
  await decreaseScale()
}

const handleResetScale = async () => {
  await resetScale()
}

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  if (!dropdown.value?.contains(event.target as Node)) {
    closeDropdown()
  }
}

// Escape key handler
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.ld-size-selector {
  position: relative;
  display: inline-block;
}

/* Trigger button */
.ld-size-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ld-color-gray-700, #374151);
  background: var(--ld-color-gray-50, #f9fafb);
  border: 1px solid var(--ld-color-gray-200, #e5e7eb);
  border-radius: var(--ld-radius-md, 0.375rem);
  cursor: pointer;
  transition: all 0.2s;
}

.ld-size-trigger:hover {
  background: var(--ld-color-gray-100, #f3f4f6);
  border-color: var(--ld-color-gray-300, #d1d5db);
}

.ld-size-trigger:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--ld-color-primary-500, #3b82f6);
}

.ld-size-icon {
  flex-shrink: 0;
}

.ld-size-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.ld-size-scale {
  font-size: 0.75rem;
  color: var(--ld-color-gray-500, #6b7280);
}

/* Dropdown */
.ld-size-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  z-index: 1000;
  min-width: 300px;
  max-width: 360px;
  background: white;
  border: 1px solid var(--ld-color-gray-200, #e5e7eb);
  border-radius: var(--ld-radius-lg, 0.5rem);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* Sections */
.ld-size-section {
  padding: 1rem;
  border-bottom: 1px solid var(--ld-color-gray-100, #f3f4f6);
}

.ld-size-section:last-child {
  border-bottom: none;
}

.ld-size-section-title {
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--ld-color-gray-500, #6b7280);
}

/* Presets */
.ld-size-presets {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ld-size-preset {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--ld-color-gray-700, #374151);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--ld-radius-md, 0.375rem);
  cursor: pointer;
  transition: all 0.2s;
}

.ld-size-preset:hover {
  background: var(--ld-color-gray-50, #f9fafb);
}

.ld-size-preset--active {
  background: var(--ld-color-primary-50, #eff6ff);
  border-color: var(--ld-color-primary-200, #bfdbfe);
  color: var(--ld-color-primary-700, #1d4ed8);
}

.ld-size-preset-name {
  font-weight: 500;
}

.ld-size-check {
  flex-shrink: 0;
  color: var(--ld-color-primary-600, #2563eb);
}

/* Scale controls */
.ld-size-scale-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ld-size-scale-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: var(--ld-color-gray-600, #4b5563);
  background: var(--ld-color-gray-100, #f3f4f6);
  border: 1px solid var(--ld-color-gray-200, #e5e7eb);
  border-radius: var(--ld-radius-md, 0.375rem);
  cursor: pointer;
  transition: all 0.2s;
}

.ld-size-scale-btn:hover:not(:disabled) {
  background: var(--ld-color-gray-200, #e5e7eb);
  border-color: var(--ld-color-gray-300, #d1d5db);
}

.ld-size-scale-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ld-size-scale-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.ld-size-scale-slider {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--ld-color-gray-200, #e5e7eb);
  border-radius: 2px;
  outline: none;
}

.ld-size-scale-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--ld-color-primary-500, #3b82f6);
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.ld-size-scale-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--ld-color-primary-500, #3b82f6);
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.ld-size-scale-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ld-color-gray-600, #4b5563);
}

.ld-size-scale-reset {
  margin-left: 0.25rem;
}

/* Preview */
.ld-size-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--ld-color-gray-50, #f9fafb);
  border: 1px solid var(--ld-color-gray-200, #e5e7eb);
  border-radius: var(--ld-radius-md, 0.375rem);
}

.ld-size-preview-text {
  margin: 0;
  color: var(--ld-color-gray-700, #374151);
}

.ld-size-preview-xs {
  font-size: var(--ld-text-xs, 0.75rem);
}

.ld-size-preview-sm {
  font-size: var(--ld-text-sm, 0.875rem);
}

.ld-size-preview-base {
  font-size: var(--ld-text-base, 1rem);
}

.ld-size-preview-lg {
  font-size: var(--ld-text-lg, 1.125rem);
}

.ld-size-preview-xl {
  font-size: var(--ld-text-xl, 1.25rem);
}

/* Transitions */
.ld-dropdown-enter-active,
.ld-dropdown-leave-active {
  transition: all 0.2s ease;
}

.ld-dropdown-enter-from,
.ld-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .ld-size-trigger {
    color: var(--ld-color-gray-200, #e5e7eb);
    background: var(--ld-color-gray-800, #1f2937);
    border-color: var(--ld-color-gray-700, #374151);
  }

  .ld-size-trigger:hover {
    background: var(--ld-color-gray-700, #374151);
    border-color: var(--ld-color-gray-600, #4b5563);
  }

  .ld-size-dropdown {
    background: var(--ld-color-gray-800, #1f2937);
    border-color: var(--ld-color-gray-700, #374151);
  }

  .ld-size-section {
    border-color: var(--ld-color-gray-700, #374151);
  }

  .ld-size-preset {
    color: var(--ld-color-gray-200, #e5e7eb);
  }

  .ld-size-preset:hover {
    background: var(--ld-color-gray-700, #374151);
  }

  .ld-size-preset--active {
    background: var(--ld-color-primary-900, #1e3a8a);
    border-color: var(--ld-color-primary-700, #1d4ed8);
    color: var(--ld-color-primary-200, #bfdbfe);
  }

  .ld-size-scale-btn {
    color: var(--ld-color-gray-300, #d1d5db);
    background: var(--ld-color-gray-700, #374151);
    border-color: var(--ld-color-gray-600, #4b5563);
  }

  .ld-size-scale-btn:hover:not(:disabled) {
    background: var(--ld-color-gray-600, #4b5563);
    border-color: var(--ld-color-gray-500, #6b7280);
  }

  .ld-size-preview {
    background: var(--ld-color-gray-900, #111827);
    border-color: var(--ld-color-gray-700, #374151);
  }

  .ld-size-preview-text {
    color: var(--ld-color-gray-200, #e5e7eb);
  }
}
</style>