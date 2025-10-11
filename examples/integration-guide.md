# 经费报销详情页集成指南

根据你的截图需求，实现以下两个功能：

1. **删除按钮** - 点击后显示 Dialog 确认弹窗（而不是 alert）
2. **返回列表按钮** - 返回到经费报销列表页（而不是首页）

---

## 📦 方案 1: 纯 JavaScript/HTML 实现

### 1. 删除 Dialog HTML 结构

在你的详情页 HTML 中添加：

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
        <div class="dialog-icon">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="24" fill="#FFF3E0"/>
            <path d="M28 16V30M28 34V36" stroke="#FF9800" stroke-width="3.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="dialog-message">
          确定要删除报销单 <span class="dialog-highlight" id="deleteItemName"></span> 吗？
          <br><br>
          此操作不可撤销，删除后数据将无法恢复。
        </div>
      </div>
    </div>
    <div class="dialog-footer">
      <button class="btn btn-secondary" onclick="closeDeleteDialog()">取消</button>
      <button class="btn btn-danger" onclick="confirmDelete()">确认删除</button>
    </div>
  </div>
</div>
```

### 2. Dialog CSS 样式

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

### 3. JavaScript 功能代码

```javascript
// ==================== 删除功能 ====================

// 获取当前报销单ID
function getCurrentExpenseId() {
  // 从 URL 获取 ID
  const urlParams = new URLSearchParams(window.location.search)
  let id = urlParams.get('id')
  
  // 或从 hash 路由获取
  if (!id) {
    const hash = window.location.hash
    const match = hash.match(/[?&]id=([^&]+)/)
    if (match) {
      id = match[1]
    }
  }
  
  return id
}

// 点击删除按钮
document.querySelector('.btn-delete').addEventListener('click', function() {
  showDeleteDialog()
})

// 显示删除确认 Dialog
function showDeleteDialog() {
  const dialog = document.getElementById('deleteDialog')
  const expenseId = getCurrentExpenseId()
  
  // 设置要删除的单号
  document.getElementById('deleteItemName').textContent = expenseId
  
  // 显示 Dialog
  dialog.classList.add('show')
  
  // 阻止背景滚动
  document.body.style.overflow = 'hidden'
}

// 关闭删除确认 Dialog
function closeDeleteDialog() {
  const dialog = document.getElementById('deleteDialog')
  dialog.classList.remove('show')
  
  // 恢复背景滚动
  document.body.style.overflow = ''
}

// 确认删除
async function confirmDelete() {
  const expenseId = getCurrentExpenseId()
  const deleteBtn = document.querySelector('.btn-danger')
  
  try {
    // 显示加载状态
    deleteBtn.textContent = '删除中...'
    deleteBtn.disabled = true
    
    // 调用删除 API
    const response = await fetch('/api/expense/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: expenseId })
    })
    
    if (response.ok) {
      // 删除成功
      closeDeleteDialog()
      
      // 可选：显示成功提示
      alert('删除成功！')
      
      // 返回列表页
      setTimeout(() => {
        window.location.hash = '#/expense'
      }, 500)
    } else {
      throw new Error('删除失败')
    }
  } catch (error) {
    console.error('删除出错:', error)
    alert('删除失败，请稍后重试')
    
    // 恢复按钮状态
    deleteBtn.textContent = '确认删除'
    deleteBtn.disabled = false
  }
}

// 点击遮罩层关闭
document.getElementById('deleteDialog').addEventListener('click', function(e) {
  if (e.target === this) {
    closeDeleteDialog()
  }
})

// ESC 键关闭
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeDeleteDialog()
  }
})

// ==================== 返回功能 ====================

// 返回列表按钮
document.querySelector('.btn-return').addEventListener('click', function() {
  // 方法1: 使用 history.back() 返回上一页
  // 这样会保留用户的浏览历史和筛选条件
  if (document.referrer && document.referrer.includes('/expense')) {
    window.history.back()
  } 
  // 方法2: 直接跳转到列表页
  else {
    window.location.hash = '#/expense'
    // 或者
    // window.location.href = '/index.html#/expense'
  }
})
```

---

## 📦 方案 2: Vue 项目实现

如果你的项目使用 Vue + Vue Router，使用以下代码：

### 1. 在组件中使用

```vue
<template>
  <div class="expense-detail">
    <!-- 头部 -->
    <div class="header">
      <div class="header-title">查看报销单</div>
      <div class="header-actions">
        <button class="btn btn-return" @click="handleReturn">返回列表</button>
        <button class="btn btn-edit" @click="handleEdit">编辑</button>
        <button class="btn btn-delete" @click="showDeleteDialog">删除</button>
      </div>
    </div>

    <!-- 详情内容 -->
    <div class="content">
      <!-- ... 你的详情内容 ... -->
    </div>

    <!-- 删除确认 Dialog -->
    <div v-if="deleteDialogVisible" class="dialog-mask" @click.self="closeDeleteDialog">
      <div class="dialog">
        <div class="dialog-header">
          <div class="dialog-title">删除确认</div>
          <button class="dialog-close" @click="closeDeleteDialog">×</button>
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
              确定要删除报销单 <span class="dialog-highlight">{{ expenseId }}</span> 吗？
              <br><br>
              此操作不可撤销，删除后数据将无法恢复。
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="closeDeleteDialog">取消</button>
          <button class="btn btn-danger" @click="confirmDelete" :disabled="deleting">
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const expenseId = ref('')
const deleteDialogVisible = ref(false)
const deleting = ref(false)

// 初始化
onMounted(() => {
  expenseId.value = route.query.id || route.params.id
})

// 返回列表
const handleReturn = () => {
  // 方法1: 返回上一页（推荐）
  router.go(-1)
  
  // 方法2: 跳转到指定路由
  // router.push('/expense')
  // router.push({ name: 'expense-list' })
}

// 编辑
const handleEdit = () => {
  router.push({
    path: '/expense/edit',
    query: { id: expenseId.value }
  })
}

// 显示删除 Dialog
const showDeleteDialog = () => {
  deleteDialogVisible.value = true
}

// 关闭删除 Dialog
const closeDeleteDialog = () => {
  deleteDialogVisible.value = false
}

// 确认删除
const confirmDelete = async () => {
  try {
    deleting.value = true
    
    // 调用删除 API
    const response = await fetch('/api/expense/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: expenseId.value })
    })
    
    if (response.ok) {
      // 删除成功
      closeDeleteDialog()
      
      // 可选：显示成功提示（使用你的 UI 库）
      // ElMessage.success('删除成功')
      alert('删除成功')
      
      // 返回列表页
      setTimeout(() => {
        router.push('/expense')
      }, 500)
    } else {
      throw new Error('删除失败')
    }
  } catch (error) {
    console.error('删除出错:', error)
    // ElMessage.error('删除失败，请稍后重试')
    alert('删除失败，请稍后重试')
  } finally {
    deleting.value = false
  }
}

// ESC 键关闭
const handleKeydown = (e) => {
  if (e.key === 'Escape' && deleteDialogVisible.value) {
    closeDeleteDialog()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* ... 添加上面的 CSS 样式 ... */
</style>
```

---

## 📦 方案 3: 使用之前创建的 Dialog 插件

如果你想使用我之前创建的 Dialog 插件：

```javascript
import { createDeleteConfirmPlugin, injectDeleteConfirmStyles } from '@/dialog/plugins/delete-confirm'
import { createDialogManager } from '@/dialog'

// 初始化
const dialogManager = createDialogManager()
await dialogManager.initialize()

const deletePlugin = createDeleteConfirmPlugin()
injectDeleteConfirmStyles()

// 安装插件
const dialogAPI = {
  open: dialogManager.open.bind(dialogManager),
  // ... 其他方法
}
deletePlugin.install(dialogAPI)

// 使用
document.querySelector('.btn-delete').addEventListener('click', async () => {
  const confirmed = await deletePlugin.showDeleteConfirm({
    itemName: `报销单 ${expenseId}`,
    message: '删除后数据将无法恢复，确定要继续吗？',
    onConfirm: async () => {
      await deleteExpense(expenseId)
    }
  })
  
  if (confirmed) {
    // 返回列表
    window.location.hash = '#/expense'
  }
})
```

---

## 🎯 关键要点总结

### 删除功能：
1. ✅ 使用 Dialog 代替 alert
2. ✅ 显示警告图标
3. ✅ 确认后调用 API
4. ✅ 支持 ESC 键和点击遮罩关闭

### 返回功能：
1. ✅ 使用 `window.history.back()` 或 `router.go(-1)`
2. ✅ 返回到经费报销列表页 `/expense`
3. ✅ 不会跳转到首页

### 路由处理：
```javascript
// Hash 路由
window.location.hash = '#/expense'

// Vue Router
router.go(-1)  // 返回上一页
router.push('/expense')  // 跳转到列表页
```

---

## 📝 完整示例

完整的可运行示例文件：
- `expense-detail-with-dialog.html` - 纯 HTML/JS 实现

你可以根据自己的项目技术栈选择对应的方案进行集成！
