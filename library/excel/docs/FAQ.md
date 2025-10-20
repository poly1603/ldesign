# 常见问题解答 (FAQ)

## 安装和使用

### Q1: 如何安装依赖？

**A:** 根据你使用的框架选择对应的包：

```bash
# 原生 JavaScript
npm install @ldesign/excel-viewer-core

# Vue 3
npm install @ldesign/excel-viewer-vue

# React
npm install @ldesign/excel-viewer-react

# Lit Web Component
npm install @ldesign/excel-viewer-lit
```

### Q2: 需要额外安装 Luckysheet 吗？

**A:** 不需要。Luckysheet 已作为依赖包含在核心包中。但如果使用 CDN，需要手动引入 Luckysheet 的 CSS 和 JS 文件。

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/css/luckysheet.css">
<script src="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/luckysheet.umd.js"></script>
```

### Q3: 支持哪些 Excel 格式？

**A:** 支持以下格式：
- `.xlsx` (Excel 2007+)
- `.xls` (Excel 97-2003)
- `.csv` (逗号分隔值)

## 功能相关

### Q4: 如何处理大文件（10 万+ 行）？

**A:** 启用虚拟滚动和性能优化选项：

```javascript
const viewer = new ExcelViewer({
  container: '#excel-viewer',
  enableVirtualScroll: true,
  virtualScrollThreshold: 100000,
  performance: {
    useWebWorker: true,
    chunkSize: 10000,
    lazyLoad: true
  }
});
```

### Q5: 是否支持公式计算？

**A:** 是的，支持常用的 Excel 公式，包括：
- 数学函数：SUM、AVERAGE、MAX、MIN 等
- 逻辑函数：IF、AND、OR 等
- 文本函数：CONCATENATE、LEFT、RIGHT 等
- 日期函数：TODAY、NOW、DATE 等

### Q6: 如何导出文件？

**A:** 支持多种导出格式：

```javascript
// 导出 Excel
viewer.downloadFile({
  format: 'xlsx',
  filename: 'export.xlsx'
});

// 导出 CSV
viewer.downloadFile({
  format: 'csv',
  filename: 'data.csv'
});

// 导出 HTML
viewer.downloadFile({
  format: 'html',
  filename: 'table.html'
});

// 导出 JSON
viewer.downloadFile({
  format: 'json',
  filename: 'data.json'
});

// 导出截图
await viewer.downloadScreenshot('screenshot.png');
```

### Q7: 支持多工作表吗？

**A:** 是的，完全支持多工作表的查看、切换和编辑：

```javascript
// 获取所有工作表
const sheets = viewer.getData();

// 切换工作表
viewer.setActiveSheet(1); // 切换到第 2 个工作表

// 获取当前工作表索引
const index = viewer.getCurrentSheetIndex();
```

### Q8: 如何实现搜索功能？

**A:** 使用 search 方法：

```javascript
const results = viewer.search({
  keyword: 'Apple',
  caseSensitive: false,     // 是否区分大小写
  matchWholeWord: false,    // 是否全字匹配
  scope: 'all',             // 搜索范围：'current' | 'all'
  searchFormulas: true      // 是否搜索公式
});

// 处理搜索结果
results.forEach(result => {
  console.log(`工作表: ${result.sheetName}, 位置: (${result.row}, ${result.col}), 值: ${result.value}`);
});
```

## 样式和主题

### Q9: 如何自定义样式？

**A:** 使用 `customStyle` 选项：

```javascript
const viewer = new ExcelViewer({
  container: '#excel-viewer',
  customStyle: `
    .luckysheet-toolbar {
      background-color: #f0f0f0;
    }
    .luckysheet-cell {
      font-size: 14px;
    }
  `
});
```

### Q10: 支持暗色主题吗？

**A:** 是的，支持亮色和暗色主题：

```javascript
const viewer = new ExcelViewer({
  container: '#excel-viewer',
  theme: 'dark' // 'light' | 'dark'
});
```

### Q11: 如何隐藏工具栏或公式栏？

**A:** 通过配置选项控制：

```javascript
const viewer = new ExcelViewer({
  container: '#excel-viewer',
  showToolbar: false,      // 隐藏工具栏
  showFormulaBar: false,   // 隐藏公式栏
  showSheetTabs: false     // 隐藏工作表标签
});
```

## 编辑和交互

### Q12: 如何禁用编辑功能？

**A:** 设置 `allowEdit` 为 `false`：

```javascript
const viewer = new ExcelViewer({
  container: '#excel-viewer',
  allowEdit: false,    // 禁用编辑
  allowCopy: false,    // 禁用复制
  allowPaste: false    // 禁用粘贴
});
```

### Q13: 如何监听单元格变化？

**A:** 使用事件监听或钩子函数：

```javascript
// 方式 1: 使用事件
viewer.on('cellChange', (data) => {
  console.log('单元格变化:', data);
});

// 方式 2: 使用钩子
const viewer = new ExcelViewer({
  container: '#excel-viewer',
  hooks: {
    afterCellChange: (sheetIndex, row, col, oldValue, newValue) => {
      console.log('单元格已变化:', { sheetIndex, row, col, oldValue, newValue });
    }
  }
});
```

### Q14: 如何实现撤销/重做？

**A:** 调用内置方法：

```javascript
viewer.undo();  // 撤销
viewer.redo();  // 重做
```

### Q15: 如何冻结行或列？

**A:** 使用 setFreeze 方法：

```javascript
// 冻结前 3 行
viewer.setFreeze('row', 3);

// 冻结前 2 列
viewer.setFreeze('column', undefined, 2);

// 冻结前 3 行和前 2 列
viewer.setFreeze('both', 3, 2);
```

## 性能和优化

### Q16: 加载大文件时很慢怎么办？

**A:** 几种优化方案：

1. 启用 Web Worker：
```javascript
const viewer = new ExcelViewer({
  performance: {
    useWebWorker: true
  }
});
```

2. 启用懒加载：
```javascript
const viewer = new ExcelViewer({
  performance: {
    lazyLoad: true
  }
});
```

3. 使用虚拟滚动：
```javascript
const viewer = new ExcelViewer({
  enableVirtualScroll: true
});
```

### Q17: 内存占用太大怎么办？

**A:** 
1. 及时销毁不用的实例：
```javascript
viewer.destroy();
```

2. 禁用不必要的功能：
```javascript
const viewer = new ExcelViewer({
  allowEdit: false,
  allowCopy: false,
  showToolbar: false
});
```

3. 限制文件大小：
```javascript
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
if (file.size > MAX_SIZE) {
  alert('文件太大');
  return;
}
```

### Q18: 如何提高渲染性能？

**A:** 
1. 减少同时显示的工作表数量
2. 使用虚拟滚动
3. 禁用不必要的动画和效果
4. 在性能较差的设备上降低渲染质量

## 框架集成

### Q19: Vue 3 中如何使用？

**A:** 
```vue
<template>
  <ExcelViewer
    ref="viewerRef"
    :file="excelFile"
    @load="handleLoad"
  />
</template>

<script setup>
import { ref } from 'vue';
import { ExcelViewer } from '@ldesign/excel-viewer-vue';

const viewerRef = ref();
const excelFile = ref(null);

const handleLoad = (data) => {
  console.log('加载完成', data);
};
</script>
```

### Q20: React 中如何使用？

**A:** 
```tsx
import { useRef } from 'react';
import { ExcelViewer } from '@ldesign/excel-viewer-react';

function App() {
  const viewerRef = useRef(null);
  
  return (
    <ExcelViewer
      ref={viewerRef}
      file={excelFile}
      onLoad={(data) => console.log('加载完成', data)}
    />
  );
}
```

### Q21: 可以在 Angular 中使用吗？

**A:** 可以！使用 Lit Web Component 版本：

```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }

// app.component.html
<excel-viewer
  [attr.show-toolbar]="true"
  [attr.allow-edit]="true"
></excel-viewer>
```

## 数据处理

### Q22: 如何读取单元格数据？

**A:** 
```javascript
// 读取单个单元格
const value = viewer.getCellValue(0, 0); // 第 1 行第 1 列

// 读取所有数据
const sheets = viewer.getData();
sheets.forEach(sheet => {
  sheet.data.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      console.log(`${rowIndex},${colIndex}:`, cell.v);
    });
  });
});
```

### Q23: 如何修改单元格数据？

**A:** 
```javascript
// 修改单个单元格
viewer.setCellValue(0, 0, 'Hello World');

// 批量修改
const data = [
  ['A1', 'B1', 'C1'],
  ['A2', 'B2', 'C2']
];

data.forEach((row, r) => {
  row.forEach((value, c) => {
    viewer.setCellValue(r, c, value);
  });
});
```

### Q24: 如何处理合并单元格？

**A:** 合并单元格信息会在解析时自动识别，包含在 SheetData 的 merges 字段中：

```javascript
const sheets = viewer.getData();
sheets.forEach(sheet => {
  if (sheet.merges) {
    sheet.merges.forEach(merge => {
      console.log('合并单元格:', {
        起始行: merge.r,
        起始列: merge.c,
        行跨度: merge.rs,
        列跨度: merge.cs
      });
    });
  }
});
```

## 错误处理

### Q25: 如何处理加载错误？

**A:** 
```javascript
const viewer = new ExcelViewer({
  container: '#excel-viewer',
  hooks: {
    onError: (error) => {
      console.error('发生错误:', error);
      alert(`错误: ${error.message}`);
    }
  }
});

// 或使用 try-catch
try {
  await viewer.loadFile(file);
} catch (error) {
  console.error('加载失败:', error);
}

// 或监听事件
viewer.on('loadError', (data) => {
  console.error('加载错误:', data.error);
});
```

### Q26: 常见错误及解决方案

**A:** 

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `Container not found` | 容器元素不存在 | 检查容器选择器是否正确 |
| `Luckysheet is not loaded` | Luckysheet 未加载 | 引入 Luckysheet 库 |
| `Failed to fetch file` | 网络请求失败 | 检查 URL 和网络连接 |
| `Invalid file type` | 文件格式不支持 | 使用支持的格式（xlsx, xls, csv）|
| `Workbook not loaded` | 工作簿未加载 | 先调用 loadFile 加载文件 |

## 部署和构建

### Q27: 如何在生产环境中使用？

**A:** 
1. 使用压缩版本
2. 配置 CDN 加速
3. 启用 gzip 压缩
4. 使用代码分割减小包体积

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'excel-viewer': ['@ldesign/excel-viewer-core']
        }
      }
    }
  }
}
```

### Q28: 如何配置 TypeScript？

**A:** 类型定义已包含在包中，直接使用即可：

```typescript
import { ExcelViewer, ExcelViewerOptions } from '@ldesign/excel-viewer-core';

const options: ExcelViewerOptions = {
  container: '#excel-viewer',
  showToolbar: true
};

const viewer = new ExcelViewer(options);
```

## 其他问题

### Q29: 是否支持移动端？

**A:** 是的，支持移动端浏览器。建议针对移动端进行适配：

```javascript
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const viewer = new ExcelViewer({
  container: '#excel-viewer',
  showToolbar: !isMobile, // 移动端隐藏工具栏
  // 其他移动端优化配置
});
```

### Q30: 如何与后端集成？

**A:** 
```javascript
// 从后端加载
const response = await fetch('/api/excel/123');
const arrayBuffer = await response.arrayBuffer();
await viewer.loadFile(arrayBuffer);

// 保存到后端
const blob = viewer.exportFile({ format: 'xlsx' });
const formData = new FormData();
formData.append('file', blob, 'file.xlsx');

await fetch('/api/excel/save', {
  method: 'POST',
  body: formData
});
```

### Q31: 开源协议是什么？

**A:** 本项目采用 MIT 许可证，可以自由使用、修改和分发。

### Q32: 如何贡献代码？

**A:** 
1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 发起 Pull Request

详见 [CONTRIBUTING.md](../CONTRIBUTING.md)

### Q33: 在哪里报告问题？

**A:** 请在 GitHub Issues 中报告：
https://github.com/ldesign/excel-viewer/issues

---

**没有找到答案？** 请在 [GitHub Issues](https://github.com/ldesign/excel-viewer/issues) 中提问。


