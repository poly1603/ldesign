# 安装和使用指南

## 📦 安装步骤

### 1. 安装依赖

在项目根目录下运行：

```bash
npm install
```

这将安装所有必需的开发依赖：
- TypeScript
- Rollup 及相关插件
- 类型定义文件

### 2. 构建项目

```bash
npm run build
```

构建完成后，将在 `dist` 目录下生成以下文件：
- `flowchart.cjs.js` - CommonJS 格式
- `flowchart.esm.js` - ES Module 格式
- `flowchart.umd.js` - UMD 格式（可直接在浏览器中使用）
- `flowchart.d.ts` - TypeScript 类型定义文件

### 3. 开发模式（推荐：Vite 实时预览）

使用 Vite 开发服务器，获得极速的开发体验：

```bash
# 首次使用需要安装 example 依赖
npm run example:install

# 启动 Vite 开发服务器
npm run example:dev
```

这将启动开发服务器并自动打开浏览器，你可以：
- ⚡ 修改 `src` 源码后立即看到效果
- 🔥 无需重新构建，HMR 热更新
- 🎯 在真实浏览器环境中开发调试

**传统方式**（Rollup 监听模式）：

```bash
npm run dev
```

这将启动监听模式，代码修改后自动重新构建。

## 🚀 使用方法

### 方法一：在 Node.js 项目中使用

1. 将构建后的文件复制到你的项目中
2. 在代码中引入：

```typescript
import { FlowChart, NodeType, NodeStatus } from './path/to/flowchart.esm.js';
```

### 方法二：直接在浏览器中使用

1. 在 HTML 中引入 UMD 版本：

```html
<script src="path/to/flowchart.umd.js"></script>
```

2. 使用全局变量 `FlowChart`：

```javascript
const flowChart = new FlowChart.FlowChart({
  container: '#container'
});
```

### 方法三：查看示例

1. 确保已构建项目（运行 `npm run build`）
2. 在浏览器中打开 `example/index.html`
3. 查看三个不同的示例流程图

## 📝 基础示例

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    #flowchart {
      width: 100%;
      height: 600px;
    }
  </style>
</head>
<body>
  <div id="flowchart"></div>
  
  <script src="dist/flowchart.umd.js"></script>
  <script>
    // 创建流程图实例
    const flowChart = new FlowChart.FlowChart({
      container: '#flowchart',
      autoLayout: true,
      nodeGap: 80,
      levelGap: 120
    });
    
    // 定义节点
    const nodes = [
      {
        id: 'start',
        type: FlowChart.NodeType.START,
        label: '开始',
        position: { x: 0, y: 0 }
      },
      {
        id: 'process',
        type: FlowChart.NodeType.PROCESS,
        label: '处理',
        position: { x: 0, y: 100 }
      },
      {
        id: 'end',
        type: FlowChart.NodeType.END,
        label: '结束',
        position: { x: 0, y: 200 }
      }
    ];
    
    // 定义边
    const edges = [
      { id: 'e1', source: 'start', target: 'process' },
      { id: 'e2', source: 'process', target: 'end' }
    ];
    
    // 加载并渲染
    flowChart.load(nodes, edges);
  </script>
</body>
</html>
```

## 🔧 常见问题

### Q: 如何修改节点样式？

A: 在节点数据中添加 `style` 属性：

```javascript
{
  id: 'node1',
  type: NodeType.APPROVAL,
  label: '审批',
  position: { x: 0, y: 0 },
  style: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    textColor: '#0d47a1'
  }
}
```

### Q: 如何禁用自动布局？

A: 在配置中设置 `autoLayout: false`：

```javascript
const flowChart = new FlowChart({
  container: '#container',
  autoLayout: false
});
```

### Q: 如何导出流程图数据？

A: 使用 `toJSON()` 方法：

```javascript
const data = flowChart.toJSON();
console.log(JSON.stringify(data, null, 2));
```

### Q: 如何监听节点点击事件？

A: 在配置中添加回调函数：

```javascript
const flowChart = new FlowChart({
  container: '#container',
  onNodeClick: (node) => {
    console.log('点击了节点:', node.label);
  }
});
```

## 📚 更多资源

- 查看 [README.md](README.md) 了解完整的 API 文档
- 查看 [example/demo.js](example/demo.js) 了解更多示例代码
- 查看 [src](src) 目录了解源代码实现

## 🐛 报告问题

如果遇到问题，请提供以下信息：
1. 错误信息或截图
2. 浏览器版本
3. 使用的代码示例
4. 预期行为和实际行为

## 🎉 开始使用

现在你已经了解如何安装和使用这个插件了！开始创建你的审批流程图吧！

