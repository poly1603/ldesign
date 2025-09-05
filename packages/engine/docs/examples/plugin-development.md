# 插件开发示例

本示例展示如何编写与注册插件，并在引擎中使用。

```ts
import { createApp, creators } from '@ldesign/engine'
import App from './App.vue'

// 1) 定义插件
const greetPlugin = creators.plugin('greet', (engine) => {
  engine.events.on('user:login', (user) => {
    engine.notifications.show({ type: 'success', message: `欢迎 ${user.name}!` })
  })
})

// 2) 使用插件
const engine = createApp(App, { plugins: [greetPlugin] })
engine.mount('#app')
```

要点：
- creators.plugin(name, install) 简化插件创建
- 建议在插件内使用 events / state / notifications 等统一能力

