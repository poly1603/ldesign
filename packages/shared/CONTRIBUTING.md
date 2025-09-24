# 贡献指南

感谢您对 @ldesign/shared 的关注！我们欢迎任何形式的贡献。

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- TypeScript >= 5.0.0

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/ldesign/ldesign.git
cd ldesign/packages/shared

# 安装依赖
pnpm install
```

### 开发流程

```bash
# 开发模式
pnpm dev

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 运行测试
pnpm test

# 构建
pnpm build
```

## 📝 代码规范

### TypeScript 规范

- 使用严格的 TypeScript 配置
- 所有公共 API 必须有完整的类型定义
- 避免使用 `any` 类型，使用 `unknown` 替代
- 优先使用类型推断，必要时才显式声明类型

### 代码风格

- 使用 ESLint + Prettier 进行代码格式化
- 使用 2 个空格缩进
- 使用单引号
- 行尾不加分号
- 最大行长度 100 字符

### 命名规范

- 文件名使用 camelCase
- 函数名使用 camelCase
- 类名使用 PascalCase
- 常量使用 UPPER_SNAKE_CASE
- 类型名使用 PascalCase

### 注释规范

- 所有公共函数必须有 JSDoc 注释
- 注释应该说明函数的用途、参数、返回值
- 提供使用示例
- 复杂逻辑需要添加行内注释

示例：

```typescript
/**
 * 将数组分割成指定大小的块
 * 
 * @param array - 要分割的数组
 * @param size - 每块的大小
 * @returns 分割后的二维数组
 * 
 * @example
 * ```typescript
 * chunk([1, 2, 3, 4, 5, 6], 2) // [[1, 2], [3, 4], [5, 6]]
 * chunk([1, 2, 3, 4, 5], 3) // [[1, 2, 3], [4, 5]]
 * ```
 */
export function chunk<T>(array: T[], size: number): T[][] {
  // 实现代码...
}
```

## 🧪 测试规范

### 测试要求

- 所有新功能必须有对应的测试
- 测试覆盖率不低于 85%
- 使用 Vitest 作为测试框架
- 测试文件命名为 `*.test.ts` 或 `*.spec.ts`

### 测试示例

```typescript
import { describe, it, expect } from 'vitest'
import { chunk } from '../array'

describe('chunk', () => {
  it('should split array into chunks of specified size', () => {
    expect(chunk([1, 2, 3, 4, 5, 6], 2)).toEqual([[1, 2], [3, 4], [5, 6]])
    expect(chunk([1, 2, 3, 4, 5], 3)).toEqual([[1, 2, 3], [4, 5]])
  })

  it('should return empty array for invalid size', () => {
    expect(chunk([1, 2, 3], 0)).toEqual([])
    expect(chunk([1, 2, 3], -1)).toEqual([])
  })

  it('should handle empty array', () => {
    expect(chunk([], 2)).toEqual([])
  })
})
```

## 📁 项目结构

```
packages/shared/
├── src/
│   ├── components/     # Vue 组件
│   ├── hooks/         # Vue 3 Composition API hooks
│   ├── types/         # TypeScript 类型定义
│   ├── utils/         # 工具函数
│   └── index.ts       # 主入口文件
├── __tests__/         # 测试文件
├── docs/             # 文档
├── scripts/          # 构建脚本
└── package.json
```

## 🔄 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 类型说明

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式化（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例

```
feat(utils): add chunk function for array splitting

Add a new utility function to split arrays into chunks of specified size.
This is useful for pagination and data processing scenarios.

Closes #123
```

## 🚀 发布流程

1. 确保所有测试通过
2. 更新版本号（遵循 [Semantic Versioning](https://semver.org/)）
3. 更新 CHANGELOG.md
4. 创建 Pull Request
5. 代码审查通过后合并
6. 自动发布到 npm

## 📞 联系我们

- 提交 Issue: [GitHub Issues](https://github.com/ldesign/ldesign/issues)
- 讨论: [GitHub Discussions](https://github.com/ldesign/ldesign/discussions)
- 邮箱: ldesign@example.com

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件。
