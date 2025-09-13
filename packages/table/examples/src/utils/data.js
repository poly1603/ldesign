/**
 * 示例数据生成工具
 */

// 示例员工数据
export const sampleEmployees = [
  { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com', department: '技术部', salary: 8000, active: true, joinDate: '2023-01-15' },
  { id: 2, name: '李四', age: 30, email: 'lisi@example.com', department: '产品部', salary: 9000, active: true, joinDate: '2022-08-20' },
  { id: 3, name: '王五', age: 28, email: 'wangwu@example.com', department: '设计部', salary: 7500, active: false, joinDate: '2023-03-10' },
  { id: 4, name: '赵六', age: 32, email: 'zhaoliu@example.com', department: '市场部', salary: 8500, active: true, joinDate: '2022-12-05' },
  { id: 5, name: '钱七', age: 27, email: 'qianqi@example.com', department: '技术部', salary: 7800, active: true, joinDate: '2023-05-18' },
  { id: 6, name: '孙八', age: 29, email: 'sunba@example.com', department: '运营部', salary: 7200, active: true, joinDate: '2023-02-28' },
  { id: 7, name: '周九', age: 26, email: 'zhoujiu@example.com', department: '技术部', salary: 8200, active: false, joinDate: '2023-04-12' },
  { id: 8, name: '吴十', age: 31, email: 'wushi@example.com', department: '产品部', salary: 9500, active: true, joinDate: '2022-11-08' }
]

// 基础列配置
export const basicColumns = [
  {
    key: 'id',
    title: 'ID',
    width: 60,
    sortable: true
  },
  {
    key: 'name',
    title: '姓名',
    width: 100,
    sortable: true
  },
  {
    key: 'age',
    title: '年龄',
    width: 80,
    sortable: true
  },
  {
    key: 'email',
    title: '邮箱',
    width: 200
  },
  {
    key: 'department',
    title: '部门',
    width: 100,
    filterable: true
  },
  {
    key: 'salary',
    title: '薪资',
    width: 100,
    sortable: true,
    formatter: (value) => `¥${value.toLocaleString()}`
  },
  {
    key: 'active',
    title: '状态',
    width: 80,
    render: (value) => value ? '<span style="color: green;">✓ 在职</span>' : '<span style="color: red;">✗ 离职</span>'
  },
  {
    key: 'joinDate',
    title: '入职日期',
    width: 120
  }
]

// 可编辑列配置
export const editableColumns = [
  {
    key: 'id',
    title: 'ID',
    width: 60,
    sortable: true
  },
  {
    key: 'name',
    title: '姓名',
    width: 100,
    sortable: true,
    editable: true,
    editor: {
      type: 'text',
      rules: [
        {
          validator: (value) => value && value.length > 0,
          message: '姓名不能为空'
        }
      ]
    }
  },
  {
    key: 'age',
    title: '年龄',
    width: 80,
    sortable: true,
    editable: true,
    editor: {
      type: 'number',
      props: { min: 18, max: 65 },
      rules: [
        {
          validator: (value) => value >= 18 && value <= 65,
          message: '年龄必须在18-65之间'
        }
      ]
    }
  },
  {
    key: 'email',
    title: '邮箱',
    width: 200,
    editable: true,
    editor: {
      type: 'text',
      rules: [
        {
          validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          message: '请输入有效的邮箱地址'
        }
      ]
    }
  },
  {
    key: 'department',
    title: '部门',
    width: 100,
    filterable: true,
    editable: true,
    editor: {
      type: 'select',
      options: [
        { label: '技术部', value: '技术部' },
        { label: '产品部', value: '产品部' },
        { label: '设计部', value: '设计部' },
        { label: '市场部', value: '市场部' },
        { label: '运营部', value: '运营部' }
      ]
    }
  },
  {
    key: 'salary',
    title: '薪资',
    width: 100,
    sortable: true,
    editable: true,
    editor: {
      type: 'number',
      props: { min: 3000, step: 100 }
    },
    formatter: (value) => `¥${value.toLocaleString()}`
  },
  {
    key: 'active',
    title: '状态',
    width: 80,
    editable: true,
    editor: {
      type: 'checkbox'
    },
    render: (value) => value ? '<span style="color: green;">✓ 在职</span>' : '<span style="color: red;">✗ 离职</span>'
  },
  {
    key: 'joinDate',
    title: '入职日期',
    width: 120,
    editable: true,
    editor: {
      type: 'date'
    }
  }
]

// 拖拽排序列配置
export const dragSortColumns = [
  {
    key: 'drag',
    title: '',
    width: 40,
    render: () => '<span class="drag-handle" style="cursor: grab;">⋮⋮</span>'
  },
  ...basicColumns
]

// 生成大量数据
export function generateLargeData(count = 10000) {
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二']
  const departments = ['技术部', '产品部', '设计部', '市场部', '运营部']
  const domains = ['example.com', 'test.com', 'demo.com', 'sample.com']
  
  const data = []
  for (let i = 1; i <= count; i++) {
    data.push({
      id: i,
      name: `${names[i % names.length]}${i}`,
      age: Math.floor(Math.random() * 30) + 22,
      email: `user${i}@${domains[i % domains.length]}`,
      department: departments[i % departments.length],
      salary: Math.floor(Math.random() * 5000) + 5000,
      active: Math.random() > 0.2,
      joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
    })
  }
  return data
}

// 生成随机员工数据
export function generateRandomEmployee() {
  const names = ['新员工A', '新员工B', '新员工C', '新员工D', '新员工E']
  const departments = ['技术部', '产品部', '设计部', '市场部', '运营部']
  
  return {
    id: Date.now(),
    name: names[Math.floor(Math.random() * names.length)],
    age: Math.floor(Math.random() * 30) + 22,
    email: `user${Date.now()}@example.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    salary: Math.floor(Math.random() * 5000) + 5000,
    active: Math.random() > 0.3,
    joinDate: new Date().toISOString().split('T')[0]
  }
}

// 日志记录工具
export function createLogger(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return () => {}
  
  return function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = document.createElement('div')
    logEntry.className = `log-entry ${type}`
    logEntry.textContent = `[${timestamp}] ${message}`
    
    container.appendChild(logEntry)
    container.scrollTop = container.scrollHeight
  }
}
