<template>
  <div ref="containerRef" class="vue-word-viewer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { WordViewer } from '@word-viewer/core';

type ViewerOptions = any;
type DocumentSource = any;

interface Props {
  source?: DocumentSource;
  options?: ViewerOptions;
  zoom?: number;
  editable?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

const props = defineProps<Props>();
const emit = defineEmits<{
  loaded: [data: any];
  error: [error: any];
  changed: [];
  zoom: [level: number];
  'page-change': [pageInfo: any];
}>();

const containerRef = ref<HTMLElement | null>(null);
let viewer: WordViewer | null = null;

onMounted(() => {
  if (containerRef.value) {
    viewer = new WordViewer(containerRef.value, {
      ...props.options,
      editable: props.editable,
      theme: props.theme,
      initialZoom: props.zoom,
    });

    viewer.on('loaded', (data) => emit('loaded', data));
    viewer.on('error', (error) => emit('error', error));
    viewer.on('changed', () => emit('changed'));
    viewer.on('zoom', (level) => emit('zoom', level));
    viewer.on('page-change', (pageInfo) => emit('page-change', pageInfo));

    if (props.source) {
      loadDocument(props.source);
    }
  }
});

onBeforeUnmount(() => {
  if (viewer) {
    viewer.destroy();
    viewer = null;
  }
});

watch(() => props.source, (newSource) => {
  if (newSource) loadDocument(newSource);
});

watch(() => props.zoom, (newZoom) => {
  if (viewer && newZoom !== undefined) {
    viewer.setZoom(newZoom);
  }
});

watch(() => props.editable, (newEditable) => {
  if (viewer) {
    newEditable ? viewer.enableEdit() : viewer.disableEdit();
  }
});

watch(() => props.theme, (newTheme) => {
  if (viewer && newTheme) {
    viewer.updateOptions({ theme: newTheme });
  }
});

async function loadDocument(source: DocumentSource) {
  if (!viewer) return;
  try {
    if (source instanceof File) {
      await viewer.loadFile(source);
    } else if (source instanceof Blob) {
      const buffer = await source.arrayBuffer();
      await viewer.loadBuffer(buffer);
    } else if (source instanceof ArrayBuffer) {
      await viewer.loadBuffer(source);
    } else if (typeof source === 'string') {
      await viewer.loadUrl(source);
    }
  } catch (error) {
    console.error('加载文档失败:', error);
  }
}

function getViewer(): WordViewer | null {
  return viewer;
}

defineExpose({ getViewer, loadDocument });
</script>

<style scoped>
.vue-word-viewer {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>



