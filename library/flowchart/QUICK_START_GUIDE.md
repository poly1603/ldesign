# 🚀 快速开始指南 - 高级连线系统

## 5分钟上手

### 第1步：查看示例

打开演示文件查看效果：

```bash
cd library/flowchart/example
# 使用浏览器打开
open advanced-connection-demo.html
```

你会看到：
- ✅ 连线从节点边框中间开始/结束
- ✅ 最少的折点，路径清晰
- ✅ 菱形节点每个角只有一根线
- ✅ 拖拽折点调整路径（启用交互后）

### 第2步：基础使用

创建一个简单的流程图：

```typescript
import { FlowChart } from 'flowchart-approval';

// 创建流程图实例
const flowChart = new FlowChart({
  container: '#flowchart-container',
  autoLayout: false,
  enableZoom: true,
  enablePan: true
});

// 定义节点
const nodes = [
  { 
    id: '1', 
    type: 'start', 
    label: '开始', 
    position: { x: 200, y: 100 } 
  },
  { 
    id: '2', 
    type: 'condition', 
    label: '判断', 
    position: { x: 200, y: 200 } 
  },
  { 
    id: '3', 
    type: 'process', 
    label: '处理A', 
    position: { x: 100, y: 300 } 
  },
  { 
    id: '4', 
    type: 'process', 
    label: '处理B', 
    position: { x: 300, y: 300 } 
  },
  { 
    id: '5', 
    type: 'end', 
    label: '结束', 
    position: { x: 200, y: 400 } 
  }
];

// 定义连线
const edges = [
  { id: 'e1', source: '1', target: '2' },
  { id: 'e2', source: '2', target: '3', label: '是' },
  { id: 'e3', source: '2', target: '4', label: '否' },
  { id: 'e4', source: '3', target: '5' },
  { id: 'e5', source: '4', target: '5' }
];

// 加载并渲染
flowChart.load(nodes, edges);
```

**就这样！** 新的连线系统会自动：
- 为每个节点选择最佳连接点
- 计算最优路径（最少折点）
- 优化菱形节点的连接点分配

### 第3步：启用交互功能

如果你想让用户可以拖拽调整连线：

```typescript
// 获取渲染器
const renderer = flowChart.getRenderer();
const edgeRenderer = renderer.getEdgeRenderer();

// 设置SVG元素（必需）
const svg = document.querySelector('#flowchart-container svg');
edgeRenderer.setSVGElement(svg);

// 启用交互功能
edgeRenderer.enableInteraction(true);
```

现在用户可以：
- **拖拽蓝色圆点**（折点）调整路径
- **拖拽绿色菱形**（连接点）改变连接位置
- **双击折点**删除

## 核心特性详解

### 1. 智能连接点

系统会根据节点类型和相对位置自动选择最佳连接点：

```
矩形节点：
    ↑ top
    |
← left  right →
    |
  ↓ bottom

菱形节点：
    ◇ top
   ╱ ╲
left◇ ◇right
   ╲ ╱
    ◇ bottom
```

### 2. 最少折点路由

系统会自动选择折点最少的路径：

```
理想情况（0个折点）：
[A] ────────→ [B]

标准情况（1个折点）：
[A] ───┐
       │
       └──→ [B]

回折情况（3个折点）：
[A] ───┐
       │
   ┌───┘
   │
   └──→ [B]
```

### 3. 菱形节点优化

每个角只连接一根线，避免重叠：

```
优化前（❌）:        优化后（✅）:
     ◇                  ◇
    ╱│╲                ╱ ╲
   ╱ │ ╲              ╱   ╲
  A  B  C            A     C
                            B
```

## HTML完整示例

```html
<!DOCTYPE html>
<html>
<head>
  <title>FlowChart Demo</title>
  <style>
    #flowchart-container {
      width: 100%;
      height: 600px;
      border: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div id="flowchart-container"></div>
  
  <script type="module">
    import { FlowChart } from './dist/flowchart.esm.js';
    
    const flowChart = new FlowChart({
      container: '#flowchart-container',
      autoLayout: false,
      enableZoom: true,
      enablePan: true,
      zoom: {
        initialScale: 0.8,
        centerOnInit: true
      }
    });
    
    const nodes = [
      { id: '1', type: 'start', label: '开始', position: { x: 200, y: 100 } },
      { id: '2', type: 'condition', label: '判断', position: { x: 200, y: 200 } },
      { id: '3', type: 'process', label: '处理A', position: { x: 100, y: 300 } },
      { id: '4', type: 'process', label: '处理B', position: { x: 300, y: 300 } },
      { id: '5', type: 'end', label: '结束', position: { x: 200, y: 400 } }
    ];
    
    const edges = [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '2', target: '3', label: '是' },
      { id: 'e3', source: '2', target: '4', label: '否' },
      { id: 'e4', source: '3', target: '5' },
      { id: 'e5', source: '4', target: '5' }
    ];
    
    flowChart.load(nodes, edges);
  </script>
</body>
</html>
```

## 常见问题

### Q: 连线不是从节点中间出发？

A: 确保节点的尺寸配置正确：

```typescript
// 默认配置
const DEFAULT_NODE_WIDTH = 120;
const DEFAULT_NODE_HEIGHT = 60;

// 如果你使用了自定义尺寸，需要同步更新
```

### Q: 如何禁用折点优化？

A: 使用传统的路由方式：

```typescript
// 使用直线或贝塞尔曲线
flowChart.addEdge({
  id: 'e1',
  source: '1',
  target: '2',
  style: {
    type: 'bezier'  // 或 'straight'
  }
});
```

### Q: 菱形节点的连接点被占满了怎么办？

A: 系统会自动选择最近的可用顶点。如果所有顶点都被占用，考虑：
1. 添加中间节点
2. 调整节点布局
3. 合并某些连线

### Q: 如何监听连线拖拽事件？

A: 在启用交互时设置回调：

```typescript
const edgeInteraction = new EdgeInteraction({
  onWaypointDrag: (edgeId, index, position) => {
    console.log('折点被拖动:', edgeId, index, position);
  },
  onAnchorDrag: (edgeId, isSource, position) => {
    console.log('锚点被拖动:', edgeId, isSource, position);
  }
});
```

## 性能建议

### 大规模图（>100个节点）

1. **禁用实时交互**
   ```typescript
   edgeRenderer.enableInteraction(false);
   ```

2. **使用虚拟化**
   只渲染可见区域的连线

3. **延迟渲染**
   ```typescript
   flowChart.load(nodes, edges, {
     lazyRender: true
   });
   ```

### 复杂路径优化

如果路径计算较慢，可以调整配置：

```typescript
const router = new OptimizedEdgeRouter({
  minDistance: 50,  // 增加最小距离
  gridSize: 20      // 增加网格尺寸
});
```

## 下一步

- 📖 阅读[完整文档](./ADVANCED_CONNECTION_SYSTEM.md)
- 🔧 查看[更新说明](./CONNECTION_SYSTEM_UPDATE.md)
- 🎯 尝试[示例演示](./example/advanced-connection-demo.html)

## 支持

遇到问题？
- 查看[FAQ](./ADVANCED_CONNECTION_SYSTEM.md#故障排除)
- 提交[Issue](https://github.com/your-repo/issues)
- 加入[讨论](https://github.com/your-repo/discussions)

---

Happy Coding! 🎉













