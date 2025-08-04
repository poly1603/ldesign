<template>
  <div ref="containerRef" class="composite-watermark">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { createWatermark, destroyWatermark, type WatermarkInstance } from '../../mock/watermark'

// Props 定义
interface Props {
  username: string
  department?: string
  securityLevel?: 'low' | 'medium' | 'high'
  showTimestamp?: boolean
  showIp?: boolean
  enabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  department: '',
  securityLevel: 'medium',
  showTimestamp: true,
  showIp: false,
  enabled: true
})

// Emits 定义
const emit = defineEmits<{
  created: [instance: WatermarkInstance]
  destroyed: []
  error: [error: Error]
  securityViolation: [violation: { type: string; timestamp: number; details: any }]
}>()

// 模板引用
const containerRef = ref<HTMLElement>()

// 水印实例
const watermarkInstance = ref<WatermarkInstance | null>(null)

// 状态
const currentTime = ref(new Date())
const userIp = ref('192.168.1.100') // 模拟IP地址

// 定时器
let timeUpdateTimer: ReturnType<typeof setInterval> | null = null

// 安全级别配置
const securityConfigs = {
  low: {
    level: 'low' as const,
    mutationObserver: false,
    styleProtection: false,
    canvasProtection: false
  },
  medium: {
    level: 'medium' as const,
    mutationObserver: true,
    styleProtection: false,
    canvasProtection: false
  },
  high: {
    level: 'high' as const,
    mutationObserver: true,
    styleProtection: true,
    canvasProtection: true
  }
}

// 水印内容
const watermarkContent = computed(() => {
  const parts = []
  
  // 用户信息
  if (props.username) {
    parts.push(props.username)
  }
  
  // 部门信息
  if (props.department) {
    parts.push(props.department)
  }
  
  // 时间戳
  if (props.showTimestamp) {
    parts.push(currentTime.value.toLocaleString())
  }
  
  // IP地址
  if (props.showIp) {
    parts.push(userIp.value)
  }
  
  return parts
})

// 水印配置
const watermarkConfig = computed(() => {
  const securityConfig = securityConfigs[props.securityLevel]
  
  return {
    content: watermarkContent.value,
    style: {
      fontSize: 14,
      color: getSecurityColor(),
      opacity: 0.2,
      lineHeight: 1.5
    },
    layout: {
      gapX: 150,
      gapY: 120
    },
    security: {
      ...securityConfig,
      onViolation: (violation: any) => {
        emit('securityViolation', {
          type: violation.type,
          timestamp: Date.now(),
          details: violation
        })
      }
    }
  }
})

// 根据安全级别获取颜色
const getSecurityColor = () => {
  switch (props.securityLevel) {
    case 'low':
      return '#4CAF50'
    case 'medium':
      return '#FF9800'
    case 'high':
      return '#F44336'
    default:
      return '#666666'
  }
}

// 更新时间
const updateTime = () => {
  currentTime.value = new Date()
}

// 创建水印
const createWatermarkInstance = async () => {
  if (!containerRef.value || !props.enabled) return
  
  try {
    // 如果已存在实例，先销毁
    if (watermarkInstance.value) {
      await destroyWatermark(watermarkInstance.value)
    }
    
    watermarkInstance.value = await createWatermark(containerRef.value, watermarkConfig.value)
    emit('created', watermarkInstance.value)
    
  } catch (error) {
    console.error('Failed to create composite watermark:', error)
    emit('error', error as Error)
  }
}

// 销毁水印
const destroyWatermarkInstance = async () => {
  if (watermarkInstance.value) {
    try {
      await destroyWatermark(watermarkInstance.value)
      watermarkInstance.value = null
      emit('destroyed')
    } catch (error) {
      console.error('Failed to destroy composite watermark:', error)
      emit('error', error as Error)
    }
  }
}

// 刷新水印（用于更新时间戳）
const refreshWatermark = async () => {
  if (props.showTimestamp && watermarkInstance.value) {
    updateTime()
    await createWatermarkInstance()
  }
}

// 监听配置变化
watch(
  () => [
    props.username,
    props.department,
    props.securityLevel,
    props.showTimestamp,
    props.showIp,
    props.enabled
  ],
  () => {
    if (props.enabled) {
      createWatermarkInstance()
    } else {
      destroyWatermarkInstance()
    }
  }
)

// 监听时间变化（如果显示时间戳）
watch(
  () => props.showTimestamp,
  (showTimestamp) => {
    if (showTimestamp) {
      // 启动定时器，每分钟更新一次
      timeUpdateTimer = setInterval(() => {
        refreshWatermark()
      }, 60000) // 60秒
    } else {
      // 清除定时器
      if (timeUpdateTimer) {
        clearInterval(timeUpdateTimer)
        timeUpdateTimer = null
      }
    }
  },
  { immediate: true }
)

// 生命周期
onMounted(() => {
  // 初始化时间
  updateTime()
  
  // 创建水印
  if (props.enabled) {
    createWatermarkInstance()
  }
})

onUnmounted(() => {
  // 清除定时器
  if (timeUpdateTimer) {
    clearInterval(timeUpdateTimer)
  }
  
  // 销毁水印
  destroyWatermarkInstance()
})

// 暴露方法给父组件
defineExpose({
  createWatermark: createWatermarkInstance,
  destroyWatermark: destroyWatermarkInstance,
  refreshWatermark,
  getInstance: () => watermarkInstance.value,
  getConfig: () => watermarkConfig.value,
  getCurrentTime: () => currentTime.value,
  getUserInfo: () => ({
    username: props.username,
    department: props.department,
    ip: userIp.value
  })
})
</script>

<style lang="less" scoped>
.composite-watermark {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
