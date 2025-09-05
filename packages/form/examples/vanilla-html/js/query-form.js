/**
 * 查询表单示例 JavaScript
 * 
 * @description
 * 实现查询表单的展开/收起、数据管理、按钮布局等功能
 */

class QueryForm {
  constructor(options = {}) {
    this.options = {
      container: '#queryForm',
      defaultRowCount: 2,
      colCount: 4,
      gutter: 16,
      collapsed: true,
      onSubmit: null,
      onReset: null,
      onToggle: null,
      onFieldChange: null,
      ...options
    };
    
    this.collapsed = this.options.collapsed;
    this.formData = {};
    
    this.init();
  }
  
  init() {
    this.bindElements();
    this.bindEvents();
    this.updateLayout();
    this.updateStatus();
  }
  
  bindElements() {
    this.form = document.querySelector(this.options.container);
    this.grid = this.form.querySelector('.query-form-grid');
    this.fields = this.form.querySelectorAll('.form-field');
    this.hiddenFields = this.form.querySelectorAll('.query-form-field-hidden');
    this.actions = this.form.querySelector('.query-form-actions');
    this.toggleBtn = this.form.querySelector('#toggleBtn');
    this.toggleText = this.form.querySelector('#toggleText');
    this.collapseIcon = this.form.querySelector('#collapseIcon');
    this.resetBtn = this.form.querySelector('#resetBtn');
    
    // 状态显示元素
    this.expandStatus = document.querySelector('#expandStatus');
    this.fieldCount = document.querySelector('#fieldCount');
    this.formDataDisplay = document.querySelector('#formData');
  }
  
  bindEvents() {
    // 表单提交
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    // 重置按钮
    this.resetBtn.addEventListener('click', () => {
      this.handleReset();
    });
    
    // 展开/收起按钮
    this.toggleBtn.addEventListener('click', () => {
      this.toggle();
    });
    
    // 字段变化监听
    this.form.addEventListener('input', (e) => {
      if (e.target.matches('input, select, textarea')) {
        this.handleFieldChange(e.target);
      }
    });
    
    // 窗口大小变化
    window.addEventListener('resize', () => {
      this.updateLayout();
    });
    
    // 代码示例标签切换
    this.bindCodeTabs();
  }
  
  bindCodeTabs() {
    const tabs = document.querySelectorAll('.code-tab');
    const panels = document.querySelectorAll('.code-panel');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // 更新标签状态
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // 更新面板显示
        panels.forEach(panel => {
          panel.classList.remove('active');
          if (panel.id === `${targetTab}-panel`) {
            panel.classList.add('active');
          }
        });
      });
    });
  }
  
  updateLayout() {
    // 设置网格样式
    this.grid.style.gridTemplateColumns = `repeat(${this.options.colCount}, 1fr)`;
    this.grid.style.gap = `${this.options.gutter}px`;
    
    // 更新隐藏字段显示状态
    this.hiddenFields.forEach(field => {
      if (this.collapsed) {
        field.style.display = 'none';
      } else {
        field.style.display = 'flex';
      }
    });
    
    // 更新按钮组位置
    this.updateActionPosition();
  }
  
  updateActionPosition() {
    const visibleFields = this.collapsed ? 
      this.fields.length - this.hiddenFields.length : 
      this.fields.length;
    
    const maxFieldsPerRow = this.options.defaultRowCount * this.options.colCount;
    const shouldFullRow = this.collapsed ? 
      (visibleFields % this.options.colCount === 0) :
      (visibleFields >= maxFieldsPerRow - 1);
    
    if (shouldFullRow) {
      this.actions.style.gridColumn = '1 / -1';
      this.actions.classList.add('full-row');
    } else {
      const currentCol = (visibleFields % this.options.colCount) + 1;
      this.actions.style.gridColumn = `${currentCol} / -1`;
      this.actions.classList.remove('full-row');
    }
  }
  
  toggle() {
    this.collapsed = !this.collapsed;
    this.updateLayout();
    this.updateStatus();
    
    // 更新按钮文本和图标
    this.toggleText.textContent = this.collapsed ? '展开' : '收起';
    this.collapseIcon.style.transform = this.collapsed ? 'rotate(0deg)' : 'rotate(180deg)';
    
    // 触发回调
    if (this.options.onToggle) {
      this.options.onToggle(this.collapsed);
    }
  }
  
  handleSubmit() {
    this.collectFormData();
    
    // 模拟查询过程
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalText = submitBtn.querySelector('.btn-text').textContent;
    
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = '查询中...';
    
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').textContent = originalText;
      
      // 显示查询结果
      this.showQueryResult();
      
      // 触发回调
      if (this.options.onSubmit) {
        this.options.onSubmit(this.formData);
      }
    }, 1000);
  }
  
  handleReset() {
    this.form.reset();
    this.formData = {};
    this.updateFormDataDisplay();
    
    // 触发回调
    if (this.options.onReset) {
      this.options.onReset();
    }
    
    alert('表单已重置');
  }
  
  handleFieldChange(field) {
    this.collectFormData();
    
    // 触发回调
    if (this.options.onFieldChange) {
      this.options.onFieldChange(field.name, field.value, this.formData);
    }
  }
  
  collectFormData() {
    const formData = new FormData(this.form);
    this.formData = {};
    
    for (const [key, value] of formData.entries()) {
      if (value.trim() !== '') {
        this.formData[key] = value;
      }
    }
    
    this.updateFormDataDisplay();
  }
  
  updateFormDataDisplay() {
    this.formDataDisplay.textContent = JSON.stringify(this.formData, null, 2);
  }
  
  updateStatus() {
    // 更新展开状态
    this.expandStatus.textContent = this.collapsed ? '收起' : '展开';
    this.expandStatus.className = `status-value ${this.collapsed ? 'collapsed' : 'expanded'}`;
    
    // 更新字段数量
    const visibleCount = this.fields.length - (this.collapsed ? this.hiddenFields.length : 0);
    this.fieldCount.textContent = `${visibleCount} / ${this.fields.length}`;
  }
  
  showQueryResult() {
    const hasData = Object.keys(this.formData).length > 0;

    if (hasData) {
      alert(`查询成功！找到 ${Math.floor(Math.random() * 50) + 1} 条记录`);
    } else {
      alert('请至少填写一个查询条件');
    }
  }
  
  // 公共方法
  expand() {
    if (this.collapsed) {
      this.toggle();
    }
  }
  
  collapse() {
    if (!this.collapsed) {
      this.toggle();
    }
  }
  
  getFormData() {
    this.collectFormData();
    return this.formData;
  }
  
  setFormData(data) {
    Object.keys(data).forEach(key => {
      const field = this.form.querySelector(`[name="${key}"]`);
      if (field) {
        field.value = data[key];
      }
    });
    this.collectFormData();
  }
  
  validate() {
    // 简单的验证逻辑
    const requiredFields = this.form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('error');
        isValid = false;
      } else {
        field.classList.remove('error');
      }
    });
    
    return isValid;
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 创建查询表单实例
  const queryForm = new QueryForm({
    container: '#queryForm',
    defaultRowCount: 2,
    colCount: 4,
    onSubmit: (data) => {
      console.log('查询数据:', data);
    },
    onReset: () => {
      console.log('表单已重置');
    },
    onToggle: (collapsed) => {
      console.log('展开状态:', collapsed ? '收起' : '展开');
    },
    onFieldChange: (name, value, formData) => {
      console.log('字段变化:', { name, value, formData });
    }
  });
  
  // 将实例暴露到全局，方便调试
  window.queryForm = queryForm;
});
