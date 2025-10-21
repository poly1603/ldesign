<template>
  <div class="ldesign-color-picker-field">
    <div
      ref="triggerRef"
      class="ldesign-color-trigger"
      :class="triggerClass"
      @click="togglePicker"
    >
      <div
        class="ldesign-color-preview"
        :style="{ backgroundColor: displayColor }"
      />
      <span class="ldesign-color-value">{{ displayColor }}</span>
      <span class="ldesign-color-arrow">▼</span>
    </div>

    <!-- 颜色选择器面板 -->
    <teleport to="body">
      <div
        v-if="pickerVisible"
        ref="pickerRef"
        class="ldesign-color-picker-panel"
        :style="pickerStyle"
      >
        <!-- 预设颜色 -->
        <div v-if="presetColors && presetColors.length" class="ldesign-color-presets">
          <div
            v-for="(color, index) in presetColors"
            :key="index"
            class="ldesign-color-preset"
            :class="{ 'is-active': modelValue === color }"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
          />
        </div>

        <!-- 色板 -->
        <div class="ldesign-color-palette">
          <div
            ref="paletteRef"
            class="ldesign-color-saturation"
            @mousedown="handleSaturationMouseDown"
          >
            <div class="ldesign-color-saturation-white" />
            <div class="ldesign-color-saturation-black" />
            <div
              class="ldesign-color-saturation-cursor"
              :style="cursorStyle"
            />
          </div>

          <!-- 色相滑块 -->
          <div
            ref="hueRef"
            class="ldesign-color-hue"
            @mousedown="handleHueMouseDown"
          >
            <div
              class="ldesign-color-hue-cursor"
              :style="{ left: `${huePosition}%` }"
            />
          </div>

          <!-- 透明度滑块 -->
          <div
            v-if="showAlpha"
            ref="alphaRef"
            class="ldesign-color-alpha"
            @mousedown="handleAlphaMouseDown"
          >
            <div class="ldesign-color-alpha-bg" />
            <div
              class="ldesign-color-alpha-slider"
              :style="{ background: alphaGradient }"
            >
              <div
                class="ldesign-color-alpha-cursor"
                :style="{ left: `${alphaPosition}%` }"
              />
            </div>
          </div>
        </div>

        <!-- 输入框 -->
        <div class="ldesign-color-input">
          <input
            v-model="hexInput"
            type="text"
            class="ldesign-color-hex-input"
            placeholder="#000000"
            @input="handleHexInput"
          />
          <button class="ldesign-color-clear" @click="clearColor">
            清除
          </button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue?: string
  disabled?: boolean
  presetColors?: string[]
  showAlpha?: boolean
  format?: 'hex' | 'rgb' | 'rgba'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '#000000',
  disabled: false,
  showAlpha: false,
  format: 'hex'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const triggerRef = ref<HTMLElement>()
const pickerRef = ref<HTMLElement>()
const paletteRef = ref<HTMLElement>()
const hueRef = ref<HTMLElement>()
const alphaRef = ref<HTMLElement>()

const pickerVisible = ref(false)
const pickerStyle = ref({})
const hexInput = ref(props.modelValue)

// HSV 值
const hue = ref(0)
const saturation = ref(100)
const value = ref(100)
const alpha = ref(100)

const triggerClass = computed(() => ({
  'is-disabled': props.disabled,
  'is-open': pickerVisible.value
}))

const displayColor = computed(() => {
  return props.modelValue || '#ffffff'
})

const huePosition = computed(() => {
  return (hue.value / 360) * 100
})

const alphaPosition = computed(() => {
  return alpha.value
})

const alphaGradient = computed(() => {
  const rgb = hsvToRgb(hue.value, saturation.value, value.value)
  return `linear-gradient(to right, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1))`
})

const cursorStyle = computed(() => ({
  left: `${saturation.value}%`,
  top: `${100 - value.value}%`
}))

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    hexInput.value = newVal
    updateHSVFromHex(newVal)
  }
})

const togglePicker = () => {
  if (props.disabled) return
  
  pickerVisible.value = !pickerVisible.value
  
  if (pickerVisible.value) {
    updatePickerPosition()
  }
}

const updatePickerPosition = () => {
  if (!triggerRef.value || !pickerRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const pickerHeight = 300 // 预估高度

  const spaceBelow = window.innerHeight - triggerRect.bottom
  const spaceAbove = triggerRect.top

  let top = triggerRect.bottom + window.scrollY + 4

  if (spaceBelow < pickerHeight && spaceAbove > spaceBelow) {
    top = triggerRect.top + window.scrollY - pickerHeight - 4
  }

  pickerStyle.value = {
    position: 'absolute',
    top: `${top}px`,
    left: `${triggerRect.left + window.scrollX}px`,
    zIndex: '1000'
  }
}

const selectColor = (color: string) => {
  hexInput.value = color
  emit('update:modelValue', color)
  emit('change', color)
  updateHSVFromHex(color)
}

const clearColor = () => {
  hexInput.value = ''
  emit('update:modelValue', '')
  emit('change', '')
}

const handleHexInput = () => {
  const hex = hexInput.value
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    emit('update:modelValue', hex)
    emit('change', hex)
    updateHSVFromHex(hex)
  }
}

// 色板拖动
const handleSaturationMouseDown = (e: MouseEvent) => {
  if (props.disabled) return
  
  const updateSaturation = (event: MouseEvent) => {
    if (!paletteRef.value) return
    
    const rect = paletteRef.value.getBoundingClientRect()
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width))
    const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height))
    
    saturation.value = (x / rect.width) * 100
    value.value = 100 - (y / rect.height) * 100
    
    updateColorFromHSV()
  }
  
  updateSaturation(e)
  
  const handleMouseMove = (event: MouseEvent) => {
    updateSaturation(event)
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 色相滑块
const handleHueMouseDown = (e: MouseEvent) => {
  if (props.disabled) return
  
  const updateHue = (event: MouseEvent) => {
    if (!hueRef.value) return
    
    const rect = hueRef.value.getBoundingClientRect()
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width))
    
    hue.value = (x / rect.width) * 360
    updateColorFromHSV()
  }
  
  updateHue(e)
  
  const handleMouseMove = (event: MouseEvent) => {
    updateHue(event)
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 透明度滑块
const handleAlphaMouseDown = (e: MouseEvent) => {
  if (props.disabled) return
  
  const updateAlpha = (event: MouseEvent) => {
    if (!alphaRef.value) return
    
    const rect = alphaRef.value.getBoundingClientRect()
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width))
    
    alpha.value = (x / rect.width) * 100
    updateColorFromHSV()
  }
  
  updateAlpha(e)
  
  const handleMouseMove = (event: MouseEvent) => {
    updateAlpha(event)
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// HSV 转 RGB
function hsvToRgb(h: number, s: number, v: number) {
  s = s / 100
  v = v / 100
  
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  
  let r = 0, g = 0, b = 0
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  } else {
    r = c; g = 0; b = x
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  }
}

// RGB 转 Hex
function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// Hex 转 HSV
function updateHSVFromHex(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return
  
  const r = parseInt(result[1], 16) / 255
  const g = parseInt(result[2], 16) / 255
  const b = parseInt(result[3], 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min
  
  let h = 0
  const s = max === 0 ? 0 : (diff / max) * 100
  const v = max * 100
  
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff + (g < b ? 6 : 0)) * 60
    } else if (max === g) {
      h = ((b - r) / diff + 2) * 60
    } else {
      h = ((r - g) / diff + 4) * 60
    }
  }
  
  hue.value = h
  saturation.value = s
  value.value = v
}

// 从 HSV 更新颜色
function updateColorFromHSV() {
  const rgb = hsvToRgb(hue.value, saturation.value, value.value)
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
  
  hexInput.value = hex
  emit('update:modelValue', hex)
  emit('change', hex)
}

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (
    pickerVisible.value &&
    triggerRef.value &&
    pickerRef.value &&
    !triggerRef.value.contains(event.target as Node) &&
    !pickerRef.value.contains(event.target as Node)
  ) {
    pickerVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  if (props.modelValue) {
    updateHSVFromHex(props.modelValue)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="less" scoped>
.ldesign-color-picker-field {
  display: inline-block;
}

.ldesign-color-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 11px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(.is-disabled) {
    border-color: #722ED1;
  }

  &.is-open {
    border-color: #722ED1;
    box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.1);
  }

  &.is-disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
}

.ldesign-color-preview {
  width: 20px;
  height: 20px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
}

.ldesign-color-value {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  min-width: 70px;
}

.ldesign-color-arrow {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.25);
  transition: transform 0.3s;

  .ldesign-color-trigger.is-open & {
    transform: rotate(180deg);
  }
}

.ldesign-color-picker-panel {
  width: 280px;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
}

.ldesign-color-presets {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.ldesign-color-preset {
  width: 24px;
  height: 24px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.1);
  }

  &.is-active {
    box-shadow: 0 0 0 2px #722ED1;
  }
}

.ldesign-color-palette {
  margin-bottom: 12px;
}

.ldesign-color-saturation {
  position: relative;
  width: 100%;
  height: 150px;
  background: linear-gradient(to right, #fff, hsl(v-bind(hue), 100%, 50%));
  border-radius: 4px;
  margin-bottom: 12px;
  cursor: crosshair;
}

.ldesign-color-saturation-white {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent, #000);
  border-radius: 4px;
}

.ldesign-color-saturation-black {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.ldesign-color-saturation-cursor {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.ldesign-color-hue {
  position: relative;
  width: 100%;
  height: 12px;
  background: linear-gradient(to right, 
    #f00 0%, #ff0 17%, #0f0 33%, 
    #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
  border-radius: 6px;
  margin-bottom: 12px;
  cursor: pointer;
}

.ldesign-color-hue-cursor {
  position: absolute;
  top: 50%;
  width: 4px;
  height: 16px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.ldesign-color-alpha {
  position: relative;
  width: 100%;
  height: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}

.ldesign-color-alpha-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(45deg, #ddd 25%, transparent 25%),
    linear-gradient(-45deg, #ddd 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ddd 75%),
    linear-gradient(-45deg, transparent 75%, #ddd 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
  border-radius: 6px;
}

.ldesign-color-alpha-slider {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 6px;
}

.ldesign-color-alpha-cursor {
  position: absolute;
  top: 50%;
  width: 4px;
  height: 16px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.ldesign-color-input {
  display: flex;
  gap: 8px;
}

.ldesign-color-hex-input {
  flex: 1;
  padding: 4px 11px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;

  &:focus {
    border-color: #722ED1;
  }
}

.ldesign-color-clear {
  padding: 4px 12px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    color: #722ED1;
    border-color: #722ED1;
  }
}
</style>





