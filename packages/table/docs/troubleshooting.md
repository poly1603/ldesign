# 故障排除指南

本文档提供了使用 LDESIGN Table 时常见问题的解决方案。

## 🚨 常见问题

### 1. 表格无法显示

#### 问题描述
表格容器为空，没有任何内容显示。

#### 可能原因
- 容器元素不存在
- CSS 样式未正确加载
- 数据格式错误
- 初始化时机不当

#### 解决方案

```typescript
// 1. 确保容器元素存在
const container = document.getElementById('table-container')
if (!container) {
  console.error('表格容器不存在')
  return
}

// 2. 检查 CSS 是否加载
import '@ldesign/table/styles'

// 3. 验证数据格式
const data = [
  { id: 1, name: '张三', age: 25 }, // 确保数据结构正确
  { id: 2, name: '李四', age: 30 }
]

// 4. 在 DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  const table = new Table({
    container: '#table-container',
    columns: [
      { key: 'name', title: '姓名' },
      { key: 'age', title: '年龄' }
    ],
    data,
    rowKey: 'id'
  })
})
```

### 2. 样式显示异常

#### 问题描述
表格样式混乱，布局不正确。

#### 可能原因
- CSS 文件未正确导入
- 样式冲突
- 主题配置错误
- 容器尺寸问题

#### 解决方案

```typescript
// 1. 确保正确导入样式
import '@ldesign/table/styles'
// 或者在 HTML 中引入
// <link rel="stylesheet" href="path/to/table.css">

// 2. 检查容器样式
.table-container {
  width: 100%;
  height: 400px; /* 确保有明确的高度 */
  overflow: auto;
}

// 3. 重置可能冲突的样式
.table-container * {
  box-sizing: border-box;
}

// 4. 设置正确的主题
table.setTheme({
  type: 'light',
  responsive: 'auto'
})
```

### 3. 数据更新不生效

#### 问题描述
调用数据更新方法后，表格显示没有变化。

#### 可能原因
- 数据引用未改变
- rowKey 配置错误
- 数据格式不匹配
- 缓存问题

#### 解决方案

```typescript
// 1. 确保 rowKey 正确配置
const table = new Table({
  // ...
  rowKey: 'id', // 确保每行都有唯一的 id
  data: data.map(item => ({ ...item, id: item.id || generateId() }))
})

// 2. 使用正确的更新方法
// 错误：直接修改原数组
data.push(newItem) // ❌

// 正确：使用表格方法
table.addRow(newItem) // ✅

// 3. 批量更新时创建新数组
const newData = [...data, newItem]
table.setData(newData)

// 4. 强制刷新
table.refresh()
```

### 4. 性能问题

#### 问题描述
大数据量时表格卡顿，滚动不流畅。

#### 可能原因
- 未启用虚拟滚动
- 渲染函数过于复杂
- 频繁的数据更新
- 内存泄漏

#### 解决方案

```typescript
// 1. 启用虚拟滚动
const table = new Table({
  // ...
  virtualScroll: {
    enabled: true,
    itemHeight: 40,
    bufferSize: 10
  }
})

// 2. 优化渲染函数
// 错误：复杂的渲染逻辑
render: (value, row) => {
  const div = document.createElement('div')
  // 复杂的 DOM 操作...
  return div
}

// 正确：简单的字符串返回
render: (value, row) => `<span class="custom">${value}</span>`

// 3. 使用批量操作
// 错误：逐个添加
data.forEach(item => table.addRow(item))

// 正确：批量添加
table.addRows(data)

// 4. 及时清理资源
table.destroy() // 组件销毁时调用
```

### 5. 事件监听器不工作

#### 问题描述
绑定的事件监听器没有被触发。

#### 可能原因
- 事件名称错误
- 监听器绑定时机不当
- 事件被阻止冒泡
- 监听器被覆盖

#### 解决方案

```typescript
// 1. 使用正确的事件名称
table.on('selection-change', handler) // ✅
table.on('selectionChange', handler)  // ❌

// 2. 在表格初始化后绑定
const table = new Table(config)
table.on('row-click', (data) => {
  console.log('点击行:', data.row)
})

// 3. 检查事件是否被阻止
table.on('row-click', (data, event) => {
  event.stopPropagation() // 可能阻止其他监听器
})

// 4. 避免重复绑定
table.off('row-click') // 先移除旧监听器
table.on('row-click', newHandler) // 再绑定新监听器
```

### 6. 编辑功能异常

#### 问题描述
单元格编辑功能无法正常工作。

#### 可能原因
- 编辑配置错误
- 验证规则问题
- 事件冲突
- 编辑器类型不支持

#### 解决方案

```typescript
// 1. 正确配置编辑功能
const table = new Table({
  // ...
  editable: {
    enabled: true,
    editors: {
      name: { 
        type: 'text', 
        required: true,
        validator: (value) => value.length > 0
      },
      age: { 
        type: 'number', 
        min: 0, 
        max: 120 
      }
    }
  }
})

// 2. 处理编辑事件
table.on('edit-save', (data) => {
  console.log('保存编辑:', data)
  // 执行保存逻辑
})

table.on('edit-error', (error) => {
  console.error('编辑错误:', error)
  // 显示错误信息
})

// 3. 自定义编辑器
const customEditor = {
  type: 'custom',
  render: (value, onChange) => {
    const input = document.createElement('input')
    input.value = value
    input.onchange = (e) => onChange(e.target.value)
    return input
  }
}
```

### 7. 导出功能失败

#### 问题描述
数据导出时出现错误或文件损坏。

#### 可能原因
- 浏览器兼容性问题
- 数据格式错误
- 文件大小限制
- 权限问题

#### 解决方案

```typescript
// 1. 检查浏览器支持
if (!window.Blob || !window.URL) {
  console.error('浏览器不支持文件导出')
  return
}

// 2. 处理导出错误
table.on('export-error', (error) => {
  console.error('导出失败:', error)
  alert('导出失败，请重试')
})

// 3. 分批导出大数据
const batchSize = 1000
const totalRows = table.getData().length
for (let i = 0; i < totalRows; i += batchSize) {
  const batch = table.getData().slice(i, i + batchSize)
  table.exportData({
    format: 'csv',
    data: batch,
    filename: `数据_${Math.floor(i / batchSize) + 1}.csv`
  })
}

// 4. 自定义导出格式
table.exportData({
  format: 'custom',
  transformer: (data) => {
    // 自定义数据转换逻辑
    return JSON.stringify(data, null, 2)
  },
  filename: 'custom_export.json'
})
```

## 🔧 调试技巧

### 1. 启用调试模式

```typescript
const table = new Table({
  // ...
  debug: true // 启用调试输出
})

// 监听调试事件
table.on('debug', (info) => {
  console.log('调试信息:', info)
})
```

### 2. 检查表格状态

```typescript
// 获取表格内部状态
console.log('数据:', table.getData())
console.log('选择:', table.getSelectedRows())
console.log('排序:', table.getSortState())
console.log('筛选:', table.getFilterState())
console.log('分页:', table.getPaginationState())
```

### 3. 性能监控

```typescript
// 监控渲染性能
table.on('render-start', () => {
  console.time('render')
})

table.on('render-complete', () => {
  console.timeEnd('render')
})

// 监控内存使用
table.on('performance-update', (metrics) => {
  console.log('性能指标:', metrics)
})
```

### 4. 错误捕获

```typescript
// 全局错误处理
table.on('error', (error) => {
  console.error('表格错误:', error)
  // 发送错误报告
  sendErrorReport(error)
})

// 包装操作以捕获错误
function safeOperation(operation) {
  try {
    return operation()
  } catch (error) {
    console.error('操作失败:', error)
    return null
  }
}

const result = safeOperation(() => table.setData(newData))
```

## 📞 获取帮助

如果以上解决方案无法解决您的问题，请：

1. **检查版本兼容性** - 确保使用的是最新版本
2. **查看控制台错误** - 浏览器开发者工具中的错误信息
3. **创建最小复现示例** - 简化问题场景
4. **提供环境信息** - 浏览器版本、操作系统等
5. **联系技术支持** - 提交详细的问题描述

### 问题报告模板

```
**问题描述**
简要描述遇到的问题

**复现步骤**
1. 步骤一
2. 步骤二
3. 步骤三

**期望结果**
描述期望的正确行为

**实际结果**
描述实际发生的情况

**环境信息**
- 浏览器: Chrome 91.0.4472.124
- 操作系统: Windows 10
- 表格版本: 1.0.0
- 框架: React 18.0.0

**代码示例**
```typescript
// 提供最小复现代码
```

**错误信息**
```
// 控制台错误信息
```
```

通过遵循这些故障排除指南，您应该能够解决大部分常见问题。如果问题仍然存在，请不要犹豫寻求帮助！
