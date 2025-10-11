/**
 * 经费报销删除确认 Dialog - 集成代码
 * 
 * 使用方法：
 * 1. 将这个文件引入到你的项目中
 * 2. 在页面中添加 Dialog HTML 结构（见下方）
 * 3. 在删除按钮上调用 showDeleteDialog()
 */

// ==================== 全局变量 ====================
let currentDeleteItem = null

// ==================== 核心函数 ====================

/**
 * 显示删除确认 Dialog
 * @param {string} id - 报销单编号
 * @param {string} company - 请款公司（可选）
 * @param {string} amount - 支付金额（可选）
 */
window.showDeleteDialog = function(id, company, amount) {
  currentDeleteItem = { id, company, amount }
  
  // 设置 Dialog 内容
  const itemNoEl = document.getElementById('deleteItemNo')
  const companyEl = document.getElementById('deleteItemCompany')
  const amountEl = document.getElementById('deleteItemAmount')
  const detailEl = document.querySelector('.dialog-detail')
  
  if (itemNoEl) itemNoEl.textContent = id
  
  // 如果有详细信息，显示详细信息区域
  if (company && amount) {
    if (companyEl) companyEl.textContent = company
    if (amountEl) amountEl.textContent = amount + ' 万元'
    if (detailEl) detailEl.style.display = 'block'
  } else {
    if (detailEl) detailEl.style.display = 'none'
  }
  
  // 显示 Dialog
  const dialog = document.getElementById('deleteDialog')
  if (dialog) {
    dialog.classList.add('show')
    document.body.style.overflow = 'hidden'
  }
}

/**
 * 关闭删除确认 Dialog
 */
window.closeDeleteDialog = function() {
  const dialog = document.getElementById('deleteDialog')
  if (dialog) {
    dialog.classList.remove('show')
    document.body.style.overflow = ''
  }
  currentDeleteItem = null
}

/**
 * 确认删除
 */
window.confirmDelete = async function() {
  if (!currentDeleteItem) return
  
  const deleteBtn = document.getElementById('confirmDeleteBtn')
  if (!deleteBtn) return
  
  try {
    // 显示加载状态
    const originalText = deleteBtn.textContent
    deleteBtn.textContent = '删除中...'
    deleteBtn.disabled = true
    
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
    
    // 如果你的API不是返回response，可以修改这里
    // 例如：
    // const result = await yourDeleteFunction(currentDeleteItem.id)
    // if (!result.success) throw new Error('删除失败')
    
    if (!response.ok) {
      throw new Error('删除失败')
    }
    // ==============================================
    
    // 删除成功
    console.log('删除成功:', currentDeleteItem.id)
    
    // 关闭 Dialog
    window.closeDeleteDialog()
    
    // 显示成功提示
    alert(`报销单 ${currentDeleteItem.id} 已删除成功！`)
    
    // 从表格中移除该行（带动画）
    removeTableRow(currentDeleteItem.id)
    
    // 或者重新加载列表数据
    // if (typeof reloadExpenseList === 'function') {
    //   reloadExpenseList()
    // }
    
  } catch (error) {
    console.error('删除出错:', error)
    alert('删除失败，请稍后重试')
  } finally {
    // 恢复按钮状态
    if (deleteBtn) {
      deleteBtn.textContent = '确认删除'
      deleteBtn.disabled = false
    }
  }
}

/**
 * 从表格中移除行（带动画效果）
 * @param {string} id - 报销单编号
 */
function removeTableRow(id) {
  // 尝试多种选择器，适配不同的表格结构
  const tableBody = document.querySelector('#tableBody, tbody')
  if (!tableBody) return
  
  const rows = tableBody.querySelectorAll('tr')
  rows.forEach(row => {
    // 查找包含ID的单元格
    const cells = row.querySelectorAll('td')
    const firstCell = cells[0]
    
    if (firstCell && firstCell.textContent.trim() === id) {
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
  const tableBody = document.querySelector('#tableBody, tbody')
  if (!tableBody) return
  
  const rowCount = tableBody.querySelectorAll('tr').length
  const paginationInfo = document.querySelector('.pagination-info')
  
  if (paginationInfo) {
    paginationInfo.textContent = `共找到 ${rowCount} 条记录　当前显示 1-${rowCount} 条`
  }
}

// ==================== 事件监听 ====================

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 点击遮罩层关闭 Dialog
  const deleteDialog = document.getElementById('deleteDialog')
  if (deleteDialog) {
    deleteDialog.addEventListener('click', function(e) {
      if (e.target === this) {
        window.closeDeleteDialog()
      }
    })
  }
  
  // ESC 键关闭 Dialog
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const dialog = document.getElementById('deleteDialog')
      if (dialog && dialog.classList.contains('show')) {
        window.closeDeleteDialog()
      }
    }
  })
  
  console.log('删除 Dialog 功能已加载')
})

// ==================== HTML 结构（复制到页面底部） ====================
/*
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
*/
