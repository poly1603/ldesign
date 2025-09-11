<!--
  LDesign地图Vue组件
  提供开箱即用的地图组件，支持插槽和事件
-->

<template>
  <div 
    ref="mapContainer" 
    class="ldesign-map-container"
    :class="{
      'ldesign-map-loading': isLoading,
      'ldesign-map-error': !!error
    }"
  >
    <!-- 加载状态 -->
    <div v-if="isLoading" class="ldesign-map-loading-overlay">
      <slot name="loading">
        <div class="ldesign-map-spinner"></div>
        <span class="ldesign-map-loading-text">地图加载中...</span>
      </slot>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="ldesign-map-error-overlay">
      <slot name="error" :error="error">
        <div class="ldesign-map-error-content">
          <h3>地图加载失败</h3>
          <p>{{ error.message }}</p>
          <button @click="retry" class="ldesign-map-retry-btn">重试</button>
        </div>
      </slot>
    </div>

    <!-- 地图控件插槽 -->
    <div v-if="isInitialized" class="ldesign-map-controls">
      <slot name="controls" :map="map" :mapInstance="mapInstance">
        <!-- 默认控件 -->
        <div v-if="showDefaultControls" class="ldesign-map-default-controls">
          <button @click="zoomIn" class="ldesign-map-control-btn">+</button>
          <button @click="zoomOut" class="ldesign-map-control-btn">-</button>
        </div>
      </slot>
    </div>

    <!-- 地图信息插槽 -->
    <div v-if="isInitialized && showMapInfo" class="ldesign-map-info">
      <slot name="info" :center="center" :zoom="zoom" :bearing="bearing" :pitch="pitch">
        <div class="ldesign-map-info-content">
          <span>缩放: {{ zoom.toFixed(1) }}</span>
          <span>中心: {{ center[0].toFixed(4) }}, {{ center[1].toFixed(4) }}</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useLDesignMap } from '../composables/useLDesignMap'
import type { VueMapOptions, VueMapEvents } from '../types'
import type { MarkerOptions } from '../../../types'

// 定义组件名称
defineOptions({
  name: 'LDesignMapComponent'
})

/**
 * 组件属性定义
 */
interface Props {
  /** 地图配置选项 */
  options: VueMapOptions
  /** 标记点列表 */
  markers?: MarkerOptions[]
  /** 是否显示默认控件 */
  showDefaultControls?: boolean
  /** 是否显示地图信息 */
  showMapInfo?: boolean
  /** 地图高度 */
  height?: string | number
  /** 地图宽度 */
  width?: string | number
}

/**
 * 组件事件定义
 */
interface Emits {
  /** 地图加载完成 */
  load: []
  /** 地图点击 */
  click: [event: { lngLat: [number, number]; point: [number, number] }]
  /** 地图移动 */
  move: []
  /** 地图缩放 */
  zoom: []
  /** 标记点点击 */
  markerClick: [marker: MarkerOptions]
  /** 错误事件 */
  error: [error: Error]
  /** 地图状态更新 */
  update: [state: { center: [number, number]; zoom: number; bearing: number; pitch: number }]
}

// 定义props和emits
const props = withDefaults(defineProps<Props>(), {
  markers: () => [],
  showDefaultControls: true,
  showMapInfo: false,
  height: '400px',
  width: '100%'
})

const emit = defineEmits<Emits>()

// 地图容器引用
const mapContainer = ref<HTMLElement>()

// 事件处理器
const events: VueMapEvents = {
  onLoad: () => emit('load'),
  onClick: (event) => emit('click', event),
  onMove: () => {
    emit('move')
    emit('update', {
      center: center.value,
      zoom: zoom.value,
      bearing: bearing.value,
      pitch: pitch.value
    })
  },
  onZoom: () => {
    emit('zoom')
    emit('update', {
      center: center.value,
      zoom: zoom.value,
      bearing: bearing.value,
      pitch: pitch.value
    })
  },
  onMarkerClick: (marker) => emit('markerClick', marker),
  onError: (error) => emit('error', error)
}

// 使用地图组合式API
const mapInstance = useLDesignMap(mapContainer, props.options, events)

const {
  map,
  isInitialized,
  isLoading,
  error,
  center,
  zoom,
  bearing,
  pitch,
  markers,
  addMarker,
  removeMarker,
  clearMarkers
} = mapInstance

// 计算样式
const containerStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  width: typeof props.width === 'number' ? `${props.width}px` : props.width
}))

// 控件方法
const zoomIn = () => {
  if (map.value) {
    map.value.setZoom(zoom.value + 1)
  }
}

const zoomOut = () => {
  if (map.value) {
    map.value.setZoom(zoom.value - 1)
  }
}

const retry = async () => {
  try {
    await mapInstance.initialize()
  } catch (err) {
    console.error('重试失败:', err)
  }
}

// 监听标记点变化
watch(() => props.markers, (newMarkers, oldMarkers) => {
  if (!isInitialized.value) return

  // 清除旧标记点
  clearMarkers()

  // 添加新标记点
  newMarkers.forEach(marker => {
    addMarker(marker)
  })
}, { deep: true, immediate: true })

// 暴露给父组件的方法和属性
defineExpose({
  map,
  mapInstance,
  isInitialized,
  isLoading,
  error,
  center,
  zoom,
  bearing,
  pitch,
  markers,
  addMarker,
  removeMarker,
  clearMarkers,
  zoomIn,
  zoomOut,
  retry
})
</script>

<style lang="less" scoped>
.ldesign-map-container {
  position: relative;
  width: v-bind('containerStyle.width');
  height: v-bind('containerStyle.height');
  background-color: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-base);
  overflow: hidden;
  box-shadow: var(--ldesign-shadow-1);

  &.ldesign-map-loading {
    pointer-events: none;
  }

  &.ldesign-map-error {
    border: 1px solid var(--ldesign-error-color);
  }
}

.ldesign-map-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .ldesign-map-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--ldesign-brand-color-3);
    border-top: 3px solid var(--ldesign-brand-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--ls-spacing-sm);
  }

  .ldesign-map-loading-text {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);
  }
}

.ldesign-map-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--ldesign-error-color-1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .ldesign-map-error-content {
    text-align: center;
    padding: var(--ls-padding-lg);

    h3 {
      color: var(--ldesign-error-color);
      margin: 0 0 var(--ls-spacing-sm) 0;
      font-size: var(--ls-font-size-lg);
    }

    p {
      color: var(--ldesign-text-color-secondary);
      margin: 0 0 var(--ls-spacing-base) 0;
      font-size: var(--ls-font-size-sm);
    }

    .ldesign-map-retry-btn {
      background-color: var(--ldesign-error-color);
      color: white;
      border: none;
      padding: var(--ls-padding-sm) var(--ls-padding-base);
      border-radius: var(--ls-border-radius-base);
      cursor: pointer;
      font-size: var(--ls-font-size-sm);
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--ldesign-error-color-hover);
      }
    }
  }
}

.ldesign-map-controls {
  position: absolute;
  top: var(--ls-spacing-base);
  right: var(--ls-spacing-base);
  z-index: 100;

  .ldesign-map-default-controls {
    display: flex;
    flex-direction: column;
    gap: var(--ls-spacing-xs);

    .ldesign-map-control-btn {
      width: 32px;
      height: 32px;
      background-color: var(--ldesign-bg-color-component);
      border: 1px solid var(--ldesign-border-color);
      border-radius: var(--ls-border-radius-base);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: var(--ls-font-size-lg);
      font-weight: bold;
      color: var(--ldesign-text-color-primary);
      transition: all 0.2s;
      box-shadow: var(--ldesign-shadow-1);

      &:hover {
        background-color: var(--ldesign-bg-color-component-hover);
        border-color: var(--ldesign-border-color-hover);
      }

      &:active {
        background-color: var(--ldesign-bg-color-component-active);
      }
    }
  }
}

.ldesign-map-info {
  position: absolute;
  bottom: var(--ls-spacing-base);
  left: var(--ls-spacing-base);
  z-index: 100;

  .ldesign-map-info-content {
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: var(--ls-padding-xs) var(--ls-padding-sm);
    border-radius: var(--ls-border-radius-base);
    font-size: var(--ls-font-size-xs);
    display: flex;
    gap: var(--ls-spacing-sm);

    span {
      white-space: nowrap;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
