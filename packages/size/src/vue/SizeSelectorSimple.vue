<template>
  <div class="size-selector">
    <label>
      Size: 
      <select 
        :value="currentPreset" 
        @change="onPresetChange"
      >
        <option 
          v-for="preset in presets" 
          :key="preset.name" 
          :value="preset.name"
        >
          {{ preset.label }}
        </option>
      </select>
    </label>
  </div>
</template>

<script setup lang="ts">
import { useSize } from './useSizeSimple'

const { 
  currentPreset, 
  applyPreset, 
  getPresets 
} = useSize()

const presets = getPresets()

function onPresetChange(event: Event) {
  const target = event.target as HTMLSelectElement
  applyPreset(target.value)
}
</script>

<style scoped>
.size-selector {
  display: flex;
  gap: 1rem;
  align-items: center;
}

label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  white-space: nowrap;
}

select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  cursor: pointer;
}
</style>
