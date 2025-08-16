<script setup lang="ts">
import FormDatePicker from './FormDatePicker.vue'

interface FormTimePickerProps {
  modelValue?: string | Date | null
}

defineProps<FormTimePickerProps>()

defineEmits<{
  'update:modelValue': [value: string | Date | null]
  change: [value: string | Date | null, event: Event]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  clear: []
}>()
</script>

<template>
  <div class="form-time-picker">
    <FormDatePicker
      v-bind="$attrs"
      :model-value="modelValue"
      type="time"
      @update:model-value="$emit('update:modelValue', $event)"
      @change="$emit('change', $event)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
      @clear="$emit('clear')"
    />
  </div>
</template>

<style scoped>
.form-time-picker {
  width: 100%;
}
</style>
