/**
 * 验证引擎测试文件
 * 
 * 用于验证验证引擎和内置验证规则是否正常工作
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { createForm } from './core/factory'
import { required, email, minLength, maxLength, range, integer } from './utils/validation-rules'

/**
 * 测试基础验证规则
 */
async function testBasicValidationRules() {
  console.log('=== 测试基础验证规则 ===')
  
  // 创建带验证规则的表单
  const form = createForm({
    initialValues: {
      name: '',
      email: '',
      age: '',
      bio: ''
    },
    fields: [
      {
        name: 'name',
        label: '姓名',
        type: 'input',
        rules: [
          { type: 'required', message: '请输入姓名' },
          { type: 'minLength', params: { min: 2 }, message: '姓名至少2个字符' },
          { type: 'maxLength', params: { max: 20 }, message: '姓名不能超过20个字符' }
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
          { type: 'required', message: '请输入年龄' },
          { type: 'integer', message: '年龄必须是整数' },
          { type: 'range', params: { min: 0, max: 120 }, message: '年龄必须在0-120之间' }
        ]
      },
      {
        name: 'bio',
        label: '个人简介',
        type: 'textarea',
        rules: [
          { type: 'maxLength', params: { max: 500 }, message: '个人简介不能超过500个字符' }
        ]
      }
    ]
  })
  
  console.log('表单创建成功，开始测试验证...')
  
  // 测试空值验证
  console.log('\n--- 测试空值验证 ---')
  let result = await form.validate()
  console.log('空值验证结果:', result)
  
  // 测试有效值
  console.log('\n--- 测试有效值 ---')
  form.setFieldValue('name', 'John Doe')
  form.setFieldValue('email', 'john@example.com')
  form.setFieldValue('age', 25)
  form.setFieldValue('bio', '这是一个简短的个人简介')
  
  result = await form.validate()
  console.log('有效值验证结果:', result)
  
  // 测试无效值
  console.log('\n--- 测试无效值 ---')
  form.setFieldValue('name', 'A') // 太短
  form.setFieldValue('email', 'invalid-email') // 无效邮箱
  form.setFieldValue('age', 150) // 超出范围
  
  result = await form.validate()
  console.log('无效值验证结果:', result)
  
  return form
}

/**
 * 测试自定义验证规则
 */
async function testCustomValidationRules() {
  console.log('\n=== 测试自定义验证规则 ===')
  
  const form = createForm({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    fields: [
      {
        name: 'password',
        label: '密码',
        type: 'input',
        rules: [
          { type: 'required', message: '请输入密码' },
          { type: 'minLength', params: { min: 8 }, message: '密码至少8个字符' },
          {
            type: 'custom',
            validator: (value: string) => {
              const hasUpper = /[A-Z]/.test(value)
              const hasLower = /[a-z]/.test(value)
              const hasNumber = /\d/.test(value)
              
              if (!hasUpper || !hasLower || !hasNumber) {
                return '密码必须包含大写字母、小写字母和数字'
              }
              
              return true
            },
            message: '密码强度不够'
          }
        ]
      },
      {
        name: 'confirmPassword',
        label: '确认密码',
        type: 'input',
        dependencies: ['password'],
        rules: [
          { type: 'required', message: '请确认密码' },
          {
            type: 'custom',
            validator: (value: string, context: any) => {
              const password = context.formData.password
              return value === password ? true : '两次输入的密码不一致'
            },
            message: '密码确认失败'
          }
        ]
      }
    ]
  })
  
  // 测试密码强度验证
  console.log('\n--- 测试密码强度验证 ---')
  form.setFieldValue('password', 'weak')
  let result = await form.validateField('password')
  console.log('弱密码验证结果:', result)
  
  form.setFieldValue('password', 'StrongPass123')
  result = await form.validateField('password')
  console.log('强密码验证结果:', result)
  
  // 测试密码确认验证
  console.log('\n--- 测试密码确认验证 ---')
  form.setFieldValue('confirmPassword', 'DifferentPass123')
  result = await form.validateField('confirmPassword')
  console.log('密码不匹配验证结果:', result)
  
  form.setFieldValue('confirmPassword', 'StrongPass123')
  result = await form.validateField('confirmPassword')
  console.log('密码匹配验证结果:', result)
  
  return form
}

/**
 * 测试异步验证
 */
async function testAsyncValidation() {
  console.log('\n=== 测试异步验证 ===')
  
  const form = createForm({
    initialValues: {
      username: ''
    },
    fields: [
      {
        name: 'username',
        label: '用户名',
        type: 'input',
        rules: [
          { type: 'required', message: '请输入用户名' },
          { type: 'minLength', params: { min: 3 }, message: '用户名至少3个字符' },
          {
            type: 'custom',
            validator: async (value: string) => {
              // 模拟异步验证（检查用户名是否已存在）
              console.log(`正在检查用户名 "${value}" 是否可用...`)
              
              return new Promise((resolve) => {
                setTimeout(() => {
                  const existingUsers = ['admin', 'test', 'user']
                  const isAvailable = !existingUsers.includes(value.toLowerCase())
                  
                  if (isAvailable) {
                    console.log(`用户名 "${value}" 可用`)
                    resolve(true)
                  } else {
                    console.log(`用户名 "${value}" 已被占用`)
                    resolve('该用户名已被占用，请选择其他用户名')
                  }
                }, 1000) // 模拟网络延迟
              })
            },
            message: '用户名验证失败'
          }
        ]
      }
    ]
  })
  
  // 测试可用用户名
  console.log('\n--- 测试可用用户名 ---')
  form.setFieldValue('username', 'newuser')
  let result = await form.validateField('username')
  console.log('可用用户名验证结果:', result)
  
  // 测试已占用用户名
  console.log('\n--- 测试已占用用户名 ---')
  form.setFieldValue('username', 'admin')
  result = await form.validateField('username')
  console.log('已占用用户名验证结果:', result)
  
  return form
}

/**
 * 测试条件验证
 */
async function testConditionalValidation() {
  console.log('\n=== 测试条件验证 ===')
  
  const form = createForm({
    initialValues: {
      hasAddress: false,
      address: '',
      city: '',
      zipCode: ''
    },
    fields: [
      {
        name: 'hasAddress',
        label: '是否填写地址',
        type: 'checkbox'
      },
      {
        name: 'address',
        label: '详细地址',
        type: 'input',
        rules: [
          {
            type: 'required',
            condition: (formData: any) => formData.hasAddress,
            message: '请输入详细地址'
          }
        ]
      },
      {
        name: 'city',
        label: '城市',
        type: 'input',
        rules: [
          {
            type: 'required',
            condition: (formData: any) => formData.hasAddress,
            message: '请输入城市'
          }
        ]
      },
      {
        name: 'zipCode',
        label: '邮政编码',
        type: 'input',
        rules: [
          {
            type: 'required',
            condition: (formData: any) => formData.hasAddress,
            message: '请输入邮政编码'
          },
          {
            type: 'pattern',
            params: { pattern: /^\d{6}$/ },
            condition: (formData: any) => formData.hasAddress,
            message: '邮政编码格式不正确'
          }
        ]
      }
    ]
  })
  
  // 测试未选择地址时的验证
  console.log('\n--- 测试未选择地址时的验证 ---')
  let result = await form.validate()
  console.log('未选择地址验证结果:', result)
  
  // 测试选择地址但未填写时的验证
  console.log('\n--- 测试选择地址但未填写时的验证 ---')
  form.setFieldValue('hasAddress', true)
  result = await form.validate()
  console.log('选择地址但未填写验证结果:', result)
  
  // 测试填写完整地址信息
  console.log('\n--- 测试填写完整地址信息 ---')
  form.setFieldValue('address', '北京市朝阳区某某街道123号')
  form.setFieldValue('city', '北京')
  form.setFieldValue('zipCode', '100000')
  result = await form.validate()
  console.log('完整地址信息验证结果:', result)
  
  return form
}

/**
 * 运行所有验证测试
 */
async function runAllValidationTests() {
  try {
    console.log('开始运行验证引擎测试...\n')
    
    const form1 = await testBasicValidationRules()
    const form2 = await testCustomValidationRules()
    const form3 = await testAsyncValidation()
    const form4 = await testConditionalValidation()
    
    console.log('\n=== 验证测试完成 ===')
    console.log('所有验证测试都成功运行！')
    
    // 清理资源
    form1.destroy()
    form2.destroy()
    form3.destroy()
    form4.destroy()
    
    console.log('资源清理完成')
    
  } catch (error) {
    console.error('验证测试过程中发生错误:', error)
  }
}

// 导出测试函数
export { runAllValidationTests }
