# 贡献指南

感谢你考虑为 @ldesign/progress 做出贡献！

## 开始之前

- 阅读 [README.md](./README.md) 了解项目
- 查看 [开发指南](./DEV_GUIDE.md) 了解开发流程
- 查看 [构建指南](./BUILD.md) 了解构建流程

## 如何贡献

### 报告 Bug

在提交 Bug 之前，请：

1. 搜索已有的 Issues
2. 使用最新版本测试
3. 提供最小可复现示例

提交 Bug 时请包含：

- 环境信息（OS、Node 版本等）
- 复现步骤
- 期望行为
- 实际行为
- 相关截图或代码

### 提出新功能

1. 先创建 Issue 讨论
2. 说明功能的使用场景
3. 提供设计思路
4. 等待维护者反馈

### 提交代码

#### 1. Fork 项目

```bash
# Fork 项目到你的 GitHub
# 然后克隆到本地
git clone <your-fork-url>
cd progress
```

#### 2. 创建分支

```bash
git checkout -b feature/your-feature-name
```

分支命名规范：
- `feature/xxx` - 新功能
- `fix/xxx` - Bug 修复
- `docs/xxx` - 文档更新
- `refactor/xxx` - 重构
- `perf/xxx` - 性能优化

#### 3. 安装依赖

```bash
pnpm install
```

#### 4. 开发

```bash
# 启动示例项目
pnpm dev:vue
# 或
pnpm dev:react
# 或
pnpm dev:vanilla
```

#### 5. 测试

```bash
# 测试构建
pnpm build:all

# 确保没有错误
pnpm test:build
```

#### 6. 提交代码

提交信息格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建/工具配置

**示例:**

```
feat(core): 添加水波纹进度条

- 实现 WaveProgress 类
- 支持 Canvas 和 SVG 渲染
- 添加波浪动画效果

Closes #123
```

#### 7. 推送并创建 Pull Request

```bash
git push origin feature/your-feature-name
```

然后在 GitHub 上创建 Pull Request。

## Pull Request 指南

### PR 标题

使用与提交信息相同的格式。

### PR 描述

包含：

1. **改动说明**：简述做了什么
2. **动机**：为什么要做这个改动
3. **测试**：如何测试
4. **截图**（如适用）：UI 改动的截图
5. **相关 Issue**：Closes #xxx

### PR 检查清单

提交前确保：

- [ ] 代码遵循项目规范
- [ ] 添加了必要的注释
- [ ] 更新了相关文档
- [ ] 通过了所有测试
- [ ] 没有引入新的警告
- [ ] 更新了 CHANGELOG（如需要）

## 代码规范

### TypeScript

```typescript
// ✅ 好
interface ProgressOptions {
  value: number;
  color?: string;
}

// ❌ 不好
interface ProgressOptions {
  value: any;
  color;
}
```

### 命名

```typescript
// ✅ 类名使用 PascalCase
class LinearProgress {}

// ✅ 方法名使用 camelCase
setValue() {}

// ✅ 常量使用 UPPER_CASE
const MAX_VALUE = 100;

// ✅ 私有属性使用 private
private currentValue: number;
```

### 注释

```typescript
/**
 * 设置进度值
 * @param value - 新的进度值
 * @param animated - 是否使用动画
 */
setValue(value: number, animated?: boolean): void {
  // 实现...
}
```

## 文档

### API 文档

新增 API 需要更新 `docs/API.md`。

### 使用示例

提供清晰的使用示例。

### 注释

复杂逻辑添加注释说明。

## 测试

虽然目前还没有自动化测试，但请确保：

1. 在所有示例项目中测试
2. 测试边界情况
3. 测试不同配置组合
4. 构建测试通过

## 发布流程

（仅维护者）

1. 更新版本号
2. 更新 CHANGELOG
3. 构建所有包
4. 测试构建
5. 发布到 NPM
6. 创建 Git Tag

## 获取帮助

- 查看文档
- 创建 Issue
- 加入讨论

## 行为准则

- 尊重他人
- 友好交流
- 建设性反馈
- 欢迎新手

## 许可证

贡献代码即表示同意项目使用 MIT 许可证。

---

再次感谢你的贡献！🎉


