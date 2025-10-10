# Vue 3 集成

@ldesign/pdf 为Vue 3提供了开箱即用的组件和Composable。

## 安装

```bash
npm install @ldesign/pdf pdfjs-dist vue
```

## 使用方式

### 方式一：使用组件

最简单的使用方式，适合大多数场景。

```vue
<template>
  <PDFViewer
    :source="pdfUrl"
    :workerSrc="workerSrc"
    @pageChange="handlePageChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PDFViewerComponent as PDFViewer } from '@ldesign/pdf/vue';

const pdfUrl = ref('https://example.com/sample.pdf');
const workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js';

const handlePageChange = (page: number) => {
  console.log('当前页:', page);
};
</script>
```

### 方式二：使用Composable

需要完全控制UI时使用。

```vue
<template>
  <div class="my-pdf-viewer">
    <!-- 自定义工具栏 -->
    <div class="toolbar">
      <button @click="previousPage" :disabled="currentPage <= 1">
        上一页
      </button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages">
        下一页
      </button>
    </div>

    <!-- PDF容器 -->
    <div v-if="loading">加载中... {{ Math.round(progress * 100) }}%</div>
    <div v-if="error">错误: {{ error.message }}</div>
    <div ref="containerRef" class="pdf-content"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePDFViewer } from '@ldesign/pdf/vue';

const pdfUrl = ref('https://example.com/sample.pdf');

const {
  containerRef,
  loading,
  progress,
  error,
  currentPage,
  totalPages,
  nextPage,
  previousPage,
} = usePDFViewer(pdfUrl, {
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
  scale: 'auto',
});
</script>
```

### 方式三：全局注册

在整个应用中使用。

```typescript
// main.ts
import { createApp } from 'vue';
import { PDFViewerPlugin } from '@ldesign/pdf/vue';
import App from './App.vue';

const app = createApp(App);

// 全局注册
app.use(PDFViewerPlugin);

app.mount('#app');
```

然后在任何组件中使用：

```vue
<template>
  <PDFViewer :source="pdfUrl" :workerSrc="workerSrc" />
</template>
```

## 组件API

### Props

#### source

- **类型**: `string | ArrayBuffer | Uint8Array`
- **必填**: 否
- **说明**: PDF文件源

```vue
<PDFViewer source="https://example.com/sample.pdf" />
```

#### workerSrc

- **类型**: `string`
- **必填**: 是
- **说明**: PDF.js Worker路径

```vue
<PDFViewer
  :workerSrc="`https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js`"
/>
```

#### scale

- **类型**: `'auto' | 'page-fit' | 'page-width' | 'page-height' | number`
- **默认值**: `'auto'`
- **说明**: 缩放模式

```vue
<PDFViewer :scale="1.5" />
<PDFViewer scale="page-fit" />
```

#### quality

- **类型**: `'low' | 'medium' | 'high' | 'ultra'`
- **默认值**: `'medium'`
- **说明**: 渲染质量

```vue
<PDFViewer quality="high" />
```

#### layout

- **类型**: `'single' | 'continuous' | 'double' | 'book'`
- **默认值**: `'continuous'`
- **说明**: 布局模式

```vue
<PDFViewer layout="continuous" />
```

#### showToolbar

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否显示工具栏

```vue
<PDFViewer :show-toolbar="false" />
```

#### showSearch

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否显示搜索

```vue
<PDFViewer :show-search="true" />
```

#### showPrint

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否显示打印按钮

```vue
<PDFViewer :show-print="true" />
```

#### showDownload

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否显示下载按钮

```vue
<PDFViewer :show-download="true" />
```

### Events

#### load

文档开始加载时触发。

```vue
<PDFViewer @load="handleLoad" />
```

#### pageChange

页面切换时触发。

```vue
<PDFViewer @pageChange="handlePageChange" />

<script setup>
const handlePageChange = (page: number) => {
  console.log('当前页:', page);
};
</script>
```

#### error

发生错误时触发。

```vue
<PDFViewer @error="handleError" />

<script setup>
const handleError = (error: Error) => {
  console.error('错误:', error);
};
</script>
```

### 暴露的方法

通过ref访问组件方法：

```vue
<template>
  <PDFViewer ref="pdfRef" :source="pdfUrl" />
  <button @click="print">打印</button>
</template>

<script setup>
import { ref } from 'vue';

const pdfRef = ref();

const print = () => {
  pdfRef.value?.print();
};
</script>
```

可用方法：
- `load(source)` - 加载PDF
- `goToPage(page)` - 跳转到指定页
- `nextPage()` - 下一页
- `previousPage()` - 上一页
- `setScale(scale)` - 设置缩放
- `zoomIn(step?)` - 放大
- `zoomOut(step?)` - 缩小
- `rotate(angle)` - 旋转
- `search(query, options?)` - 搜索
- `print(options?)` - 打印
- `download(filename?)` - 下载
- `refresh()` - 刷新

## Composable API

### usePDFViewer

创建PDF查看器实例。

```typescript
function usePDFViewer(
  source?: Ref<PDFSource | undefined> | PDFSource,
  options?: UsePDFViewerOptions
): UsePDFViewerReturn
```

#### 参数

- `source` - PDF源，可以是响应式引用
- `options` - 配置选项

#### 返回值

```typescript
interface UsePDFViewerReturn {
  // 实例和引用
  viewer: Ref<PDFViewer | null>;
  containerRef: Ref<HTMLDivElement | null>;

  // 状态
  loading: Ref<boolean>;
  progress: Ref<number>;
  error: Ref<Error | null>;
  currentPage: Ref<number>;
  totalPages: Ref<number>;
  scale: Ref<number>;
  documentInfo: Ref<DocumentInfo | null>;

  // 方法
  load: (source: PDFSource) => Promise<void>;
  goToPage: (pageNumber: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setScale: (scale: number) => void;
  zoomIn: (step?: number) => void;
  zoomOut: (step?: number) => void;
  rotate: (angle: number) => void;
  search: (query: string) => Promise<void>;
  print: () => Promise<void>;
  download: (filename?: string) => void;
  refresh: () => void;
}
```

#### 完整示例

```vue
<template>
  <div class="pdf-viewer">
    <!-- 工具栏 -->
    <div class="toolbar">
      <button @click="previousPage" :disabled="currentPage <= 1">
        上一页
      </button>
      <input
        v-model.number="pageInput"
        type="number"
        :min="1"
        :max="totalPages"
        @change="goToPage(pageInput)"
      />
      <span>/ {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages">
        下一页
      </button>

      <button @click="zoomOut">缩小</button>
      <span>{{ Math.round(scale * 100) }}%</span>
      <button @click="zoomIn">放大</button>

      <button @click="rotate(90)">旋转</button>
      <button @click="print">打印</button>
      <button @click="download('document.pdf')">下载</button>
    </div>

    <!-- 状态显示 -->
    <div v-if="loading" class="loading">
      加载中... {{ Math.round(progress * 100) }}%
    </div>
    <div v-if="error" class="error">
      {{ error.message }}
    </div>

    <!-- PDF容器 -->
    <div ref="containerRef" class="content"></div>

    <!-- 信息显示 -->
    <div v-if="documentInfo" class="info">
      <p>标题: {{ documentInfo.title }}</p>
      <p>作者: {{ documentInfo.author }}</p>
      <p>页数: {{ documentInfo.numPages }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePDFViewer } from '@ldesign/pdf/vue';

const pdfSource = ref('https://example.com/sample.pdf');
const pageInput = ref(1);

const {
  containerRef,
  viewer,
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
} = usePDFViewer(pdfSource, {
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
  scale: 'auto',
  quality: 'high',
});
</script>

<style scoped>
.pdf-viewer {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
}

.content {
  flex: 1;
  overflow: auto;
}

.loading, .error {
  padding: 20px;
  text-align: center;
}

.error {
  color: red;
}

.info {
  padding: 12px;
  background: #f5f5f5;
  font-size: 14px;
}
</style>
```

## 响应式源

source支持响应式引用，当source变化时自动重新加载：

```vue
<script setup>
import { ref } from 'vue';
import { usePDFViewer } from '@ldesign/pdf/vue';

const pdfUrl = ref('https://example.com/doc1.pdf');

// source是响应式的
const { containerRef } = usePDFViewer(pdfUrl, {
  workerSrc: '...',
});

// 切换PDF会自动重新加载
const switchPDF = () => {
  pdfUrl.value = 'https://example.com/doc2.pdf';
};
</script>
```

## 完整的示例应用

查看完整的示例应用代码：

- [基础示例](https://github.com/ldesign/pdf/tree/main/examples/vue3-demo/src/demos/BasicDemo.vue)
- [高级功能](https://github.com/ldesign/pdf/tree/main/examples/vue3-demo/src/demos/AdvancedDemo.vue)
- [Composable示例](https://github.com/ldesign/pdf/tree/main/examples/vue3-demo/src/demos/ComposableDemo.vue)
- [自定义工具栏](https://github.com/ldesign/pdf/tree/main/examples/vue3-demo/src/demos/CustomToolbarDemo.vue)

## 下一步

- [配置选项](/guide/configuration) - 了解所有配置选项
- [事件系统](/guide/events) - 了解如何使用事件
- [API参考](/api/vue-component) - 查看完整的Vue API
