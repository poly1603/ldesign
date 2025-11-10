# pnpm 安装速度优化指南

本文档提供了针对 ldesign monorepo 项目的 pnpm 安装速度优化方案。

## 已应用的优化配置

### .npmrc 配置优化

以下配置已经应用到项目的 `.npmrc` 文件中：

```ini
# 网络并发优化
network-concurrency=32          # 增加网络并发数（默认16）
fetch-retries=5                # 重试次数
fetch-retry-mintimeout=10000   # 最小重试超时
fetch-retry-maxtimeout=60000   # 最大重试超时

# 依赖检查优化
strict-peer-dependencies=false  # 跳过严格的 peer 依赖检查

# 使用淘宝镜像源
registry=https://registry.npmmirror.com/
```

## 其他优化建议

### 1. 使用 pnpm 缓存

pnpm 会自动缓存已下载的包，如果你想清理并重建缓存：

```bash
# 清理 pnpm 缓存
pnpm store prune

# 验证缓存状态
pnpm store status
```

### 2. 使用 --frozen-lockfile

如果 `pnpm-lock.yaml` 已存在且不需要更新，使用：

```bash
pnpm install --frozen-lockfile
```

这会跳过依赖解析阶段，直接使用 lockfile 中的版本。

### 3. 忽略可选依赖

如果项目不需要某些可选依赖，可以跳过它们的安装：

```bash
pnpm install --no-optional
```

### 4. 并行安装工作区

对于 monorepo 项目，使用并行安装：

```bash
pnpm install --filter ./packages/* --filter ./libraries/* --filter ./tools/*
```

### 5. 使用本地缓存服务器（高级）

如果团队多人开发，可以搭建本地 npm 缓存服务器（如 Verdaccio）。

### 6. 预安装常用依赖

创建一个预安装脚本，提前下载常用的大型依赖：

```bash
# 预安装常用依赖到全局 store
pnpm add -g typescript @types/node rollup
```

### 7. 使用 pnpm 的 filter 功能

如果只需要安装特定包的依赖：

```bash
# 只安装 color 包的依赖
pnpm install --filter @ldesign/color

# 安装多个包
pnpm install --filter @ldesign/color --filter @ldesign/websocket
```

## 性能对比

根据项目规模，优化后预期提升：

- **网络并发优化**: 下载速度提升 30-50%
- **使用 frozen-lockfile**: 节省 20-30% 的解析时间
- **跳过可选依赖**: 节省 10-15% 的安装时间
- **使用国内镜像源**: 下载速度提升 2-3 倍（相比官方源）

## 当前项目统计

当前项目包含约 5000+ 个依赖包，首次安装时间取决于：

- 网络速度
- 本地缓存状态
- 系统性能

预计首次完整安装时间：3-8 分钟（已优化配置）

## 快速命令参考

```bash
# 快速安装（使用所有优化）
pnpm install --frozen-lockfile --no-optional

# 清理并重新安装
pnpm store prune && pnpm install

# 只安装生产依赖
pnpm install --prod

# 更新依赖并安装
pnpm update
```

## 故障排除

### 问题：安装速度仍然很慢

**解决方案**：
1. 检查网络连接
2. 尝试更换镜像源（见 .npmrc 文件中的备选源）
3. 清理 pnpm 缓存：`pnpm store prune`
4. 检查防火墙/代理设置

### 问题：某些包下载失败

**解决方案**：
1. 增加重试次数：在 `.npmrc` 中设置更大的 `fetch-retries`
2. 使用 VPN 或代理
3. 手动下载失败的包

### 问题：peer 依赖冲突

**解决方案**：
```bash
# 使用宽松模式
pnpm install --no-strict-peer-dependencies

# 或更新 .npmrc
strict-peer-dependencies=false
```

## 维护建议

1. **定期清理缓存**：每月运行一次 `pnpm store prune`
2. **更新 lockfile**：重要更新后运行 `pnpm install` 更新 lockfile
3. **监控安装时间**：记录并对比优化效果

## 相关资源

- [pnpm 官方文档](https://pnpm.io/zh/)
- [pnpm 配置选项](https://pnpm.io/zh/npmrc)
- [淘宝 npm 镜像](https://npmmirror.com/)