/**
 * LDesign Form - 基础表单示例
 * 
 * @description
 * 展示如何使用 LDesign Form 的核心 API 创建和管理表单
 */

// 注意：在实际项目中，这些函数会从 main.js 中导入
// 这里我们直接使用全局函数

// 模拟 LDesign Form 核心 API（实际使用时应该从构建后的包中导入）
// import { createForm } from '@ldesign/form';

// 简化的表单实现（用于演示）
class SimpleForm {
  constructor(config) {
    this.config = config;
    this.data = { ...config.initialValues };
    this.fields = new Map();
    this.errors = {};
    this.isDirty = false;
    this.isSubmitted = false;
    this.listeners = {
      change: [],
      submit: [],
      reset: []
    };
  }

  registerField(fieldConfig) {
    const field = new SimpleField(fieldConfig, this);
    this.fields.set(fieldConfig.name, field);
    return field;
  }

  setFieldValue(name, value) {
    const oldValue = this.data[name];
    this.data[name] = value;
    
    if (oldValue !== value) {
      this.isDirty = true;
      this.emit('change', { name, value, oldValue, data: this.data });
    }
    
    // 清除该字段的错误
    delete this.errors[name];
    clearError(name);
    
    // 更新状态显示
    this.updateStatusDisplay();
  }

  getFieldValue(name) {
    return this.data[name];
  }

  validate() {
    this.errors = {};
    let isValid = true;

    for (const [name, field] of this.fields) {
      const value = this.data[name];
      const fieldErrors = field.validate(value);
      
      if (fieldErrors.length > 0) {
        this.errors[name] = fieldErrors;
        isValid = false;
        showError(name, fieldErrors[0]);
      } else {
        clearError(name);
      }
    }

    this.updateStatusDisplay();
    return isValid;
  }

  submit() {
    const isValid = this.validate();
    this.isSubmitted = true;
    
    const event = {
      data: formatFormData(this.data),
      valid: isValid,
      errors: this.errors
    };
    
    this.emit('submit', event);
    this.updateStatusDisplay();
    
    return event;
  }

  reset() {
    this.data = { ...this.config.initialValues };
    this.errors = {};
    this.isDirty = false;
    this.isSubmitted = false;
    
    // 清除所有错误显示
    for (const name of this.fields.keys()) {
      clearError(name);
    }
    
    // 重置表单元素
    const form = document.getElementById('basicForm');
    if (form) {
      form.reset();
    }
    
    this.emit('reset', { data: this.data });
    this.updateStatusDisplay();
  }

  on(event, listener) {
    if (this.listeners[event]) {
      this.listeners[event].push(listener);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(data));
    }
  }

  updateStatusDisplay() {
    const isValid = Object.keys(this.errors).length === 0;
    
    updateStatus('form-valid', isValid ? '有效' : '无效', isValid ? 'valid' : 'invalid');
    updateStatus('form-dirty', this.isDirty ? '已修改' : '未修改', this.isDirty ? 'dirty' : 'pristine');
    updateStatus('form-submitted', this.isSubmitted ? '已提交' : '未提交');
  }
}

class SimpleField {
  constructor(config, form) {
    this.config = config;
    this.form = form;
  }

  validate(value) {
    const errors = [];
    const rules = this.config.rules || [];

    for (const rule of rules) {
      if (rule.required && !isRequired(value)) {
        errors.push(rule.message || '此字段是必填项');
        break;
      }

      if (rule.type === 'email' && value && !isValidEmail(value)) {
        errors.push(rule.message || '请输入有效的邮箱地址');
      }

      if (rule.min !== undefined || rule.max !== undefined) {
        if (!validateLength(value, rule.min, rule.max)) {
          if (rule.min !== undefined && rule.max !== undefined) {
            errors.push(rule.message || `长度必须在 ${rule.min} 到 ${rule.max} 之间`);
          } else if (rule.min !== undefined) {
            errors.push(rule.message || `最少需要 ${rule.min} 个字符`);
          } else if (rule.max !== undefined) {
            errors.push(rule.message || `最多允许 ${rule.max} 个字符`);
          }
        }
      }
    }

    return errors;
  }
}

// 创建表单实例
const form = new SimpleForm({
  initialValues: {
    name: '',
    email: '',
    age: '',
    bio: ''
  }
});

// 注册字段
const nameField = form.registerField({
  name: 'name',
  rules: [
    { required: true, message: '姓名是必填项' },
    { min: 2, message: '姓名至少需要2个字符' }
  ]
});

const emailField = form.registerField({
  name: 'email',
  rules: [
    { required: true, message: '邮箱是必填项' },
    { type: 'email', message: '请输入有效的邮箱地址' }
  ]
});

const ageField = form.registerField({
  name: 'age',
  rules: [
    { min: 0, message: '年龄不能为负数' },
    { max: 120, message: '年龄不能超过120岁' }
  ]
});

const bioField = form.registerField({
  name: 'bio',
  rules: [
    { max: 500, message: '个人简介不能超过500个字符' }
  ]
});

// 防抖验证函数
const debouncedValidate = debounce(() => {
  form.validate();
}, 300);

// 绑定事件监听器
document.addEventListener('DOMContentLoaded', () => {
  // 获取表单元素
  const formElement = document.getElementById('basicForm');
  const submitBtn = document.getElementById('submitBtn');
  const resetBtn = document.getElementById('resetBtn');
  const validateBtn = document.getElementById('validateBtn');

  // 绑定输入事件
  ['name', 'email', 'age', 'bio'].forEach(fieldName => {
    const input = document.getElementById(fieldName);
    if (input) {
      input.addEventListener('input', (e) => {
        const value = e.target.type === 'number' ?
          (e.target.value ? Number(e.target.value) : '') :
          e.target.value;

        form.setFieldValue(fieldName, value);
        debouncedValidate();
      });

      input.addEventListener('blur', () => {
        form.validate();
      });
    }
  });

  // 表单提交事件
  formElement.addEventListener('submit', (e) => {
    e.preventDefault();

    const result = form.submit();

    if (result.valid) {
      showNotification('表单提交成功！', 'success');
      console.log('表单数据:', result.data);
    } else {
      showNotification('表单验证失败，请检查输入！', 'error');
      console.log('验证错误:', result.errors);
    }
  });

  // 重置按钮事件
  resetBtn.addEventListener('click', () => {
    form.reset();
    showNotification('表单已重置', 'info');
  });

  // 验证按钮事件
  validateBtn.addEventListener('click', () => {
    const isValid = form.validate();

    if (isValid) {
      showNotification('表单验证通过！', 'success');
    } else {
      showNotification('表单验证失败！', 'error');
    }
  });

  // 表单事件监听
  form.on('change', (event) => {
    console.log('表单数据变化:', event);
  });

  form.on('submit', (event) => {
    console.log('表单提交:', event);
  });

  form.on('reset', (event) => {
    console.log('表单重置:', event);
  });

  // 初始化状态显示
  form.updateStatusDisplay();

  console.log('基础表单示例已初始化');
});
