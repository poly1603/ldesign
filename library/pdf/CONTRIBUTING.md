# 贡献指南

感谢你对@ldesign/pdf的关注！我们欢迎各种形式的贡献。

## 🚀 开始之前

1. **Fork 仓库**
2. **克隆到本地**
   ```bash
   git clone https://github.com/your-username/pdf.git
   cd pdf
   ```
3. **安装依赖**
   ```bash
   pnpm install
   ```

## 📝 贡献方式

### 报告Bug

在[Issues](https://github.com/ldesign/pdf/issues)中创建新问题：

- 使用清晰的标题
- 详细描述问题
- 提供复现步骤
- 包含环境信息（浏览器、版本等）
- 如果可能，提供最小可复现示例

### 提出新功能

在[Issues](https://github.com/ldesign/pdf/issues)中提出：

- 说明功能的用途
- 描述预期行为
- 提供使用示例

### 提交代码

1. **创建分支**
   ```bash
   git checkout -b feature/my-feature
   # 或
   git checkout -b fix/my-fix
   ```

2. **编写代码**
   - 遵循现有代码风格
   - 添加必要的注释
   - 更新相关文档

3. **测试代码**
   ```bash
   # 构建库
   pnpm build

   # 运行示例测试
   pnpm dev:vue3
   pnpm dev:vanilla

   # 检查文档
   pnpm docs:dev
   ```

4. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   # 或
   git commit -m "fix: 修复Bug"
   ```

5. **推送到远程**
   ```bash
   git push origin feature/my-feature
   ```

6. **创建 Pull Request**
   - 提供清晰的标题和描述
   - 关联相关Issue
   - 等待代码审查

## 📋 提交信息规范

遵循[约定式提交](https://www.conventionalcommits.org/zh-hans/)：

```
<类型>(<范围>): <描述>

[可选的正文]

[可选的脚注]
```

**类型:**
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例:**
```
feat(core): 添加虚拟滚动支持

添加了虚拟滚动功能以提升大型PDF的性能。

Closes #123
```

## 🏗️ 项目结构

```
pdf/
├── src/                    # 源代码
│   ├── core/              # 核心功能
│   ├── adapters/          # 框架适配器
│   ├── types/             # 类型定义
│   └── utils/             # 工具函数
├── examples/              # 示例项目
├── docs/                  # 文档
└── scripts/               # 构建脚本
```

## 💻 开发流程

### 开发新功能

1. **创建分支**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **编写代码**
   - 在`src/`目录下添加代码
   - 更新类型定义
   - 添加必要的注释

3. **更新文档**
   - 在`docs/`中添加或更新文档
   - 更新README.md（如需要）

4. **创建示例**
   - 在示例项目中添加演示
   - 确保示例可以运行

5. **测试**
   ```bash
   pnpm build
   pnpm dev:vue3
   pnpm dev:vanilla
   pnpm docs:dev
   ```

### 修复Bug

1. **创建分支**
   ```bash
   git checkout -b fix/bug-description
   ```

2. **定位问题**
   - 理解Bug产生的原因
   - 编写复现步骤

3. **修复问题**
   - 修改相关代码
   - 添加注释说明

4. **验证修复**
   - 确保Bug已修复
   - 检查是否引入新问题

## 📚 代码规范

### TypeScript

- 使用TypeScript编写代码
- 提供完整的类型定义
- 避免使用`any`类型

```typescript
// ✅ 好的
function loadPDF(source: PDFSource): Promise<void> {
  // ...
}

// ❌ 不好的
function loadPDF(source: any): any {
  // ...
}
```

### 命名规范

- 类名：`PascalCase`
- 函数/变量：`camelCase`
- 常量：`UPPER_SNAKE_CASE`
- 私有成员：`_camelCase`

```typescript
class PDFViewer {
  private _scale: number;

  public goToPage(pageNumber: number): void {
    // ...
  }
}
```

### 注释规范

使用JSDoc格式：

```typescript
/**
 * 加载PDF文档
 * @param source - PDF来源
 * @returns Promise
 */
async load(source: PDFSource): Promise<void> {
  // ...
}
```

## 🧪 测试

虽然目前项目没有自动化测试，但请确保：

1. **手动测试**
   - 在所有示例项目中测试
   - 测试不同的浏览器
   - 测试不同的PDF文件

2. **文档测试**
   - 确保文档示例可以运行
   - 检查文档是否准确

## 📖 文档

### 更新文档

在`docs/`目录下更新相关文档：

- **指南**: `docs/guide/`
- **API**: `docs/api/`
- **示例**: `docs/examples/`

### 文档格式

使用Markdown编写，遵循以下格式：

```markdown
# 标题

简要介绍...

## 子标题

详细说明...

### 代码示例

\`\`\`typescript
const viewer = new PDFViewer({...});
\`\`\`

### 注意事项

- 要点1
- 要点2
```

## 🎨 Vue组件开发

开发Vue组件时：

1. 使用`<script setup>`语法
2. 使用TypeScript
3. 提供Props类型定义
4. 使用Emits类型定义
5. 添加注释说明

```vue
<template>
  <!-- 模板 -->
</template>

<script setup lang="ts">
/**
 * PDF查看器组件
 */
import { ref } from 'vue';

interface Props {
  /** PDF源 */
  source: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  load: [];
  error: [error: Error];
}>();
</script>
```

## 🔍 代码审查

提交Pull Request后：

1. **自我审查**
   - 检查代码质量
   - 确保没有遗漏

2. **响应反馈**
   - 及时回复评论
   - 根据建议修改

3. **保持更新**
   - 及时同步主分支
   - 解决冲突

## ❓ 获取帮助

如有问题，可以：

- 在Issues中提问
- 查看[文档](./docs/)
- 参考现有代码

## 📜 许可证

提交代码即表示你同意将代码以MIT许可证发布。

## 🙏 感谢

感谢所有贡献者！你的贡献让这个项目变得更好。

---

再次感谢你的贡献！🎉
