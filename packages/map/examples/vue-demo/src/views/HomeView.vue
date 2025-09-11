<script setup lang="ts">
import { ref, reactive } from 'vue'
import { LDesignMapComponent } from '@ldesign/map/vue'
import type { LDesignMap } from '@ldesign/map'
import '@ldesign/map/style.css'

// 地图配置 - 使用Leaflet + OpenStreetMap，无需API密钥
const mapOptions = reactive({
  center: [116.404, 39.915] as [number, number], // 北京
  zoom: 10,
  style: 'streets' as string,
  engine: 'leaflet' as string // 使用Leaflet引擎
})

// 当前选中的样式
const currentStyle = ref('streets')
const currentMapType = ref('2d')

// 地图样式选项
const mapStyles = [
  { value: 'streets', label: '街道地图', description: '标准的街道地图，显示道路、建筑物和地名' },
  { value: 'satellite', label: '卫星地图', description: '高清卫星影像，真实展现地表情况' },
  { value: 'hybrid', label: '混合地图', description: '卫星影像与道路标注的结合' },
  { value: 'terrain', label: '地形地图', description: '显示地形起伏和海拔信息' },
  { value: 'dark', label: '暗色主题', description: '深色背景的地图样式，适合夜间使用' },
  { value: 'light', label: '亮色主题', description: '浅色背景的地图样式，简洁明亮' }
]

// 地图类型选项
const mapTypes = [
  { value: '2d', label: '2D平面地图', description: '传统的平面地图视图' },
  { value: '3d', label: '3D立体地图', description: '支持倾斜和旋转的3D地图' },
  { value: 'administrative', label: '行政区划地图', description: '突出显示行政边界' },
  { value: 'custom', label: '自定义区块地图', description: '自定义样式的地图' }
]

// 功能模块状态
const features = reactive({
  heatmap: false,
  buildings3d: false,
  particles: false,
  geofence: false,
  routing: false,
  search: false,
  measurement: false
})

// 地图实例引用
const mapRef = ref()

// 切换地图样式
const changeStyle = (style: string) => {
  currentStyle.value = style
  mapOptions.style = style
  if (mapRef.value?.map) {
    mapRef.value.map.setStyle(style)
  }
}

// 切换地图类型
const changeMapType = (type: string) => {
  currentMapType.value = type
  // 这里可以根据类型调整地图配置
  if (mapRef.value?.map) {
    switch (type) {
      case '3d':
        mapRef.value.map.setPitch(45)
        mapRef.value.map.setBearing(20)
        break
      case '2d':
        mapRef.value.map.setPitch(0)
        mapRef.value.map.setBearing(0)
        break
    }
  }
}

// 地图加载完成
const onMapReady = (map: LDesignMap) => {
  console.log('地图加载完成:', map)

  // 添加一些示例标记点
  map.addMarker({
    lngLat: [116.404, 39.915],
    popup: {
      content: '<h3>天安门广场</h3><p>中华人民共和国的象征</p>'
    }
  })

  map.addMarker({
    lngLat: [116.407, 39.918],
    popup: {
      content: '<h3>故宫博物院</h3><p>明清两朝的皇家宫殿</p>'
    }
  })
}

// 切换功能模块
const toggleFeature = async (feature: string) => {
  if (!mapRef.value?.map) return

  const map = mapRef.value.map
  features[feature as keyof typeof features] = !features[feature as keyof typeof features]

  try {
    switch (feature) {
      case 'heatmap':
        if (features.heatmap) {
          // 添加热力图数据
          await map.heatmap.addHeatmap({
            data: [
              { lng: 116.404, lat: 39.915, weight: 1 },
              { lng: 116.405, lat: 39.916, weight: 2 },
              { lng: 116.406, lat: 39.917, weight: 3 },
              { lng: 116.407, lat: 39.918, weight: 2 },
              { lng: 116.408, lat: 39.919, weight: 1 }
            ],
            style: {
              intensity: 1,
              radius: 20
            }
          })
        } else {
          map.heatmap.clearHeatmaps()
        }
        break

      case 'buildings3d':
        if (features.buildings3d) {
          await map.threeD.enableBuildings()
        } else {
          map.threeD.disableBuildings()
        }
        break

      case 'particles':
        if (features.particles) {
          // 添加粒子效果（雪花）
          map.effects.addParticleEffect({
            type: 'snow',
            count: 100,
            size: 2,
            speed: 1
          })
        } else {
          map.effects.clearParticleEffects()
        }
        break

      case 'geofence':
        if (features.geofence) {
          // 添加地理围栏
          map.geofence.addGeofence({
            name: '重要区域',
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [116.400, 39.910],
                [116.410, 39.910],
                [116.410, 39.920],
                [116.400, 39.920],
                [116.400, 39.910]
              ]]
            }
          })
        } else {
          map.geofence.clearGeofences()
        }
        break

      case 'routing':
        if (features.routing) {
          // 添加路径规划
          await map.routing.addRoute({
            waypoints: [
              [116.404, 39.915],
              [116.407, 39.918]
            ],
            profile: 'driving'
          })
        } else {
          map.routing.clearRoutes()
        }
        break

      case 'measurement':
        if (features.measurement) {
          map.measurement.startMeasurement('distance')
        } else {
          map.measurement.stopMeasurement()
        }
        break
    }
  } catch (error) {
    console.error(`切换功能 ${feature} 时出错:`, error)
    // 回滚状态
    features[feature as keyof typeof features] = !features[feature as keyof typeof features]
  }
}
</script>

<template>
  <div class="map-demo">
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="panel-section">
        <h3>地图样式</h3>
        <div class="style-grid">
          <button
            v-for="style in mapStyles"
            :key="style.value"
            :class="['style-btn', { active: currentStyle === style.value }]"
            @click="changeStyle(style.value)"
            :title="style.description"
          >
            {{ style.label }}
          </button>
        </div>
      </div>

      <div class="panel-section">
        <h3>地图类型</h3>
        <div class="type-grid">
          <button
            v-for="type in mapTypes"
            :key="type.value"
            :class="['type-btn', { active: currentMapType === type.value }]"
            @click="changeMapType(type.value)"
            :title="type.description"
          >
            {{ type.label }}
          </button>
        </div>
      </div>

      <div class="panel-section">
        <h3>功能模块</h3>
        <div class="feature-list">
          <label v-for="(enabled, feature) in features" :key="feature" class="feature-item">
            <input
              type="checkbox"
              :checked="enabled"
              @change="toggleFeature(feature)"
            />
            <span class="feature-name">{{ feature }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="map-container">
      <LDesignMapComponent
        ref="mapRef"
        :options="mapOptions"
        :show-default-controls="true"
        :show-map-info="true"
        @map-ready="onMapReady"
        @error="(error: Error) => console.error('地图错误:', error)"
      >
        <template #loading>
          <div class="custom-loading">
            <div class="loading-spinner"></div>
            <p>正在加载地图...</p>
          </div>
        </template>

        <template #error="{ error }">
          <div class="custom-error">
            <h3>地图加载失败</h3>
            <p>{{ error.message }}</p>
            <p class="error-tip">请检查网络连接或Mapbox访问令牌</p>
          </div>
        </template>
      </LDesignMapComponent>
    </div>
  </div>
</template>

<style lang="less" scoped>
.map-demo {
  display: flex;
  height: 100vh;
  background-color: var(--ldesign-bg-color-page, #f5f5f5);
}

.control-panel {
  width: 320px;
  background-color: var(--ldesign-bg-color-container, #ffffff);
  border-right: 1px solid var(--ldesign-border-color, #e5e5e5);
  padding: var(--ls-padding-base, 20px);
  overflow-y: auto;
  box-shadow: var(--ldesign-shadow-1, 0 1px 10px rgba(0, 0, 0, 0.05));
}

.panel-section {
  margin-bottom: var(--ls-margin-lg, 28px);

  h3 {
    color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9));
    font-size: var(--ls-font-size-lg, 20px);
    font-weight: 600;
    margin-bottom: var(--ls-margin-sm, 12px);
    border-bottom: 2px solid var(--ldesign-brand-color, #722ED1);
    padding-bottom: var(--ls-padding-xs, 6px);
  }
}

.style-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ls-spacing-sm, 12px);
}

.style-btn {
  padding: var(--ls-padding-sm, 12px);
  border: 1px solid var(--ldesign-border-color, #e5e5e5);
  border-radius: var(--ls-border-radius-base, 6px);
  background-color: var(--ldesign-bg-color-component, #ffffff);
  color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9));
  font-size: var(--ls-font-size-sm, 16px);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--ldesign-bg-color-component-hover, #f8f8f8);
    border-color: var(--ldesign-border-color-hover, #d9d9d9);
  }

  &.active {
    background-color: var(--ldesign-brand-color, #722ED1);
    border-color: var(--ldesign-brand-color, #722ED1);
    color: white;
  }
}

.type-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--ls-spacing-xs, 6px);
}

.type-btn {
  padding: var(--ls-padding-sm, 12px);
  border: 1px solid var(--ldesign-border-color, #e5e5e5);
  border-radius: var(--ls-border-radius-base, 6px);
  background-color: var(--ldesign-bg-color-component, #ffffff);
  color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9));
  font-size: var(--ls-font-size-sm, 16px);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background-color: var(--ldesign-bg-color-component-hover, #f8f8f8);
    border-color: var(--ldesign-border-color-hover, #d9d9d9);
  }

  &.active {
    background-color: var(--ldesign-brand-color-1, #f1ecf9);
    border-color: var(--ldesign-brand-color, #722ED1);
    color: var(--ldesign-brand-color, #722ED1);
  }
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-sm, 12px);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm, 12px);
  padding: var(--ls-padding-sm, 12px);
  border: 1px solid var(--ldesign-border-color, #e5e5e5);
  border-radius: var(--ls-border-radius-base, 6px);
  background-color: var(--ldesign-bg-color-component, #ffffff);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--ldesign-bg-color-component-hover, #f8f8f8);
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: var(--ldesign-brand-color, #722ED1);
  }

  .feature-name {
    color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9));
    font-size: var(--ls-font-size-sm, 16px);
    text-transform: capitalize;
  }
}

.map-container {
  flex: 1;
  position: relative;
}

.custom-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ls-spacing-base, 20px);

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--ldesign-brand-color-3, #bfa4e5);
    border-top: 4px solid var(--ldesign-brand-color, #722ED1);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.7));
    font-size: var(--ls-font-size-base, 18px);
  }
}

.custom-error {
  text-align: center;
  padding: var(--ls-padding-xl, 36px);

  h3 {
    color: var(--ldesign-error-color, #e54848);
    font-size: var(--ls-font-size-xl, 24px);
    margin-bottom: var(--ls-margin-base, 20px);
  }

  p {
    color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.7));
    font-size: var(--ls-font-size-base, 18px);
    margin-bottom: var(--ls-margin-sm, 12px);
  }

  .error-tip {
    color: var(--ldesign-text-color-placeholder, rgba(0, 0, 0, 0.5));
    font-size: var(--ls-font-size-sm, 16px);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .map-demo {
    flex-direction: column;
  }

  .control-panel {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid var(--ldesign-border-color, #e5e5e5);
  }

  .style-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .feature-list {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .feature-item {
    flex: 0 0 calc(50% - 6px);
  }
}
</style>
