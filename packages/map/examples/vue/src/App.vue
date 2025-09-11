<template>
  <div id="app">
    <!-- 头部 -->
    <header class="header">
      <h1>LDesign Map Vue 示例</h1>
      <p>展示LDesign地图插件在Vue 3中的完整功能</p>
    </header>

    <!-- 主体内容 -->
    <main class="main">
      <!-- 侧边栏控制面板 -->
      <aside class="sidebar">
        <!-- 地图状态 -->
        <div class="control-group">
          <h3>地图状态</h3>
          <div class="info-panel">
            <div class="info-item">
              <span>状态:</span>
              <span>{{ isInitialized ? '已加载' : isLoading ? '加载中' : '未加载' }}</span>
            </div>
            <div class="info-item">
              <span>中心点:</span>
              <span>{{ center[0].toFixed(4) }}, {{ center[1].toFixed(4) }}</span>
            </div>
            <div class="info-item">
              <span>缩放级别:</span>
              <span>{{ zoom.toFixed(1) }}</span>
            </div>
            <div class="info-item">
              <span>标记点数量:</span>
              <span>{{ markers.length }}</span>
            </div>
          </div>
        </div>

        <!-- 地图控制 -->
        <div class="control-group">
          <h3>地图控制</h3>
          <div class="control-item">
            <label>缩放级别</label>
            <input 
              type="range" 
              min="0" 
              max="20" 
              step="0.1"
              v-model.number="zoom"
              :disabled="!isInitialized"
            />
          </div>
          <div class="control-item">
            <button @click="flyToBeijing" :disabled="!isInitialized">
              飞行到北京
            </button>
          </div>
          <div class="control-item">
            <button @click="flyToShanghai" :disabled="!isInitialized">
              飞行到上海
            </button>
          </div>
        </div>

        <!-- 标记点管理 -->
        <div class="control-group">
          <h3>标记点管理</h3>
          <div class="control-item">
            <button @click="addRandomMarker" :disabled="!isInitialized">
              添加随机标记点
            </button>
          </div>
          <div class="control-item">
            <button @click="addBeijingMarker" :disabled="!isInitialized">
              添加北京标记点
            </button>
          </div>
          <div class="control-item">
            <button @click="clearAllMarkers" :disabled="!isInitialized || markers.length === 0">
              清除所有标记点
            </button>
          </div>
        </div>

        <!-- 功能演示 -->
        <div class="control-group">
          <h3>功能演示</h3>
          <div class="control-item">
            <button @click="showRouting" :disabled="!isInitialized">
              路径规划演示
            </button>
          </div>
          <div class="control-item">
            <button @click="showHeatmap" :disabled="!isInitialized">
              热力图演示
            </button>
          </div>
          <div class="control-item">
            <button @click="showGeofence" :disabled="!isInitialized">
              地理围栏演示
            </button>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="error" class="control-group">
          <h3>错误信息</h3>
          <div class="info-panel" style="background: #fee; color: #c33;">
            {{ error.message }}
          </div>
        </div>
      </aside>

      <!-- 地图容器 -->
      <div class="map-container">
        <LDesignMapComponent
          :options="mapOptions"
          :markers="currentMarkers"
          :show-default-controls="true"
          :show-map-info="true"
          height="100%"
          @load="handleMapLoad"
          @click="handleMapClick"
          @move="handleMapMove"
          @zoom="handleMapZoom"
          @error="handleMapError"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { LDesignMapComponent } from '@ldesign/map/vue'
import type { MarkerOptions } from '@ldesign/map'

// 地图配置
const mapOptions = reactive({
  center: [116.404, 39.915] as [number, number],
  zoom: 10,
  accessToken: 'pk.eyJ1IjoibGRlc2lnbiIsImEiOiJjbHpxeXl6ZXkwMGNzMmxzNjBxdGNxbzJxIn0.demo-token', // 请替换为真实的token
  style: 'streets',
  showNavigation: true,
  showScale: true,
  showFullscreen: true
})

// 地图状态
const isInitialized = ref(false)
const isLoading = ref(false)
const error = ref<Error | null>(null)
const center = ref<[number, number]>([116.404, 39.915])
const zoom = ref(10)
const markers = ref<MarkerOptions[]>([])

// 当前标记点（用于传递给组件）
const currentMarkers = computed(() => markers.value)

// 事件处理器
const handleMapLoad = () => {
  isInitialized.value = true
  isLoading.value = false
  console.log('地图加载完成')
}

const handleMapClick = (event: { lngLat: [number, number]; point: [number, number] }) => {
  console.log('地图点击:', event.lngLat)
  
  // 在点击位置添加标记点
  addMarkerAt(event.lngLat, `点击位置 (${event.lngLat[0].toFixed(4)}, ${event.lngLat[1].toFixed(4)})`)
}

const handleMapMove = () => {
  // 地图移动时更新状态（这里可以从地图实例获取最新状态）
}

const handleMapZoom = () => {
  // 地图缩放时更新状态
}

const handleMapError = (err: Error) => {
  error.value = err
  isLoading.value = false
  console.error('地图错误:', err)
}

// 控制方法
const flyToBeijing = () => {
  center.value = [116.404, 39.915]
  zoom.value = 12
}

const flyToShanghai = () => {
  center.value = [121.473, 31.230]
  zoom.value = 12
}

const addRandomMarker = () => {
  const randomLng = 116.404 + (Math.random() - 0.5) * 0.2
  const randomLat = 39.915 + (Math.random() - 0.5) * 0.2
  addMarkerAt([randomLng, randomLat], `随机标记点 ${markers.value.length + 1}`)
}

const addBeijingMarker = () => {
  addMarkerAt([116.404, 39.915], '北京市中心', '这里是北京市中心，中国的首都。')
}

const addMarkerAt = (lngLat: [number, number], title: string, description?: string) => {
  const marker: MarkerOptions = {
    id: `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    lngLat,
    popup: {
      content: description ? `<h4>${title}</h4><p>${description}</p>` : title
    }
  }
  markers.value.push(marker)
}

const clearAllMarkers = () => {
  markers.value = []
}

// 功能演示方法
const showRouting = () => {
  console.log('路径规划演示 - 功能开发中')
  // TODO: 实现路径规划演示
}

const showHeatmap = () => {
  console.log('热力图演示 - 功能开发中')
  // TODO: 实现热力图演示
}

const showGeofence = () => {
  console.log('地理围栏演示 - 功能开发中')
  // TODO: 实现地理围栏演示
}
</script>

<style scoped>
/* 组件特定样式 */
</style>
