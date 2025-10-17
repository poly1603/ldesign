# ⚡ 快速开始指南

## 🎯 开发模式（推荐）

使用 Vite + HMR 实现极速开发体验！

### 第一步：安装依赖

```bash
# 安装主项目依赖
npm install

# 安装 example 依赖
npm run example:install
```

### 第二步：启动开发服务器

```bash
npm run example:dev
```

浏览器会自动打开 `http://localhost:3000`，你会看到三个精美的示例流程图。

### 第三步：开始开发

1. **打开源码文件**
   ```
   src/FlowChart.ts    - 核心类
   src/Renderer.ts     - 渲染器
   src/Layout.ts       - 布局引擎
   src/Node.ts         - 节点类
   src/Edge.ts         - 边类
   ```

2. **修改代码**
   - 比如修改节点的默认样式
   - 添加新的节点类型
   - 优化布局算法

3. **保存文件**
   - Vite 会立即检测到变化
   - 浏览器自动刷新
   - 立即看到效果！⚡

### 第四步：测试功能

在浏览器中：
- 点击「加载示例」按钮查看不同流程图
- 点击节点和连线查看交互效果
- 使用「模拟审批」功能测试状态变化
- 使用「导出JSON」查看数据结构

## 📝 示例：添加一个新节点样式

### 1. 打开 `src/FlowChart.ts`

找到 `getDefaultNodeStyles()` 方法：

```typescript
private getDefaultNodeStyles(): Record<NodeType, any> {
  return {
    [NodeType.APPROVAL]: {
      backgroundColor: '#fff3cd',
      borderColor: '#ffc107',
      borderWidth: 2,
      textColor: '#856404',
      fontSize: 14,
      borderRadius: 4
    },
    // ... 其他样式
  };
}
```

### 2. 修改样式

```typescript
[NodeType.APPROVAL]: {
  backgroundColor: '#e3f2fd',  // 改成蓝色背景
  borderColor: '#2196f3',      // 改成蓝色边框
  borderWidth: 3,               // 加粗边框
  textColor: '#0d47a1',         // 深蓝色文字
  fontSize: 16,                 // 放大字体
  borderRadius: 8               // 更圆润
},
```

### 3. 保存文件

浏览器立即刷新，你会看到审批节点的新样式！✨

## 🎨 开发技巧

### 1. 使用浏览器开发者工具

```javascript
// 在控制台中访问全局变量（example/demo.js 中定义）
window.flowChart  // 当前流程图实例

// 调试
console.log(window.flowChart.getAllNodes());
console.log(window.flowChart.toJSON());
```

### 2. 修改示例代码

编辑 `example/demo.js`：

```javascript
// 添加自定义测试
window.testCustomFeature = function() {
  const chart = window.flowChart;
  // 你的测试代码
  console.log('测试自定义功能');
};
```

在浏览器控制台调用：
```javascript
testCustomFeature();
```

### 3. 查看实时日志

修改源码时添加日志：

```typescript
console.log('🔍 调试信息:', data);
```

保存后立即在浏览器控制台看到输出。

## 🚀 常见开发场景

### 场景1：添加新的节点类型

1. 在 `src/types.ts` 添加新类型：
   ```typescript
   export enum NodeType {
     // ... 现有类型
     CUSTOM = 'custom'  // 新增
   }
   ```

2. 在 `src/FlowChart.ts` 添加样式：
   ```typescript
   [NodeType.CUSTOM]: {
     backgroundColor: '#your-color',
     // ...
   }
   ```

3. 在 `example/demo.js` 测试：
   ```javascript
   {
     id: 'custom-node',
     type: NodeType.CUSTOM,
     label: '自定义节点',
     position: { x: 0, y: 0 }
   }
   ```

### 场景2：修改渲染逻辑

编辑 `src/Renderer.ts`：

```typescript
private createNodeShape(...) {
  // 修改节点绘制逻辑
  // 保存后立即看到效果
}
```

### 场景3：优化布局算法

编辑 `src/Layout.ts`：

```typescript
private layoutByLevels(levels: Map<number, FlowNode[]>): void {
  // 调整布局参数
  // 实时预览布局效果
}
```

## 📦 构建发布

开发完成后，构建正式版本：

```bash
npm run build
```

生成的文件在 `dist` 目录：
- `flowchart.cjs.js` - 用于 Node.js
- `flowchart.esm.js` - 用于现代打包工具
- `flowchart.umd.js` - 用于浏览器直接引用

## 🎯 完整开发流程

```bash
# 1. 克隆/初始化项目
npm install
npm run example:install

# 2. 启动开发服务器
npm run example:dev

# 3. 开发（编辑 src 目录）
# ... 修改代码，保存，浏览器自动刷新 ...

# 4. 构建
npm run build

# 5. 测试构建产物（可选）
npm run example:build
```

## 💡 提示

- ✅ 修改 `src` 下的 TypeScript 文件会触发 HMR
- ✅ 修改 `example/demo.js` 会自动刷新页面
- ✅ 修改 `example/index.html` 会自动刷新页面
- ✅ 打开浏览器开发者工具可以看到详细日志
- ✅ 使用 `console.log` 在源码中添加调试信息

## 🎉 享受开发！

现在你已经掌握了快速开发的技巧，开始创建你的审批流程图功能吧！

有问题？查看：
- [README.md](README.md) - 完整 API 文档
- [example/README.md](example/README.md) - 示例项目说明
- [INSTALL.md](INSTALL.md) - 安装指南





