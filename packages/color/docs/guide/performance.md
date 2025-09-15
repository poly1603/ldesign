# 性能优化

@ldesign/color 通过“闲时处理 + 缓存 + 预生成”提供流畅体验。

## 闲时处理（requestIdleCallback）

```ts
import { addIdleTask, getDefaultProcessorStatus } from '@ldesign/color'

addIdleTask(() => {
  // 在空闲时间批量预生成主题
  // themeManager.preGenerateAllThemes()
})

console.log(getDefaultProcessorStatus())
```

## 主题预生成

```ts
await themeManager.preGenerateAllThemes()   // 或单个：preGenerateTheme('green')
```

## 缓存配置

```ts
const themeManager = await createThemeManagerWithPresets({
  cache: { maxSize: 50, defaultTTL: 3600_000 },
  idleProcessing: true,
})
```

## 最佳实践

- 应用启动后预生成常用主题
- 在交互前（首屏）避免大计算，改在 idle 阶段完成
- 使用按需导入减少打包体积

