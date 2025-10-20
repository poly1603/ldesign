<template>
  <div ref="containerRef" class="panorama-viewer" :style="containerStyle"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { PanoramaViewer as CoreViewer } from '@panorama-viewer/core';
import type { ViewerOptions, Hotspot, ViewLimits, CubemapImages } from '@panorama-viewer/core';

export interface PanoramaViewerProps {
  image: string | CubemapImages;
  format?: 'equirectangular' | 'cubemap';
  fov?: number;
  minFov?: number;
  maxFov?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  gyroscope?: boolean;
  width?: string;
  height?: string;
  viewLimits?: ViewLimits | null;
  keyboardControls?: boolean;
  renderOnDemand?: boolean;
  showMiniMap?: boolean;
}

const props = withDefaults(defineProps<PanoramaViewerProps>(), {
  format: 'equirectangular',
  fov: 75,
  minFov: 30,
  maxFov: 100,
  autoRotate: false,
  autoRotateSpeed: 0.5,
  gyroscope: true,
  width: '100%',
  height: '500px',
  viewLimits: null,
  keyboardControls: true,
  renderOnDemand: true,
  showMiniMap: true,
});

const emit = defineEmits<{
  ready: [];
  error: [error: Error];
  progress: [progress: number];
  hotspotClick: [hotspot: Hotspot];
}>();

const containerRef = ref<HTMLElement>();
const viewerInstance = ref<CoreViewer | null>(null);

const containerStyle = computed(() => ({
  width: props.width,
  height: props.height,
}));

onMounted(() => {
  if (!containerRef.value) return;

  try {
    const options: ViewerOptions = {
      container: containerRef.value,
      image: props.image,
      format: props.format,
      fov: props.fov,
      minFov: props.minFov,
      maxFov: props.maxFov,
      autoRotate: props.autoRotate,
      autoRotateSpeed: props.autoRotateSpeed,
      gyroscope: props.gyroscope,
      viewLimits: props.viewLimits,
      keyboardControls: props.keyboardControls,
      renderOnDemand: props.renderOnDemand,
      onProgress: (progress: number) => emit('progress', progress),
    };

    viewerInstance.value = new CoreViewer(options);

    // Setup hotspot click listener
    containerRef.value.addEventListener('hotspotclick', ((e: CustomEvent) => {
      emit('hotspotClick', e.detail.hotspot);
    }) as EventListener);

    // Set initial minimap visibility
    if (!props.showMiniMap && viewerInstance.value) {
      viewerInstance.value.hideMiniMap();
    }

    emit('ready');
  } catch (error) {
    emit('error', error as Error);
  }
});

onUnmounted(() => {
  if (viewerInstance.value) {
    viewerInstance.value.dispose();
    viewerInstance.value = null;
  }
});

// Watch for image changes
watch(
  () => props.image,
  async (newImage) => {
    if (viewerInstance.value) {
      try {
        await viewerInstance.value.loadImage(newImage, true);
      } catch (error) {
        emit('error', error as Error);
      }
    }
  }
);

// Watch for autoRotate changes
watch(
  () => props.autoRotate,
  (newValue) => {
    if (viewerInstance.value) {
      if (newValue) {
        viewerInstance.value.enableAutoRotate();
      } else {
        viewerInstance.value.disableAutoRotate();
      }
    }
  }
);

// Watch for viewLimits changes
watch(
  () => props.viewLimits,
  (newLimits) => {
    if (viewerInstance.value) {
      viewerInstance.value.setViewLimits(newLimits);
    }
  }
);

// Watch for minimap visibility
watch(
  () => props.showMiniMap,
  (newValue) => {
    if (viewerInstance.value) {
      if (newValue) {
        viewerInstance.value.showMiniMap();
      } else {
        viewerInstance.value.hideMiniMap();
      }
    }
  }
);

// Expose methods to parent component
const loadImage = async (url: string | CubemapImages, transition = false): Promise<void> => {
  if (viewerInstance.value) {
    await viewerInstance.value.loadImage(url, transition);
  }
};

const reset = (): void => {
  if (viewerInstance.value) {
    viewerInstance.value.reset();
  }
};

const enableAutoRotate = (): void => {
  if (viewerInstance.value) {
    viewerInstance.value.enableAutoRotate();
  }
};

const disableAutoRotate = (): void => {
  if (viewerInstance.value) {
    viewerInstance.value.disableAutoRotate();
  }
};

const enableGyroscope = async (): Promise<boolean> => {
  if (viewerInstance.value) {
    return await viewerInstance.value.enableGyroscope();
  }
  return false;
};

const disableGyroscope = (): void => {
  if (viewerInstance.value) {
    viewerInstance.value.disableGyroscope();
  }
};

const getRotation = () => {
  if (viewerInstance.value) {
    return viewerInstance.value.getRotation();
  }
  return { x: 0, y: 0, z: 0 };
};

const setRotation = (x: number, y: number, z: number): void => {
  if (viewerInstance.value) {
    viewerInstance.value.setRotation(x, y, z);
  }
};

const addHotspot = (hotspot: Hotspot): void => {
  if (viewerInstance.value) {
    viewerInstance.value.addHotspot(hotspot);
  }
};

const removeHotspot = (id: string): void => {
  if (viewerInstance.value) {
    viewerInstance.value.removeHotspot(id);
  }
};

const getHotspots = (): Hotspot[] => {
  if (viewerInstance.value) {
    return viewerInstance.value.getHotspots();
  }
  return [];
};

const enterFullscreen = async (): Promise<void> => {
  if (viewerInstance.value) {
    await viewerInstance.value.enterFullscreen();
  }
};

const exitFullscreen = (): void => {
  if (viewerInstance.value) {
    viewerInstance.value.exitFullscreen();
  }
};

const isFullscreen = (): boolean => {
  if (viewerInstance.value) {
    return viewerInstance.value.isFullscreen();
  }
  return false;
};

const screenshot = (width?: number, height?: number): string => {
  if (viewerInstance.value) {
    return viewerInstance.value.screenshot(width, height);
  }
  return '';
};

const setViewLimits = (limits: ViewLimits | null): void => {
  if (viewerInstance.value) {
    viewerInstance.value.setViewLimits(limits);
  }
};

const showMiniMap = (): void => {
  if (viewerInstance.value) {
    viewerInstance.value.showMiniMap();
  }
};

const hideMiniMap = (): void => {
  if (viewerInstance.value) {
    viewerInstance.value.hideMiniMap();
  }
};

const toggleMiniMap = (): void => {
  if (viewerInstance.value) {
    viewerInstance.value.toggleMiniMap();
  }
};

defineExpose({
  loadImage,
  reset,
  enableAutoRotate,
  disableAutoRotate,
  enableGyroscope,
  disableGyroscope,
  getRotation,
  setRotation,
  addHotspot,
  removeHotspot,
  getHotspots,
  enterFullscreen,
  exitFullscreen,
  isFullscreen,
  screenshot,
  setViewLimits,
  showMiniMap,
  hideMiniMap,
  toggleMiniMap,
});
</script>

<style scoped>
.panorama-viewer {
  position: relative;
  overflow: hidden;
}
</style>
