<template>
  <div class="ldesign-rate-field" :class="rateClass">
    <div class="ldesign-rate-stars">
      <span
        v-for="index in count"
        :key="index"
        class="ldesign-rate-star"
        :class="getStarClass(index)"
        @click="handleClick(index)"
        @mouseenter="handleMouseEnter(index)"
        @mouseleave="handleMouseLeave"
      >
        <span class="ldesign-rate-star-first">{{ getStarChar(index, 'first') }}</span>
        <span class="ldesign-rate-star-second">{{ getStarChar(index, 'second') }}</span>
      </span>
    </div>
    
    <span v-if="showText && texts" class="ldesign-rate-text">
      {{ getCurrentText() }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue?: number
  count?: number
  allowHalf?: boolean
  disabled?: boolean
  showText?: boolean
  texts?: string[]
  icon?: string
  voidIcon?: string
  color?: string
  voidColor?: string
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  count: 5,
  allowHalf: false,
  disabled: false,
  showText: false,
  icon: '★',
  voidIcon: '☆',
  color: '#fadb14',
  voidColor: '#d9d9d9',
  size: 'medium'
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'change': [value: number]
}>()

const hoverValue = ref(0)
const isHovering = ref(false)

const rateClass = computed(() => ({
  'is-disabled': props.disabled,
  [`ldesign-rate--${props.size}`]: true
}))

const displayValue = computed(() => {
  return isHovering.value ? hoverValue.value : props.modelValue
})

const getStarClass = (index: number) => {
  const value = displayValue.value
  
  if (value >= index) {
    return 'is-full'
  } else if (props.allowHalf && value >= index - 0.5) {
    return 'is-half'
  }
  
  return ''
}

const getStarChar = (index: number, position: 'first' | 'second') => {
  const value = displayValue.value
  
  if (value >= index) {
    return props.icon
  } else if (props.allowHalf && value >= index - 0.5 && position === 'first') {
    return props.icon
  }
  
  return props.voidIcon
}

const handleClick = (index: number) => {
  if (props.disabled) return
  
  let newValue: number
  
  if (props.allowHalf) {
    // 如果允许半星，需要判断点击位置
    const isSecondHalf = hoverValue.value === index
    newValue = isSecondHalf ? index : index - 0.5
  } else {
    newValue = index
  }
  
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

const handleMouseEnter = (index: number) => {
  if (props.disabled) return
  
  isHovering.value = true
  hoverValue.value = index
}

const handleMouseLeave = () => {
  if (props.disabled) return
  
  isHovering.value = false
  hoverValue.value = 0
}

const getCurrentText = () => {
  if (!props.texts || props.texts.length === 0) {
    return ''
  }
  
  const index = Math.ceil(displayValue.value) - 1
  return props.texts[index] || ''
}
</script>

<style lang="less" scoped>
.ldesign-rate-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.ldesign-rate-stars {
  display: inline-flex;
  gap: 4px;
}

.ldesign-rate-star {
  position: relative;
  display: inline-block;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.1);
  }

  .ldesign-rate-field.is-disabled & {
    cursor: not-allowed;

    &:hover {
      transform: none;
    }
  }
}

.ldesign-rate-star-first,
.ldesign-rate-star-second {
  display: inline-block;
  color: v-bind(voidColor);
  transition: color 0.3s;
}

.ldesign-rate-star-first {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  overflow: hidden;
}

.ldesign-rate-star.is-full .ldesign-rate-star-first,
.ldesign-rate-star.is-full .ldesign-rate-star-second {
  color: v-bind(color);
}

.ldesign-rate-star.is-half .ldesign-rate-star-first {
  color: v-bind(color);
}

.ldesign-rate-text {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin-left: 4px;
}

.ldesign-rate--small {
  .ldesign-rate-star {
    font-size: 16px;
  }

  .ldesign-rate-text {
    font-size: 12px;
  }
}

.ldesign-rate--medium {
  .ldesign-rate-star {
    font-size: 20px;
  }

  .ldesign-rate-text {
    font-size: 14px;
  }
}

.ldesign-rate--large {
  .ldesign-rate-star {
    font-size: 24px;
  }

  .ldesign-rate-text {
    font-size: 16px;
  }
}
</style>





