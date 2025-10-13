<template>
  <div 
    ref="containerRef"
    class="pdf-viewer-vue"
    :style="containerStyle"
  >
    <div v-if="isLoading" class="pdf-viewer-loading-overlay">
      <div class="spinner"></div>
      <p>Loading PDF...</p>
    </div>
    <div v-if="error" class="pdf-viewer-error-overlay">
      <p>Error: {{ error.message }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch, computed, PropType } from 'vue';
import UniversalPDFViewer from '../../index';
import type { UniversalPDFViewerOptions, PDFViewerState } from '../../types';

export default defineComponent({
  name: 'PDFViewer',
  props: {
    pdfUrl: {
      type: String,
      default: undefined
    },
    enableToolbar: {
      type: Boolean,
      default: true
    },
    enableZoom: {
      type: Boolean,
      default: true
    },
    enableSearch: {
      type: Boolean,
      default: true
    },
    enablePrint: {
      type: Boolean,
      default: true
    },
    enableDownload: {
      type: Boolean,
      default: true
    },
    enableFullscreen: {
      type: Boolean,
      default: true
    },
    enableRotation: {
      type: Boolean,
      default: true
    },
    defaultScale: {
      type: Number,
      default: 1.0
    },
    minScale: {
      type: Number,
      default: 0.25
    },
    maxScale: {
      type: Number,
      default: 5.0
    },
    theme: {
      type: String as PropType<'light' | 'dark'>,
      default: 'light'
    },
    height: {
      type: String,
      default: '600px'
    },
    width: {
      type: String,
      default: '100%'
    }
  },
  emits: [
    'ready',
    'load',
    'error',
    'page-change',
    'scale-change',
    'rotation-change',
    'search-complete',
    'theme-change'
  ],
  setup(props, { emit }) {
    const containerRef = ref<HTMLDivElement | null>(null);
    const viewer = ref<UniversalPDFViewer | null>(null);
    const isLoading = ref(false);
    const error = ref<Error | null>(null);
    const state = ref<Partial<PDFViewerState>>({});

    const containerStyle = computed(() => ({
      width: props.width,
      height: props.height
    }));

    const initializeViewer = () => {
      if (!containerRef.value) return;

      const options: Partial<UniversalPDFViewerOptions> = {
        container: containerRef.value,
        pdfUrl: props.pdfUrl,
        enableToolbar: props.enableToolbar,
        enableZoom: props.enableZoom,
        enableSearch: props.enableSearch,
        enablePrint: props.enablePrint,
        enableDownload: props.enableDownload,
        enableFullscreen: props.enableFullscreen,
        enableRotation: props.enableRotation,
        defaultScale: props.defaultScale,
        minScale: props.minScale,
        maxScale: props.maxScale,
        theme: props.theme as 'light' | 'dark'
      };

      viewer.value = new UniversalPDFViewer(options);

      // Set up event listeners
      viewer.value.on('initialized', (viewerState: PDFViewerState) => {
        state.value = viewerState;
        emit('ready', viewer.value);
      });

      viewer.value.on('loading', () => {
        isLoading.value = true;
        error.value = null;
      });

      viewer.value.on('loaded', (data: { totalPages: number }) => {
        isLoading.value = false;
        emit('load', data);
      });

      viewer.value.on('error', (err: Error) => {
        isLoading.value = false;
        error.value = err;
        emit('error', err);
      });

      viewer.value.on('pageChanged', ({ currentPage, totalPages }: any) => {
        state.value.currentPage = currentPage;
        state.value.totalPages = totalPages;
        emit('page-change', { currentPage, totalPages });
      });

      viewer.value.on('scaleChanged', ({ scale }: any) => {
        state.value.scale = scale;
        emit('scale-change', scale);
      });

      viewer.value.on('rotationChanged', ({ rotation }: any) => {
        state.value.rotation = rotation;
        emit('rotation-change', rotation);
      });

      viewer.value.on('searchComplete', (data: any) => {
        emit('search-complete', data);
      });

      viewer.value.on('themeChanged', ({ theme }: any) => {
        emit('theme-change', theme);
      });
    };

    // Public methods exposed to parent
    const nextPage = () => viewer.value?.nextPage();
    const previousPage = () => viewer.value?.previousPage();
    const goToPage = (page: number) => viewer.value?.goToPage(page);
    const zoomIn = () => viewer.value?.zoomIn();
    const zoomOut = () => viewer.value?.zoomOut();
    const setScale = (scale: number) => viewer.value?.setScale(scale);
    const rotate = (angle: number) => viewer.value?.rotate(angle);
    const search = (query: string) => viewer.value?.search(query);
    const print = () => viewer.value?.print();
    const download = (filename?: string) => viewer.value?.download(filename);
    const setTheme = (theme: 'light' | 'dark') => viewer.value?.setTheme(theme);
    const loadPDF = (source: string | ArrayBuffer | Uint8Array) => viewer.value?.loadPDF(source);

    // Watch for PDF URL changes
    watch(() => props.pdfUrl, (newUrl) => {
      if (newUrl && viewer.value) {
        viewer.value.loadPDF(newUrl);
      }
    });

    // Watch for theme changes
    watch(() => props.theme, (newTheme) => {
      if (viewer.value) {
        viewer.value.setTheme(newTheme as 'light' | 'dark');
      }
    });

    onMounted(() => {
      initializeViewer();
    });

    onUnmounted(() => {
      if (viewer.value) {
        viewer.value.destroy();
      }
    });

    return {
      containerRef,
      isLoading,
      error,
      state,
      containerStyle,
      // Expose methods
      nextPage,
      previousPage,
      goToPage,
      zoomIn,
      zoomOut,
      setScale,
      rotate,
      search,
      print,
      download,
      setTheme,
      loadPDF
    };
  }
});
</script>

<style scoped>
.pdf-viewer-vue {
  position: relative;
}

.pdf-viewer-loading-overlay,
.pdf-viewer-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 1000;
}

.pdf-viewer-error-overlay {
  background: rgba(255, 200, 200, 0.95);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>