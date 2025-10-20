# @word-viewer/vue

Vue 3 组件封装 - Word 文档查看器。

## 📦 安装

```bash
npm install @word-viewer/vue
```

## 🚀 快速开始

```vue
<template>
  <WordViewer
    :source="file"
    :zoom="1.2"
    :editable="true"
    theme="light"
    @loaded="onLoaded"
    @error="onError"
  />
</template>

<script setup>
import { ref } from 'vue';
import { WordViewerComponent as WordViewer } from '@word-viewer/vue';

const file = ref(null);

function onLoaded(data) {
  console.log('文档已加载', data);
}

function onError(error) {
  console.error('错误', error);
}
</script>
```

## 📖 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `DocumentSource` | - | 文档源（File、Blob、URL、ArrayBuffer） |
| `options` | `ViewerOptions` | - | 配置选项 |
| `zoom` | `number` | `1.0` | 缩放级别 |
| `editable` | `boolean` | `false` | 是否可编辑 |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | 主题 |

## 📡 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `@loaded` | `(data: any)` | 文档加载完成 |
| `@error` | `(error: any)` | 发生错误 |
| `@changed` | `()` | 文档内容改变 |
| `@zoom` | `(level: number)` | 缩放级别改变 |
| `@page-change` | `(pageInfo: any)` | 页面改变 |

## 🎯 示例

### 文件上传

```vue
<template>
  <div>
    <input type="file" @change="handleFileChange" />
    <WordViewer :source="file" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WordViewerComponent as WordViewer } from '@word-viewer/vue';

const file = ref(null);

function handleFileChange(event) {
  file.value = event.target.files[0];
}
</script>
```

### 访问查看器实例

```vue
<template>
  <WordViewer ref="viewerRef" :source="file" />
  <button @click="exportPDF">导出 PDF</button>
</template>

<script setup>
import { ref } from 'vue';
import { WordViewerComponent as WordViewer } from '@word-viewer/vue';

const viewerRef = ref();

async function exportPDF() {
  const viewer = viewerRef.value?.getViewer();
  if (viewer) {
    const blob = await viewer.exportToPDF();
    // 下载 PDF
  }
}
</script>
```

## 📄 许可证

MIT


