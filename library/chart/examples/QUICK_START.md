# 🚀 快速启动示例项目

## 方式一：使用 npm/pnpm（推荐）

### Vue 3 示例

```bash
# 进入 Vue 示例目录
cd examples/vue-example

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 浏览器访问
# http://localhost:3000
```

### React 示例

```bash
# 进入 React 示例目录
cd examples/react-example

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 浏览器访问
# http://localhost:3001
```

---

## 方式二：同时启动两个示例

### 在项目根目录执行

**Terminal 1** (Vue):
```bash
cd library/chart/examples/vue-example && pnpm install && pnpm dev
```

**Terminal 2** (React):
```bash
cd library/chart/examples/react-example && pnpm install && pnpm dev
```

然后：
- Vue 示例: http://localhost:3000
- React 示例: http://localhost:3001

---

## 📱 使用指南

### 启动后你会看到

1. **6 个基础图表**
   - 折线图、柱状图、饼图
   - 多系列图、散点图、雷达图

2. **控制按钮**
   - 🌙/🌞 暗色/亮色模式
   - 🔼🔽 字体大小调整
   - 🔄 刷新数据
   - 📊 查看统计
   - 🚀 大数据示例

3. **优化功能展示**
   - ✨ 缓存优化
   - ⭐ 优先级管理
   - 🚀 虚拟渲染 + Worker

### 试试这些操作

#### 1. 查看性能统计
```
点击 "📊 统计" 按钮
→ 查看缓存命中率
→ 查看内存使用
→ 查看内存压力级别
```

#### 2. 测试大数据性能
```
点击 "🚀 大数据" 按钮
→ 生成 50,000 个数据点
→ 自动启用所有优化
→ 观察性能表现
→ 查看统计信息
```

#### 3. 测试主题切换
```
点击 "🌙 暗色" 按钮
→ 所有图表切换到暗色模式
→ 观察切换速度（应该很快）
```

#### 4. 测试数据刷新
```
点击 "🔄 刷新" 按钮
→ 观察图表更新
→ 检查控制台（缓存命中）
```

---

## 🔧 故障排查

### 问题：依赖安装失败

**解决方案**：
```bash
# 清除缓存
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

### 问题：启动失败

**可能原因**：端口被占用

**解决方案**：
修改 `vite.config.ts` 中的端口号
```typescript
server: {
  port: 8080  // 改成其他端口
}
```

### 问题：图表不显示

**检查**：
1. 容器元素是否有高度
2. 数据格式是否正确
3. 查看浏览器控制台错误

---

## 📊 性能基准

启动后，你应该看到：

### 初始加载
```
Vue 示例:   < 500ms ✅
React 示例: < 500ms ✅
```

### 图表渲染
```
小数据集: < 50ms ✅
大数据集: < 1000ms ✅ (启用优化)
```

### 内存使用
```
初始: < 50MB ✅
6个图表: < 100MB ✅
大数据图表: < 150MB ✅
```

---

## 💡 开发提示

### 1. 打开浏览器开发者工具
```
F12 或 Cmd+Option+I
→ 查看 Console（性能日志）
→ 查看 Performance（性能分析）
→ 查看 Memory（内存分析）
```

### 2. 性能分析
```javascript
// 控制台执行
window.__CHART_DEBUG__ = {
  cache: () => chartCache.stats(),
  instances: () => instanceManager.stats(),
}

// 查看统计
__CHART_DEBUG__.cache()
__CHART_DEBUG__.instances()
```

### 3. 内存分析
```
1. 打开 Memory 选项卡
2. 点击 "Take snapshot"
3. 点击 "🚀 大数据"
4. 再次 "Take snapshot"
5. 对比内存变化
```

---

## 📚 下一步

### 学习更多

1. 阅读 [性能优化指南](../docs/performance-guide.md)
2. 阅读 [最佳实践](../docs/best-practices.md)
3. 查看 [API 文档](../docs/api-reference.md)
4. 研究示例源代码
5. 尝试修改和实验

### 集成到项目

1. 安装 `@ldesign/chart`
2. 参考示例代码
3. 启用优化功能
4. 监控性能指标
5. 根据需求调整

---

**Have fun！** 🎉

如有问题，请查看 [故障排查指南](../docs/performance-guide.md#故障排查)

