# 集成示例

演示与第三方生态的整体集成思路：路由、状态库、UI 组件等。

## 路由集成（Vue Router）

```ts
import { createApp } from '@ldesign/engine'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

const router = createRouter({ history: createWebHistory(), routes: [] })

const engine = createApp(App)
engine.setRouter?.({ install: (engine) => {
  // 在此进行路由与引擎的桥接
}})
engine.getApp()?.use(router)
engine.mount('#app')
```

## UI 框架集成（Element Plus）

```ts
import ElementPlus from 'element-plus'
engine.getApp()?.use(ElementPlus)
```

## 通知/日志/中间件综合

结合事件与中间件进行统一埋点与异常报告。
