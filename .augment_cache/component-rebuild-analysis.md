# 组件库重构项目分析报告

## 当前项目状态分析

### 现有组件库架构
- **技术栈**: 基于 Stencil.js 的 Web Components
- **构建工具**: Stencil CLI + 自定义构建脚本
- **样式系统**: LESS + 设计系统变量
- **测试框架**: Jest + Puppeteer (E2E)
- **文档系统**: VitePress

### 现有组件清单
当前 `packages/component/src/components/` 包含以下组件：
- button (按钮)
- card (卡片)
- checkbox (复选框)
- form (表单 - 包含 form-item, form-row, form-col)
- icon (图标)
- input (输入框)
- message (消息)
- modal (模态框)
- notification (通知)
- popup (弹窗)
- radio (单选框)
- switch (开关)
- table (表格)
- tooltip (工具提示)

### 设计系统现状
- **色彩规范**: 已有完整的 LDESIGN 设计系统变量
- **主题**: 紫色主题 (#722ED1)
- **变量文件**: `packages/component/src/global/variables.less`
- **全局样式**: `packages/component/src/global/global.less`
- **混入文件**: `packages/component/src/global/mixins.less`

### 构建配置分析

#### @ldesign/builder 配置模式
根据代码库分析，@ldesign/builder 支持以下配置方式：
```typescript
// ldesign.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true
  },
  libraryType: 'vue3', // 或 'typescript'
  dts: true,
  minify: true,
  external: ['vue'],
  globals: { vue: 'Vue' },
  name: 'ComponentLibrary'
})
```

#### @ldesign/launcher 配置模式
```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    lib: {
      entry: './src/index.ts',
      name: 'MyLib',
      formats: ['es', 'cjs', 'umd'],
      dts: { outDir: 'dist/types' }
    }
  },
  build: {
    sourcemap: true,
    minify: 'esbuild'
  }
})
```

### 依赖关系分析

#### 当前依赖
- `@stencil/core`: Web Components 框架
- `@stencil/less`: LESS 预处理器
- `@stencil/vue-output-target`: Vue 3 集成
- `@ldesign/builder`: 已在 devDependencies 中

#### 需要的新依赖
- `@ldesign/launcher`: 启动工具
- `vitest`: 测试框架 (替换 Jest)
- `vite`: 构建工具
- `vue`: Vue 3 支持

### 重构策略

#### 技术栈迁移
- **从**: Stencil.js Web Components
- **到**: Vue 3 + TypeScript + Vite
- **原因**: 更好的 TypeScript 支持，更现代的开发体验

#### 构建工具迁移
- **从**: Stencil CLI
- **到**: @ldesign/builder + @ldesign/launcher
- **配置**: 使用 ldesign.config.ts 和 launcher.config.ts

#### 测试框架迁移
- **从**: Jest + Puppeteer
- **到**: Vitest + @vue/test-utils
- **优势**: 更快的测试执行，更好的 ESM 支持

### 风险评估

#### 高风险项
1. **依赖关系**: 其他包可能依赖当前组件库
2. **API 兼容性**: 新组件库的 API 可能与现有不兼容
3. **样式迁移**: LESS 变量和混入需要完整迁移

#### 缓解措施
1. **渐进式迁移**: 保留现有包，创建新的组件库
2. **API 设计**: 参考现有组件 API，保持兼容性
3. **样式复用**: 直接复用现有的设计系统变量

### 下一步行动计划

1. **安全清理**: 备份现有代码，然后清理目录
2. **环境配置**: 配置新的构建和测试环境
3. **样式系统**: 迁移设计系统变量和样式
4. **组件开发**: 按复杂度递增开发8个核心组件
5. **文档重建**: 创建新的 VitePress 文档系统

## 结论

当前项目具备良好的基础，设计系统完整，组件功能丰富。重构的主要目标是现代化技术栈，提升开发体验和性能。通过使用 @ldesign/builder 和 @ldesign/launcher，可以实现更好的构建和开发体验。
