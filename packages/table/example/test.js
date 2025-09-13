/**
 * 表格样式测试脚本
 * 
 * 测试表格的基础样式和功能
 */

// 模拟导入表格类（在实际使用中会从npm包导入）
// import { Table } from '@ldesign/table'

// 由于我们在开发环境中，直接创建DOM结构来测试样式
function createTestTable() {
  const container = document.getElementById('table-container')
  if (!container) {
    console.error('找不到表格容器')
    return
  }

  // 创建表格包装器
  const wrapper = document.createElement('div')
  wrapper.className = 'ldesign-table-wrapper'

  // 创建表格
  const table = document.createElement('table')
  table.className = 'ldesign-table'

  // 创建表头
  const thead = document.createElement('thead')
  const headerRow = document.createElement('tr')
  
  const headers = ['ID', '姓名', '年龄', '邮箱', '状态', '操作']
  headers.forEach(headerText => {
    const th = document.createElement('th')
    th.textContent = headerText
    headerRow.appendChild(th)
  })
  
  thead.appendChild(headerRow)
  table.appendChild(thead)

  // 创建表体
  const tbody = document.createElement('tbody')
  
  // 创建测试数据
  const testData = [
    { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com', status: '激活' },
    { id: 2, name: '李四', age: 30, email: 'lisi@example.com', status: '禁用' },
    { id: 3, name: '王五', age: 28, email: 'wangwu@example.com', status: '激活' },
    { id: 4, name: '赵六', age: 35, email: 'zhaoliu@example.com', status: '激活' },
    { id: 5, name: '钱七', age: 22, email: 'qianqi@example.com', status: '禁用' }
  ]

  testData.forEach((row, index) => {
    const tr = document.createElement('tr')
    tr.dataset.key = row.id.toString()
    
    // 添加选中状态（测试样式）
    if (index === 1) {
      tr.classList.add('selected')
    }
    
    // 添加展开状态（测试样式）
    if (index === 2) {
      tr.classList.add('expanded')
    }

    // 创建单元格
    const cells = [
      row.id,
      row.name,
      row.age,
      row.email,
      row.status,
      '编辑 | 删除'
    ]

    cells.forEach(cellText => {
      const td = document.createElement('td')
      td.textContent = cellText
      tr.appendChild(td)
    })

    tbody.appendChild(tr)
  })

  table.appendChild(tbody)

  // 创建表脚（可选）
  const tfoot = document.createElement('tfoot')
  const footerRow = document.createElement('tr')
  
  const footerCell = document.createElement('td')
  footerCell.colSpan = 6
  footerCell.textContent = `共 ${testData.length} 条记录`
  footerCell.style.textAlign = 'center'
  footerCell.style.fontWeight = '600'
  
  footerRow.appendChild(footerCell)
  tfoot.appendChild(footerRow)
  table.appendChild(tfoot)

  // 组装结构
  wrapper.appendChild(table)
  container.appendChild(wrapper)

  console.log('测试表格已创建')
  
  // 添加交互测试
  addInteractionTests(table)
}

function addInteractionTests(table) {
  // 添加行悬停效果测试
  const rows = table.querySelectorAll('tbody tr')
  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      console.log('鼠标进入行:', row.dataset.key)
    })
    
    row.addEventListener('mouseleave', () => {
      console.log('鼠标离开行:', row.dataset.key)
    })
    
    row.addEventListener('click', () => {
      // 切换选中状态
      row.classList.toggle('selected')
      console.log('行点击:', row.dataset.key, '选中状态:', row.classList.contains('selected'))
    })
  })

  // 添加表头点击测试（排序）
  const headers = table.querySelectorAll('thead th')
  headers.forEach((header, index) => {
    header.addEventListener('click', () => {
      // 清除其他列的排序状态
      headers.forEach(h => {
        h.classList.remove('sorted', 'sorted-asc', 'sorted-desc')
      })
      
      // 切换当前列的排序状态
      if (header.classList.contains('sorted-asc')) {
        header.classList.remove('sorted-asc')
        header.classList.add('sorted', 'sorted-desc')
      } else {
        header.classList.add('sorted', 'sorted-asc')
      }
      
      console.log('表头点击:', header.textContent, '排序状态:', 
        header.classList.contains('sorted-asc') ? '升序' : '降序')
    })
  })
}

// 页面加载完成后创建测试表格
document.addEventListener('DOMContentLoaded', () => {
  console.log('开始创建测试表格...')
  createTestTable()
})

// 导出测试函数（如果需要）
window.createTestTable = createTestTable
