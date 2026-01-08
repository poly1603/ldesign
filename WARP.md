# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 项目概览

LDesign 是一个基于 pnpm workspace 的大型设计系统 Monorepo，整体可以分成三大块：

- **核心基础能力（`packages/`）**：不依赖具体框架的工具和服务（engine、router、store、http、cache、i18n、auth、logger、tracker 等），是所有上层库的“地基”。
- **功能库（`libraries/`）**：面向业务/场景的高级组件或功能库（图表、表格、编辑器、媒体播放器、3D 查看器、Office 处理等），通常包含一个 **core 包** 加多个 **框架适配层**（Vue / React / Lit / Web Components）。
- **工具与应用（`tools/`、`apps/`）**：内部构建工具、启动器、CLI，以及示例/演示应用。

仓库架构采用 **Monorepo + Git 子模块**：

- 每个 package / library / tool 本质上都是一个 **独立 Git 仓库（submodule）**，有自己的配置、脚本和提交历史。
- 根仓库提供统一的 **pnpm workspace**、共享开发依赖，以及在 `scripts/*.ts` / `scripts/*.js` 中的编排脚本。
- 日常开发在根仓库完成，具体子模块按需切分分支、提交、推送，然后在根仓库更新 submodule 指针。

做非简单修改时，优先遵循：

- 能复用现有包（特别是 `packages/shared` 及其他核心包）就不要新造轮子。
- 框架相关逻辑放在各自的适配层，核心能力尽量保持与框架无关。

## 环境与初始化

**环境要求**（来自 `README.md` 和根 `package.json`）：

- Node.js `>= 18.0.0`
- pnpm `>= 8.0.0`（当前锁定为 `pnpm@9.15.9`）

**首次在根目录使用本仓库时**：

```bash
pnpm init            # 初始化并同步所有 Git submodule（并行拉取）
pnpm install         # 安装整个 workspace 依赖
pnpm dev             # 启动主示例应用（filter 到 ldesign-simple-app workspace）
```

如果 submodule 未初始化或状态异常，可使用：

```bash
pnpm sub:status      # 查看所有 submodule 状态
pnpm sub:update      # 更新所有 submodule
pnpm sub:sync        # 同步 submodule 配置
```

## 根目录常用命令

以下命令均在根 `package.json` 中定义，可以稳定使用。

### 项目管理与安装

```bash
pnpm init            # 通过 scripts/init-submodules.js --parallel 初始化所有 submodule
pnpm install         # 整个 workspace 的标准安装流程
pnpm install:fast    # 跳过部分可选依赖的快速安装（scripts/fast-install.js）
pnpm install:prod    # 仅安装生产依赖，使用 frozen lockfile
pnpm install:clean   # prune pnpm store 后重新安装
```

### 开发与预览

```bash
pnpm dev             # 启动主示例应用（workspace: ldesign-simple-app）
pnpm preview         # 预览已构建完成的主应用
```

**单包开发模式**（submodule 初始化完成后）：

```bash
cd libraries/chart/examples/vite-demo
pnpm install
pnpm dev

# 或在仓库根目录通过 filter：
pnpm --filter @ldesign/chart-core dev
pnpm --filter "@ldesign/chart*" build
```

同样的 `pnpm --filter <workspace>` 模式可以用于其他库和工具，只要对应 workspace 已存在。

### 构建与清理

根层构建由 `scripts/build-all.ts`（通过 `tsx` 运行）统一编排：

```bash
pnpm build           # 通过 build-all.ts 构建所有相关 workspace
pnpm build:clean     # 清理后重新构建（build-all.ts --clean）
pnpm build:verbose   # 构建时输出更详细日志（build-all.ts --verbose）
pnpm build:dry       # 构建流程 dry-run（不实际执行构建，build-all.ts --dry-run）
```

清理相关命令：

```bash
pnpm clean           # 通过 scripts/clean-all.js 清理 node_modules 与 dist
pnpm clean:dist      # 仅清理构建产物
pnpm clean:modules   # 仅清理 node_modules
```

### Lint 与代码风格

```bash
pnpm lint            # 对整个仓库运行 ESLint
pnpm lint:fix        # ESLint 并尝试自动修复
pnpm lint:all        # 对所有 workspace 递归执行其本地 lint 命令（pnpm -r lint）
pnpm lint:all:fix    # 递归执行所有 workspace 的 lint:fix
```

### pnpm 存储与缓存

```bash
pnpm cache:status    # 查看 pnpm store 状态
pnpm cache:prune     # 清理 pnpm store
```

## 测试与单测执行方式

根 `devDependencies` 包含 `@playwright/test`，并且项目规范中约定使用 **Vitest** + **Playwright** 作为主要测试工具；但**具体的 test 脚本定义在各个子模块内部**，根目录没有统一的 `test` 脚本。

当相关子模块已初始化后，一般情况是：

- 每个 package / library 在自己的 `package.json` 中定义了 `test`、`test:coverage` 或 E2E 相关脚本。
- `vitest.config.ts` 与 `playwright.config.*` 放在各自 package 内部。

常见用法（以 workspace 为单位；实际脚本名以对应 package 的 `package.json` 为准）：

```bash
# 针对某个 workspace 运行单元测试
pnpm --filter <workspace-name> test

# 运行带覆盖率的单测
pnpm --filter <workspace-name> test -- --coverage

# 直接用 Vitest 跑单个测试文件
pnpm --filter <workspace-name> vitest path/to/file.test.ts

# 只跑文件中的某个用例
pnpm --filter <workspace-name> vitest path/to/file.test.ts -t "测试名称子串"

# 若某个 workspace 定义了 Playwright E2E
pnpm --filter <workspace-name> test:e2e
# 或在该 package 目录下直接使用 Playwright CLI
npx playwright test path/to/spec.ts -g "场景名称"
```

如果某个 workspace 没有暴露上述脚本，应以该子模块本身的配置为准，直接调用其使用的测试工具（Vitest / Playwright 等）。

## Monorepo 与 Workspace 架构

从整体上看（具体实现散落在各个 submodule 仓库里，但都遵循相同约定）：

- `packages/` —— **核心基础能力层**
  - 共享工具：`shared`、`color`、`size`、`device`、`crypto` 等。
  - 运行时与框架基础：`engine`、`router`、`store`、`i18n`、`template` 等。
  - 服务类：`http`、`cache`、`logger`、`notification`、`tracker` 等。
  - 安全相关：`auth`、`permission`、`error` 等。

- `libraries/` —— **业务/功能组件层**
  - 按领域划分（图表、表格、表单、编辑器、Office 文档、媒体组件、低代码等）。
  - 每个功能库通常包含：
    - `packages/core`：与框架无关的领域核心逻辑；
    - `packages/vue` / `packages/react` / `packages/lit`：在各自框架上对 core 的包装。
  - 大部分库还会提供：
    - `examples/` 或 `playground/`：Vite 等驱动的可运行示例；
    - `test/`：该库自己的测试代码。

- `tools/` —— **工具与基础设施**
  - `builder/`：统一的库打包工具（`@ldesign/builder`）。
  - `launcher/`：应用/示例的启动与构建工具（`@ldesign/launcher`）。
  - `cli/`：命令行工具。
  - 其他：测试、性能监控、发布、文档生成、Git/Submodule 管理、依赖与环境管理等。

- `apps/` —— **实际应用与 Demo**
  - 包含各种示例应用，其中主示例应用通过根目录的 `pnpm dev` 暴露。

- `scripts/` —— **根级别脚本**
  - `init-submodules.js`：Submodule 初始化与同步（被 `pnpm init` 调用）。
  - `build-all.ts`：跨多个 workspace 的构建编排。
  - `clean-all.js`：清理 `node_modules` 与构建目录。
  - 其他辅助脚本。

### Git Submodule 作为边界

- 每个 package / library / tool 是一个独立 Git 仓库。
- 修改某个 submodule 的推荐流程：
  1. 确保该 submodule 已初始化，且在合适的分支上；
  2. 在 submodule 内修改代码、提交并推送；
  3. 回到根仓库，对该子目录执行 `git add <submodule-path>`，提交更新后的 submodule 指针。

Agent 在修改代码时，不要把 submodule 当作“普通文件夹”，它们可能有独立的 `tsconfig`、`eslint.config`、测试与发布流程。

## 构建/应用/库 的通用约定

这些约定来自 `.cursor/rules`，属于项目级别规则：

### 库构建：`@ldesign/builder`

- 所有需要打包成 npm 包的库 **必须** 使用 `@ldesign/builder`。
- 典型库的 `package.json` 结构类似：

```json
{
  "scripts": {
    "build": "ldesign-builder build",
    "build:watch": "ldesign-builder build --watch",
    "build:clean": "ldesign-builder clean && ldesign-builder build"
  },
  "devDependencies": {
    "@ldesign/builder": "workspace:*"
  }
}
```

- 构建配置通常放在 `builder.config.ts` 中，以 `src/index.ts` 为入口，输出多种格式（ESM / CJS / UMD），并开启 sourcemap 与类型声明。

### 应用/示例构建：`@ldesign/launcher`

- 应用类、示例、文档站等需要运行 dev server 的项目 **必须** 使用 `@ldesign/launcher`：

```json
{
  "scripts": {
    "dev": "ldesign-launcher dev",
    "build": "ldesign-launcher build",
    "preview": "ldesign-launcher preview",
    "serve": "ldesign-launcher serve"
  },
  "devDependencies": {
    "@ldesign/launcher": "workspace:*"
  }
}
```

- `launcher.config.ts` 负责配置 root、publicDir、build 输出目录、dev server 端口以及代理等。

新建或调整应用/库时，优先按照这些模式来配置，而不是自己重新搭建构建体系。

## 组件、样式与主题规范

这些约束主要由 `.cursor/rules` 定义，属于全局约定。

### Vue 组件组织方式

- 共享库中的 Vue 组件以 **TSX** 形式实现，并使用统一目录结构：

```text
components/
└── Button/                 # 组件目录（PascalCase）
    ├── index.ts            # 组件导出入口（必需）
    ├── Button.tsx          # 组件实现（TSX）
    ├── Button.less         # 组件样式（Less）
    ├── types.ts            # 类型定义
    ├── props.ts            # Props 定义（可选）
    ├── constants.ts        # 常量（可选）
    └── __tests__/          # 单元测试（推荐）
        └── Button.test.ts
```

关键要点：

- 目录名使用 **PascalCase**（如 `DatePicker`），主文件名与目录一致（`DatePicker.tsx`）。
- 必须提供 `index.ts`，统一转出组件与类型。
- 组件 `name` 统一以 `Ld` 作为前缀（如 `LdButton`）。
- Props / emits 需要完整类型定义和 JSDoc 注释，并合理设置默认值。

### 样式与主题

- 组件样式统一使用 **Less**，并且 **必须使用主题 CSS 变量**，不能直接写死颜色和尺寸。
- 主题变量定义集中在：
  - `themes/color.css`：颜色系统（主色、语义色、文本色、背景色、边框色等）；
  - `themes/size.css`：尺寸系统（间距、字号、圆角等）。

编写样式时：

- **禁止** 直接写 `#fff`、`14px` 这类硬编码值；
- **必须** 使用类似 `var(--color-primary-default)`、`var(--size-5)`、`var(--size-radius-md)`、`var(--size-font-base)` 等变量；
- 类名采用 `ld-` 前缀的 BEM 规范，例如 `ld-button`、`ld-button__content`、`ld-button--primary`；
- 如果需要适配暗色主题，应通过主题变量实现，而不是在组件内部写死颜色覆盖。

示例（概念示意）：

```css
.button {
  background: var(--color-primary-default);
  color: var(--color-text-inverse);
  padding: var(--size-5) var(--size-8);
  border-radius: var(--size-radius-md);
  font-size: var(--size-font-base);
}
```

## 代码质量与 TypeScript 规范

`.cursor/rules/code-quality.mdc` 对整个仓库的代码质量做了统一要求，生成或修改代码时需要遵守：

- **ESLint**
  - 基于 `@antfu/eslint-config`；
  - 所有代码必须通过 `pnpm lint`（通常在提交前还要执行 `pnpm lint:fix`）；
  - 避免未使用变量、`var`、随意的 `console.log` 与 `debugger`。

- **TypeScript**
  - 尽量使用强类型，避免 `any`（如确需使用应有清晰注释说明原因）；
  - 所有导出的函数/类/接口，都需要明确的类型签名和 JSDoc；
  - CI 中不接受 TypeScript 报错，视作阻断问题。

- **性能与内存**
  - 在热点路径优先采用高效数据结构（如 `Map`、`Set`、双向链表、LRU 缓存等）；
  - 避免重复的重计算，必要时采用缓存或 `computed`；
  - 定时器与事件监听要有清理逻辑（返回清理函数或在生命周期钩子里处理）；
  - 对缓存/管理类对象，优先使用有上限的结构（`maxSize` 等）而不是无限增长的 `Map`。

- **复用与结构**
  - 优先复用 `packages/shared` 等已有工具，而不是复制粘贴或轻微改名；
  - 模块保持单一职责，控制嵌套深度，使控制流尽量扁平化。

## 包级规范

`.cursor/rules/ldesign-package-standards.mdc` 规定了每个包应该的结构与质量基线：

- **目录结构**
  - `src/` 下通常包含 `core/`、`types/`、`utils/`，并提供统一入口 `index.ts`；
  - `tests/` 存放单测与集成测试；
  - `examples/` 提供可运行示例，`docs/` 可选地提供文档；
  - 非 trivial 的包一般会有本地 `eslint.config.js`、`tsconfig.json`、`vitest.config.ts`、`builder.config.ts` 等。

- **性能/内存约定**（尤其是 engine 类包）：
  - 缓存操作通常需要做到 O(1)，并支持 LRU / LFU / FIFO 等策略；
  - 事件系统使用优先级桶与监听器上限，提供自动清理机制；
  - 状态管理常用路径编译、浅比较等手段减少不必要计算。

- **类型与文档**
  - 所有公开 API 需要有显式类型，并通过 `export type` 暴露类型别名/接口；
  - 公共 API 的 JSDoc 要使用中文，并包含 `@param`、`@returns`、`@throws`、`@example` 等信息。

- **测试**
  - 目标覆盖率大约在 80%+（语句、分支、函数、行）；
  - 需要覆盖核心功能、边界情况以及错误路径。

新增包或对现有包做较大重构时，应尽量让结构与配置对齐这些标准。

## 语言偏好

项目规则中要求：与维护者沟通时应使用 **中文**。因此，在本仓库中生成用户可见的注释、文档、示例说明等内容时，应优先使用中文（代码标识符仍使用英文）。

## 未来 Warp 实例在本仓库的工作方式

- 优先使用根层脚本和 pnpm workspace 能力来处理构建、lint、开发，而不是直接绕过到底层工具（除非在具体 submodule 中已有更合适的脚本）。
- 在修改某个功能域（例如图表、3D viewer、player、image-editor 等）之前，先查看对应库的目录结构，遵循它已经采用的 TSX 组件组织方式、Less + 主题变量的写法。
- 新增或修改 API 时，要同时补全类型定义、中文 JSDoc，并考虑性能和内存约束。
- 对于“这段逻辑应该放在哪里”的问题，优先考虑放入 `packages/shared` 或最贴近业务领域的核心包，而不是直接写在应用代码里。
- 将每个 Git submodule 视为一个独立包，有自己的生命周期与发布流程，避免做跨边界的隐式耦合修改。
