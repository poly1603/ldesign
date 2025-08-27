<!--
评分组件
-->

<template>
  <div class="rating-field">
    <div class="rating-stars">
      <span
        v-for="star in maxStars"
        :key="star"
        :class="['star', getStarClass(star)]"
        @click="handleStarClick(star)"
        @mouseover="handleStarHover(star)"
        @mouseleave="handleMouseLeave"
      >
        ★
      </span>
    </div>
    <div v-if="showText" class="rating-text">
      {{ getRatingText() }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue?: number
  max?: number
  allowHalf?: boolean
  showText?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  max: 5,
  allowHalf: false,
  showText: false,
  disabled: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const hoverValue = ref(0)
const isHovering = ref(false)

// 计算属性
const maxStars = computed(() => props.max)
const currentValue = computed(() => isHovering.value ? hoverValue.value : props.modelValue)

// 获取星星样式类
const getStarClass = (star: number) => {
  const value = currentValue.value
  
  if (star <= value) {
    return 'filled'
  } else if (props.allowHalf && star - 0.5 <= value) {
    return 'half'
  } else {
    return 'empty'
  }
}

// 获取评分文本
const getRatingText = () => {
  const value = props.modelValue
  if (value === 0) return '未评分'
  
  const texts = ['很差', '较差', '一般', '较好', '很好']
  const index = Math.ceil(value) - 1
  return `${value}星 - ${texts[index] || '很好'}`
}

// 事件处理
const handleStarClick = (star: number) => {
  if (props.disabled) return
  
  let value = star
  
  if (props.allowHalf) {
    // 如果允许半星，点击左半部分为半星，右半部分为整星
    // 这里简化处理，直接设置为整星
    value = star
  }
  
  emit('update:modelValue', value)
}

const handleStarHover = (star: number) => {
  if (props.disabled) return
  
  isHovering.value = true
  hoverValue.value = star
}

const handleMouseLeave = () => {
  isHovering.value = false
  hoverValue.value = 0
}
</script>

<style scoped>
.rating-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.star.filled {
  color: #faad14;
}

.star.half {
  background: linear-gradient(90deg, #faad14 50%, #d9d9d9 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.star.empty {
  color: #d9d9d9;
}

.star:hover {
  transform: scale(1.1);
}

.rating-text {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.rating-field[disabled] .star {
  cursor: not-allowed;
  opacity: 0.6;
}

.rating-field[disabled] .star:hover {
  transform: none;
}
</style>
