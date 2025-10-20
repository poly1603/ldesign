<template>
  <div ref="containerRef" class="vue-word-viewer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, defineProps, defineEmits } from 'vue';
import { WordViewer } from '../../core/WordViewer';
import type { ViewerOptions, DocumentSource } from '../../core/types';

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
    // 初始化查看器
    viewer = new WordViewer(containerRef.value, {
      ...props.options,
      editable: props.editable,
      theme: props.theme,
      initialZoom: props.zoom,
    });

    // 绑定事件
    viewer.on('loaded', (data) => emit('loaded', data));
    viewer.on('error', (error) => emit('error', error));
    viewer.on('changed', () => emit('changed'));
    viewer.on('zoom', (level) => emit('zoom', level));
    viewer.on('page-change', (pageInfo) => emit('page-change', pageInfo));

    // 加载文档
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

// 监听源文档变化
watch(
  () => props.source,
  (newSource) => {
    if (newSource) {
      loadDocument(newSource);
    }
  }
);

// 监听缩放变化
watch(
  () => props.zoom,
  (newZoom) => {
    if (viewer && newZoom !== undefined) {
      viewer.setZoom(newZoom);
    }
  }
);

// 监听编辑模式变化
watch(
  () => props.editable,
  (newEditable) => {
    if (viewer) {
      if (newEditable) {
        viewer.enableEdit();
      } else {
        viewer.disableEdit();
      }
    }
  }
);

// 监听主题变化
watch(
  () => props.theme,
  (newTheme) => {
    if (viewer && newTheme) {
      viewer.updateOptions({ theme: newTheme });
    }
  }
);

/**
 * 加载文档
 */
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

/**
 * 获取查看器实例
 */
function getViewer(): WordViewer | null {
  return viewer;
}

// 暴露方法给父组件
defineExpose({
  getViewer,
  loadDocument,
});
</script>

<style scoped>
.vue-word-viewer {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>



