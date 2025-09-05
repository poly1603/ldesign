# 状态管理示例

展示如何使用全局状态、命名空间与监听。

```ts
import { createApp } from '@ldesign/engine'
import App from './App.vue'

const engine = createApp(App)

engine.state.set('user.profile', { name: 'Alice' })

const unwatch = engine.state.watch('user.profile', (n, o) => {
  console.log('profile changed:', n, o)
})

const userNS = engine.state.namespace('user')
userNS.set('token', 'xxx')

engine.mount('#app')
```

要点：
- 使用点路径访问嵌套数据
- 命名空间隔离业务模块
