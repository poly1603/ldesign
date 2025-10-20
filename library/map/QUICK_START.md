# 快速启动指南

本指南帮助您快速启动 Map Renderer 示例项目。

## 📋 前置要求

- Node.js >= 16.0.0
- npm >= 7.0.0

## 🚀 快速启动（3步）

### 1. 安装根目录依赖并构建库

```bash
# 在项目根目录
npm install
npm run build
```

### 2. 安装示例依赖

```bash
cd example
npm install
```

### 3. 启动示例

```bash
npm run dev
```

示例会自动在浏览器打开 http://localhost:3000

## 📄 可用页面

### 基础功能演示
- URL: http://localhost:3000/
- 展示6种配色方案
- 单选/多选功能
- 标记点和动画

### 高级功能演示
- URL: http://localhost:3000/advanced-features.html
- 热力图
- 路径渲染
- 智能聚类
- 测量工具
- 地图导出
- 图例组件

## 🔧 故障排除

### 问题：地图不显示

**解决方案:**
```bash
# 回到根目录重新构建
cd ..
npm run build

# 回到示例目录
cd example
npm run dev
```

### 问题：端口3000被占用

**解决方案:**
编辑 `example/vite.config.js`:
```javascript
server: {
  port: 3001  // 改为其他端口
}
```

### 问题：模块导入错误

**解决方案:**
```bash
# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json
npm install

# 清除 Vite 缓存
rm -rf node_modules/.vite
npm run dev
```

## 📦 完整安装命令（Windows）

```powershell
# 根目录
npm install
npm run build

# 示例目录
cd example
npm install
npm run dev
```

## 📦 完整安装命令（Mac/Linux）

```bash
# 根目录
npm install && npm run build

# 示例目录
cd example && npm install && npm run dev
```

## ✅ 验证安装

成功启动后，您应该看到：

1. **终端输出**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

2. **浏览器自动打开**，显示地图示例

3. **控制台无错误**，所有地图正常渲染

## 🎯 下一步

- 查看 [example/README.md](example/README.md) 了解示例详情
- 阅读 [docs/EXAMPLES.md](docs/EXAMPLES.md) 学习如何使用
- 查看 [docs/ENHANCEMENTS.md](docs/ENHANCEMENTS.md) 了解所有新功能

## 📞 获取帮助

如果遇到问题：

1. 检查 Node.js 版本: `node --version` (需要 >= 16)
2. 查看浏览器控制台错误
3. 查看 [example/README.md](example/README.md) 的故障排查部分
4. 提交 [Issue](https://github.com/your-username/map-renderer/issues)

---

**祝使用愉快！🎉**









