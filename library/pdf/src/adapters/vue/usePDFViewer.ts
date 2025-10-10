/**
 * Vue 3 Composable
 */

import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue';
import { PDFViewer } from '../../core/PDFViewer';
import type { PDFViewerConfig, PDFSource, DocumentInfo, PageInfo } from '../../types';

export interface UsePDFViewerOptions extends Omit<PDFViewerConfig, 'container'> {
  /** 是否自动加载 */
  autoLoad?: boolean;
}

export interface UsePDFViewerReturn {
  /** PDF查看器实例 */
  viewer: Ref<PDFViewer | null>;

  /** 容器元素引用 */
  containerRef: Ref<HTMLDivElement | null>;

  /** 加载状态 */
  loading: Ref<boolean>;

  /** 加载进度 */
  progress: Ref<number>;

  /** 错误信息 */
  error: Ref<Error | null>;

  /** 当前页码 */
  currentPage: Ref<number>;

  /** 总页数 */
  totalPages: Ref<number>;

  /** 缩放比例 */
  scale: Ref<number>;

  /** 文档信息 */
  documentInfo: Ref<DocumentInfo | null>;

  /** 加载PDF */
  load: (source: PDFSource) => Promise<void>;

  /** 跳转到指定页 */
  goToPage: (pageNumber: number) => void;

  /** 下一页 */
  nextPage: () => void;

  /** 上一页 */
  previousPage: () => void;

  /** 设置缩放 */
  setScale: (scale: number) => void;

  /** 放大 */
  zoomIn: (step?: number) => void;

  /** 缩小 */
  zoomOut: (step?: number) => void;

  /** 旋转 */
  rotate: (angle: number) => void;

  /** 搜索 */
  search: (query: string) => Promise<void>;

  /** 打印 */
  print: () => Promise<void>;

  /** 下载 */
  download: (filename?: string) => void;

  /** 刷新 */
  refresh: () => void;
}

/**
 * 使用PDF查看器
 */
export function usePDFViewer(
  source?: Ref<PDFSource | undefined> | PDFSource,
  options: UsePDFViewerOptions = {}
): UsePDFViewerReturn {
  const viewer = ref<PDFViewer | null>(null);
  const containerRef = ref<HTMLDivElement | null>(null);
  const loading = ref(false);
  const progress = ref(0);
  const error = ref<Error | null>(null);
  const currentPage = ref(1);
  const totalPages = ref(0);
  const scale = ref(1);
  const documentInfo = ref<DocumentInfo | null>(null);

  /**
   * 初始化查看器
   */
  const initViewer = () => {
    if (!containerRef.value) return;

    const { autoLoad, ...viewerConfig } = options;

    viewer.value = new PDFViewer({
      ...viewerConfig,
      container: containerRef.value,
      on: {
        loadStart: () => {
          loading.value = true;
          progress.value = 0;
          error.value = null;
        },
        loadProgress: (p) => {
          progress.value = p;
        },
        loadComplete: (info) => {
          loading.value = false;
          progress.value = 1;
          documentInfo.value = info;
          totalPages.value = info.numPages;
          currentPage.value = viewer.value?.currentPage || 1;
          scale.value = viewer.value?.scale || 1;
        },
        loadError: (err) => {
          loading.value = false;
          error.value = err;
        },
        pageChange: (pageNumber) => {
          currentPage.value = pageNumber;
        },
        scaleChange: (s) => {
          scale.value = s;
        },
        ...viewerConfig.on,
      },
    });
  };

  /**
   * 加载PDF
   */
  const load = async (src: PDFSource) => {
    if (!viewer.value) {
      throw new Error('查看器未初始化');
    }

    try {
      await viewer.value.load(src);
    } catch (err) {
      error.value = err as Error;
      throw err;
    }
  };

  /**
   * 跳转到指定页
   */
  const goToPage = (pageNumber: number) => {
    viewer.value?.goToPage(pageNumber);
  };

  /**
   * 下一页
   */
  const nextPage = () => {
    viewer.value?.nextPage();
  };

  /**
   * 上一页
   */
  const previousPage = () => {
    viewer.value?.previousPage();
  };

  /**
   * 设置缩放
   */
  const setScale = (s: number) => {
    viewer.value?.setScale(s);
  };

  /**
   * 放大
   */
  const zoomIn = (step?: number) => {
    viewer.value?.zoomIn(step);
  };

  /**
   * 缩小
   */
  const zoomOut = (step?: number) => {
    viewer.value?.zoomOut(step);
  };

  /**
   * 旋转
   */
  const rotate = (angle: number) => {
    viewer.value?.rotate(angle);
  };

  /**
   * 搜索
   */
  const search = async (query: string) => {
    if (viewer.value) {
      await viewer.value.search(query);
    }
  };

  /**
   * 打印
   */
  const print = async () => {
    if (viewer.value) {
      await viewer.value.print();
    }
  };

  /**
   * 下载
   */
  const download = (filename?: string) => {
    viewer.value?.download(filename);
  };

  /**
   * 刷新
   */
  const refresh = () => {
    viewer.value?.refresh();
  };

  // 挂载时初始化
  onMounted(() => {
    initViewer();

    // 自动加载
    if (options.autoLoad !== false && source) {
      const src = ref(source) as Ref<PDFSource | undefined>;
      if (src.value) {
        load(src.value);
      }
    }
  });

  // 卸载时销毁
  onUnmounted(() => {
    viewer.value?.destroy();
  });

  // 监听source变化
  if (source) {
    const src = ref(source) as Ref<PDFSource | undefined>;
    watch(src, (newSource) => {
      if (newSource && viewer.value) {
        load(newSource);
      }
    });
  }

  return {
    viewer,
    containerRef,
    loading,
    progress,
    error,
    currentPage,
    totalPages,
    scale,
    documentInfo,
    load,
    goToPage,
    nextPage,
    previousPage,
    setScale,
    zoomIn,
    zoomOut,
    rotate,
    search,
    print,
    download,
    refresh,
  };
}
