# LDesign 优化快速参考

## 🚀 已完成的优化

### 1. 依赖分析工具

```bash
# 运行依赖分析
pnpm tsx scripts/analyze-dependencies.ts

# 功能
- ✅ 循环依赖检测
- ✅ 依赖层级分析
- ✅ 依赖统计报告
- ✅ Mermaid 图生成
```

### 2. 统一配置包 (@ldesign/config)

```bash
# 安装
pnpm add -D @ldesign/config
```

#### TypeScript 配置
```json
// tsconfig.json
{
  "extends": "@ldesign/config/tsconfig.base.json"    // 基础配置
  "extends": "@ldesign/config/tsconfig.vue.json"     // Vue 项目
  "extends": "@ldesign/config/tsconfig.react.json"   // React 项目
  "extends": "@ldesign/config/tsconfig.node.json"    // Node 项目
}
```

#### Vite 配置
```ts
import { createVueViteConfig, createLibraryViteConfig } from '@ldesign/config/vite'

// Vue 项目
export default defineConfig(createVueViteConfig())

// 库项目
export default defineConfig(createLibraryViteConfig({
  entry: './src/index.ts',
  name: 'MyLibrary'
}))
```

#### ESLint 配置
```js
import { baseEslintConfig, vueEslintConfig } from '@ldesign/config/eslint'

export default vueEslintConfig
```

### 3. 统一文档站点

```bash
# 进入文档目录
cd docs-site

# 启动开发服务器
pnpm dev

# 构建文档
pnpm build
```

**访问地址**: http://localhost:4000

## 📊 项目现状

### 依赖健康度
- ✅ **0 个循环依赖**
- 📦 **70 个包**
- 🔗 **123 个内部依赖**
- 📊 **4 层依赖架构**

### 高依赖包（需要关注）
1. `@ldesign/shared` - 被 25 个包依赖
2. `@ldesign/kit` - 被 9 个包依赖
3. `@ldesign/http` - 被 7 个包依赖

## 🛠️ 常用命令

```bash
# 依赖分析
pnpm tsx scripts/analyze-dependencies.ts

# 文档开发
cd docs-site && pnpm dev

# 使用 CLI 创建项目
npx @ldesign/cli create my-project

# 安装核心包
pnpm add @ldesign/cache @ldesign/http @ldesign/store
```

## 📁 重要文件位置

```
项目根目录/
├── scripts/
│   └── analyze-dependencies.ts    # 依赖分析工具
├── packages/
│   └── config/                    # 统一配置包
├── docs-site/                     # 文档站点
├── docs/
│   ├── dependency-analysis-report.md      # 依赖分析报告
│   ├── unified-config-usage.md            # 配置使用指南
│   └── optimization-implementation-summary.md  # 实施总结
└── dependency-graph.md            # 依赖关系图
```

## 💡 最佳实践

### 使用统一配置
1. 新建包时，从 `@ldesign/config` 继承配置
2. 只覆盖必要的配置项
3. 避免复制粘贴配置文件

### 管理依赖
1. 定期运行依赖分析（建议每周一次）
2. PR 合并前检查是否引入循环依赖
3. 控制包的依赖数量，保持精简

### 维护文档
1. 新功能必须同步更新文档
2. 提供可运行的代码示例
3. 保持 API 文档的时效性

## 🎯 下一步行动

- [ ] 将核心包迁移到统一配置
- [ ] 完善所有包的文档
- [ ] 提升测试覆盖率到 80%
- [ ] 优化核心包性能
- [ ] 实现插件化架构

---

**更新时间**: 2024-10-24  
**版本**: v1.0.0
