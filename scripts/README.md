# LDesign Packages 批量打包工具

这是一个智能的 TypeScript 命令行工具，用于自动分析和构建 LDesign monorepo 中的所有包。

## 🚀 功能特性

- **自动包发现**: 扫描 `packages` 目录下的所有 `@ldesign` 包
- **依赖关系分析**: 智能分析包之间的依赖关系，构建完整的依赖图
- **拓扑排序**: 使用拓扑排序算法确定正确的构建顺序
- **循环依赖检测**: 自动检测并报告循环依赖问题
- **并行构建**: 支持同一层级包的并行构建，提高构建效率
- **详细日志**: 提供丰富的日志输出和进度显示
- **干运行模式**: 支持只分析不构建的预览模式
- **错误处理**: 完善的错误处理和恢复机制

## 📦 依赖关系分析

工具会自动分析以下依赖关系：

1. **dependencies**: 生产环境依赖的其他 `@ldesign` 包
2. **devDependencies**: 开发环境依赖的其他 `@ldesign` 包（排除 `@ldesign/builder`）

### 当前项目的依赖层级

根据分析，当前项目的包依赖层级如下：

```
第1层（基础包）:
├── @ldesign/kit
├── @ldesign/launcher  
├── @ldesign/http
├── @ldesign/cache
├── @ldesign/device
├── @ldesign/store
├── @ldesign/size
├── @ldesign/i18n
├── @ldesign/crypto
└── @ldesign/webcomponent

第2层:
├── @ldesign/builder (依赖 kit)
└── @ldesign/config-editor

第3层:
├── @ldesign/shared (依赖 builder)
└── @ldesign/engine (依赖 builder)

第4层:
├── @ldesign/color (依赖 shared)
├── @ldesign/api (依赖 http)
└── @ldesign/router (依赖 device)

第5层:
└── @ldesign/theme (依赖 color)

第6层:
└── @ldesign/template (依赖 cache, device, engine, shared)
```

## 🛠️ 使用方法

### 基本用法

```bash
# 串行构建所有包
tsx scripts/build-packages.ts

# 并行构建同一层级的包（推荐）
tsx scripts/build-packages.ts --parallel

# 只分析依赖关系，不执行构建
tsx scripts/build-packages.ts --dry-run

# 显示详细日志
tsx scripts/build-packages.ts --verbose

# 组合使用
tsx scripts/build-packages.ts --parallel --verbose
```

### 命令行选项

| 选项 | 描述 |
|------|------|
| `--dry-run` | 只分析依赖关系，不执行实际的打包操作 |
| `--verbose` | 显示详细的日志输出 |
| `--parallel` | 并行构建同一层级的包（提高构建速度） |
| `--help`, `-h` | 显示帮助信息 |

## 📊 输出示例

### 正常构建输出

```
🏗️  LDesign Packages 批量打包工具
ℹ 工作目录: /path/to/ldesign
ℹ 包目录: /path/to/ldesign/packages

📦 扫描 packages 目录...
✓ 扫描完成，共发现 20 个包

🔍 验证依赖关系...
✓ 依赖关系验证通过

🔗 构建依赖关系图...
✓ 依赖图构建完成，共 20 个节点

📊 执行拓扑排序...
✓ 拓扑排序完成，共 6 个层级

📋 构建计划
第 1 层:
  构建: @ldesign/kit, @ldesign/launcher, @ldesign/http, @ldesign/cache, @ldesign/device, @ldesign/store
第 2 层:
  构建: @ldesign/builder
第 3 层:
  构建: @ldesign/shared, @ldesign/engine
...

🚀 开始构建包...

第 1 层构建 (6 个包): @ldesign/kit, @ldesign/launcher, @ldesign/http, @ldesign/cache, @ldesign/device, @ldesign/store
✓ @ldesign/kit 构建成功 (12.3s)
✓ @ldesign/launcher 构建成功 (8.7s)
...

🎉 构建完成！共构建 18 个包，耗时 156.7s
```

### 干运行输出

```bash
tsx scripts/build-packages.ts --dry-run --verbose
```

会显示完整的依赖分析过程，但不执行实际构建。

## 🔧 技术实现

### 核心组件

1. **PackageScanner**: 负责扫描和分析包信息
2. **DependencyAnalyzer**: 负责构建依赖图和拓扑排序
3. **PackageBuilder**: 负责执行实际的打包操作
4. **Logger**: 提供丰富的日志输出

### 算法特性

- **拓扑排序**: 使用 Kahn 算法进行拓扑排序
- **循环依赖检测**: 在排序过程中自动检测循环依赖
- **并行优化**: 同一层级的包可以并行构建
- **错误恢复**: 单个包构建失败不会影响其他包

## 🚨 注意事项

1. **构建脚本要求**: 只有包含 `build` 脚本的包才会被构建
2. **依赖范围**: 只分析 `@ldesign` 命名空间下的包依赖
3. **构建工具**: 使用 `pnpm run build` 执行构建
4. **Windows 兼容**: 自动处理 Windows 平台的命令执行

## 🐛 故障排除

### 常见问题

1. **循环依赖错误**
   ```
   检测到循环依赖: @ldesign/a, @ldesign/b
   ```
   解决方案: 检查并修复包之间的循环依赖关系

2. **包构建失败**
   ```
   @ldesign/xxx 构建失败: 命令执行失败 (退出码: 1)
   ```
   解决方案: 使用 `--verbose` 选项查看详细错误信息

3. **找不到包**
   ```
   @ldesign/xxx 依赖的 @ldesign/yyy 不存在于当前包列表中
   ```
   解决方案: 确保所有依赖的包都存在于 packages 目录中

## 📝 开发说明

如需修改或扩展此工具，请注意：

1. 所有类都有完整的 TypeScript 类型定义
2. 代码结构采用面向对象设计，易于扩展
3. 详细的注释说明了每个方法的功能
4. 错误处理覆盖了所有可能的异常情况

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个工具！
