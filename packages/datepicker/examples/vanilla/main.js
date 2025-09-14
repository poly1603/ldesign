/**
 * LDesign DatePicker 示例主文件
 */

import { DatePicker, DateUtils, ThemeManager } from '../../src/index.ts';

// 全局变量
let currentTheme = 'light';
let currentDevice = 'desktop';
let themeManager;
let datePickers = {};

/**
 * 初始化应用
 */
function initApp() {
  // 初始化主题管理器
  themeManager = new ThemeManager();
  themeManager.setTheme(currentTheme);
  
  // 初始化事件监听器
  initEventListeners();
  
  // 初始化日期选择器
  initDatePickers();
  
  // 设置初始设备类型
  setDeviceType(currentDevice);
  
  console.log('LDesign DatePicker 示例应用已初始化');
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
  // 主题切换
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // 设备类型切换
  const deviceButtons = document.querySelectorAll('.device-btn');
  deviceButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const device = e.target.getAttribute('data-device');
      setDeviceType(device);
    });
  });
  
  // 窗口大小变化
  window.addEventListener('resize', handleResize);
}

/**
 * 初始化所有日期选择器
 */
function initDatePickers() {
  // 基础日期选择器
  initBasicDatePicker();
  
  // 日期范围选择器
  initRangeDatePicker();
  
  // 多日期选择器
  initMultipleDatePicker();
  
  // 日期时间选择器
  initDateTimePicker();
  
  // 月份选择器
  initMonthPicker();
  
  // 年份选择器
  initYearPicker();
  
  // 禁用日期选择器
  initDisabledDatePicker();
  
  // 自定义格式选择器
  initFormatDatePicker();
}

/**
 * 初始化基础日期选择器
 */
function initBasicDatePicker() {
  const container = document.getElementById('basic-datepicker');
  const result = document.getElementById('basic-result');
  
  if (!container) return;
  
  const datePicker = new DatePicker({
    mode: 'date',
    selectionType: 'single',
    placeholder: '请选择日期',
    format: 'YYYY-MM-DD'
  });
  
  datePicker.mount(container);
  
  datePicker.on('change', (value) => {
    result.textContent = `选中的日期: ${DateUtils.format(value, 'YYYY-MM-DD')}`;
  });
  
  datePickers.basic = datePicker;
}

/**
 * 初始化日期范围选择器
 */
function initRangeDatePicker() {
  const container = document.getElementById('range-datepicker');
  const result = document.getElementById('range-result');
  
  if (!container) return;
  
  const datePicker = new DatePicker({
    mode: 'date',
    selectionType: 'range',
    placeholder: '请选择日期范围',
    format: 'YYYY-MM-DD'
  });
  
  datePicker.mount(container);
  
  datePicker.on('change', (value) => {
    if (value && value.start && value.end) {
      result.textContent = `选中的日期范围: ${DateUtils.format(value.start, 'YYYY-MM-DD')} ~ ${DateUtils.format(value.end, 'YYYY-MM-DD')}`;
    } else {
      result.textContent = '请选择日期范围';
    }
  });
  
  datePickers.range = datePicker;
}

/**
 * 初始化多日期选择器
 */
function initMultipleDatePicker() {
  const container = document.getElementById('multiple-datepicker');
  const result = document.getElementById('multiple-result');
  
  if (!container) return;
  
  const datePicker = new DatePicker({
    mode: 'date',
    selectionType: 'multiple',
    placeholder: '请选择多个日期',
    format: 'YYYY-MM-DD'
  });
  
  datePicker.mount(container);
  
  datePicker.on('change', (value) => {
    if (Array.isArray(value) && value.length > 0) {
      const dates = value.map(date => DateUtils.format(date, 'YYYY-MM-DD')).join(', ');
      result.textContent = `选中的日期: ${dates}`;
    } else {
      result.textContent = '请选择多个日期';
    }
  });
  
  datePickers.multiple = datePicker;
}

/**
 * 初始化日期时间选择器
 */
function initDateTimePicker() {
  const container = document.getElementById('datetime-datepicker');
  const result = document.getElementById('datetime-result');
  
  if (!container) return;
  
  const datePicker = new DatePicker({
    mode: 'datetime',
    selectionType: 'single',
    placeholder: '请选择日期时间',
    format: 'YYYY-MM-DD HH:mm:ss'
  });
  
  datePicker.mount(container);
  
  datePicker.on('change', (value) => {
    result.textContent = `选中的日期时间: ${DateUtils.format(value, 'YYYY-MM-DD HH:mm:ss')}`;
  });
  
  datePickers.datetime = datePicker;
}

/**
 * 初始化月份选择器
 */
function initMonthPicker() {
  const container = document.getElementById('month-datepicker');
  const result = document.getElementById('month-result');
  
  if (!container) return;
  
  const datePicker = new DatePicker({
    mode: 'month',
    selectionType: 'single',
    placeholder: '请选择月份',
    format: 'YYYY-MM'
  });
  
  datePicker.mount(container);
  
  datePicker.on('change', (value) => {
    result.textContent = `选中的月份: ${DateUtils.format(value, 'YYYY-MM')}`;
  });
  
  datePickers.month = datePicker;
}

/**
 * 初始化年份选择器
 */
function initYearPicker() {
  const container = document.getElementById('year-datepicker');
  const result = document.getElementById('year-result');
  
  if (!container) return;
  
  const datePicker = new DatePicker({
    mode: 'year',
    selectionType: 'single',
    placeholder: '请选择年份',
    format: 'YYYY'
  });
  
  datePicker.mount(container);
  
  datePicker.on('change', (value) => {
    result.textContent = `选中的年份: ${DateUtils.format(value, 'YYYY')}`;
  });
  
  datePickers.year = datePicker;
}

/**
 * 初始化禁用日期选择器
 */
function initDisabledDatePicker() {
  const container = document.getElementById('disabled-datepicker');
  const result = document.getElementById('disabled-result');
  
  if (!container) return;
  
  // 禁用周末和特定日期
  const today = new Date();
  const disabledDates = [
    DateUtils.add(today, 3, 'day'),
    DateUtils.add(today, 7, 'day'),
    DateUtils.add(today, 10, 'day')
  ];
  
  const datePicker = new DatePicker({
    mode: 'date',
    selectionType: 'single',
    placeholder: '请选择日期（周末和特定日期被禁用）',
    format: 'YYYY-MM-DD',
    disabledDates: disabledDates,
    // 禁用周末 (0=周日, 6=周六)
    // disabledWeekdays: [0, 6]
  });
  
  datePicker.mount(container);
  
  datePicker.on('change', (value) => {
    result.textContent = `选中的日期: ${DateUtils.format(value, 'YYYY-MM-DD')}`;
  });
  
  datePickers.disabled = datePicker;
}

/**
 * 初始化自定义格式选择器
 */
function initFormatDatePicker() {
  const container = document.getElementById('format-datepicker');
  const result = document.getElementById('format-result');
  
  if (!container) return;
  
  const datePicker = new DatePicker({
    mode: 'date',
    selectionType: 'single',
    placeholder: '请选择日期',
    format: 'YYYY年MM月DD日'
  });
  
  datePicker.mount(container);
  
  datePicker.on('change', (value) => {
    result.textContent = `选中的日期: ${DateUtils.format(value, 'YYYY年MM月DD日')}`;
  });
  
  datePickers.format = datePicker;
}

/**
 * 切换主题
 */
function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  themeManager.setTheme(currentTheme);
  
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.textContent = currentTheme === 'light' ? '切换到暗色' : '切换到亮色';
  }
  
  console.log(`主题已切换到: ${currentTheme}`);
}

/**
 * 设置设备类型
 */
function setDeviceType(device) {
  currentDevice = device;
  
  // 更新按钮状态
  const deviceButtons = document.querySelectorAll('.device-btn');
  deviceButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-device') === device);
  });
  
  // 更新所有日期选择器的设备类型
  Object.values(datePickers).forEach(picker => {
    if (picker && picker.updateOptions) {
      picker.updateOptions({ deviceType: device });
    }
  });
  
  // 更新 body 类名
  document.body.className = `device-${device}`;
  
  console.log(`设备类型已切换到: ${device}`);
}

/**
 * 处理窗口大小变化
 */
function handleResize() {
  const width = window.innerWidth;
  let newDevice;
  
  if (width < 768) {
    newDevice = 'mobile';
  } else if (width < 1024) {
    newDevice = 'tablet';
  } else {
    newDevice = 'desktop';
  }
  
  if (newDevice !== currentDevice) {
    setDeviceType(newDevice);
  }
}

/**
 * 错误处理
 */
function handleError(error) {
  console.error('DatePicker 示例错误:', error);
  
  // 显示错误信息给用户
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #ff4d4f;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 10001;
    font-size: 14px;
  `;
  errorDiv.textContent = `错误: ${error.message}`;
  
  document.body.appendChild(errorDiv);
  
  // 3秒后自动移除错误信息
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 3000);
}

// 全局错误处理
window.addEventListener('error', (event) => {
  handleError(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  handleError(event.reason);
});

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// 导出到全局作用域（用于调试）
window.DatePickerDemo = {
  datePickers,
  themeManager,
  toggleTheme,
  setDeviceType,
  currentTheme,
  currentDevice
};
