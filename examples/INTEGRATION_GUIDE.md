# 删除确认 Dialog 集成指南

## 📁 已创建的文件

在 `D:\WorkBench\ldesign\examples\` 目录下，我已经为你准备好了以下文件：

1. **delete-dialog-integration.js** - JavaScript 核心功能代码
2. **delete-dialog-styles.css** - CSS 样式文件
3. **delete-dialog-template.html** - HTML 模板代码
4. **expense-list-with-dialog.html** - 完整示例（可直接运行）

---

## 🚀 快速集成步骤

### 方式 1：完整文件引入（推荐）

#### 步骤 1：引入 CSS 样式

在你的 HTML 页面 `<head>` 标签中添加：

```html
<link rel="stylesheet" href="D:/WorkBench/ldesign/examples/delete-dialog-styles.css">
```

或者将 CSS 内容复制到你现有的样式文件中。

#### 步骤 2：引入 JavaScript 文件

在你的 HTML 页面 `</body>` 标签之前添加：

```html
<script src="D:/WorkBench/ldesign/examples/delete-dialog-integration.js"></script>
```

#### 步骤 3：添加 Dialog HTML 结构

将 `delete-dialog-template.html` 的内容复制到你的页面底部（`</body>` 标签之前）。

#### 步骤 4：修改删除按钮

找到你表格中的删除按钮，修改为：

```html
<!-- 列表页的删除按钮 -->
<button onclick="showDeleteDialog('BX20240520001', '深圳市XX股份合作公司', '1200.00')">
  删除
</button>

<!-- 详情页的删除按钮（不需要公司和金额） -->
<button onclick="showDeleteDialog('BX20240520001')">
  删除
</button>
```

#### 步骤 5：修改 API 调用（如果需要）

打开 `delete-dialog-integration.js`，找到第 77-84 行：

```javascript
// ========== 修改这里：调用你的删除 API ==========
const response = await fetch('/api/expense/delete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: currentDeleteItem.id
  })
})
```

根据你的实际 API 修改这部分代码。

---

### 方式 2：复制粘贴代码（适合已有项目结构）

如果你的项目已经有了自己的文件结构，可以按以下方式集成：

#### 1. 复制 CSS 样式

打开 `delete-dialog-styles.css`，将所有内容复制到你的 CSS 文件中。

#### 2. 复制 JavaScript 代码

打开 `delete-dialog-integration.js`，将核心函数复制到你的 JS 文件中：
- `showDeleteDialog()`
- `closeDeleteDialog()`
- `confirmDelete()`
- `removeTableRow()`

#### 3. 添加 HTML 模板

打开 `delete-dialog-template.html`，将内容复制到你的页面底部。

#### 4. 修改删除按钮

```html
<button onclick="showDeleteDialog(id, company, amount)">删除</button>
```

---

## 📋 具体集成到你的项目

根据你的截图，你的项目可能是这样的结构：

```
你的项目/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
└── js/
    └── app.js          # JavaScript 文件
```

### 集成步骤：

#### 1. 在 `index.html` 的 `<head>` 中添加 CSS：

```html
<head>
  ...
  <!-- 引入删除 Dialog 样式 -->
  <link rel="stylesheet" href="D:/WorkBench/ldesign/examples/delete-dialog-styles.css">
  <!-- 或者直接写在 style 标签中 -->
  <style>
    /* 复制 delete-dialog-styles.css 的内容到这里 */
  </style>
</head>
```

#### 2. 在 `index.html` 的 `</body>` 之前添加：

```html
  <!-- 删除 Dialog HTML -->
  <div class="dialog-mask" id="deleteDialog">
    <!-- 复制 delete-dialog-template.html 的内容 -->
  </div>

  <!-- 引入删除 Dialog JavaScript -->
  <script src="D:/WorkBench/ldesign/examples/delete-dialog-integration.js"></script>
</body>
```

#### 3. 修改你的删除按钮：

在经费报销列表页面，找到删除按钮的代码，改成：

```html
<!-- 原来的代码（使用 alert） -->
<button onclick="删除('BX20240520001')">删除</button>

<!-- 改为（使用 Dialog） -->
<button onclick="showDeleteDialog('BX20240520001', '深圳市XX股份合作公司', '1200.00')">删除</button>
```

---

## 🎯 API 对接

### 如果你的删除 API 是这样的：

```javascript
// 情况 1：使用 fetch
fetch('/api/expense/delete', {
  method: 'POST',
  body: JSON.stringify({ id: 'BX20240520001' })
})
```

那么不需要修改，直接使用即可。

### 如果你的删除 API 是这样的：

```javascript
// 情况 2：使用 axios
axios.post('/api/expense/delete', { id: 'BX20240520001' })

// 情况 3：使用自定义函数
deleteExpense('BX20240520001')
```

那么需要修改 `delete-dialog-integration.js` 中的 `confirmDelete()` 函数：

```javascript
async function confirmDelete() {
  if (!currentDeleteItem) return
  
  const deleteBtn = document.getElementById('confirmDeleteBtn')
  if (!deleteBtn) return
  
  try {
    deleteBtn.textContent = '删除中...'
    deleteBtn.disabled = true
    
    // ===== 修改这里：使用你的 API =====
    
    // 如果使用 axios：
    await axios.post('/api/expense/delete', {
      id: currentDeleteItem.id
    })
    
    // 或者使用你的函数：
    // await deleteExpense(currentDeleteItem.id)
    
    // ==================================
    
    window.closeDeleteDialog()
    alert(`报销单 ${currentDeleteItem.id} 已删除成功！`)
    removeTableRow(currentDeleteItem.id)
    
  } catch (error) {
    console.error('删除出错:', error)
    alert('删除失败，请稍后重试')
  } finally {
    deleteBtn.textContent = '确认删除'
    deleteBtn.disabled = false
  }
}
```

---

## 🧪 测试

### 1. 查看完整示例

打开浏览器，访问：
```
D:\WorkBench\ldesign\examples\expense-list-with-dialog.html
```

点击任意一行的"删除"按钮，查看效果。

### 2. 在你的项目中测试

1. 按照上述步骤集成代码
2. 在浏览器中打开你的经费报销列表页
3. 点击删除按钮
4. 应该会弹出美观的 Dialog 确认框

---

## 🔧 常见问题

### Q1: Dialog 不显示？
**A:** 检查：
1. CSS 文件是否正确引入
2. HTML 模板是否添加到页面底部
3. 浏览器控制台是否有错误

### Q2: 点击删除按钮没反应？
**A:** 检查：
1. JavaScript 文件是否正确引入
2. 删除按钮的 `onclick` 是否正确设置
3. 浏览器控制台是否有错误

### Q3: 删除成功但页面没更新？
**A:** 有两个解决方案：
1. 使用 `removeTableRow()` 函数从表格移除行（已包含）
2. 或者在删除成功后重新加载列表数据：
```javascript
// 在 confirmDelete() 函数的成功回调中添加
location.reload() // 刷新页面
// 或
reloadExpenseList() // 调用你的列表刷新函数
```

### Q4: 如何自定义 Dialog 样式？
**A:** 修改 `delete-dialog-styles.css` 文件中的对应样式，例如：
```css
/* 修改 Dialog 宽度 */
.dialog {
  max-width: 600px;  /* 默认是 480px */
}

/* 修改按钮颜色 */
.btn-danger {
  background: #f00;  /* 改成纯红色 */
}
```

---

## 📞 需要帮助？

如果集成过程中遇到问题，请提供：
1. 你的项目文件结构
2. 删除按钮的当前代码
3. 浏览器控制台的错误信息（按 F12 查看）

---

## ✅ 集成完成检查清单

- [ ] CSS 样式已添加到项目
- [ ] JavaScript 文件已引入或代码已复制
- [ ] Dialog HTML 模板已添加到页面底部
- [ ] 删除按钮已修改为调用 `showDeleteDialog()`
- [ ] API 调用已根据实际情况修改
- [ ] 在浏览器中测试成功

完成以上所有步骤后，你的删除确认功能就成功集成了！🎉
