# 最佳实践

本指南提供了使用 LDesign 组件库的最佳实践，帮助你构建高质量、可维护的应用程序。

## 组件使用

### 选择合适的组件

根据具体的使用场景选择最合适的组件：

```html
<!-- ✅ 好的做法：根据场景选择合适的按钮类型 -->
<ld-button type="primary">主要操作</ld-button>
<ld-button type="default">次要操作</ld-button>
<ld-button type="text">辅助操作</ld-button>
<ld-button type="link" href="/help">帮助链接</ld-button>

<!-- ❌ 避免：滥用主要按钮 -->
<ld-button type="primary">保存</ld-button>
<ld-button type="primary">取消</ld-button>
<ld-button type="primary">删除</ld-button>
```

### 保持一致性

在整个应用中保持组件使用的一致性：

```html
<!-- ✅ 好的做法：统一的尺寸和样式 -->
<ld-form>
  <ld-form-item label="用户名">
    <ld-input size="medium" placeholder="请输入用户名"></ld-input>
  </ld-form-item>
  <ld-form-item label="密码">
    <ld-input size="medium" type="password" placeholder="请输入密码"></ld-input>
  </ld-form-item>
  <ld-form-item>
    <ld-button type="primary" size="medium">登录</ld-button>
  </ld-form-item>
</ld-form>

<!-- ❌ 避免：混乱的尺寸 -->
<ld-form>
  <ld-form-item label="用户名">
    <ld-input size="large" placeholder="请输入用户名"></ld-input>
  </ld-form-item>
  <ld-form-item label="密码">
    <ld-input size="small" type="password" placeholder="请输入密码"></ld-input>
  </ld-form-item>
  <ld-form-item>
    <ld-button type="primary" size="medium">登录</ld-button>
  </ld-form-item>
</ld-form>
```

### 合理使用属性

充分利用组件提供的属性来满足需求：

```html
<!-- ✅ 好的做法：使用组件属性 -->
<ld-input 
  placeholder="请输入邮箱"
  type="email"
  clearable
  prefix-icon="mail"
  max-length="50">
</ld-input>

<!-- ❌ 避免：不必要的自定义 -->
<div class="custom-input-wrapper">
  <span class="custom-icon">📧</span>
  <ld-input placeholder="请输入邮箱"></ld-input>
  <button class="custom-clear">×</button>
</div>
```

## 性能优化

### 按需加载

只加载实际使用的组件：

```javascript
// ✅ 好的做法：按需加载
import { defineCustomElement as defineButton } from '@ldesign/components/dist/components/ld-button';
import { defineCustomElement as defineInput } from '@ldesign/components/dist/components/ld-input';

defineButton();
defineInput();

// ❌ 避免：加载所有组件（如果只使用少数组件）
import { defineCustomElements } from '@ldesign/components/loader';
defineCustomElements(); // 加载了所有组件
```

### 懒加载

对于大型应用，考虑使用懒加载：

```javascript
// ✅ 好的做法：懒加载复杂组件
async function loadTable() {
  const { defineCustomElement } = await import('@ldesign/components/dist/components/ld-table');
  defineCustomElement();
}

// 只在需要时加载
document.getElementById('load-table').addEventListener('click', loadTable);
```

### 避免重复注册

确保组件只注册一次：

```javascript
// ✅ 好的做法：检查是否已注册
function registerComponent(tagName, defineFunction) {
  if (!customElements.get(tagName)) {
    defineFunction();
  }
}

registerComponent('ld-button', defineButton);
```

## 可访问性

### 语义化标签

使用语义化的 HTML 结构：

```html
<!-- ✅ 好的做法：语义化结构 -->
<main>
  <section>
    <h2>用户信息</h2>
    <ld-form role="form" aria-label="用户信息表单">
      <ld-form-item label="姓名">
        <ld-input aria-describedby="name-help"></ld-input>
        <div id="name-help">请输入您的真实姓名</div>
      </ld-form-item>
    </ld-form>
  </section>
</main>

<!-- ❌ 避免：缺乏语义 -->
<div>
  <div>用户信息</div>
  <ld-form>
    <ld-form-item label="姓名">
      <ld-input></ld-input>
    </ld-form-item>
  </ld-form>
</div>
```

### 键盘导航

确保所有交互元素都支持键盘导航：

```html
<!-- ✅ 好的做法：支持键盘导航 -->
<ld-modal visible="true" modal-title="确认删除">
  <p>确定要删除这个项目吗？</p>
  <div slot="footer">
    <ld-button type="primary" autofocus>确定</ld-button>
    <ld-button>取消</ld-button>
  </div>
</ld-modal>
```

### ARIA 属性

适当使用 ARIA 属性增强可访问性：

```html
<!-- ✅ 好的做法：使用 ARIA 属性 -->
<ld-button 
  type="primary" 
  aria-label="保存文档"
  aria-describedby="save-help">
  保存
</ld-button>
<div id="save-help" class="sr-only">
  快捷键：Ctrl+S
</div>
```

## 表单处理

### 表单验证

实现完整的表单验证：

```javascript
// ✅ 好的做法：完整的表单验证
class FormValidator {
  constructor(formElement) {
    this.form = formElement;
    this.rules = new Map();
  }
  
  addRule(fieldName, validator, message) {
    if (!this.rules.has(fieldName)) {
      this.rules.set(fieldName, []);
    }
    this.rules.get(fieldName).push({ validator, message });
  }
  
  async validate() {
    const errors = new Map();
    
    for (const [fieldName, rules] of this.rules) {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      const value = field?.value || '';
      
      for (const rule of rules) {
        const isValid = await rule.validator(value);
        if (!isValid) {
          errors.set(fieldName, rule.message);
          break;
        }
      }
    }
    
    this.displayErrors(errors);
    return errors.size === 0;
  }
  
  displayErrors(errors) {
    // 清除之前的错误
    this.form.querySelectorAll('ld-form-item').forEach(item => {
      item.removeAttribute('validate-status');
      item.removeAttribute('validate-message');
    });
    
    // 显示新错误
    for (const [fieldName, message] of errors) {
      const formItem = this.form.querySelector(`ld-form-item[prop="${fieldName}"]`);
      if (formItem) {
        formItem.setAttribute('validate-status', 'error');
        formItem.setAttribute('validate-message', message);
      }
    }
  }
}

// 使用示例
const validator = new FormValidator(document.getElementById('user-form'));
validator.addRule('email', (value) => /\S+@\S+\.\S+/.test(value), '请输入有效的邮箱地址');
validator.addRule('password', (value) => value.length >= 8, '密码至少8位');
```

### 表单状态管理

合理管理表单状态：

```javascript
// ✅ 好的做法：状态管理
class FormManager {
  constructor() {
    this.data = {};
    this.errors = {};
    this.loading = false;
    this.dirty = false;
  }
  
  setField(name, value) {
    this.data[name] = value;
    this.dirty = true;
    this.clearError(name);
  }
  
  setError(name, message) {
    this.errors[name] = message;
  }
  
  clearError(name) {
    delete this.errors[name];
  }
  
  async submit() {
    this.loading = true;
    try {
      const response = await this.api.submit(this.data);
      this.dirty = false;
      return response;
    } catch (error) {
      this.handleSubmitError(error);
      throw error;
    } finally {
      this.loading = false;
    }
  }
  
  handleSubmitError(error) {
    if (error.fieldErrors) {
      Object.entries(error.fieldErrors).forEach(([field, message]) => {
        this.setError(field, message);
      });
    }
  }
}
```

## 错误处理

### 用户友好的错误信息

提供清晰、可操作的错误信息：

```html
<!-- ✅ 好的做法：清晰的错误信息 -->
<ld-form-item 
  label="邮箱地址" 
  validate-status="error" 
  validate-message="邮箱格式不正确，请检查后重新输入">
  <ld-input type="email" value="invalid-email"></ld-input>
</ld-form-item>

<!-- ❌ 避免：模糊的错误信息 -->
<ld-form-item 
  label="邮箱地址" 
  validate-status="error" 
  validate-message="错误">
  <ld-input type="email" value="invalid-email"></ld-input>
</ld-form-item>
```

### 错误边界

实现错误边界来处理组件错误：

```javascript
// ✅ 好的做法：错误边界
class ComponentErrorHandler {
  constructor() {
    this.setupGlobalErrorHandler();
  }
  
  setupGlobalErrorHandler() {
    window.addEventListener('error', (event) => {
      if (event.target.tagName?.startsWith('LD-')) {
        this.handleComponentError(event.target, event.error);
      }
    });
  }
  
  handleComponentError(component, error) {
    console.error('Component error:', component.tagName, error);
    
    // 显示用户友好的错误信息
    this.showErrorMessage('组件加载失败，请刷新页面重试');
    
    // 上报错误
    this.reportError(component.tagName, error);
  }
  
  showErrorMessage(message) {
    // 使用 Toast 或其他方式显示错误
    console.warn(message);
  }
  
  reportError(componentName, error) {
    // 上报到错误监控系统
    // analytics.reportError(componentName, error);
  }
}

new ComponentErrorHandler();
```

## 测试

### 组件测试

编写全面的组件测试：

```javascript
// ✅ 好的做法：全面的测试
describe('ld-button', () => {
  let button;
  
  beforeEach(() => {
    button = document.createElement('ld-button');
    document.body.appendChild(button);
  });
  
  afterEach(() => {
    document.body.removeChild(button);
  });
  
  test('should render with default props', () => {
    expect(button.type).toBe('default');
    expect(button.size).toBe('medium');
    expect(button.disabled).toBe(false);
  });
  
  test('should handle click events', async () => {
    const clickHandler = jest.fn();
    button.addEventListener('ldClick', clickHandler);
    
    button.click();
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(clickHandler).toHaveBeenCalled();
  });
  
  test('should be accessible', async () => {
    button.textContent = 'Test Button';
    
    expect(button.getAttribute('role')).toBe('button');
    expect(button.tabIndex).toBe(0);
  });
});
```

### E2E 测试

编写端到端测试：

```javascript
// ✅ 好的做法：E2E 测试
import { test, expect } from '@playwright/test';

test('user can submit form', async ({ page }) => {
  await page.goto('/form-page');
  
  // 填写表单
  await page.fill('ld-input[name="username"]', 'testuser');
  await page.fill('ld-input[name="email"]', 'test@example.com');
  
  // 提交表单
  await page.click('ld-button[type="primary"]');
  
  // 验证结果
  await expect(page.locator('.success-message')).toBeVisible();
});
```

## 性能监控

### 监控组件性能

```javascript
// ✅ 好的做法：性能监控
class PerformanceMonitor {
  constructor() {
    this.setupComponentObserver();
  }
  
  setupComponentObserver() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('ld-')) {
          this.recordComponentMetric(entry);
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });
  }
  
  recordComponentMetric(entry) {
    console.log(`Component ${entry.name} took ${entry.duration}ms`);
    
    // 上报性能数据
    // analytics.recordTiming(entry.name, entry.duration);
  }
  
  measureComponentRender(componentName, renderFn) {
    performance.mark(`${componentName}-start`);
    renderFn();
    performance.mark(`${componentName}-end`);
    performance.measure(componentName, `${componentName}-start`, `${componentName}-end`);
  }
}
```

## 代码组织

### 模块化

保持代码的模块化和可维护性：

```javascript
// ✅ 好的做法：模块化组织
// components/UserForm.js
export class UserForm {
  constructor(container) {
    this.container = container;
    this.validator = new FormValidator();
    this.init();
  }
  
  init() {
    this.render();
    this.bindEvents();
    this.setupValidation();
  }
  
  render() {
    this.container.innerHTML = `
      <ld-form id="user-form">
        <ld-form-item label="用户名" prop="username">
          <ld-input name="username" placeholder="请输入用户名"></ld-input>
        </ld-form-item>
        <ld-form-item>
          <ld-button type="primary">提交</ld-button>
        </ld-form-item>
      </ld-form>
    `;
  }
  
  bindEvents() {
    const form = this.container.querySelector('#user-form');
    form.addEventListener('ldSubmit', this.handleSubmit.bind(this));
  }
  
  setupValidation() {
    this.validator.addRule('username', 
      value => value.length >= 3, 
      '用户名至少3个字符'
    );
  }
  
  async handleSubmit(event) {
    const isValid = await this.validator.validate();
    if (isValid) {
      // 处理提交
    }
  }
}
```

## 总结

遵循这些最佳实践可以帮助你：

1. **提高代码质量** - 编写更可维护的代码
2. **增强用户体验** - 提供更好的交互体验
3. **确保可访问性** - 让所有用户都能使用你的应用
4. **优化性能** - 构建高性能的应用程序
5. **简化维护** - 降低长期维护成本

记住，最佳实践会随着技术发展而演进，保持学习和更新是很重要的。
