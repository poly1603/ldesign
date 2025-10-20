# @ldesign/progress-vue

Vue 3 进度条组件封装。

## 安装

```bash
npm install @ldesign/progress-vue
```

## 使用

### 全局注册

```javascript
import { createApp } from 'vue';
import ProgressPlugin from '@ldesign/progress-vue';
import '@ldesign/progress-core/dist/index.css';
import App from './App.vue';

const app = createApp(App);
app.use(ProgressPlugin);
app.mount('#app');
```

### 按需引入

```vue
<template>
  <div>
    <LdLinearProgress
      :value="50"
      theme="primary"
      @change="handleChange"
    />
    
    <LdCircleProgress
      :value="75"
      :radius="60"
      theme="success"
    />
  </div>
</template>

<script setup>
import { LinearProgress as LdLinearProgress, CircleProgress as LdCircleProgress } from '@ldesign/progress-vue';
import '@ldesign/progress-core/dist/index.css';

const handleChange = (value) => {
  console.log('Progress:', value);
};
</script>
```

查看主项目 README 获取详细文档。


