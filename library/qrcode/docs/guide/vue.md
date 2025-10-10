# Vue 3 集成

`@ldesign/qrcode` 为 Vue 3 提供了开箱即用的组件和 Composition API。

## 安装

```bash
npm install @ldesign/qrcode
```

## 组件方式

### 基础使用

使用 `QRCode` 组件：

```vue
<template>
  <div>
    <QRCode content="https://example.com" />
  </div>
</template>

<script setup lang="ts">
import { QRCode } from '@ldesign/qrcode/vue';
</script>
```

### 自定义样式

```vue
<template>
  <QRCode
    :content="url"
    :error-correction-level="errorLevel"
    :style-config="{
      size: 300,
      fgColor: '#2563eb',
      bgColor: '#dbeafe',
      cornerRadius: 0.3,
    }"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QRCode } from '@ldesign/qrcode/vue';

const url = ref('https://example.com');
const errorLevel = ref('M');
</script>
```

### 响应式内容

```vue
<template>
  <div>
    <input v-model="content" placeholder="输入内容" />
    <QRCode :content="content" :style-config="{ size: 250 }" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QRCode } from '@ldesign/qrcode/vue';

const content = ref('https://github.com');
</script>
```

### 完整配置

```vue
<template>
  <QRCode
    :content="content"
    :error-correction-level="errorLevel"
    :render-type="renderType"
    :style-config="styleConfig"
    :logo="logoConfig"
    @generated="onGenerated"
    @error="onError"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QRCode } from '@ldesign/qrcode/vue';
import type { StyleConfig, LogoConfig } from '@ldesign/qrcode';

const content = ref('https://example.com');
const errorLevel = ref<'L' | 'M' | 'Q' | 'H'>('H');
const renderType = ref<'canvas' | 'svg'>('canvas');

const styleConfig = ref<StyleConfig>({
  size: 300,
  dotStyle: 'rounded',
  gradient: {
    type: 'linear',
    colors: ['#667eea', '#764ba2'],
    direction: 45,
  },
});

const logoConfig = ref<LogoConfig>({
  src: '/logo.png',
  width: '25%',
  height: '25%',
  logoBackground: true,
  logoBackgroundPadding: 8,
});

const onGenerated = (info: any) => {
  console.log('二维码已生成:', info);
};

const onError = (error: Error) => {
  console.error('生成失败:', error);
};
</script>
```

## Composition API

### useQRCode

使用 `useQRCode` composable：

```vue
<template>
  <div>
    <div ref="qrContainer"></div>
    <button @click="updateContent">更新内容</button>
    <button @click="download">下载</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQRCode } from '@ldesign/qrcode/vue';

const qrContainer = ref<HTMLElement>();

const { qrCode, update, download, destroy } = useQRCode({
  content: 'https://example.com',
  container: qrContainer,
  style: {
    size: 250,
  },
});

const updateContent = async () => {
  await update({ content: 'https://github.com' });
};

const downloadQR = () => {
  download({ fileName: 'qrcode', format: 'png' });
};

onMounted(() => {
  // qrCode 自动生成
});
</script>
```

### 响应式配置

```vue
<template>
  <div>
    <div ref="qrContainer"></div>

    <div class="controls">
      <input v-model="content" placeholder="内容" />
      <input v-model="fgColor" type="color" />
      <button @click="updateConfig">更新</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQRCode } from '@ldesign/qrcode/vue';

const qrContainer = ref<HTMLElement>();
const content = ref('https://example.com');
const fgColor = ref('#2563eb');

const { update } = useQRCode({
  content: content.value,
  container: qrContainer,
  style: {
    size: 250,
    fgColor: fgColor.value,
  },
});

const updateConfig = async () => {
  await update({
    content: content.value,
    style: {
      fgColor: fgColor.value,
    },
  });
};
</script>
```

### 监听变化

使用 `watch` 自动更新：

```vue
<template>
  <div>
    <div ref="qrContainer"></div>

    <select v-model="selectedStyle">
      <option value="square">方形</option>
      <option value="rounded">圆角</option>
      <option value="dots">圆点</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQRCode } from '@ldesign/qrcode/vue';
import type { DotStyle } from '@ldesign/qrcode';

const qrContainer = ref<HTMLElement>();
const selectedStyle = ref<DotStyle>('square');

const { update } = useQRCode({
  content: 'https://example.com',
  container: qrContainer,
  style: {
    size: 250,
    dotStyle: selectedStyle.value,
  },
});

watch(selectedStyle, async (newStyle) => {
  await update({
    style: { dotStyle: newStyle },
  });
});
</script>
```

## 完整示例

### 交互式二维码生成器

```vue
<template>
  <div class="qr-generator">
    <h2>二维码生成器</h2>

    <!-- 二维码展示 -->
    <div class="qr-preview">
      <QRCode
        :content="config.content"
        :error-correction-level="config.errorLevel"
        :style-config="config.style"
        :logo="config.logo"
        @generated="onGenerated"
      />
    </div>

    <!-- 控制面板 -->
    <div class="controls">
      <!-- 内容 -->
      <div class="control-group">
        <label>内容</label>
        <input v-model="config.content" placeholder="输入内容" />
      </div>

      <!-- 纠错级别 -->
      <div class="control-group">
        <label>纠错级别</label>
        <select v-model="config.errorLevel">
          <option value="L">Low (7%)</option>
          <option value="M">Medium (15%)</option>
          <option value="Q">Quartile (25%)</option>
          <option value="H">High (30%)</option>
        </select>
      </div>

      <!-- 样式选择 -->
      <div class="control-group">
        <label>模块样式</label>
        <select v-model="config.style.dotStyle">
          <option value="square">方形</option>
          <option value="rounded">圆角</option>
          <option value="dots">圆点</option>
          <option value="diamond">菱形</option>
          <option value="star">星形</option>
        </select>
      </div>

      <!-- 颜色 -->
      <div class="control-group">
        <label>前景色</label>
        <input v-model="config.style.fgColor" type="color" />
      </div>

      <div class="control-group">
        <label>背景色</label>
        <input v-model="config.style.bgColor" type="color" />
      </div>

      <!-- 尺寸 -->
      <div class="control-group">
        <label>尺寸: {{ config.style.size }}px</label>
        <input v-model.number="config.style.size" type="range" min="150" max="500" />
      </div>

      <!-- Logo -->
      <div class="control-group">
        <label>
          <input v-model="showLogo" type="checkbox" />
          显示 Logo
        </label>
      </div>

      <div v-if="showLogo" class="control-group">
        <label>Logo URL</label>
        <input v-model="config.logo.src" placeholder="Logo 图片地址" />
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <button @click="handleDownload('png')">下载 PNG</button>
        <button @click="handleDownload('svg')">下载 SVG</button>
        <button @click="handleReset">重置</button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div v-if="stats" class="stats">
      <p>版本: {{ stats.version }}</p>
      <p>模块数: {{ stats.moduleCount }}</p>
      <p>生成耗时: {{ stats.renderTime }}ms</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { QRCode } from '@ldesign/qrcode/vue';
import type { DotStyle } from '@ldesign/qrcode';

// 配置
const config = reactive({
  content: 'https://example.com',
  errorLevel: 'M' as 'L' | 'M' | 'Q' | 'H',
  style: {
    size: 300,
    dotStyle: 'rounded' as DotStyle,
    fgColor: '#2563eb',
    bgColor: '#ffffff',
  },
  logo: {
    src: '',
    width: '25%',
    height: '25%',
    logoBackground: true,
    logoBackgroundPadding: 8,
  },
});

const showLogo = ref(false);
const stats = ref<any>(null);

// 计算实际的 logo 配置
const logoConfig = computed(() => {
  return showLogo.value && config.logo.src ? config.logo : undefined;
});

// 事件处理
const onGenerated = (info: any) => {
  stats.value = info;
  console.log('二维码已生成:', info);
};

const handleDownload = (format: 'png' | 'svg') => {
  // 这里需要获取组件实例并调用 download 方法
  // 或者使用 useQRCode 替代
  console.log(`下载格式: ${format}`);
};

const handleReset = () => {
  config.content = 'https://example.com';
  config.errorLevel = 'M';
  config.style = {
    size: 300,
    dotStyle: 'rounded',
    fgColor: '#2563eb',
    bgColor: '#ffffff',
  };
  showLogo.value = false;
};
</script>

<style scoped>
.qr-generator {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.qr-preview {
  display: flex;
  justify-content: center;
  padding: 40px;
  background: #f3f4f6;
  border-radius: 12px;
  margin-bottom: 30px;
}

.controls {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.control-group {
  margin-bottom: 15px;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #374151;
}

.control-group input[type='text'],
.control-group input[type='range'],
.control-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.actions button {
  flex: 1;
  padding: 10px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.actions button:hover {
  background: #1d4ed8;
}

.stats {
  margin-top: 20px;
  padding: 15px;
  background: #f9fafb;
  border-radius: 8px;
}

.stats p {
  margin: 5px 0;
  color: #6b7280;
}
</style>
```

### 使用 useQRCode 的版本

```vue
<template>
  <div>
    <div ref="qrContainer"></div>
    <button @click="handleDownload">下载</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQRCode } from '@ldesign/qrcode/vue';

const qrContainer = ref<HTMLElement>();

const { qrCode, download } = useQRCode({
  content: 'https://example.com',
  container: qrContainer,
  style: {
    size: 300,
    dotStyle: 'rounded',
  },
});

const handleDownload = () => {
  download({ fileName: 'qrcode', format: 'png' });
};
</script>
```

## 全局注册

在 `main.ts` 中全局注册插件：

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import QRCodePlugin from '@ldesign/qrcode/vue';

const app = createApp(App);

// 注册插件
app.use(QRCodePlugin);

app.mount('#app');
```

然后在组件中直接使用：

```vue
<template>
  <qr-code content="https://example.com" />
</template>
```

## TypeScript 支持

完整的类型定义：

```typescript
import type {
  QRCodeConfig,
  StyleConfig,
  LogoConfig,
  DotStyle,
  ErrorCorrectionLevel,
} from '@ldesign/qrcode';

interface QRCodeProps {
  content: string;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  renderType?: 'canvas' | 'svg';
  styleConfig?: StyleConfig;
  logo?: LogoConfig;
}

interface QRCodeEmits {
  generated: [info: any];
  error: [error: Error];
  update: [changes: any];
}
```

## 最佳实践

### 1. 性能优化

使用 `v-once` 对于静态二维码：

```vue
<template>
  <QRCode v-once :content="staticContent" />
</template>
```

### 2. 懒加载

使用 `v-if` 延迟加载：

```vue
<template>
  <div>
    <button @click="showQR = true">显示二维码</button>
    <QRCode v-if="showQR" :content="content" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QRCode } from '@ldesign/qrcode/vue';

const showQR = ref(false);
const content = ref('https://example.com');
</script>
```

### 3. 清理资源

```vue
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { useQRCode } from '@ldesign/qrcode/vue';

const { destroy } = useQRCode({
  content: 'https://example.com',
  container: qrContainer,
});

onBeforeUnmount(() => {
  destroy();
});
</script>
```

## 下一步

继续学习：

- [React 集成](./react.md) - 在 React 中使用
- [Vanilla JS](./vanilla.md) - 在原生 JavaScript 中使用
- [API 参考](../api/types.md) - 完整的类型定义
