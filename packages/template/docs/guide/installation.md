# 安装

## 📦 包管理器安装

### pnpm (推荐)

```bash
pnpm add @ldesign/template
```

### npm

```bash
npm install @ldesign/template
```

### yarn

```bash
yarn add @ldesign/template
```

## 🎯 Vue 项目集成

如果你在 Vue 项目中使用，还需要安装 Vue 集成包：

```bash
# 使用 pnpm
pnpm add @ldesign/template @ldesign/device @ldesign/logger

# 使用 npm
npm install @ldesign/template @ldesign/device @ldesign/logger

# 使用 yarn
yarn add @ldesign/template @ldesign/device @ldesign/logger
```

## 🔧 TypeScript 支持

本包完全使用 TypeScript 编写，提供完整的类型定义。无需额外安装类型包。

## 📋 系统要求

- **Node.js**: >= 16.0.0
- **Vue**: >= 3.0.0 (如果使用 Vue 集成)
- **TypeScript**: >= 4.5.0 (推荐)

## 🚀 快速验证

安装完成后，可以通过以下代码验证安装是否成功：

```typescript
import { TemplateManager } from '@ldesign/template'

const manager = new TemplateManager()
console.log('模板管理器创建成功！', manager)
```

## 🎪 CDN 引入

如果你想通过 CDN 使用（不推荐用于生产环境）：

```html
<script src="https://unpkg.com/@ldesign/template@latest/dist/index.umd.js"></script>
<script>
  const { TemplateManager } = LDesignTemplate
  const manager = new TemplateManager()
</script>
```

## 🔍 版本检查

查看当前安装的版本：

```bash
npm list @ldesign/template
```

## 🆙 升级指南

### 从 0.x 升级到 1.x

1. 更新依赖版本
2. 查看 [迁移指南](/guide/migration) 了解破坏性变更
3. 运行测试确保功能正常

### 保持最新

```bash
# 检查可用更新
npm outdated @ldesign/template

# 更新到最新版本
npm update @ldesign/template
```

## 🐛 安装问题排查

### 常见问题

1. **网络问题**
   ```bash
   # 使用淘宝镜像
   npm install @ldesign/template --registry=https://registry.npmmirror.com
   ```

2. **权限问题**
   ```bash
   # 使用 sudo (Linux/macOS)
   sudo npm install @ldesign/template

   # 或配置 npm 前缀 (推荐)
   npm config set prefix ~/.npm-global
   ```

3. **版本冲突**
   ```bash
   # 清除缓存
   npm cache clean --force

   # 删除 node_modules 重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

### 获取帮助

如果遇到安装问题，可以：

- 查看 [FAQ](/guide/faq)
- 在 [GitHub Issues](https://github.com/ldesign/template/issues) 提问
- 加入我们的 [Discord 社区](https://discord.gg/ldesign)

## ✅ 下一步

安装完成后，建议阅读：

- [快速开始](/guide/getting-started) - 5分钟上手指南
- [基础概念](/guide/concepts) - 了解核心概念
- [API 参考](/api/) - 详细的 API 文档
