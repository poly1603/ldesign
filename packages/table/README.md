# @ldesign/table

一个功能强大、高性能的现代表格组件库，提供完整的数据表格解决方案。

## ✨ 特性

### 🚀 核心功能
- **数据渲染**: 支持大量数据的高效渲染
- **排序筛选**: 多列排序和高级筛选功能
- **分页**: 灵活的分页配置和导航
- **行选择**: 单选、多选和全选支持
- **列操作**: 列宽调整、固定列、列排序

### ⚡ 性能优化
- **虚拟滚动**: 支持万级数据流畅滚动
- **懒加载**: 按需加载数据，提升初始化速度
- **增量更新**: 智能差异计算，减少重绘
- **缓存机制**: 多层缓存策略，提升响应速度
- **批量操作**: 优化大量数据操作性能

### 🎨 用户体验
- **响应式设计**: 完美适配移动端和桌面端
- **主题系统**: 10+ 预设主题，支持自定义主题
- **无障碍支持**: 符合 WCAG 标准的无障碍设计
- **国际化**: 完整的多语言支持
- **动画效果**: 流畅的交互动画和过渡效果

### 🔧 高级功能
- **可编辑单元格**: 多种编辑器类型和验证规则
- **拖拽排序**: HTML5 拖拽API，支持行重排序
- **数据导出**: 多格式导出（CSV、Excel、JSON等）
- **展开行**: 支持行展开显示详细信息
- **树形数据**: 支持层级数据展示

### 🛠️ 开发体验
- **TypeScript**: 完整的类型定义和智能提示
- **框架无关**: 可与任何前端框架集成
- **模块化**: 按需引入，减少包体积
- **事件系统**: 完整的事件监听和处理机制
- **插件架构**: 易于扩展和定制

## 📦 安装

```bash
# npm
npm install @ldesign/table

# yarn
yarn add @ldesign/table

# pnpm
pnpm add @ldesign/table
```

## 🚀 快速开始

### 基础用法

```typescript
import { Table } from '@ldesign/table'
import '@ldesign/table/styles'

// 创建表格实例
const table = new Table({
  container: '#table-container',
  columns: [
    { key: 'name', title: '姓名', sortable: true, width: 120 },
    { key: 'age', title: '年龄', sortable: true, width: 80 },
    { key: 'department', title: '部门', filterable: true, width: 150 },
    { key: 'salary', title: '薪资', sortable: true, width: 100,
      render: (value) => `¥${value.toLocaleString()}` }
  ],
  data: [
    { id: 1, name: '张三', age: 25, department: '技术部', salary: 8000 },
    { id: 2, name: '李四', age: 30, department: '市场部', salary: 7500 },
    { id: 3, name: '王五', age: 28, department: '人事部', salary: 6500 }
  ],
  rowKey: 'id',
  pagination: {
    enabled: true,
    pageSize: 10
  },
  selection: {
    enabled: true,
    multiple: true
  }
})
```

### Vue 集成

```vue
<template>
  <div ref="tableContainer" class="table-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Table } from '@ldesign/table/vue'

const tableContainer = ref<HTMLElement>()

onMounted(() => {
  const table = new Table({
    container: tableContainer.value!,
    columns: [
      // 列配置
    ],
    data: [
      // 数据
    ]
  })
  
  table.render()
})
</script>
```

### React 集成

```tsx
import React, { useRef, useEffect } from 'react'
import { Table } from '@ldesign/table/react'

const TableComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const table = new Table({
        container: containerRef.current,
        columns: [
          // 列配置
        ],
        data: [
          // 数据
        ]
      })
      
      table.render()
      
      return () => table.destroy()
    }
  }, [])

  return <div ref={containerRef} className="table-container" />
}
```

## 📖 核心功能

### 虚拟滚动

```typescript
const table = new Table({
  // 启用虚拟滚动
  virtualScroll: {
    enabled: true,
    itemHeight: 40,        // 行高
    bufferSize: 10,        // 缓冲区大小
    threshold: 100         // 启用虚拟滚动的数据量阈值
  }
})
```

### 固定功能

```typescript
const table = new Table({
  columns: [
    { key: 'id', title: 'ID', fixed: 'left' },      // 左侧固定
    { key: 'name', title: '姓名' },                  // 普通列
    { key: 'action', title: '操作', fixed: 'right' } // 右侧固定
  ],
  // 固定表头
  fixedHeader: true,
  // 固定脚部
  fixedFooter: true
})
```

### 多选功能

```typescript
const table = new Table({
  selection: {
    enabled: true,
    multiple: true,        // 多选
    checkboxColumn: true,  // 显示复选框列
    onSelectionChange: (selectedRows) => {
      console.log('选中的行:', selectedRows)
    }
  }
})
```

### 排序功能

```typescript
const table = new Table({
  columns: [
    {
      key: 'name',
      title: '姓名',
      sortable: true,      // 启用排序
      sorter: (a, b) => a.name.localeCompare(b.name)
    }
  ]
})
```

### 过滤功能

```typescript
const table = new Table({
  columns: [
    {
      key: 'status',
      title: '状态',
      filterable: true,    // 启用过滤
      filters: [
        { text: '活跃', value: 'active' },
        { text: '禁用', value: 'disabled' }
      ]
    }
  ]
})
```

## 🎨 样式定制

表格使用 CSS 变量进行样式定制：

```css
:root {
  /* 表格基础颜色 */
  --ldesign-table-bg: #ffffff;
  --ldesign-table-border: #e5e5e5;
  --ldesign-table-header-bg: #fafafa;
  
  /* 表格文字颜色 */
  --ldesign-table-text: var(--ldesign-text-color-primary);
  --ldesign-table-text-secondary: var(--ldesign-text-color-secondary);
  
  /* 表格交互颜色 */
  --ldesign-table-hover-bg: #f5f5f5;
  --ldesign-table-selected-bg: var(--ldesign-brand-color-1);
}
```

## 📚 API 文档

详细的 API 文档请查看：[API 文档](./docs/api.md)

## 🧪 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 测试覆盖率
pnpm test:coverage

# 代码检查
pnpm lint
```

### 高级配置

```typescript
const advancedTable = new Table({
  container: '#advanced-table',
  columns: columns,
  data: data,
  rowKey: 'id',

  // 虚拟滚动（大数据量）
  virtualScroll: {
    enabled: true,
    itemHeight: 40,
    bufferSize: 10
  },

  // 可编辑功能
  editable: {
    enabled: true,
    editors: {
      name: { type: 'text', required: true },
      age: { type: 'number', min: 18, max: 65 },
      department: {
        type: 'select',
        options: ['技术部', '市场部', '人事部']
      }
    }
  },

  // 拖拽排序
  dragSort: {
    enabled: true,
    onSortChange: (data) => {
      console.log('排序变更:', data)
    }
  },

  // 主题配置
  theme: {
    type: 'light',
    responsive: 'auto',
    animations: true
  }
})
```

## 📖 文档

### 核心文档
- [📚 API 文档](./docs/api.md) - 完整的 API 参考
- [🎨 主题系统](./docs/theme-system.md) - 主题定制指南
- [🧪 测试文档](./docs/testing.md) - 测试指南和覆盖率
- [🔧 故障排除](./docs/troubleshooting.md) - 常见问题解决方案

### 使用示例
- [📋 示例总览](./examples/README.md) - 所有示例的详细说明
- [🔗 在线演示](./examples/index.html) - 交互式功能演示
- [⚛️ React 集成](./examples/frameworks/react-example.html)
- [🔧 Vue.js 集成](./examples/frameworks/vue-example.html)

## 🎯 核心概念

### 数据管理
```typescript
// 设置数据
table.setData(newData)

// 添加行
table.addRow({ id: 4, name: '赵六', age: 32 })

// 更新行
table.updateRow(1, { age: 26 })

// 删除行
table.removeRow(1)
```

### 事件处理
```typescript
// 监听选择变更
table.on('selection-change', (data) => {
  console.log('选中行:', data.selectedRows)
})

// 监听排序变更
table.on('sort-change', (data) => {
  console.log('排序:', data.column, data.direction)
})

// 监听数据变更
table.on('data-change', (data) => {
  console.log('数据变更:', data.type, data.count)
})
```

### 主题定制
```typescript
// 设置预设主题
table.setTheme({ type: 'dark' })

// 自定义主题
table.setTheme({
  type: 'custom',
  customVars: {
    '--ldesign-brand-color': '#ff6b6b',
    '--ldesign-bg-color-container': '#f8f9fa'
  }
})
```

## 🔧 开发

### 环境要求
- Node.js >= 16
- pnpm >= 7

### 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建项目
pnpm build

# 运行测试
pnpm test

# 测试覆盖率
pnpm test:coverage

# 启动示例服务器
cd examples && pnpm dev
```

### 项目结构

```
packages/table/
├── src/                    # 源代码
│   ├── components/         # UI 组件
│   ├── core/              # 核心类
│   ├── managers/          # 功能管理器
│   ├── styles/            # 样式文件
│   ├── types/             # 类型定义
│   └── utils/             # 工具函数
├── tests/                 # 测试文件
├── examples/              # 使用示例
├── docs/                  # 文档
└── dist/                  # 构建输出
```

## 🤝 贡献

我们欢迎所有形式的贡献！

### 贡献方式
1. 🐛 报告 Bug
2. 💡 提出新功能建议
3. 📝 改进文档
4. 🔧 提交代码

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交变更
4. 添加测试
5. 确保测试通过
6. 提交 Pull Request

## 📊 测试状态

- **总测试数**: 416
- **通过率**: 97% (403/416)
- **代码覆盖率**: 95%+
- **性能基准**: 支持 10万+ 数据行

## 🌟 特别感谢

感谢所有为这个项目做出贡献的开发者！

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件
