# 支持的框架与用法

本工具旨在“简单、智能、可扩展”，在保持直观结构的同时，尽可能自动化。除 TypeScript、Vue2/3、React 外，新增支持：

- Svelte（@sveltejs/rollup-plugin-svelte）
- Solid（rollup-plugin-solid）
- Preact（esbuild jsxImportSource: preact）
- Lit / Web Components（lit）
- Angular（基础支持，推荐使用 ng-packagr 获取完整特性）

## 快速开始（零配置）

示例项目零安装（仅需 @ldesign/builder）：

```bash
# 全量示例
node bin/ldesign-builder.js examples

# 分别验证新增框架
node bin/ldesign-builder.js examples --filter svelte-components
node bin/ldesign-builder.js examples --filter solid-components
node bin/ldesign-builder.js examples --filter preact-components
node bin/ldesign-builder.js examples --filter lit-components
node bin/ldesign-builder.js examples --filter angular-lib
```

大多数情况下，直接执行构建即可：

```bash
ldesign-builder build
```

工具会自动检测库类型，并选择合适策略与插件。若自动检测不准确，可在配置中指定：

```ts
import { defineConfig } from '@ldesign/builder'
import { LibraryType } from '@ldesign/builder'

export default defineConfig({
  libraryType: LibraryType.SVELTE, // 或 SOLID/REACT/PREACT/LIT/ANGULAR 等
})
```

## 可选依赖（按需安装）

只有在对应框架被使用时才需要安装以下插件：

- Svelte: npm i -D @sveltejs/rollup-plugin-svelte
- Solid: npm i -D rollup-plugin-solid
- Preact: 无需额外插件（使用 rollup-plugin-esbuild 自动处理 JSX），建议安装 preact
- Lit: 无需额外插件（使用 esbuild + typescript），建议安装 lit
- Angular（基础）: 无需额外插件（使用 esbuild + typescript），建议安装 @angular/core @angular/common

以上插件会通过动态导入，仅在使用到时加载；未安装时会给出明确的提示。

## 输出结构（统一约定）

- es/: ESM，保留模块结构
- lib/: CJS，保留模块结构
- dist/: UMD（单文件，可选）

## 注意事项

- Angular: 本工具提供最小打包能力；若需要 AOT、Ivy 与 ngc 等完整特性，推荐使用 ng-packagr。
- Svelte 的 .svelte 声明文件（.d.ts）生成涉及额外流程，当前版本默认仅为 TS/JS 模块生成声明文件。
- Solid/Preact 默认外部化核心运行时（solid-js / preact），可在 external 中自定义。

