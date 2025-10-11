# 经费报销列表页 - 删除 Dialog 集成代码片段

## 🎯 核心代码

### 1. 在表格的删除按钮上绑定函数

```html
<!-- 原来使用 alert 的删除按钮 -->
<button onclick="deleteItem('BX20240520001')">删除</button>

<!-- 改为使用 Dialog 的删除按钮 -->
<button class="action-btn btn-delete" 
        onclick="showDeleteDialog('BX20240520001', '深圳市XX股份合作公司', '1200.00')">
  删除
</button>
```

### 2. JavaScript 核心代码

```javascript
// 全局变量：保存当前要删除的项目信息
let currentDeleteItem = null

/**
 * 显示删除确认 Dialog
 * @param {string} id - 报销单编号
 * @param {string} company - 请款公司
 * @param {string} amount - 支付金额
 */
function showDeleteDialog(id, company, amount) {
  // 保存当前要删除的项目
  currentDeleteItem = { id, company, amount }
  
  // 设置 Dialog 内容
  document.getElementById('deleteItemNo').textContent = id
  document.getElementById('deleteItemCompany').textContent = company
  document.getElementById('deleteItemAmount').textContent = amount + ' 万元'
  
  // 显示 Dialog
  const dialog = document.getElementById('deleteDialog')
  dialog.classList.add('show')
  
  // 阻止背景滚动
  document.body.style.overflow = 'hidden'
}

/**
 * 关闭删除确认 Dialog
 */
function closeDeleteDialog() {
  const dialog = document.getElementById('deleteDialog')
  dialog.classList.remove('show')
  
  // 恢复背景滚动
  document.body.style.overflow = ''
  
  // 清空当前删除项
  currentDeleteItem = null
}

/**
 * 确认删除
 */
async function confirmDelete() {
  if (!currentDeleteItem) return
  
  const deleteBtn = document.getElementById('confirmDeleteBtn')
  
  try {
    // 显示加载状态
    deleteBtn.textContent = '删除中...'
    deleteBtn.disabled = true
    
    // ========== 调用你的删除 API ==========
    const response = await fetch('/api/expense/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: currentDeleteItem.id
      })
    })
    
    if (!response.ok) {
      throw new Error('删除失败')
    }
    // =====================================
    
    // 删除成功
    console.log('删除成功:', currentDeleteItem.id)
    
    // 关闭 Dialog
    closeDeleteDialog()
    
    // 显示成功提示（可以改用你的 UI 库的提示组件）
    alert(`报销单 ${currentDeleteItem.id} 已删除成功！`)
    
    // 从表格中移除该行（添加动画效果）
    removeTableRow(currentDeleteItem.id)
    
  } catch (error) {
    console.error('删除出错:', error)
    alert('删除失败，请稍后重试')
  } finally {
    // 恢复按钮状态
    deleteBtn.textContent = '确认删除'
    deleteBtn.disabled = false
  }
}

/**
 * 从表格中移除行（带动画）
 */
function removeTableRow(id) {
  const rows = document.querySelectorAll('#tableBody tr')
  rows.forEach(row => {
    const firstCell = row.cells[0]
    if (firstCell && firstCell.textContent === id) {
      // 添加退出动画
      row.style.opacity = '0'
      row.style.transform = 'translateX(-20px)'
      row.style.transition = 'all 0.3s'
      
      // 动画结束后移除DOM
      setTimeout(() => {
        row.remove()
        updatePaginationInfo()
      }, 300)
    }
  })
}

/**
 * 更新分页信息
 */
function updatePaginationInfo() {
  const rowCount = document.querySelectorAll('#tableBody tr').length
  const paginationInfo = document.querySelector('.pagination-info')
  if (paginationInfo) {
    paginationInfo.textContent = `共找到 ${rowCount} 条记录　当前显示 1-${rowCount} 条`
  }
}

// 点击遮罩层关闭 Dialog
document.getElementById('deleteDialog').addEventListener('click', function(e) {
  if (e.target === this) {
    closeDeleteDialog()
  }
})

// ESC 键关闭 Dialog
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeDeleteDialog()
  }
})
```

### 3. Dialog HTML 结构（添加到页面底部）

```html
<!-- 删除确认 Dialog -->
<div class="dialog-mask" id="deleteDialog">
  <div class="dialog">
    <div class="dialog-header">
      <div class="dialog-title">删除确认</div>
      <button class="dialog-close" onclick="closeDeleteDialog()">×</button>
    </div>
    <div class="dialog-body">
      <div class="dialog-content">
        <!-- 警告图标 -->
        <div class="dialog-icon">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="24" fill="#FFF3E0"/>
            <path d="M28 16V30M28 34V36" stroke="#FF9800" stroke-width="3.5" stroke-linecap="round"/>
          </svg>
        </div>
        
        <!-- 提示消息 -->
        <div class="dialog-message">
          确定要删除报销单 <span class="dialog-highlight" id="deleteItemNo"></span> 吗？
          <br><br>
          此操作不可撤销，删除后数据将无法恢复。
        </div>
        
        <!-- 详细信息 -->
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
```

### 4. Dialog CSS 样式（添加到样式表）

```css
/* Dialog 遮罩层 */
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}

.dialog-mask.show {
  display: flex;
}

/* Dialog 容器 */
.dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 480px;
  animation: zoomIn 0.2s;
  overflow: hidden;
}

/* Dialog 头部 */
.dialog-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.dialog-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.dialog-close:hover {
  background: #f5f5f5;
  color: #666;
}

/* Dialog 内容 */
.dialog-body {
  padding: 24px;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.dialog-icon {
  animation: scaleIn 0.3s ease-out;
}

.dialog-message {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  text-align: center;
}

.dialog-highlight {
  color: #ff4d4f;
  font-weight: 600;
}

/* 详细信息区域 */
.dialog-detail {
  width: 100%;
  background: #fafafa;
  border-radius: 4px;
  padding: 12px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.dialog-detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.dialog-detail-row:last-child {
  margin-bottom: 0;
}

.dialog-detail-label {
  color: #999;
}

.dialog-detail-value {
  color: #333;
  font-weight: 500;
}

/* Dialog 底部 */
.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .btn {
  min-width: 90px;
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-danger {
  background: #ff4d4f;
  color: white;
}

.btn-danger:hover {
  background: #d32f2f;
}

.btn-danger:disabled {
  background: #ffa39e;
  cursor: not-allowed;
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoomIn {
  from { 
    transform: scale(0.9);
    opacity: 0;
  }
  to { 
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from { 
    transform: scale(0.8);
    opacity: 0;
  }
  to { 
    transform: scale(1);
    opacity: 1;
  }
}
```

---

## 📋 快速集成步骤

### 步骤 1: 修改删除按钮

找到你的表格中的删除按钮，修改 onclick 事件：

```html
<!-- 原来 -->
<button onclick="deleteExpense(id)">删除</button>

<!-- 改为 -->
<button onclick="showDeleteDialog(id, company, amount)">删除</button>
```

### 步骤 2: 添加 Dialog HTML

在页面底部（`</body>` 前）添加上面的 Dialog HTML 结构。

### 步骤 3: 添加 CSS 样式

将上面的 CSS 样式添加到你的样式文件中。

### 步骤 4: 添加 JavaScript 代码

将上面的 JavaScript 代码添加到你的脚本中，根据你的 API 修改删除接口调用部分。

---

## 🎯 关键修改点

### 原来的删除方式（使用 alert）

```javascript
function deleteExpense(id) {
  if (confirm('确定要删除吗？')) {
    // 调用删除 API
    fetch('/api/expense/delete', {
      method: 'POST',
      body: JSON.stringify({ id })
    }).then(() => {
      alert('删除成功')
      location.reload() // 刷新页面
    })
  }
}
```

### 现在的删除方式（使用 Dialog）

```javascript
// 第一步：显示 Dialog
function showDeleteDialog(id, company, amount) {
  currentDeleteItem = { id, company, amount }
  document.getElementById('deleteItemNo').textContent = id
  document.getElementById('deleteItemCompany').textContent = company
  document.getElementById('deleteItemAmount').textContent = amount + ' 万元'
  document.getElementById('deleteDialog').classList.add('show')
  document.body.style.overflow = 'hidden'
}

// 第二步：确认删除
async function confirmDelete() {
  const { id } = currentDeleteItem
  
  // 调用删除 API
  await fetch('/api/expense/delete', {
    method: 'POST',
    body: JSON.stringify({ id })
  })
  
  // 关闭 Dialog
  closeDeleteDialog()
  
  // 从表格中移除该行（无需刷新页面）
  removeTableRow(id)
}
```

---

## 💡 优势对比

| 特性 | alert | Dialog |
|------|-------|--------|
| 美观度 | ❌ 简陋 | ✅ 现代化 |
| 自定义 | ❌ 不可 | ✅ 完全可定制 |
| 动画效果 | ❌ 无 | ✅ 流畅动画 |
| 详细信息 | ❌ 不支持 | ✅ 显示公司、金额等 |
| 交互体验 | ❌ 生硬 | ✅ 平滑过渡 |
| 移动端 | ❌ 兼容差 | ✅ 响应式 |

---

## 📝 完整示例

查看完整可运行的示例文件：
- `expense-list-with-dialog.html` - 经费报销列表页完整示例

直接在浏览器中打开即可测试所有功能！
