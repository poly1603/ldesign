# 插件配置 (plugins)

在配置中直接配置 Vite 插件。

```ts
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [vue()]
}
```

## 与智能插件的配合
@ldesign/launcher 会根据项目类型自动注入必要插件（如 `@vitejs/plugin-vue`）。如果你已经在 `plugins` 中手动声明，将自动去重，避免重复注册导致的 “SFC 解析二次处理” 错误。

建议：
- 需要自定义插件选项时在 `plugins` 中显式声明
- 不自定义时可省略，由智能检测自动注入

## 条件加载插件
```ts
export default ({ mode }) => ({
  plugins: [
    mode === 'development' && mockPlugin(),
    legacyPlugin()
  ].filter(Boolean)
})
```

更多插件开发见: [/plugins/](../plugins/index.md)

