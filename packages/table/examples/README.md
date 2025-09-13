# LDESIGN Table 使用示例

这个目录包含了 LDESIGN Table 的完整使用示例，展示了表格组件的各种功能和集成方式。

## 📋 示例列表

### 基础功能示例

- **[index.html](./index.html)** - 主页和功能概览
- **[basic.html](./basic.html)** - 基础表格功能演示
- **[filter.html](./filter.html)** - 筛选和搜索功能
- **[editable.html](./editable.html)** - 可编辑单元格功能
- **[drag-sort.html](./drag-sort.html)** - 拖拽排序功能
- **[export.html](./export.html)** - 数据导出功能
- **[theme.html](./theme.html)** - 主题系统演示
- **[performance.html](./performance.html)** - 性能测试和优化
- **[complete.html](./complete.html)** - 完整功能集成演示

### 框架集成示例

- **[frameworks/vue-example.html](./frameworks/vue-example.html)** - Vue.js 集成示例
- **[frameworks/react-example.html](./frameworks/react-example.html)** - React 集成示例

## 🚀 快速开始

### 1. 安装依赖

```bash
cd examples
pnpm install
```

### 2. 启动开发服务器

```bash
npx vite
```

### 3. 访问示例

打开浏览器访问 `http://localhost:3000`，选择不同的示例页面进行体验。

## 📖 示例详解

### 基础表格 (basic.html)

展示表格的核心功能：
- 数据渲染和显示
- 排序功能
- 分页功能
- 行选择功能
- 基础事件处理

```javascript
import { Table } from '@ldesign/table'

const table = new Table({
  container: '#table-container',
  columns: [
    { key: 'name', title: '姓名', sortable: true },
    { key: 'age', title: '年龄', sortable: true },
    { key: 'department', title: '部门' }
  ],
  data: employees,
  pagination: { enabled: true, pageSize: 10 },
  selection: { enabled: true, multiple: true }
})
```

### 筛选搜索 (filter.html)

演示高级筛选功能：
- 全局搜索
- 多列独立筛选
- 条件组合筛选
- 快速筛选按钮
- 筛选状态管理

```javascript
// 全局搜索
table.setFilter('global', (row) => {
  return Object.values(row).some(value => 
    String(value).toLowerCase().includes(searchTerm)
  )
})

// 条件筛选
table.setFilter('department', (row) => row.department === '技术部')
```

### 可编辑表格 (editable.html)

展示单元格编辑功能：
- 多种编辑器类型
- 验证规则
- 编辑事件处理
- 键盘快捷键
- 批量编辑

```javascript
const editableTable = new Table({
  // ... 其他配置
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
  }
})
```

### 拖拽排序 (drag-sort.html)

演示拖拽排序功能：
- HTML5 拖拽API
- 拖拽视觉反馈
- 拖拽约束
- 排序历史记录
- 自动滚动支持

```javascript
const dragTable = new Table({
  // ... 其他配置
  dragSort: {
    enabled: true,
    handleSelector: '.drag-handle',
    onSortChange: (data) => {
      console.log(`从 ${data.fromIndex} 移动到 ${data.toIndex}`)
    }
  }
})
```

### 数据导出 (export.html)

展示多格式导出功能：
- CSV、Excel、JSON、XML、HTML 格式
- 选择性列导出
- 筛选数据导出
- 导出进度跟踪
- 自定义文件名

```javascript
// 导出 CSV
table.exportData({
  format: 'csv',
  filename: '员工数据.csv',
  columns: ['name', 'age', 'department'],
  includeHeaders: true
})

// 导出选中数据
table.exportData({
  format: 'excel',
  data: table.getSelectedRows(),
  filename: '选中员工.xlsx'
})
```

### 主题系统 (theme.html)

演示主题定制功能：
- 多种预设主题
- 响应式模式
- 自定义主题
- 特性开关
- 无障碍支持

```javascript
// 设置主题
table.setTheme({
  type: 'dark',
  responsive: 'auto',
  animations: true,
  shadows: true,
  rounded: true
})

// 自定义主题
table.setTheme({
  type: 'custom',
  customVars: {
    '--ldesign-brand-color': '#ff6b6b',
    '--ldesign-bg-color-container': '#f8f9fa'
  }
})
```

### 性能测试 (performance.html)

展示大数据量处理：
- 虚拟滚动
- 懒加载机制
- 增量更新
- 性能监控
- 批量操作优化

```javascript
const performanceTable = new Table({
  // ... 其他配置
  virtualScroll: {
    enabled: true,
    itemHeight: 40,
    bufferSize: 10
  },
  performance: {
    lazyLoad: true,
    cache: true,
    incremental: true
  }
})

// 生成大量数据
generateData(100000) // 10万条数据
```

## 🔧 框架集成

### Vue.js 集成

```vue
<template>
  <div ref="tableContainer"></div>
</template>

<script>
import { Table } from '@ldesign/table'

export default {
  mounted() {
    this.table = new Table({
      container: this.$refs.tableContainer,
      columns: this.columns,
      data: this.data,
      onSelectionChange: this.handleSelectionChange
    })
  },
  beforeUnmount() {
    this.table?.destroy()
  }
}
</script>
```

### React 集成

```jsx
import React, { useEffect, useRef } from 'react'
import { Table } from '@ldesign/table'

function TableComponent({ columns, data, onSelectionChange }) {
  const containerRef = useRef(null)
  const tableRef = useRef(null)

  useEffect(() => {
    tableRef.current = new Table({
      container: containerRef.current,
      columns,
      data,
      onSelectionChange
    })

    return () => {
      tableRef.current?.destroy()
    }
  }, [])

  return <div ref={containerRef} />
}
```

## 📁 项目结构

```
examples/
├── index.html              # 主页
├── basic.html              # 基础功能
├── filter.html             # 筛选搜索
├── editable.html           # 可编辑表格
├── drag-sort.html          # 拖拽排序
├── export.html             # 数据导出
├── theme.html              # 主题系统
├── performance.html        # 性能测试
├── complete.html           # 完整功能
├── frameworks/             # 框架集成示例
│   ├── vue-example.html    # Vue.js 示例
│   └── react-example.html  # React 示例
├── src/                    # 共享资源
│   ├── styles/             # 样式文件
│   └── utils/              # 工具函数
├── package.json            # 项目配置
├── vite.config.js          # Vite 配置
└── README.md               # 说明文档
```

## 🎯 最佳实践

### 1. 性能优化

- 对于大数据量（>1000行），启用虚拟滚动
- 使用懒加载减少初始渲染时间
- 启用缓存提高重复操作性能
- 使用增量更新减少不必要的重绘

### 2. 用户体验

- 提供加载状态指示
- 实现错误处理和用户反馈
- 支持键盘导航和快捷键
- 确保响应式设计适配移动端

### 3. 开发建议

- 使用 TypeScript 获得更好的类型安全
- 实现适当的事件处理和清理
- 遵循组件生命周期管理
- 进行充分的测试覆盖

## 🔗 相关链接

- [API 文档](../docs/api.md)
- [主题系统文档](../docs/theme-system.md)
- [性能优化指南](../docs/performance.md)
- [故障排除](../docs/troubleshooting.md)

## 📞 技术支持

如果您在使用过程中遇到问题，请：

1. 查看相关文档和示例
2. 检查浏览器控制台错误信息
3. 参考故障排除指南
4. 提交 Issue 或联系技术支持
