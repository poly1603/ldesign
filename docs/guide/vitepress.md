# VitePress 使用文档

本文介绍如何在本仓库中使用与维护文档站点（VitePress）。

## 快速命令

::: code-group
```bash [开发]
# 在仓库根目录下执行（推荐）
npm --prefix ./docs run dev
# 或进入 docs 目录
# cd docs && npm run dev
```

```bash [构建]
# 生成静态站点到 docs/.vitepress/dist
npm --prefix ./docs run build
```

```bash [本地预览]
# 预览构建结果（本地静态服务）
npm --prefix ./docs run preview
```
:::

> 也可使用 pnpm：`pnpm -F @ldesign/docs dev|build|preview`

## 目录结构

```
docs/
  .vitepress/           # 站点配置与主题扩展
    config.ts          # 侧边栏、导航、Vite 配置
    theme/
      index.ts         # 注册 Web Components、主题入口
      custom.css       # 站点级样式
  components/          # 组件文档（按分类）
  examples/            # 示例集合
  guide/               # 指南：安装、主题、最佳实践等
  index.md             # 首页
  package.json         # 文档站运行脚本
```

## Web Components 注册

为在文档中直接使用自定义元素（`<ldesign-*>`），我们在主题入口注册了 Stencil 组件：

```ts
// docs/.vitepress/theme/index.ts（已存在）
import DefaultTheme from 'vitepress/theme'
import { defineCustomElements } from '@ldesign/webcomponent/loader'

export default {
  extends: DefaultTheme,
  async enhanceApp() {
    if (typeof window !== 'undefined') {
      defineCustomElements(window)
    }
  }
}
```

## 新增页面

1) 在对应分类目录新增 Markdown 文件，例如：
- 组件：`docs/components/time-picker.md`
- 示例：`docs/examples/time-picker.md`
- 指南：`docs/guide/vitepress.md`（当前文件）

2) 在侧边栏中登记链接：编辑 `docs/.vitepress/config.ts`，在 `themeConfig.sidebar` 中添加：

```ts
sidebar: {
  '/guide/': [
    {
      text: '进阶',
      items: [
        { text: 'VitePress 文档使用', link: '/guide/vitepress' },
      ]
    }
  ]
}
```

保存后开发服务器会自动热更新。

## Demo 编写建议

- 直接在 Markdown 中书写原生 HTML 示例：

```html
<div class="demo-block">
  <ldesign-time-picker placeholder="选择时间"></ldesign-time-picker>
</div>
```

- 若需要脚本交互，可使用 `<script>` 内联或添加 `<script setup>` 的 Vue 示例（VitePress 支持）：

```html
<div class="demo-block">
  <ldesign-button id="btn" type="primary">点击</ldesign-button>
</div>
<script>
  document.getElementById('btn')?.addEventListener('click', () => alert('hello'))
</script>
```

## 部署

构建后会在 `docs/.vitepress/dist` 生成静态站点，可部署到任意静态托管平台（GitHub Pages、Netlify、Vercel 等）。

- GitHub Actions（示意）：
  - 基于当前仓库 `.github/workflows/docs.yml`（若存在）配置，将 `docs` 工作空间构建并发布。

## 常见问题

- 组件未渲染/无样式：确认 `docs/.vitepress/theme/index.ts` 中已调用 `defineCustomElements` 且浏览器控制台无错误。
- 图片或静态资源 404：确保引用路径以 `/` 开头或使用相对路径，并检查 `base` 配置。
- 自定义元素在代码块中被执行：为展示代码片段请使用三引号代码块，避免被当作 HTML 渲染。

## 交互 Demo 最佳实践

- 聚焦与键盘无障碍：若 Demo 需要键盘操作，确保交互区域可聚焦（tabindex="0"）。本库的拖拽容器 `ldesign-draggable` 已默认可聚焦并支持方向键/快捷键。
- 脚本隔离：将示例脚本放入 `<script>` 或 `<script setup>`，避免在 Markdown 渲染阶段直接执行。
- 样式范围化：将示例样式写在 `demo-block` 内部或 `docs/.vitepress/theme/custom.css`，避免污染全站。
- 资源体积：示例图片尽量使用合适尺寸与 Web 格式（如 WebP/AVIF），或使用占位图/CDN，减少页面负载。

## 性能优化小贴士

- 本地搜索：已启用 VitePress 本地搜索，可快速定位文档。
- 依赖优化：在 `docs/.vitepress/config.ts` 的 `optimizeDeps.include` 中显式包含 Web Components Loader，确保开发体验与 HMR 稳定。
- 构建体积：通过 `build.chunkSizeWarningLimit` 放宽警告阈值，同时关注示例用图与第三方依赖体积。
