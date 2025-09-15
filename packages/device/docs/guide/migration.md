# 迁移指南

本文档帮助你从旧版本（或初始实现）迁移到当前版本。

## 1. 导出与包结构

- CJS 主入口由 `lib/index.cjs` 统一为 `cjs/index.cjs`
- 类型文件由 `es/index.d.ts` 统一为 `types/index.d.ts`
- 导出路径请参考 package.json `exports` 字段：
  - import: `./es/index.js`
  - require: `./cjs/index.cjs`
  - types: `./types/index.d.ts`

无需代码变更，若自定义了打包或直连文件路径请同步调整。

## 2. 事件与模块

- DeviceDetector 现在会桥接扩展模块事件：
  - networkChange / batteryChange / positionChange
- 如果以前直接从模块监听事件，现在也可以从 DeviceDetector 上统一监听。

示例：
```ts
const detector = new DeviceDetector()
await detector.loadModule('network')

// 统一从 detector 监听
detector.on('networkChange', (info) => {
  // ...
})
```

## 3. 插件选项与组合式 API

- 插件选项更正：`globalPropertyName`（旧文档里可能有 `globalProperty`）
- 统一使用 `debounceDelay` 键名

```ts
app.use(DevicePlugin, {
  globalPropertyName: '$device',
  debounceDelay: 250,
  enableResize: true,
  enableOrientation: true,
})
```

## 4. 类型修正

- DeviceDetectorEvents 增加了 `positionChange` 与 `error`
- 某些模块的事件 API 为可选（on/off/emit 非强制实现），使用前请做存在性判断

```ts
const mod = await detector.loadModule('battery')
if (typeof (mod as any).on === 'function') {
  (mod as any).on('batteryChange', (b) => { /* ... */ })
}
```

## 5. 指令与文档

- 指令绑定值结构保持不变，但文档中示例已统一至当前 API
- 若原项目中直接依赖旧文档片段，请参考 docs/vue/* 与 docs/guide/* 的最新示例

## 6. 测试与类型检查

- 测试类型配置从覆盖 __tests__/examples 等文件调整为仅校验 src 目录，减少外部依赖对类型检查的影响
- 若你需要对测试进行严格类型检查，可在 tsconfig.test.json 中恢复 include 配置

## 7. 不兼容变更小结

- 无破坏性 API 变更；少量导出路径与文档字段名修正
- 事件桥接的新增仅带来正向兼容

