/**
 * LDesign Form - 原生 HTML 示例主文件
 * 
 * @description
 * 提供通用的工具函数和初始化逻辑
 */

// 工具函数：显示错误信息
function showError(fieldName, message) {
  const errorElement = document.getElementById(`${fieldName}-error`);
  const inputElement = document.getElementById(fieldName);
  
  if (errorElement && inputElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
    inputElement.classList.add('error');
  }
}

// 工具函数：清除错误信息
function clearError(fieldName) {
  const errorElement = document.getElementById(`${fieldName}-error`);
  const inputElement = document.getElementById(fieldName);
  
  if (errorElement && inputElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('show');
    inputElement.classList.remove('error');
  }
}

// 工具函数：更新状态显示
function updateStatus(elementId, value, type = 'default') {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value;
    element.className = 'status-value';
    
    switch (type) {
      case 'valid':
        element.classList.add('valid');
        break;
      case 'invalid':
        element.classList.add('invalid');
        break;
      case 'dirty':
        element.classList.add('dirty');
        break;
      case 'pristine':
        element.classList.add('pristine');
        break;
      default:
        break;
    }
  }
}

// 工具函数：显示通知
function showNotification(message, type = 'info') {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // 添加样式
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '6px',
    color: 'white',
    fontWeight: '500',
    zIndex: '9999',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease',
    maxWidth: '300px',
    wordWrap: 'break-word'
  });
  
  // 设置背景色
  switch (type) {
    case 'success':
      notification.style.backgroundColor = 'var(--ldesign-success-color)';
      break;
    case 'error':
      notification.style.backgroundColor = 'var(--ldesign-error-color)';
      break;
    case 'warning':
      notification.style.backgroundColor = 'var(--ldesign-warning-color)';
      break;
    default:
      notification.style.backgroundColor = 'var(--ldesign-brand-color-6)';
      break;
  }
  
  // 添加到页面
  document.body.appendChild(notification);
  
  // 显示动画
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // 自动隐藏
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// 工具函数：格式化表单数据
function formatFormData(data) {
  const formatted = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== '') {
      formatted[key] = value;
    }
  }
  
  return formatted;
}

// 工具函数：验证邮箱格式
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 工具函数：验证必填字段
function isRequired(value) {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).length > 0;
  }
  return value !== null && value !== undefined;
}

// 工具函数：验证长度
function validateLength(value, min, max) {
  if (!value) return true; // 空值跳过长度验证
  
  const length = typeof value === 'string' ? value.length : 0;
  
  if (min !== undefined && length < min) {
    return false;
  }
  
  if (max !== undefined && length > max) {
    return false;
  }
  
  return true;
}

// 工具函数：防抖
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 工具函数：节流
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 工具函数：深拷贝
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}

// 工具函数：检查对象是否相等
function isEqual(a, b) {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!isEqual(a[key], b[key])) return false;
  }
  
  return true;
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('LDesign Form 原生 HTML 示例已加载');
  
  // 添加全局样式
  const style = document.createElement('style');
  style.textContent = `
    .notification {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
  `;
  document.head.appendChild(style);
});
