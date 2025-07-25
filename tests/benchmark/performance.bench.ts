import { bench, describe } from 'vitest'

// 模拟组件渲染性能测试
describe('component Performance', () => {
  bench('button render performance', () => {
    // 模拟按钮组件渲染
    const button = document.createElement('button')
    button.textContent = 'Test Button'
    button.className = 'l-button l-button--primary'

    // 模拟样式计算
    const styles = {
      padding: '8px 16px',
      borderRadius: '4px',
      backgroundColor: '#1890ff',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
    }

    Object.assign(button.style, styles)

    // 模拟 DOM 操作
    document.body.appendChild(button)
    document.body.removeChild(button)
  })

  bench('input validation performance', () => {
    const testCases = [
      'test@example.com',
      'invalid-email',
      '12345',
      'a'.repeat(100),
      '',
    ]

    // 模拟邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/

    testCases.forEach((email) => {
      emailRegex.test(email)
    })
  })

  bench('color utility performance', () => {
    // 模拟颜色转换函数
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
        : null
    }

    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000']
    colors.forEach(color => hexToRgb(color))
  })

  bench('state management performance', () => {
    // 模拟状态管理操作
    const state = {
      count: 0,
      items: [] as number[],
      user: { name: 'test', id: 1 },
    }

    // 模拟多次状态更新
    for (let i = 0; i < 1000; i++) {
      state.count++
      state.items.push(i)
      state.user = { ...state.user, name: `user-${i}` }
    }
  })
})

// 模拟工具函数性能测试
describe('utility Performance', () => {
  bench('array operations', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i)

    // 测试各种数组操作
    arr.map(x => x * 2)
    arr.filter(x => x % 2 === 0)
    arr.reduce((sum, x) => sum + x, 0)
    arr.find(x => x === 500)
    arr.includes(500)
  })

  bench('object operations', () => {
    const obj = Object.fromEntries(
      Array.from({ length: 100 }, (_, i) => [`key${i}`, `value${i}`]),
    )

    // 测试对象操作
    Object.keys(obj)
    Object.values(obj)
    Object.entries(obj)
    Object.assign({}, obj)
    JSON.stringify(obj)
    JSON.parse(JSON.stringify(obj))
  })

  bench('string operations', () => {
    const str = 'Hello World '.repeat(100)

    // 测试字符串操作
    str.toUpperCase()
    str.toLowerCase()
    str.trim()
    str.split(' ')
    str.replace(/Hello/g, 'Hi')
    str.includes('World')
    str.startsWith('Hello')
    str.endsWith('World')
  })

  bench('date operations', () => {
    const now = new Date()

    // 测试日期操作
    now.getTime()
    now.toISOString()
    now.toLocaleDateString()
    const tomorrow = new Date(now.getTime() + 86400000) // 加一天
    Date.now()

    // 使用 tomorrow 避免 no-new 错误
    tomorrow.getTime()
  })
})

// 模拟内存使用测试
describe('memory Usage', () => {
  bench('memory allocation', () => {
    // 创建大量对象测试内存分配
    const objects = []
    for (let i = 0; i < 1000; i++) {
      objects.push({
        id: i,
        name: `item-${i}`,
        data: Array.from({ length: 100 }).fill(i),
        timestamp: Date.now(),
      })
    }

    // 清理
    objects.length = 0
  })

  bench('dOM manipulation', () => {
    // 测试 DOM 操作性能
    const container = document.createElement('div')

    for (let i = 0; i < 100; i++) {
      const element = document.createElement('div')
      element.textContent = `Item ${i}`
      element.className = 'test-item'
      container.appendChild(element)
    }

    // 清理
    container.innerHTML = ''
  })
})
