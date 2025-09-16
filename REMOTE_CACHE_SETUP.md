# Turborepo 远程缓存配置指南

## 概述

远程缓存是 Turborepo 的核心功能之一，它允许团队成员共享构建缓存，大幅提升开发效率。

## 配置步骤

### 1. 创建 Vercel 账号

1. 访问 [Vercel](https://vercel.com) 并注册账号
2. 创建一个新的团队（可选，但推荐用于团队协作）

### 2. 本地配置

```bash
# 登录 Vercel
pnpm turbo login

# 链接到团队（如果有的话）
pnpm turbo link
```

### 3. 环境变量配置

#### 本地开发

在项目根目录创建 `.env.local` 文件：

```bash
# Turborepo 远程缓存配置
TURBO_TOKEN=your_turbo_token_here
TURBO_TEAM=your_team_name_here
```

#### CI/CD 环境

在 GitHub Actions 中配置以下 Secrets：

- `TURBO_TOKEN`: 从 Vercel 获取的 token
- `TURBO_TEAM`: 团队名称（如果使用团队）

### 4. 验证配置

```bash
# 检查缓存状态
pnpm turbo run build --summarize

# 查看缓存统计
pnpm turbo run build --verbose
```

## 缓存策略

### 本地缓存 vs 远程缓存

| 特性 | 本地缓存 | 远程缓存 |
|------|----------|----------|
| 速度 | 最快 | 快 |
| 共享 | 否 | 是 |
| 存储 | 本地磁盘 | 云端 |
| 网络依赖 | 否 | 是 |

### 缓存优先级

1. **本地缓存** - 首先检查本地缓存
2. **远程缓存** - 如果本地没有，从远程获取
3. **重新构建** - 如果都没有，重新构建并缓存

## 性能优化

### 1. 缓存配置优化

```json
{
  "tasks": {
    "build": {
      "inputs": [
        "src/**",
        "package.json",
        "tsconfig.json"
      ],
      "outputs": [
        "dist/**"
      ],
      "cache": true
    }
  }
}
```

### 2. 网络优化

```bash
# 使用压缩传输
export TURBO_REMOTE_CACHE_COMPRESSION=true

# 设置超时时间
export TURBO_REMOTE_CACHE_TIMEOUT=30
```

### 3. 选择性缓存

```bash
# 只缓存生产构建
pnpm turbo run build:prod --remote-only

# 跳过远程缓存
pnpm turbo run build --local-only
```

## 监控和调试

### 1. 缓存统计

```bash
# 查看详细缓存信息
pnpm turbo run build --summarize

# 生成缓存报告
pnpm turbo run build --profile=cache-profile.json
```

### 2. 调试命令

```bash
# 强制使用远程缓存
pnpm turbo run build --remote-only

# 禁用所有缓存
pnpm turbo run build --no-cache

# 查看缓存键
pnpm turbo run build --dry-run
```

### 3. 常见问题

#### 缓存未命中

```bash
# 检查输入文件配置
pnpm turbo run build --dry-run

# 验证环境变量
echo $TURBO_TOKEN
echo $TURBO_TEAM
```

#### 网络问题

```bash
# 测试连接
curl -H "Authorization: Bearer $TURBO_TOKEN" \
     https://api.vercel.com/v1/teams

# 使用本地缓存作为后备
export TURBO_REMOTE_CACHE_FALLBACK=true
```

## 最佳实践

### 1. 团队协作

- 确保所有团队成员使用相同的 `TURBO_TEAM`
- 定期清理过期的缓存
- 监控缓存使用情况

### 2. CI/CD 集成

```yaml
# GitHub Actions 示例
env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}
  TURBO_REMOTE_ONLY: true

steps:
  - name: Build with remote cache
    run: pnpm turbo run build
```

### 3. 安全考虑

- 不要在公共仓库中暴露 `TURBO_TOKEN`
- 定期轮换访问令牌
- 使用团队级别的权限控制

## 成本优化

### 1. 缓存策略

- 只缓存耗时的任务
- 设置合理的缓存过期时间
- 避免缓存大文件

### 2. 监控使用量

```bash
# 查看缓存使用统计
pnpm analyze:performance
```

## 故障排除

### 常见错误

1. **401 Unauthorized**
   - 检查 `TURBO_TOKEN` 是否正确
   - 验证令牌是否过期

2. **403 Forbidden**
   - 检查团队权限
   - 验证 `TURBO_TEAM` 配置

3. **网络超时**
   - 检查网络连接
   - 增加超时时间

### 诊断命令

```bash
# 测试远程缓存连接
pnpm turbo run build --remote-only --verbose

# 查看详细日志
DEBUG=turbo:* pnpm turbo run build
```

## 相关链接

- [Turborepo 远程缓存文档](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Vercel 团队管理](https://vercel.com/docs/concepts/teams)
- [缓存配置参考](https://turbo.build/repo/docs/reference/configuration#cache)
