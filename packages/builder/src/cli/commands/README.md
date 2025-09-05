# CLI 命令

@ldesign/builder 提供了丰富的命令行工具，支持各种构建和开发场景。

## 核心命令

### build
构建项目，支持多格式输出。

```bash
# 基础构建
ldesign-builder build

# 指定配置文件
ldesign-builder build --config custom.config.ts

# 开启调试模式
ldesign-builder build --debug

# 生产模式构建
ldesign-builder build --mode production
```

### watch
监听文件变化并自动重新构建。

```bash
# 启动监听模式
ldesign-builder watch

# 指定监听目录
ldesign-builder watch --include "src/**/*"
```

### examples
批量构建示例项目，适用于 monorepo 或多示例场景。

```bash
# 构建所有示例项目
ldesign-builder examples

# 仅构建包含特定关键字的示例
ldesign-builder examples --filter typescript

# 并发构建（默认串行，避免资源冲突）
ldesign-builder examples --concurrency 3

# 指定示例根目录（默认 examples）
ldesign-builder examples --root my-examples
```

#### examples 命令工作原理

1. **项目发现**：扫描指定目录下的所有子目录
2. **项目识别**：检查是否存在 `package.json` 文件
3. **过滤筛选**：根据 `--filter` 参数筛选项目
4. **并发控制**：根据 `--concurrency` 参数控制同时构建的项目数
5. **构建执行**：在每个项目目录下执行 `ldesign-builder build`

### init
初始化新项目的构建配置。

```bash
# 交互式初始化
ldesign-builder init

# 指定项目类型
ldesign-builder init --type typescript
```

### analyze
分析构建产物和性能。

```bash
# 分析构建产物
ldesign-builder analyze

# 生成详细报告
ldesign-builder analyze --detailed
```

### clean
清理构建产物。

```bash
# 清理默认输出目录
ldesign-builder clean

# 清理指定目录
ldesign-builder clean --dirs es,lib,dist
```

## 全局选项

所有命令都支持以下全局选项：

- `--config <path>` - 指定配置文件路径
- `--debug` - 开启调试模式
- `--silent` - 静默模式，减少日志输出
- `--help` - 显示帮助信息
- `--version` - 显示版本信息

## 配置文件

支持多种配置文件格式：
- `ldesign.config.ts`
- `ldesign.config.js`
- `ldesign.config.mjs`
- `builder.config.ts`
- `builder.config.js`

## 环境变量

- `NODE_ENV` - 构建环境（development/production）
- `DEBUG` - 调试模式开关
- `BUILD_ANALYZE` - 是否启用构建分析

## 示例用法

### 典型的开发工作流

```bash
# 1. 初始化项目
ldesign-builder init --type typescript

# 2. 开发模式（监听文件变化）
ldesign-builder watch

# 3. 生产构建
ldesign-builder build --mode production

# 4. 分析构建结果
ldesign-builder analyze
```

### Monorepo 场景

```bash
# 构建所有示例
ldesign-builder examples

# 仅构建 TypeScript 相关示例
ldesign-builder examples --filter typescript

# 并发构建提高效率
ldesign-builder examples --concurrency 4
```
