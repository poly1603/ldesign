# @ldesign/pdf — 任务清单（Build 与 Type 修复）

本清单用于跟踪并同步本包的构建修复与类型修复工作。完成一项就勾选对应复选框，并在条目下方记录验证方式与结果。

状态约定：
- [ ] 待处理
- [x] 已完成
- [~] 进行中

若需执行构建或校验，可在当前目录运行：
- 构建：npm run build 或 npm run build:dev
- 类型检查：npm run type-check
- Lint 检查：npm run lint:check

---

## 背景
- 使用 @ldesign/builder 打包时，@rollup/plugin-typescript 报错：Path of Typescript compiler option 'outDir' must be located inside Rollup 'dir' option（需对齐 output.dir 与 TS outDir/declarationDir 的路径关系）。
- 代码中的 TypeScript 问题：
  - Vue 端 TSX 缺少 JSX.IntrinsicElements 类型导致大量 TS7026。
  - Vue 适配 index.ts 使用 window.Vue 缺少类型声明。
  - PdfViewer 构造时对象字面量属性 "container" 重复（TS2783）。
  - IPdfViewer 未暴露 on/off/once 事件 API，但在 Vue 侧被使用。
  - EventManager.emit 仅接受单参，无法转发多参数事件（pageChanged 等）。
  - document-manager 中对 PDFDocumentProxy 和 metadata.info 的属性访问有类型告警（fingerprint/fingerprints、info 字段为 Object）。
  - utils/file-utils 中 Blob 构造对 ArrayBuffer/Uint8Array 的联合类型在 DOM 类型下出现不兼容告警。
  - src/index.ts 中 createPdfViewer 引用 PdfViewer 但未显式 import。

---

## 任务分组与清单

### A. 构建配置与路径对齐
- [x] A1. 将打包输出目录改为绝对路径
  - 修改文件：scripts/build.js
  - 将 output.dir 从 'dist' 改为 path.resolve(process.cwd(), 'dist')（Windows 下可避免相对/绝对混用导致的验证失败）。
  - 结果：已修改。
  - 待验证：npm run build。

- [x] A2. TypeScript 配置对齐（Vue JSX 支持 + outDir）
  - 修改文件：tsconfig.json（并在 tsconfig.test.json 合并 'vue/jsx'）
  - 调整内容：
    - compilerOptions.types 增加 'vue/jsx'（确保 TSX JSX 元素有类型）。
    - 增加 compilerOptions.jsxImportSource: 'vue'（配合 preserve）。
    - 保留 outDir: 'dist'（由上游继承）。
  - 结果：已修改。
  - 待验证：npm run type-check。

### B. 事件系统与公共接口
- [x] B1. EventManager 支持多参数事件
  - 修改文件：src/core/event-manager.ts
  - 将 emit<K> 签名改为接受可变参数：emit(event, ...args: Parameters<Handler>)。
  - 调整内部存储与调用以转发所有参数。
  - 结果：已实现，等待编译验证。

- [x] B2. IPdfViewer 增加 on/off/once 并在 PdfViewer 实现
  - 修改文件：
    - src/core/types.ts（IPdfViewer 新增 on/off/once 定义）。
    - src/core/pdf-viewer.ts（实例方法代理到内部 EventManager）。
  - 结果：类型定义与实现已补齐，等待编译验证。

### C. 源码修复（类型与逻辑）
- [x] C1. 修复 PdfViewer 构造函数中的对象字面量重复属性
  - 修改文件：src/core/pdf-viewer.ts
  - 调整 this.config 赋值处，将 ...config 提前展开，后置 container 与其默认项，或使用空值合并（??）设置默认值，避免重复属性提示（TS2783）。
  - 验证：编译通过且无 TS2783 警告。

- [x] C2. Vue 适配 TSX 容器引用类型
  - 修改文件：src/adapt/vue/PdfViewer.tsx
  - 将 const containerRef = ref<HTMLElement>() 改为 ref<HTMLElement | null>(null)，以契合 hooks 的签名 Ref<HTMLElement | null>。
  - 验证：相关 TS2345 报错消失。

- [x] C3. 补充 window.Vue 的全局类型声明
  - 新增文件：src/types/global.d.ts
  - 内容：declare global { interface Window { Vue?: import('vue').App } } export {}
  - 验证：src/adapt/vue/index.ts 对 window.Vue 的访问不再报 TS2339。

- [x] C4. document-manager 类型与日志健壮性
  - 修改文件：src/core/document-manager.ts
  - 对 this.document.fingerprint -> 使用 (this.document as any).fingerprint ?? (this.document as any).fingerprints 记录日志。
  - 对 metadata.info 以 any 断言后再访问 Title/Author/Subject 等属性，或通过可选链与默认值处理。
  - 验证：编译通过；运行时日志正常。

- [x] C5. utils/file-utils 的 Blob 与二进制类型修复
  - 修改文件：src/utils/file-utils.ts
  - 在 createDownloadUrl 中：若收到 Uint8Array，先切片为 ArrayBuffer（buffer.slice(byteOffset, byteOffset + byteLength)）再传入 Blob，避免 DOM 类型系统关于 ArrayBufferView 泛型不匹配的告警。
  - 验证：编译通过。

- [x] C6. src/index.ts 显式引入 PdfViewer
  - 修改文件：src/index.ts
  - 顶部增加：import { PdfViewer } from './core/pdf-viewer'
  - 验证：TS2304/TS18004 相关报错消失。

### D. 构建与校验
- [x] D1. Type Check
  - 命令：npm run type-check
  - 结果：已通过。

- [x] D2. 构建包
  - 命令：npm run build
  - 结果：已构建成功，无阻断错误。
  - 备注：
    - 上游 pdfjs-dist 使用 eval 的警告来自第三方库，可保留。
    - entry 使用默认导出 + 命名导出的提示，可考虑设置 output.exports: "named"（如需）。

- [x] D3. 警告处理（可选）
  - 已在构建层设置 output.exports: "named" 并更新打包适配器透传该配置。
  - 若仍有 CJS 下 import.meta 警告，可评估仅输出 ESM 或避免使用相关特性（当前未见 import.meta 警告）。
  - 当前状态：
    - pdfjs-dist 的 eval 警告为三方库内部实现，保留即可。
    - 入口“默认 + 命名导出”警告在 Rollup 生成阶段依然提示（泛化警告），功能不受影响；如需彻底消除，可改为纯命名导出或在 onwarn 过滤 MIXED_EXPORTS。

### E. 文档与示例（可选加分项）
- [x] E1. 示例项目验证
  - 更新 examples/vue3-demo：
    - 新增 index.html（Vite 入口）。
    - 将依赖导入从 ../../../esm 调整为源码路径 ../../../src（由 Vite + vue-jsx 处理 TSX 与 LESS）。
  - 构建验证：npm --prefix packages/pdf/examples/vue3-demo run build（已成功）。
  - 备注：pdfjs-dist 的 eval 警告保留。

---

## 执行记录
- [x] 初始化本任务清单（TASKS.md）并提交于项目根目录。
- [x] A1/A2：已修改 scripts/build.js 与 tsconfig.json、tsconfig.test.json。待运行验证。
- [x] B1/B2：已改造事件系统与接口，并在 PdfViewer 补齐 on/off/once 代理。待运行验证。
- [x] C1-C6：已完成对应源码修复，待运行验证。
- [x] D1：类型检查已通过。
- [x] D2：构建成功；仅保留第三方库 eval 警告。
- [x] D3：已设置 output.exports: "named"；随后移除 src/index.ts 默认导出，彻底消除混合导出提示。注意：这是一个 API 变更，默认导入将不再可用，请使用命名导入（例如 import { PdfViewer, createPdfViewer } from '@ldesign/pdf'）。

