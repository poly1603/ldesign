# 快速安装指南

## 快速开始

### 方式 1：使用快速安装脚本（推荐）

```bash
npm run install:fast
```

此命令会：
- 自动检测 `pnpm-lock.yaml` 并使用 frozen-lockfile 模式
- 显示缓存状态和安装进度
- 统计安装时间

### 方式 2：使用标准 pnpm 命令

```bash
# 标准安装（已优化配置）
pnpm install

# 使用 frozen-lockfile（更快）
pnpm install --frozen-lockfile

# 跳过可选依赖（最快）
pnpm install --frozen-lockfile --no-optional
```

## 可用的安装命令

| 命令 | 说明 | 适用场景 |
|------|------|---------|
| `npm run install:fast` | 智能快速安装 | 日常开发 |
| `npm run install:prod` | 仅安装生产依赖 | 生产环境部署 |
| `npm run install:clean` | 清理缓存后重新安装 | 解决依赖问题 |
| `npm run cache:status` | 查看缓存状态 | 检查缓存 |
| `npm run cache:prune` | 清理无用缓存 | 释放磁盘空间 |

## 性能优化说明

### 已应用的优化

1. **网络并发优化** - 并发数提升至 32（默认 16）
2. **国内镜像源** - 使用淘宝 npm 镜像
3. **重试机制** - 5 次重试，确保稳定性
4. **缓存复用** - pnpm 自动复用已下载的包

### 预期性能

- **首次完整安装**: 3-8 分钟（取决于网络）
- **使用 frozen-lockfile**: 节省 20-30% 时间
- **有缓存的安装**: 1-3 分钟

## 常见问题

### Q: 为什么安装还是很慢？

**A:** 可能的原因和解决方案：

1. **网络问题**
   ```bash
   # 检查镜像源连接
   ping registry.npmmirror.com
   ```

2. **缓存问题**
   ```bash
   # 清理并重新安装
   npm run install:clean
   ```

3. **首次安装**
   - 首次安装需要下载所有包（约 5388 个），耗时较长是正常的
   - 后续安装会复用缓存，速度会显著提升

### Q: 如何更换镜像源？

**A:** 编辑 `.npmrc` 文件，取消注释你想使用的镜像源：

```ini
# 淘宝镜像（默认）
registry=https://registry.npmmirror.com/

# 官方源
# registry=https://registry.npmjs.org/

# 腾讯云镜像
# registry=https://mirrors.cloud.tencent.com/npm/

# 华为云镜像
# registry=https://mirrors.huaweicloud.com/repository/npm/
```

### Q: 如何查看安装进度？

**A:** pnpm 会自动显示进度：

```
Progress: resolved 5388, reused 5006, downloaded 2, added 5287
```

- `resolved`: 已解析的包数量
- `reused`: 从缓存复用的包数量
- `downloaded`: 新下载的包数量
- `added`: 已添加到项目的包数量

### Q: 遇到 peer 依赖警告怎么办？

**A:** 这些警告通常不影响使用，如需忽略：

```bash
pnpm install --no-strict-peer-dependencies
```

或在 `.npmrc` 中设置：
```ini
strict-peer-dependencies=false
```

## 项目统计

- **总包数**: ~5388 个
- **工作区**: 包含 packages、libraries、tools、apps
- **包管理器**: pnpm@9.15.9
- **Node 版本要求**: >=18.0.0

## 进阶优化

查看 [`INSTALL_OPTIMIZATION.md`](./INSTALL_OPTIMIZATION.md) 了解更多优化技巧。

## 故障排除

如果遇到安装问题：

1. **检查 Node 版本**
   ```bash
   node --version  # 应该 >= 18.0.0
   ```

2. **检查 pnpm 版本**
   ```bash
   pnpm --version  # 应该 >= 8.0.0
   ```

3. **完全清理重装**
   ```bash
   # 删除所有 node_modules
   pnpm -r exec rm -rf node_modules
   rm -rf node_modules
   
   # 清理缓存
   pnpm store prune
   
   # 删除 lockfile（可选）
   rm pnpm-lock.yaml
   
   # 重新安装
   pnpm install
   ```

4. **查看详细日志**
   ```bash
   pnpm install --loglevel=debug
   ```

## 相关文档

- [INSTALL_OPTIMIZATION.md](./INSTALL_OPTIMIZATION.md) - 详细优化指南
- [pnpm 官方文档](https://pnpm.io/zh/)
- [项目 README](./README.md)