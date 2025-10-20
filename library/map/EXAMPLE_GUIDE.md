# 示例运行指南

本指南确保所有示例能正常启动和运行。

## ✅ 检查清单

### 1. 依赖安装

- [ ] 根目录依赖已安装 (`npm install`)
- [ ] 示例目录依赖已安装 (`cd example && npm install`)
- [ ] 已添加 `@deck.gl/aggregation-layers` 依赖

### 2. 构建验证

- [ ] 库已构建 (`npm run build`)
- [ ] `dist/` 目录存在以下文件:
  - `index.esm.js`
  - `index.cjs.js`
  - `index.d.ts`
  - `*.js.map` 文件

### 3. 示例验证

- [ ] 示例服务器能启动 (`cd example && npm run dev`)
- [ ] 浏览器自动打开 http://localhost:3000
- [ ] 控制台无严重错误
- [ ] 所有地图正常渲染

## 🎯 功能验证

### 基础功能页面 (/)

#### 配色方案
- [ ] 单色模式地图显示正常
- [ ] 渐变色模式地图显示正常
- [ ] 分类色模式地图显示正常
- [ ] 随机色模式地图显示正常
- [ ] 数据驱动模式地图显示正常
- [ ] 自定义函数模式地图显示正常

#### 选择功能
- [ ] 单选模式：点击区域能选中
- [ ] 单选模式：再次点击能取消选中
- [ ] 单选模式：显示选中的区域名称
- [ ] 多选模式：能选中多个区域
- [ ] 多选模式：显示所有选中区域
- [ ] 清除按钮能清除选择

#### 标记点功能
- [ ] 能添加地标标记
- [ ] 地标有水波纹动画效果
- [ ] 能添加随机标记
- [ ] 能显示/隐藏标记
- [ ] 能清除所有标记

### 高级功能页面 (/advanced-features.html)

#### 热力图
- [ ] 能显示热力图
- [ ] 能隐藏热力图
- [ ] 能调整强度

#### 路径渲染
- [ ] 能添加路径点
- [ ] 能添加弧线点
- [ ] 能清除路径

#### 聚类
- [ ] 能添加聚类点
- [ ] 显示聚类数量
- [ ] 能清除聚类

#### 测量工具
- [ ] 测量模式切换正常
- [ ] 显示提示信息

#### 地图导出
- [ ] 导出按钮响应正常
- [ ] 显示相关提示

#### 图例
- [ ] 图例显示正常
- [ ] 能显示/隐藏图例
- [ ] 能切换图例位置

## 🐛 常见问题

### 问题1: 地图容器是空白的

**可能原因:**
- 库未构建或构建失败
- GeoJSON 数据加载失败
- Deck.gl 初始化失败

**解决方案:**
```bash
# 重新构建库
cd .. && npm run build

# 检查控制台错误
# 打开浏览器开发者工具 (F12)
# 查看 Console 和 Network 标签
```

### 问题2: 导入错误 "Cannot find module"

**可能原因:**
- 依赖未安装
- vite.config.js 配置错误

**解决方案:**
```bash
# 重新安装依赖
cd example
rm -rf node_modules package-lock.json
npm install
```

### 问题3: 地图显示但功能不工作

**可能原因:**
- JavaScript 错误
- 事件监听器未绑定

**解决方案:**
- 打开浏览器控制台查看错误
- 检查 `main.js` 和 `advanced-demo.js`

### 问题4: 水波纹动画不显示

**可能原因:**
- `RippleMarker` 未正确导入
- 动画循环未启动

**解决方案:**
- 查看控制台日志
- 确认 `MapRenderer` 的动画循环功能

## 📊 性能检查

### 基础性能指标

在浏览器开发者工具的 Performance 标签中检查：

- [ ] 初始加载时间 < 3秒
- [ ] 地图渲染时间 < 1秒
- [ ] FPS >= 30 (最好 60)
- [ ] 内存使用 < 200MB

### 性能优化建议

如果性能不佳：

1. **减少数据量**
   - 简化 GeoJSON（减少点数）
   - 使用更粗的精度

2. **启用缓存**
   - 确保 LayerCache 正常工作

3. **优化渲染**
   - 降低标记点数量
   - 减少同时显示的图层

## 🔍 调试技巧

### 1. 启用详细日志

在 `main.js` 或 `advanced-demo.js` 顶部添加：

```javascript
// 启用详细日志
if (window.Logger) {
  const logger = window.Logger.getInstance();
  logger.setLevel(window.LogLevel.DEBUG);
}
```

### 2. 检查 Deck.gl 状态

在控制台执行：

```javascript
// 获取地图实例（需要先定义全局变量）
console.log(mapRenderer.getDeck());
console.log(mapRenderer.getLayers());
```

### 3. 监控事件

```javascript
// 监控所有事件
if (window.EventManager) {
  const em = new window.EventManager();
  em.on('viewStateChange', (e) => console.log('View changed:', e));
  em.on('click', (e) => console.log('Clicked:', e));
}
```

## 📸 预期效果截图

### 基础功能页面

- 应该看到 9 个地图卡片
- 每个地图使用不同的配色方案
- 地图区域边界清晰
- 标签文字可读

### 高级功能页面

- 应该看到 6 个演示卡片
- 每个卡片有控制按钮
- 点击按钮有响应
- 信息栏显示状态

## ✅ 最终验证

运行以下命令验证一切正常：

```bash
# 1. 构建库
npm run build

# 2. 类型检查
npm run type-check

# 3. 启动示例
cd example && npm run dev

# 4. 在浏览器中:
# - 打开 http://localhost:3000
# - 打开 http://localhost:3000/advanced-features.html
# - 检查所有功能
# - 查看控制台无错误
```

## 📝 报告问题

如果发现问题，请提供：

1. **环境信息**
   - Node.js 版本
   - npm 版本
   - 操作系统
   - 浏览器版本

2. **错误信息**
   - 控制台错误截图
   - 网络请求截图
   - 完整的错误堆栈

3. **重现步骤**
   - 具体操作步骤
   - 预期行为
   - 实际行为

## 🎉 成功标志

当您看到以下情况时，说明一切正常：

✅ 服务器成功启动在 http://localhost:3000
✅ 浏览器自动打开示例页面
✅ 所有地图卡片都正确渲染
✅ 控制台输出类似：
```
MapRenderer loaded: ƒ MapRenderer(container, options)
Guangzhou data loaded, features: 11
Map map-single initialized successfully
Map map-gradient initialized successfully
...
All maps initialized!
```

✅ 控制台无红色错误
✅ 所有按钮点击有响应
✅ 地图交互流畅（缩放、平移）

---

**如果所有检查都通过，恭喜！示例运行成功！🎊**









