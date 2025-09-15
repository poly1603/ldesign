# EventEmitter

一个简洁高性能的事件发射器实现，被 DeviceDetector 与部分模块使用。

## 用法

```ts
const emitter = new EventEmitter<{ hello: string }>()
emitter.on('hello', (msg) => console.log(msg))
emitter.emit('hello', 'world')
```

## API

- `on(event, listener): this` — 注册监听器
- `once(event, listener): this` — 仅触发一次
- `off(event, listener?): this` — 取消监听
- `emit(event, data): this` — 触发事件
- `listenerCount(event): number` — 监听器数量
- `eventNames(): Array<keyof T>` — 已注册事件名
- `removeAllListeners(event?): this` — 清理所有监听器
- `listeners(event): EventListener[]` — 获取监听器列表
- `hasListeners(event): boolean` — 是否有监听器

