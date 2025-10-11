# 删除确认 Dialog - 快速开始 🚀

## 📦 文件清单

在 `D:\WorkBench\ldesign\examples\` 目录下：

| 文件 | 说明 | 用途 |
|------|------|------|
| `delete-dialog-integration.js` | JavaScript 功能代码 | 包含所有核心函数 |
| `delete-dialog-styles.css` | CSS 样式文件 | 美观的 Dialog 样式 |
| `delete-dialog-template.html` | HTML 模板 | Dialog 的 HTML 结构 |
| `expense-list-with-dialog.html` | 完整示例 | 可直接运行查看效果 |
| `INTEGRATION_GUIDE.md` | 详细集成指南 | 完整的集成步骤说明 |

---

## ⚡ 3 分钟快速集成

### 第 1 步：复制 3 个文件到你的项目

将以下文件复制到你的项目目录：

```bash
# 复制这些文件：
delete-dialog-integration.js  → 你的项目/js/
delete-dialog-styles.css      → 你的项目/css/
```

### 第 2 步：在 HTML 中引入

在你的 `index.html` 中添加：

```html
<!DOCTYPE html>
<html>
<head>
  ...
  <!-- 1. 引入 CSS -->
  <link rel="stylesheet" href="css/delete-dialog-styles.css">
</head>
<body>
  <!-- 你的页面内容 -->
  ...
  
  <!-- 2. 添加 Dialog HTML（复制 delete-dialog-template.html 的内容） -->
  <div class="dialog-mask" id="deleteDialog">
    <div class="dialog">
      <div class="dialog-header">
        <div class="dialog-title">删除确认</div>
        <button class="dialog-close" onclick="closeDeleteDialog()">×</button>
      </div>
      <div class="dialog-body">
        <div class="dialog-content">
          <div class="dialog-icon">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="24" fill="#FFF3E0"/>
              <path d="M28 16V30M28 34V36" stroke="#FF9800" stroke-width="3.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="dialog-message">
            确定要删除报销单 <span class="dialog-highlight" id="deleteItemNo"></span> 吗？
            <br><br>
            此操作不可撤销，删除后数据将无法恢复。
          </div>
          <div class="dialog-detail">
            <div class="dialog-detail-row">
              <span class="dialog-detail-label">请款公司：</span>
              <span class="dialog-detail-value" id="deleteItemCompany"></span>
            </div>
            <div class="dialog-detail-row">
              <span class="dialog-detail-label">支付金额：</span>
              <span class="dialog-detail-value" id="deleteItemAmount"></span>
            </div>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-secondary" onclick="closeDeleteDialog()">取消</button>
        <button class="btn btn-danger" id="confirmDeleteBtn" onclick="confirmDelete()">确认删除</button>
      </div>
    </div>
  </div>
  
  <!-- 3. 引入 JavaScript -->
  <script src="js/delete-dialog-integration.js"></script>
</body>
</html>
```

### 第 3 步：修改删除按钮

找到你表格中的删除按钮，改成：

```html
<!-- 原来 -->
<button onclick="删除按钮的原函数()">删除</button>

<!-- 改为 -->
<button onclick="showDeleteDialog('报销单编号', '公司名称', '金额')">删除</button>

<!-- 例如 -->
<button onclick="showDeleteDialog('BX20240520001', '深圳市XX公司', '1200.00')">删除</button>
```

### ✅ 完成！

现在刷新页面，点击删除按钮，就会看到美观的 Dialog 弹窗！

---

## 🎬 查看效果

**方式 1：查看完整示例**

在浏览器中打开：
```
D:\WorkBench\ldesign\examples\expense-list-with-dialog.html
```

**方式 2：直接在浏览器中打开**

```bash
# Windows
start D:\WorkBench\ldesign\examples\expense-list-with-dialog.html
```

---

## 🔧 自定义 API

默认使用 `fetch` 调用 API。如果需要修改，编辑 `delete-dialog-integration.js` 的第 76-95 行：

```javascript
// 找到这部分代码
const response = await fetch('/api/expense/delete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: currentDeleteItem.id
  })
})

// 改成你的 API 调用方式
// 例如使用 axios:
await axios.post('/api/expense/delete', {
  id: currentDeleteItem.id
})
```

---

## 📖 更多帮助

- **详细集成指南**: 查看 `INTEGRATION_GUIDE.md`
- **完整示例**: 打开 `expense-list-with-dialog.html`
- **代码片段**: 查看 `list-delete-dialog-snippet.md`

---

## 🎯 核心函数说明

### `showDeleteDialog(id, company, amount)`

显示删除确认 Dialog。

- **id**: 报销单编号（必填）
- **company**: 公司名称（可选）
- **amount**: 金额（可选）

```javascript
// 列表页使用（带详细信息）
showDeleteDialog('BX001', '深圳公司', '1200.00')

// 详情页使用（只需 ID）
showDeleteDialog('BX001')
```

### `closeDeleteDialog()`

关闭 Dialog。

### `confirmDelete()`

确认删除并调用 API。

---

## 💡 提示

1. **不需要手动关闭 Dialog**：点击取消、确认、遮罩层或按 ESC 键都会自动关闭
2. **删除成功后自动更新**：使用 `removeTableRow()` 自动从表格移除行，无需刷新页面
3. **加载状态**：删除中按钮会显示"删除中..."并禁用
4. **错误处理**：API 失败会显示错误提示并恢复按钮状态

---

## ✅ 集成检查

- [ ] 文件已复制到项目
- [ ] CSS 已引入
- [ ] JavaScript 已引入  
- [ ] Dialog HTML 已添加
- [ ] 删除按钮已修改
- [ ] 浏览器测试通过

---

**需要帮助？** 查看 `INTEGRATION_GUIDE.md` 获取详细说明！
