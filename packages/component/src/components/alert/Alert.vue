<template>
  <div
    v-if="visible"
    :class="alertClasses"
  >
    <div class="ld-alert__content">
      <l-icon
        v-if="showIcon"
        :name="iconName"
        class="ld-alert__icon"
      />
      <div class="ld-alert__body">
        <div v-if="title" class="ld-alert__title">{{ title }}</div>
        <div v-if="description || $slots.default" class="ld-alert__description">
          <slot>{{ description }}</slot>
        </div>
      </div>
    </div>
    <button
      v-if="closable"
      class="ld-alert__close"
      @click="handleClose"
    >
      <l-icon name="close" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { alertProps, alertEmits } from './types'

defineOptions({
  name: 'LAlert'
})

const props = defineProps(alertProps)
const emit = defineEmits(alertEmits)

const visible = ref(true)

const iconName = computed(() => {
  if (props.icon) return props.icon

  const iconMap = {
    info: 'info',
    success: 'check',
    warning: 'alert-triangle',
    error: 'alert-circle'
  }

  return iconMap[props.type]
})

const alertClasses = computed(() => {
  return [
    'ld-alert',
    `ld-alert--${props.type}`,
    {
      'ld-alert--with-icon': props.showIcon,
      'ld-alert--closable': props.closable
    }
  ]
})

const handleClose = () => {
  visible.value = false
  emit('close')
}
</script>

<style lang="less">
@import './alert.less';
</style>