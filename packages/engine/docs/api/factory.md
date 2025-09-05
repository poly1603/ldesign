# 工厂函数（Factory）

本文档介绍引擎提供的工厂函数：createEngine、createApp、createAndMountApp 及 creators。

## createEngine

创建引擎实例，适合需要完全控制 Vue 应用创建挂载流程的场景。

```ts
import { createEngine } from '@ldesign/engine'
import { createApp as createVueApp } from 'vue'
import App from './App.vue'

const engine = createEngine({
  config: {
    app: { name: 'My App', version: '1.0.0' },
    debug: true,
  },
  plugins: [],
  middleware: [],
})

const app = createVueApp(App)
engine.install(app)
app.mount('#app')
```

## createApp

简化 API：创建引擎并自动创建 Vue 应用，但不自动挂载。

```ts
import { createApp } from '@ldesign/engine'
import App from './App.vue'

const engine = createApp(App, {
  config: { debug: true },
})

// 需要时再挂载
engine.mount('#app')
```

## createAndMountApp

一步到位：创建引擎、创建应用并立即挂载。

```ts
import { createAndMountApp } from '@ldesign/engine'
import App from './App.vue'

const engine = createAndMountApp(App, '#app', {
  config: { debug: true },
  enableAutoSave: true,
  autoSaveInterval: 30000,
})
```

## creators

帮助快速创建插件和中间件。

```ts
import { creators } from '@ldesign/engine'

const myPlugin = creators.plugin('my-plugin', (engine) => {
  engine.logger.info('my-plugin installed')
})

const logging = creators.middleware('logging', async (_ctx, next) => {
  console.time('request')
  await next()
  console.timeEnd('request')
}, 10)
```

