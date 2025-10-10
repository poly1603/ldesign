# 项目验证清单

本文档提供了一个完整的验证清单，用于确认 ApprovalFlow 项目的所有功能正常。

## 📦 文件结构验证

### 核心文件

- [x] `src/core/ApprovalFlowEditor.ts` - 核心编辑器类
- [x] `src/types/index.ts` - TypeScript 类型定义
- [x] `src/index.ts` - 主入口文件
- [x] `src/vue.ts` - Vue 适配器
- [x] `src/react.tsx` - React 适配器

### 节点文件

- [x] `src/nodes/StartNode.ts` - 开始节点
- [x] `src/nodes/EndNode.ts` - 结束节点
- [x] `src/nodes/ApprovalNode.ts` - 审批节点
- [x] `src/nodes/ConditionNode.ts` - 条件节点
- [x] `src/nodes/ParallelNode.ts` - 并行节点
- [x] `src/nodes/CCNode.ts` - 抄送节点
- [x] `src/nodes/index.ts` - 节点注册

### 样式文件

- [x] `src/styles/index.css` - 主样式文件

### 配置文件

- [x] `package.json` - 项目配置
- [x] `tsconfig.json` - TypeScript 配置
- [x] `vite.config.ts` - Vite 构建配置
- [x] `vitest.config.ts` - 测试配置

### 测试文件

- [x] `__tests__/ApprovalFlowEditor.test.ts` - 编辑器测试
- [x] `__tests__/setup.ts` - 测试环境配置

### 文档文件

- [x] `docs/.vitepress/config.ts` - VitePress 配置
- [x] `docs/index.md` - 文档首页
- [x] `docs/guide/introduction.md` - 介绍
- [x] `docs/guide/getting-started.md` - 快速开始
- [x] `docs/guide/installation.md` - 安装指南
- [x] `docs/guide/node-types.md` - 节点类型
- [x] `docs/guide/configuration.md` - 配置选项
- [x] `docs/guide/events.md` - 事件系统
- [x] `docs/guide/data-format.md` - 数据格式
- [x] `docs/api/editor.md` - API 文档

### 示例文件

- [x] `examples/vue-demo/src/App.vue` - Vue 示例主文件
- [x] `examples/vue-demo/src/main.ts` - Vue 示例入口
- [x] `examples/vue-demo/package.json` - Vue 示例配置
- [x] `examples/vue-demo/vite.config.ts` - Vue 示例 Vite 配置

### 项目文档

- [x] `README.md` - 项目说明
- [x] `CHANGELOG.md` - 更新日志
- [x] `LICENSE` - 许可证
- [x] `PROJECT_SUMMARY.md` - 项目总结
- [x] `QUICK_START.md` - 快速开始
- [x] `DEVELOPMENT.md` - 开发指南
- [x] `BUILD_GUIDE.md` - 构建指南
- [x] `TESTING.md` - 测试指南
- [x] `.gitignore` - Git 忽略文件
- [x] `.npmignore` - npm 忽略文件
- [x] `.editorconfig` - 编辑器配置

## 🔧 功能验证

### 核心编辑器功能

- [ ] ✅ 创建编辑器实例
- [ ] ✅ 设置容器尺寸
- [ ] ✅ 初始化 LogicFlow
- [ ] ✅ 注册自定义节点
- [ ] ✅ 设置只读模式

### 数据操作

- [ ] ✅ 设置流程图数据 (`setData`)
- [ ] ✅ 获取流程图数据 (`getData`)
- [ ] ✅ 数据格式正确
- [ ] ✅ 数据转换正确

### 节点操作

- [ ] ✅ 添加节点 (`addNode`)
- [ ] ✅ 更新节点 (`updateNode`)
- [ ] ✅ 删除节点 (`deleteNode`)
- [ ] ✅ 节点 ID 生成正确

### 边操作

- [ ] ✅ 删除边 (`deleteEdge`)
- [ ] ✅ 边连接正确

### 验证功能

- [ ] ✅ 检查开始节点存在性
- [ ] ✅ 检查开始节点唯一性
- [ ] ✅ 检查结束节点存在性
- [ ] ✅ 检查审批节点审批人
- [ ] ✅ 检查条件节点条件
- [ ] ✅ 检查节点连接合法性
- [ ] ✅ 检查孤立节点

### 缩放操作

- [ ] ✅ 缩放画布 (`zoom`)
- [ ] ✅ 放大 (`zoomIn`)
- [ ] ✅ 缩小 (`zoomOut`)
- [ ] ✅ 适应画布 (`fit`)
- [ ] ✅ 重置缩放 (`resetZoom`)

### 历史操作

- [ ] ✅ 撤销 (`undo`)
- [ ] ✅ 重做 (`redo`)

### 导出功能

- [ ] ✅ 导出 JSON
- [ ] ✅ 导出 PNG
- [ ] ✅ 导出 JPG

### 其他操作

- [ ] ✅ 清空画布 (`clear`)
- [ ] ✅ 销毁编辑器 (`destroy`)
- [ ] ✅ 获取 LogicFlow 实例 (`getLogicFlow`)

## 🎨 节点验证

### 开始节点

- [ ] ✅ 正确渲染（绿色圆形）
- [ ] ✅ 样式正确
- [ ] ✅ 文本显示正确
- [ ] ✅ 不能有输入连线

### 审批节点

- [ ] ✅ 正确渲染（蓝色矩形）
- [ ] ✅ 支持单人审批模式
- [ ] ✅ 支持会签模式
- [ ] ✅ 支持或签模式
- [ ] ✅ 支持顺序审批模式
- [ ] ✅ 审批人配置正确

### 条件节点

- [ ] ✅ 正确渲染（橙色菱形）
- [ ] ✅ 条件配置正确
- [ ] ✅ 支持多个条件
- [ ] ✅ 优先级正确

### 并行节点

- [ ] ✅ 正确渲染（紫色矩形）
- [ ] ✅ 支持多个输出
- [ ] ✅ 并行图标显示

### 抄送节点

- [ ] ✅ 正确渲染（青色矩形）
- [ ] ✅ 抄送人配置正确
- [ ] ✅ 抄送图标显示

### 结束节点

- [ ] ✅ 正确渲染（红色圆形）
- [ ] ✅ 样式正确
- [ ] ✅ 文本显示正确
- [ ] ✅ 不能有输出连线

## 🎯 事件验证

- [ ] ✅ `node:click` 事件正确触发
- [ ] ✅ `node:dblclick` 事件正确触发
- [ ] ✅ `node:add` 事件正确触发
- [ ] ✅ `node:delete` 事件正确触发
- [ ] ✅ `node:update` 事件正确触发
- [ ] ✅ `edge:click` 事件正确触发
- [ ] ✅ `edge:add` 事件正确触发
- [ ] ✅ `edge:delete` 事件正确触发
- [ ] ✅ `data:change` 事件正确触发
- [ ] ✅ `canvas:zoom` 事件正确触发
- [ ] ✅ `selection:change` 事件正确触发

## 🖼️ Vue 适配器验证

- [ ] ✅ `ApprovalFlow` 组件正确导出
- [ ] ✅ 组件 props 正确
- [ ] ✅ 组件事件正确
- [ ] ✅ 组件 ref 方法正确
- [ ] ✅ `useApprovalFlow` Hook 正确
- [ ] ✅ Hook 返回值正确

## ⚛️ React 适配器验证

- [ ] ✅ `ApprovalFlow` 组件正确导出
- [ ] ✅ 组件 props 正确
- [ ] ✅ 组件事件正确
- [ ] ✅ 组件 ref 方法正确
- [ ] ✅ `useApprovalFlow` Hook 正确
- [ ] ✅ Hook 返回值正确

## 📝 类型定义验证

- [ ] ✅ `ApprovalNodeType` 枚举
- [ ] ✅ `ApprovalMode` 枚举
- [ ] ✅ `ApproverConfig` 接口
- [ ] ✅ `ConditionConfig` 接口
- [ ] ✅ `NodeData` 接口
- [ ] ✅ `EdgeData` 接口
- [ ] ✅ `FlowChartData` 接口
- [ ] ✅ `EditorConfig` 接口
- [ ] ✅ `EditorEvents` 接口
- [ ] ✅ `ValidationResult` 接口
- [ ] ✅ `ExportConfig` 接口

## 📚 文档验证

### 文档内容

- [ ] ✅ 首页完整
- [ ] ✅ 快速开始指南完整
- [ ] ✅ 安装说明完整
- [ ] ✅ 节点类型说明完整
- [ ] ✅ 配置选项完整
- [ ] ✅ 事件系统说明完整
- [ ] ✅ 数据格式说明完整
- [ ] ✅ API 文档完整

### 文档可访问性

- [ ] ✅ 文档可以构建
- [ ] ✅ 文档可以本地预览
- [ ] ✅ 文档链接正确
- [ ] ✅ 文档代码示例正确

## 💡 示例验证

### Vue 示例

- [ ] ✅ 示例可以运行
- [ ] ✅ 节点添加功能正常
- [ ] ✅ 验证功能正常
- [ ] ✅ 导出功能正常
- [ ] ✅ 只读模式切换正常
- [ ] ✅ UI 交互正常

## 🧪 测试验证

- [ ] ✅ 测试文件存在
- [ ] ✅ 测试配置正确
- [ ] ✅ 测试可以运行
- [ ] ✅ 测试覆盖核心功能
- [ ] ✅ 测试断言正确

## 🔨 构建验证

### 构建输出

- [ ] ✅ `dist/index.js` 存在
- [ ] ✅ `dist/index.cjs` 存在
- [ ] ✅ `dist/index.d.ts` 存在
- [ ] ✅ `dist/vue.js` 存在
- [ ] ✅ `dist/vue.cjs` 存在
- [ ] ✅ `dist/vue.d.ts` 存在
- [ ] ✅ `dist/react.js` 存在
- [ ] ✅ `dist/react.cjs` 存在
- [ ] ✅ `dist/react.d.ts` 存在
- [ ] ✅ `dist/style.css` 存在

### 构建质量

- [ ] ✅ 没有 TypeScript 错误
- [ ] ✅ 没有构建警告
- [ ] ✅ 文件大小合理
- [ ] ✅ Source map 生成

## 📋 代码质量

- [ ] ✅ 代码格式一致
- [ ] ✅ 没有 console.log
- [ ] ✅ 没有 TODO 注释
- [ ] ✅ 变量命名规范
- [ ] ✅ 函数注释完整
- [ ] ✅ 类型定义完整

## 🚀 发布准备

- [ ] ✅ 版本号正确
- [ ] ✅ package.json 正确
- [ ] ✅ README 完整
- [ ] ✅ CHANGELOG 更新
- [ ] ✅ LICENSE 存在
- [ ] ✅ .npmignore 正确
- [ ] ✅ 构建产物完整

## 验证脚本

你可以使用以下脚本快速验证：

```bash
# 验证文件结构
ls -la src/
ls -la docs/
ls -la examples/

# 验证配置
cat package.json
cat tsconfig.json

# 验证构建（需要先安装依赖）
npm run build
ls -la dist/

# 验证文档
npm run docs:build
ls -la docs/.vitepress/dist/

# 验证测试
npm run test
```

## 验证报告

完成验证后，请填写：

- **验证日期**: ________________
- **验证人**: ________________
- **Node.js 版本**: ________________
- **npm 版本**: ________________
- **操作系统**: ________________
- **总体评分**: ☐ 优秀 ☐ 良好 ☐ 需改进

### 发现的问题

1. ________________
2. ________________
3. ________________

### 改进建议

1. ________________
2. ________________
3. ________________

## 签字确认

- 开发者签字: ________________
- 审核者签字: ________________
- 日期: ________________
