<template>
  <div class="app">
    <h1>Vue Panorama Viewer Demo - Enhanced</h1>
    
    <div class="controls-grid">
      <div class="control-section">
        <h3>Basic Controls</h3>
        <button @click="toggleAutoRotate">
          {{ autoRotate ? '⏸️ Stop' : '▶️ Start' }} Rotation
        </button>
        <button @click="reset">🔄 Reset View</button>
        <button @click="enableGyro">📱 Enable Gyroscope</button>
      </div>

      <div class="control-section">
        <h3>Advanced Features</h3>
        <button @click="toggleFullscreen">
          {{ isFullscreenMode ? '⬜ Exit' : '⛶ Enter' }} Fullscreen
        </button>
        <button @click="toggleMiniMapVisibility">
          {{ showMiniMap ? '🗺️ Hide' : '🗺️ Show' }} Mini Map
        </button>
        <button @click="takeScreenshot">📷 Screenshot</button>
      </div>

      <div class="control-section">
        <h3>Hotspots</h3>
        <button @click="addDemoHotspot">📍 Add Hotspot</button>
        <button @click="removeAllHotspots">🗑️ Remove All</button>
        <span class="info-text">{{ hotspots.length }} hotspots</span>
      </div>

      <div class="control-section">
        <h3>View Limits</h3>
        <button @click="setHorizontalLimit">↔️ Limit Horizontal</button>
        <button @click="setVerticalLimit">↕️ Limit Vertical</button>
        <button @click="clearLimits">🔓 Clear Limits</button>
      </div>

      <div class="control-section">
        <h3>Images</h3>
        <button @click="changeImage(0)">🏔️ Mountain</button>
        <button @click="changeImage(1)">🌃 Night</button>
      </div>
    </div>

    <div class="progress-container" v-if="loadingProgress < 100 && loadingProgress > 0">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
      </div>
      <span class="progress-text">Loading: {{ Math.round(loadingProgress) }}%</span>
    </div>

    <PanoramaViewer
      ref="viewer"
      :image="currentImage"
      :auto-rotate="autoRotate"
      :fov="75"
      :view-limits="viewLimits"
      :show-mini-map="showMiniMap"
      width="100%"
      height="600px"
      @ready="onReady"
      @error="onError"
      @progress="onProgress"
      @hotspot-click="onHotspotClick"
    />

    <div class="info-panel">
      <div class="info-row">
        <strong>Controls:</strong>
        <ul>
          <li><strong>Mouse:</strong> Click + drag to rotate, wheel to zoom</li>
          <li><strong>Keyboard:</strong> Arrow keys to rotate, +/- to zoom</li>
          <li><strong>Touch:</strong> Single finger to rotate, pinch to zoom</li>
          <li><strong>Mobile:</strong> Device orientation (with permission)</li>
        </ul>
      </div>
      
      <div class="info-row" v-if="lastHotspotClick">
        <strong>Last Hotspot Clicked:</strong> {{ lastHotspotClick.label }}
      </div>

      <div class="info-row">
        <strong>New Features:</strong>
        <ul>
          <li>✅ Keyboard controls with arrow keys</li>
          <li>✅ Mini-map with compass orientation</li>
          <li>✅ Interactive hotspots with custom markers</li>
          <li>✅ Full-screen mode support</li>
          <li>✅ Screenshot capture</li>
          <li>✅ View angle restrictions</li>
          <li>✅ Smooth image transitions</li>
          <li>✅ Loading progress indicator</li>
          <li>✅ Performance optimizations</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PanoramaViewer } from '@panorama-viewer/vue';
import type { Hotspot, ViewLimits } from '@panorama-viewer/core';

const viewer = ref();
const autoRotate = ref(false);
const showMiniMap = ref(true);
const isFullscreenMode = ref(false);
const viewLimits = ref<ViewLimits | null>(null);
const loadingProgress = ref(0);
const hotspots = ref<Hotspot[]>([]);
const lastHotspotClick = ref<Hotspot | null>(null);

const images = [
  'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg',
  'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg', // 同一张图片用于演示
];

const currentImage = ref(images[0]);
let hotspotCounter = 0;

const toggleAutoRotate = () => {
  autoRotate.value = !autoRotate.value;
};

const reset = () => {
  viewer.value?.reset();
};

const enableGyro = async () => {
  const success = await viewer.value?.enableGyroscope();
  if (success) {
    alert('✅ Gyroscope enabled!');
  } else {
    alert('❌ Gyroscope not available or permission denied');
  }
};

const toggleFullscreen = async () => {
  if (isFullscreenMode.value) {
    viewer.value?.exitFullscreen();
    isFullscreenMode.value = false;
  } else {
    await viewer.value?.enterFullscreen();
    isFullscreenMode.value = true;
  }
};

const toggleMiniMapVisibility = () => {
  showMiniMap.value = !showMiniMap.value;
};

const takeScreenshot = () => {
  const dataURL = viewer.value?.screenshot(1920, 1080);
  if (dataURL) {
    // Create download link
    const link = document.createElement('a');
    link.download = 'panorama-screenshot.png';
    link.href = dataURL;
    link.click();
    alert('📸 Screenshot captured and downloaded!');
  }
};

const addDemoHotspot = () => {
  const newHotspot: Hotspot = {
    id: `hotspot-${++hotspotCounter}`,
    position: {
      theta: Math.random() * Math.PI * 2,
      phi: Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.5,
    },
    label: `📍 #${hotspotCounter}`,
    data: { name: `Point of Interest ${hotspotCounter}` },
  };
  
  viewer.value?.addHotspot(newHotspot);
  hotspots.value = viewer.value?.getHotspots() || [];
};

const removeAllHotspots = () => {
  hotspots.value.forEach(h => viewer.value?.removeHotspot(h.id));
  hotspots.value = [];
  hotspotCounter = 0;
};

const setHorizontalLimit = () => {
  viewLimits.value = {
    minTheta: -Math.PI / 4,
    maxTheta: Math.PI / 4,
  };
  alert('↔️ Horizontal rotation limited to ±45°');
};

const setVerticalLimit = () => {
  viewLimits.value = {
    minPhi: Math.PI / 3,
    maxPhi: (2 * Math.PI) / 3,
  };
  alert('↕️ Vertical rotation limited');
};

const clearLimits = () => {
  viewLimits.value = null;
  alert('🔓 All rotation limits cleared');
};

const changeImage = (index: number) => {
  loadingProgress.value = 0;
  currentImage.value = images[index];
};

const onReady = () => {
  console.log('✅ Viewer ready!');
};

const onError = (error: Error) => {
  console.error('❌ Viewer error:', error);
  alert(`Error: ${error.message}`);
};

const onProgress = (progress: number) => {
  loadingProgress.value = progress;
  if (progress >= 100) {
    setTimeout(() => {
      loadingProgress.value = 0;
    }, 500);
  }
};

const onHotspotClick = (hotspot: Hotspot) => {
  lastHotspotClick.value = hotspot;
  alert(`🎯 Clicked: ${hotspot.label}\nData: ${JSON.stringify(hotspot.data)}`);
};
</script>

<style scoped>
.app {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 2rem;
}

h3 {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.control-section {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

button {
  width: 100%;
  padding: 10px 15px;
  margin-bottom: 8px;
  font-size: 13px;
  border: none;
  border-radius: 4px;
  background-color: #42b883;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

button:last-child {
  margin-bottom: 0;
}

button:hover {
  background-color: #35a372;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

button:active {
  transform: translateY(0);
}

.info-text {
  display: block;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  margin-top: 5px;
}

.progress-container {
  margin-bottom: 20px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b883, #35a372);
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

.info-panel {
  margin-top: 20px;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.info-row {
  margin-bottom: 15px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row strong {
  display: block;
  margin-bottom: 8px;
  color: #42b883;
}

.info-row ul {
  margin: 0;
  padding-left: 20px;
}

.info-row li {
  margin-bottom: 5px;
  line-height: 1.6;
}
</style>
