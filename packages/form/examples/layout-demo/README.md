# @ldesign/form 布局演示

这是一个展示 @ldesign/form 布局系统功能的演示项目。

## 功能特性

### 🎯 布局功能演示

- **响应式网格布局** - 支持不同屏幕尺寸下的自适应列数
- **字段跨列功能** - 某些字段可以占用多列空间
- **字段分组显示** - 将相关字段分组，提高表单可读性
- **多种标签位置** - 支持顶部、左侧、右侧标签布局
- **自定义间距** - 可调整字段间距和行列间距
- **标签对齐方式** - 支持左对齐、居中、右对齐

### 📋 表单组件展示

包含 20+ 个不同类型的表单字段：

- **文本输入** - 基础文本、邮箱、电话、网址等
- **选择组件** - 下拉选择、单选框、多选框
- **开关组件** - 布尔值切换
- **日期选择** - 日期选择器
- **文本域** - 多行文本输入
- **数字输入** - 数值类型输入

### 🎨 交互功能

- **实时布局切换** - 动态调整布局参数，实时预览效果
- **预设布局** - 提供多种常用布局预设
- **表单验证** - 可开启/关闭表单验证功能
- **数据预览** - 实时显示表单数据和布局配置
- **响应式设计** - 支持移动端和桌面端

## 技术栈

- **Vue 3** - 使用 Composition API
- **TypeScript** - 完整的类型支持
- **Vite** - 快速的开发构建工具
- **SCSS** - CSS 预处理器
- **@ldesign/form** - 表单组件库

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

项目将在 http://localhost:3000 启动。

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

### 预览构建结果

```bash
npm run preview
# 或
yarn preview
# 或
pnpm preview
```

## 项目结构

```
src/
├── components/          # 组件目录（如需要）
├── composables/         # 组合式函数
│   └── useFormConfig.ts # 表单配置管理
├── styles/              # 样式文件
│   ├── main.scss        # 主样式文件
│   └── variables.scss   # SCSS 变量
├── types/               # 类型定义
│   └── form.ts          # 表单相关类型
├── App.vue              # 主应用组件
└── main.ts              # 应用入口
```

## 使用说明

### 布局控制面板

1. **布局预设** - 选择预定义的布局配置
2. **列数调整** - 设置表单的列数（1-4 列）
3. **间距控制** - 调整字段间距（8-32px）
4. **标签位置** - 选择标签显示位置
5. **标签宽度** - 设置左/右标签的宽度
6. **标签对齐** - 设置标签的对齐方式

### 功能开关

- **显示分组** - 开启/关闭字段分组功能
- **显示验证** - 开启/关闭表单验证
- **重置表单** - 清空所有表单数据

### 数据预览

右侧面板实时显示：

- 当前表单数据（JSON 格式）
- 当前布局配置（JSON 格式）

## 学习要点

### 1. 响应式布局

```typescript
// 响应式列数配置
columns: {
  xs: 1,    // 手机端 1 列
  sm: 1,    // 小屏幕 1 列
  md: 2,    // 平板 2 列
  lg: 3,    // 桌面 3 列
  xl: 4     // 大屏幕 4 列
}
```

### 2. 字段跨列

```typescript
// 字段配置
{
  name: 'email',
  label: '邮箱地址',
  component: 'FormInput',
  span: 'full'  // 跨越所有列
}
```

### 3. 字段分组

```typescript
// 分组配置
groups: [
  {
    title: '基本信息',
    fields: ['firstName', 'lastName', 'email'],
    collapsible: true,
  },
]
```

### 4. 标签布局

```typescript
// 布局配置
layout: {
  labelPosition: 'left',  // 标签位置
  labelWidth: 120,        // 标签宽度
  labelAlign: 'right'     // 标签对齐
}
```

## 扩展开发

### 添加新的字段类型

1. 在 `useFormConfig.ts` 中的 `baseFields` 数组添加新字段配置
2. 更新 `FormData` 类型定义
3. 在表单数据初始化中添加对应字段

### 添加新的布局预设

在 `useFormConfig.ts` 中的 `layoutPresets` 数组添加新预设：

```typescript
{
  name: 'custom',
  label: '自定义布局',
  config: {
    columns: 2,
    gap: 20,
    labelPosition: 'top'
  }
}
```

### 自定义样式

在 `src/styles/` 目录下修改或添加样式文件。

## 相关链接

- [@ldesign/form 文档](../docs/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)

## 许可证

MIT
