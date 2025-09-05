# 状态管理器（StateManager）

响应式全局状态，支持嵌套路径、监听、命名空间和历史记录。

## 快速上手

```ts
// 设置/获取
engine.state.set('user.profile', { name: 'Alice' })
const user = engine.state.get('user.profile')

// 监听
const unwatch = engine.state.watch('user.profile', (n, o) => {
  console.log('profile changed', n, o)
})

// 命名空间
const userNS = engine.state.namespace('user')
userNS.set('token', 'xxx')
console.log(userNS.get('token'))
```

## API

- get(key)
- set(key, value)
- remove(key)
- clear()
- has(key)
- keys()
- watch(key, callback) => unwatch()
- getSnapshot() / restoreFromSnapshot(snapshot)
- merge(partial)
- getStats() / getPerformanceStats()
- namespace(ns)

## 最佳实践

- 使用命名空间隔离模块数据
- 变更频繁的数据尽量扁平化，减少深层 watch 成本
- 结合事件系统广播关键更新
