/**
 * 核心功能测试文件
 * 
 * 用于验证框架无关的核心功能是否正常工作
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { createForm, createVanillaAdapter } from './index'

/**
 * 测试基础表单创建和操作
 */
function testBasicFormOperations() {
  console.log('=== 测试基础表单操作 ===')
  
  // 创建表单
  const form = createForm({
    initialValues: {
      name: '',
      email: '',
      age: 0
    },
    fields: [
      {
        name: 'name',
        label: '姓名',
        type: 'input',
        rules: [
          { type: 'required', message: '请输入姓名' }
        ]
      },
      {
        name: 'email',
        label: '邮箱',
        type: 'input',
        rules: [
          { type: 'required', message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]
      },
      {
        name: 'age',
        label: '年龄',
        type: 'input',
        rules: [
          { type: 'required', message: '请输入年龄' }
        ]
      }
    ]
  }, {
    onFieldChange: (name, value) => {
      console.log(`字段 ${name} 变化:`, value)
    },
    onSubmit: async (values) => {
      console.log('提交数据:', values)
    }
  })
  
  console.log('表单创建成功，ID:', form.id)
  
  // 测试数据操作
  console.log('初始数据:', form.getData())
  
  form.setFieldValue('name', 'John Doe')
  form.setFieldValue('email', 'john@example.com')
  form.setFieldValue('age', 25)
  
  console.log('设置值后的数据:', form.getData())
  
  // 测试状态
  console.log('表单状态:', form.getState())
  
  return form
}

/**
 * 测试适配器功能
 */
function testAdapterFunctionality() {
  console.log('\n=== 测试适配器功能 ===')
  
  // 创建适配器
  const adapter = createVanillaAdapter({
    debug: true
  })
  
  console.log('适配器创建成功:', adapter.name, adapter.version)
  console.log('是否支持当前环境:', adapter.isSupported())
  
  // 创建表单
  const form = adapter.createForm({
    initialValues: {
      username: '',
      password: ''
    },
    fields: [
      {
        name: 'username',
        label: '用户名',
        type: 'input',
        placeholder: '请输入用户名'
      },
      {
        name: 'password',
        label: '密码',
        type: 'input',
        props: { type: 'password' },
        placeholder: '请输入密码'
      }
    ]
  })
  
  console.log('通过适配器创建表单成功')
  
  return { adapter, form }
}

/**
 * 测试数据管理器
 */
function testDataManager() {
  console.log('\n=== 测试数据管理器 ===')
  
  const form = createForm({
    initialValues: {
      user: {
        profile: {
          name: '',
          age: 0
        },
        settings: {
          theme: 'light',
          notifications: true
        }
      }
    }
  })
  
  // 测试深层路径访问
  console.log('初始数据:', form.getData())
  
  form.setFieldValue('user.profile.name', 'Alice')
  form.setFieldValue('user.profile.age', 30)
  form.setFieldValue('user.settings.theme', 'dark')
  
  console.log('设置深层值后:', form.getData())
  console.log('获取单个深层值:', form.getFieldValue('user.profile.name'))
  
  return form
}

/**
 * 测试状态管理器
 */
function testStateManager() {
  console.log('\n=== 测试状态管理器 ===')
  
  const form = createForm({
    initialValues: {
      field1: '',
      field2: ''
    }
  })
  
  // 监听状态变化
  form.on('state:change', (state) => {
    console.log('状态变化:', state)
  })
  
  // 监听字段变化
  form.on('field:change', ({ name, value }) => {
    console.log(`字段 ${name} 变化为:`, value)
  })
  
  // 触发变化
  form.setFieldValue('field1', 'value1')
  form.setFieldValue('field2', 'value2')
  
  console.log('最终状态:', form.getState())
  
  return form
}

/**
 * 运行所有测试
 */
function runAllTests() {
  try {
    console.log('开始运行核心功能测试...\n')
    
    const form1 = testBasicFormOperations()
    const { adapter, form: form2 } = testAdapterFunctionality()
    const form3 = testDataManager()
    const form4 = testStateManager()
    
    console.log('\n=== 测试完成 ===')
    console.log('所有测试都成功运行！')
    
    // 清理资源
    form1.destroy()
    form2.destroy()
    form3.destroy()
    form4.destroy()
    adapter.destroy()
    
    console.log('资源清理完成')
    
  } catch (error) {
    console.error('测试过程中发生错误:', error)
  }
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests)
  } else {
    runAllTests()
  }
} else {
  // 在Node.js环境中直接运行
  runAllTests()
}

export { runAllTests }
