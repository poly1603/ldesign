# Vue 集成指南

本指南将详细介绍如何在 Vue 3 项目中集成和使用 @ldesign/map。

## 安装

```bash
# 安装核心包
npm install @ldesign/map

# 如果使用 TypeScript，确保安装类型定义
npm install @types/openlayers
```

## 基础集成

### 1. 创建地图组件

创建一个可复用的地图组件：

```vue
<!-- MapComponent.vue -->
<template>
  <div 
    ref="mapContainer" 
    class="map-container"
    :style="{ width: width, height: height }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { LDesignMap, LayerType, type MapConfig } from '@ldesign/map';

// Props 定义
interface Props {
  center?: [number, number];
  zoom?: number;
  theme?: string;
  width?: string;
  height?: string;
  config?: Partial<MapConfig>;
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [116.404, 39.915],
  zoom: 10,
  theme: 'default',
  width: '100%',
  height: '400px'
});

// Emits 定义
const emit = defineEmits<{
  mapReady: [map: LDesignMap];
  mapClick: [event: any];
  mapMoveEnd: [event: any];
}>();

// 响应式数据
const mapContainer = ref<HTMLElement>();
const map = ref<LDesignMap | null>(null);

// 初始化地图
const initMap = () => {
  if (!mapContainer.value) return;

  try {
    map.value = new LDesignMap({
      container: mapContainer.value,
      center: props.center,
      zoom: props.zoom,
      theme: props.theme,
      ...props.config
    });

    // 添加基础图层
    map.value.getLayerManager().addOSMLayer({
      id: 'osm-base',
      name: 'OpenStreetMap'
    });

    // 绑定事件
    map.value.on('click', (event) => {
      emit('mapClick', event);
    });

    map.value.on('moveend', (event) => {
      emit('mapMoveEnd', event);
    });

    // 触发地图就绪事件
    emit('mapReady', map.value);
  } catch (error) {
    console.error('地图初始化失败:', error);
  }
};

// 销毁地图
const destroyMap = () => {
  if (map.value) {
    map.value.destroy();
    map.value = null;
  }
};

// 监听 props 变化
watch(() => props.center, (newCenter) => {
  if (map.value) {
    map.value.setCenter(newCenter);
  }
});

watch(() => props.zoom, (newZoom) => {
  if (map.value) {
    map.value.setZoom(newZoom);
  }
});

watch(() => props.theme, (newTheme) => {
  if (map.value) {
    map.value.setTheme(newTheme);
  }
});

// 生命周期
onMounted(() => {
  initMap();
});

onUnmounted(() => {
  destroyMap();
});

// 暴露方法给父组件
defineExpose({
  getMap: () => map.value,
  setCenter: (center: [number, number]) => map.value?.setCenter(center),
  setZoom: (zoom: number) => map.value?.setZoom(zoom),
  setTheme: (theme: string) => map.value?.setTheme(theme)
});
</script>

<style scoped>
.map-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
```

### 2. 使用地图组件

在父组件中使用地图组件：

```vue
<!-- App.vue -->
<template>
  <div class="app">
    <h1>LDesign Map Vue 示例</h1>
    
    <!-- 控制面板 -->
    <div class="controls">
      <button @click="changeCenter">切换到上海</button>
      <button @click="changeZoom">放大</button>
      <button @click="toggleTheme">切换主题</button>
      <button @click="addMarker">添加标记</button>
    </div>

    <!-- 地图组件 -->
    <MapComponent
      ref="mapRef"
      :center="mapCenter"
      :zoom="mapZoom"
      :theme="mapTheme"
      width="100%"
      height="500px"
      @map-ready="onMapReady"
      @map-click="onMapClick"
      @map-move-end="onMapMoveEnd"
    />

    <!-- 信息显示 -->
    <div class="info">
      <p>地图中心: {{ mapCenter.join(', ') }}</p>
      <p>缩放级别: {{ mapZoom }}</p>
      <p>当前主题: {{ mapTheme }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MapComponent from './components/MapComponent.vue';
import type { LDesignMap } from '@ldesign/map';

// 响应式数据
const mapRef = ref<InstanceType<typeof MapComponent>>();
const mapCenter = ref<[number, number]>([116.404, 39.915]);
const mapZoom = ref(10);
const mapTheme = ref('default');
const mapInstance = ref<LDesignMap | null>(null);

// 事件处理
const onMapReady = (map: LDesignMap) => {
  mapInstance.value = map;
  console.log('地图初始化完成');
};

const onMapClick = (event: any) => {
  console.log('地图点击:', event.coordinate);
};

const onMapMoveEnd = (event: any) => {
  mapCenter.value = event.center;
  mapZoom.value = event.zoom;
};

// 控制方法
const changeCenter = () => {
  mapCenter.value = [121.473, 31.230]; // 上海坐标
};

const changeZoom = () => {
  mapZoom.value = Math.min(mapZoom.value + 2, 18);
};

const toggleTheme = () => {
  mapTheme.value = mapTheme.value === 'default' ? 'dark' : 'default';
};

const addMarker = () => {
  if (!mapInstance.value) return;

  const randomId = `marker-${Date.now()}`;
  const randomCoord: [number, number] = [
    mapCenter.value[0] + (Math.random() - 0.5) * 0.01,
    mapCenter.value[1] + (Math.random() - 0.5) * 0.01
  ];

  mapInstance.value.getMarkerManager().addMarker({
    id: randomId,
    coordinate: randomCoord,
    title: `随机标记 ${randomId}`,
    popup: {
      content: `<p>这是一个随机生成的标记点</p><p>坐标: ${randomCoord.join(', ')}</p>`
    }
  });
};
</script>

<style scoped>
.app {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.controls {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.controls button:hover {
  border-color: #722ed1;
  color: #722ed1;
}

.info {
  margin-top: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}

.info p {
  margin: 4px 0;
  font-family: monospace;
}
</style>
```

## 高级功能

### 1. 标记管理组件

创建一个专门管理标记的组件：

```vue
<!-- MarkerManager.vue -->
<template>
  <div class="marker-manager">
    <h3>标记管理</h3>
    
    <div class="controls">
      <input 
        v-model="newMarkerTitle" 
        placeholder="标记标题"
        @keyup.enter="addMarkerAtCenter"
      />
      <button @click="addMarkerAtCenter">添加标记</button>
      <button @click="clearAllMarkers">清空标记</button>
    </div>

    <div class="marker-list">
      <div 
        v-for="marker in markers" 
        :key="marker.id"
        class="marker-item"
      >
        <span>{{ marker.title }}</span>
        <div class="marker-actions">
          <button @click="flyToMarker(marker)">定位</button>
          <button @click="removeMarker(marker.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { LDesignMap } from '@ldesign/map';

interface Props {
  map: LDesignMap | null;
}

const props = defineProps<Props>();

// 响应式数据
const newMarkerTitle = ref('');
const markerCounter = ref(0);

// 计算属性
const markers = computed(() => {
  if (!props.map) return [];
  return props.map.getMarkerManager().getMarkers();
});

// 方法
const addMarkerAtCenter = () => {
  if (!props.map || !newMarkerTitle.value.trim()) return;

  const center = props.map.getCenter();
  const markerId = `marker-${++markerCounter.value}`;

  props.map.getMarkerManager().addMarker({
    id: markerId,
    coordinate: center,
    title: newMarkerTitle.value,
    popup: {
      content: `
        <div>
          <h4>${newMarkerTitle.value}</h4>
          <p>坐标: ${center.join(', ')}</p>
          <p>创建时间: ${new Date().toLocaleString()}</p>
        </div>
      `
    }
  });

  newMarkerTitle.value = '';
};

const removeMarker = (markerId: string) => {
  if (!props.map) return;
  props.map.getMarkerManager().removeMarker(markerId);
};

const clearAllMarkers = () => {
  if (!props.map) return;
  props.map.getMarkerManager().clearMarkers();
};

const flyToMarker = (marker: any) => {
  if (!props.map) return;
  props.map.setCenter(marker.coordinate);
  props.map.setZoom(15);
};
</script>

<style scoped>
.marker-manager {
  padding: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
}

.controls {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.controls input {
  flex: 1;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.controls button {
  padding: 8px 12px;
  border: 1px solid #722ed1;
  border-radius: 4px;
  background: #722ed1;
  color: white;
  cursor: pointer;
}

.marker-list {
  max-height: 200px;
  overflow-y: auto;
}

.marker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.marker-actions {
  display: flex;
  gap: 4px;
}

.marker-actions button {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  background: #fff;
  font-size: 12px;
  cursor: pointer;
}
</style>
```

### 2. 图层控制组件

```vue
<!-- LayerControl.vue -->
<template>
  <div class="layer-control">
    <h3>图层控制</h3>
    
    <div class="layer-list">
      <div 
        v-for="layer in layers" 
        :key="layer.id"
        class="layer-item"
      >
        <label class="layer-checkbox">
          <input 
            type="checkbox" 
            :checked="layer.visible"
            @change="toggleLayerVisible(layer.id, $event)"
          />
          <span>{{ layer.name }}</span>
        </label>
        
        <div class="layer-controls">
          <label>
            透明度:
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1"
              :value="layer.opacity || 1"
              @input="setLayerOpacity(layer.id, $event)"
            />
          </label>
        </div>
      </div>
    </div>

    <div class="add-layer">
      <select v-model="newLayerType">
        <option value="osm">OSM</option>
        <option value="xyz">XYZ</option>
        <option value="wms">WMS</option>
      </select>
      <input 
        v-model="newLayerName" 
        placeholder="图层名称"
      />
      <input 
        v-if="newLayerType !== 'osm'"
        v-model="newLayerUrl" 
        placeholder="图层URL"
      />
      <button @click="addLayer">添加图层</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { LDesignMap } from '@ldesign/map';

interface Props {
  map: LDesignMap | null;
}

const props = defineProps<Props>();

// 响应式数据
const newLayerType = ref('osm');
const newLayerName = ref('');
const newLayerUrl = ref('');
const layerCounter = ref(0);

// 计算属性
const layers = computed(() => {
  if (!props.map) return [];
  return props.map.getLayerManager().getLayers();
});

// 方法
const toggleLayerVisible = (layerId: string, event: Event) => {
  if (!props.map) return;
  const target = event.target as HTMLInputElement;
  props.map.getLayerManager().setLayerVisible(layerId, target.checked);
};

const setLayerOpacity = (layerId: string, event: Event) => {
  if (!props.map) return;
  const target = event.target as HTMLInputElement;
  props.map.getLayerManager().setLayerOpacity(layerId, parseFloat(target.value));
};

const addLayer = async () => {
  if (!props.map || !newLayerName.value.trim()) return;

  const layerId = `layer-${++layerCounter.value}`;
  const layerManager = props.map.getLayerManager();

  try {
    switch (newLayerType.value) {
      case 'osm':
        await layerManager.addOSMLayer({
          id: layerId,
          name: newLayerName.value
        });
        break;
      case 'xyz':
        if (!newLayerUrl.value.trim()) return;
        await layerManager.addXYZLayer({
          id: layerId,
          name: newLayerName.value,
          url: newLayerUrl.value
        });
        break;
      case 'wms':
        if (!newLayerUrl.value.trim()) return;
        await layerManager.addWMSLayer({
          id: layerId,
          name: newLayerName.value,
          url: newLayerUrl.value,
          layers: 'default'
        });
        break;
    }

    // 重置表单
    newLayerName.value = '';
    newLayerUrl.value = '';
  } catch (error) {
    console.error('添加图层失败:', error);
  }
};
</script>

<style scoped>
.layer-control {
  padding: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
}

.layer-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.layer-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.layer-controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.add-layer {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-layer select,
.add-layer input,
.add-layer button {
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.add-layer button {
  background: #722ed1;
  color: white;
  cursor: pointer;
}
</style>
```

## Composition API 封装

### 创建地图 Hook

```typescript
// composables/useMap.ts
import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { LDesignMap, type MapConfig } from '@ldesign/map';

export function useMap(
  container: Ref<HTMLElement | undefined>,
  config: Partial<MapConfig> = {}
) {
  const map = ref<LDesignMap | null>(null);
  const isReady = ref(false);
  const error = ref<string | null>(null);

  const initMap = () => {
    if (!container.value) {
      error.value = '地图容器不存在';
      return;
    }

    try {
      map.value = new LDesignMap({
        container: container.value,
        center: [116.404, 39.915],
        zoom: 10,
        theme: 'default',
        ...config
      });

      // 添加基础图层
      map.value.getLayerManager().addOSMLayer({
        id: 'osm-base',
        name: 'OpenStreetMap'
      });

      isReady.value = true;
      error.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '地图初始化失败';
      console.error('地图初始化失败:', err);
    }
  };

  const destroyMap = () => {
    if (map.value) {
      map.value.destroy();
      map.value = null;
      isReady.value = false;
    }
  };

  onMounted(() => {
    initMap();
  });

  onUnmounted(() => {
    destroyMap();
  });

  return {
    map: readonly(map),
    isReady: readonly(isReady),
    error: readonly(error),
    initMap,
    destroyMap
  };
}
```

### 使用地图 Hook

```vue
<template>
  <div>
    <div ref="mapContainer" style="width: 100%; height: 400px;"></div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="isReady" class="ready">地图加载完成</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMap } from '@/composables/useMap';

const mapContainer = ref<HTMLElement>();

const { map, isReady, error } = useMap(mapContainer, {
  center: [121.473, 31.230], // 上海
  zoom: 12,
  theme: 'dark'
});

// 使用地图实例
watch(isReady, (ready) => {
  if (ready && map.value) {
    // 地图准备就绪，可以进行操作
    map.value.getMarkerManager().addMarker({
      id: 'shanghai-marker',
      coordinate: [121.473, 31.230],
      title: '上海'
    });
  }
});
</script>
```

## 最佳实践

### 1. 性能优化

```vue
<script setup lang="ts">
import { ref, shallowRef, nextTick } from 'vue';

// 使用 shallowRef 避免深度响应式
const map = shallowRef<LDesignMap | null>(null);

// 延迟初始化
const initMap = async () => {
  await nextTick();
  // 初始化地图...
};

// 防抖处理
import { debounce } from 'lodash-es';

const debouncedUpdateMarkers = debounce((markers) => {
  // 更新标记...
}, 300);
</script>
```

### 2. 错误边界

```vue
<template>
  <div class="map-wrapper">
    <div v-if="error" class="error-message">
      <h3>地图加载失败</h3>
      <p>{{ error }}</p>
      <button @click="retry">重试</button>
    </div>
    <div v-else ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup lang="ts">
const error = ref<string | null>(null);
const retryCount = ref(0);

const initMap = () => {
  try {
    // 地图初始化逻辑...
  } catch (err) {
    error.value = err instanceof Error ? err.message : '未知错误';
  }
};

const retry = () => {
  if (retryCount.value < 3) {
    error.value = null;
    retryCount.value++;
    initMap();
  }
};
</script>
```

### 3. TypeScript 支持

```typescript
// types/map.ts
import type { LDesignMap } from '@ldesign/map';

export interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  theme?: string;
  width?: string;
  height?: string;
}

export interface MapComponentEmits {
  mapReady: [map: LDesignMap];
  mapClick: [event: any];
  mapMoveEnd: [event: any];
}

export interface MapComponentExpose {
  getMap: () => LDesignMap | null;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setTheme: (theme: string) => void;
}
```

## 总结

通过以上示例，您可以：

1. 在 Vue 3 项目中集成 LDesign Map
2. 创建可复用的地图组件
3. 实现标记和图层管理
4. 使用 Composition API 封装地图逻辑
5. 应用性能优化和错误处理最佳实践

更多高级功能和示例，请查看 [完整示例项目](../../examples/vue/README.md)。
