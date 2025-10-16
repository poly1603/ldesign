<template>
  <div class="remember-checkbox-wrapper">
    <label class="checkbox-label">
      <input
        type="checkbox"
        :checked="modelValue"
        @change="handleChange"
        class="checkbox-input"
      />
      <span class="checkbox-box">
        <svg
          v-show="modelValue"
          class="checkbox-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </span>
      <span class="checkbox-text">{{ label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '记住密码'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'change': [value: boolean]
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
  emit('change', target.checked)
}
</script>

<style scoped>
.remember-checkbox-wrapper {
  display: inline-flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.3s;
}

.checkbox-label:hover {
  opacity: 0.8;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-box {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 8px;
  background-color: #fff;
  border: 2px solid #d9d9d9;
  border-radius: 4px;
  transition: all 0.3s;
}

.checkbox-input:checked + .checkbox-box {
  background-color: #1677ff;
  border-color: #1677ff;
}

.checkbox-icon {
  width: 12px;
  height: 12px;
  color: white;
  animation: checkmark 0.3s ease-in-out;
}

@keyframes checkmark {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.checkbox-text {
  font-size: 14px;
  color: #666;
}
</style>