# Examples 使用说明

本目录提供基于当前包的程序化 API 的示例项目，完全不依赖 Vite CLI（无需安装 vite 命令）。

示例列表：
- `vue3/` - 使用 `createProject` + `startDev`/`buildProject`
- `vue2/` - 使用 `createProject` + `startDev`/`buildProject`
- `react/` - 使用 `createProject` + `startDev`/`buildProject`

运行前提：
- 先在 `packages/launcher` 目录执行一次构建，生成 `dist/`
  - `npm run build`（使用 tsup 打包）

运行方式（以 vue3 为例）：
- 开发模式：
  - `node packages/launcher/examples/vue3/dev.mjs`
- 构建：
  - `node packages/launcher/examples/vue3/build.mjs`

说明：
- dev.mjs 会自动在当前示例目录下创建 `app-vue3` 项目（如已存在可覆盖），然后启动开发服务器
- build.mjs 会确保项目存在后进行构建，并输出构建统计信息
- 所有脚本均通过 `../../dist/index.js` 引用当前包的程序化 API，无需安装 vite CLI
