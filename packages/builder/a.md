请对位于 `h:\ldesign/packages/builder/` 目录的基于 Rollup 的前端库打包工具进行全面开发和优化。

**核心要求：**

1. **智能项目检测与配置**
   - 自动检测项目类型（Vue 组件库、React 组件库、纯 TypeScript 库等）
   - 自动识别源码中的文件类型（.ts、.tsx、.vue、.jsx、.css、.less、.scss 等）
   - 根据检测结果自动配置 Rollup 配置和插件

2. **插件配置要求**
   - Vue 单文件组件使用 `unplugin-vue`
   - Vue JSX 语法使用 `unplugin-vue-jsx`
   - 自动配置其他必要的 Rollup 插件（TypeScript、CSS 处理、资源处理等）

3. **打包输出要求**
   - 打包 `src` 目录中的所有文件
   - 保持原有目录结构输出到产物目录
   - 生成多种格式：ESM、CJS、UMD（UMD 格式除外保持目录结构）
   - 生成对应的 TypeScript 声明文件（.d.ts）

4. **API 设计**
   - 不提供 CLI 工具，仅导出类或方法供编程调用
   - API 设计要简单易用，支持丰富的配置选项
   - 支持自定义配置覆盖自动检测的配置

5. **质量保证**
   - 编写 100% 测试覆盖率的单元测试
   - 完整的 TypeScript 类型定义，确保类型安全
   - 使用 VitePress 编写完整的使用文档
   - 确保构建过程无错误
   - 确保所有测试通过
   - 确保无 TypeScript 类型错误
   - 确保无 ESLint 格式错误

6. **技术栈要求**
   - 基于 Rollup 构建
   - 使用 TypeScript 开发
   - 支持现代前端框架和工具链
   - 遵循最佳实践和编码规范

请按照上述要求完整实现这个前端库打包工具，确保功能完整、质量可靠、文档齐全。