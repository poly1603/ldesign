# 📚 FlowChart 2.0 示例项目

全新架构的示例和演示项目。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

然后访问 `http://localhost:5173`

## 📁 示例文件

### 1. `index.html` - 主示例页面
完整的编辑器示例，包含所有功能：
- ✅ 工具栏（放大/缩小/适应/居中）
- ✅ 节点拖拽
- ✅ 节点选择
- ✅ 撤销/重做
- ✅ 删除/清空
- ✅ 导出JSON

### 2. `basic-graph.html` - 基础图示例
使用核心 Graph API，不包含编辑器封装：
- Graph 实例创建
- 插件注册
- 节点和边的添加
- 事件监听

### 3. `viewer.html` - 只读查看器
只读模式的流程图查看：
- 缩放和平移
- 无编辑功能
- 轻量级

## 🎯 架构演示

### 使用编辑器（推荐）

```typescript
import { FlowChartEditor } from '../src/index-new';

const editor = new FlowChartEditor({
  container: '#app',
  showToolbar: true,
  enableDrag: true,
  enableSelect: true,
  enableHistory: true,
});

editor.load({ nodes, edges });
```

### 使用核心 API

```typescript
import { Graph, DragNodePlugin, SelectNodePlugin } from '../src/index-new';

const graph = new Graph({ container: '#app' });
graph.use(new DragNodePlugin());
graph.use(new SelectNodePlugin());

graph.addNode({ ... });
graph.addEdge({ ... });
```

## 📊 测试数据

- `workflows/simple-approval.json` - 简单审批流程
- `workflows/condition-branch.json` - 条件分支流程
- `workflows/loop-process.json` - 循环流程
- `workflow-data.json` - 完整的审批流程

## 🔧 开发说明

示例项目通过 Vite 配置的 alias 直接引用 `src/` 源码：

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src')
    }
  }
}
```

这意味着：
- 修改 `src/` 源码会立即反映在示例中
- 无需重新构建
- 实时热更新

## 📖 相关文档

- [README.md](../README-NEW.md) - 主文档
- [ARCHITECTURE.md](../ARCHITECTURE-NEW.md) - 架构设计
- [MIGRATION-GUIDE.md](../MIGRATION-GUIDE.md) - 迁移指南
