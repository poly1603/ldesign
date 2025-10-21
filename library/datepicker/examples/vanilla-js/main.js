/**
 * Vanilla JS 完整示例 - 16种选择模式
 */

import '@ldesign/datepicker-lit';
import '@ldesign/datepicker-lit/style.css';
import { zhCN, enUS, jaJP } from '@ldesign/datepicker-shared';

// 当前主题和语言
let currentTheme = 'light';
let currentLocale = zhCN;

// 初始化所有选择器
function initPickers() {
  console.log('🎯 初始化所有选择器...');

  // 1. 基础日期选择
  setupPicker('date-picker', 'date-output', (val) =>
    val ? new Date(val).toLocaleDateString() : '未选择'
  );

  // 2. 日期范围（双面板）
  setupRangePicker('daterange-picker', 'daterange-output');

  // 3. 月份选择
  setupPicker('month-picker', 'month-output', (val) => {
    if (!val) return '未选择';
    const date = new Date(val);
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  });

  // 4. 月份范围（双面板）
  setupRangePicker('monthrange-picker', 'monthrange-output', (val) => {
    if (!val) return '';
    const date = new Date(val);
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  });

  // 5. 年份选择
  setupPicker('year-picker', 'year-output', (val) =>
    val ? new Date(val).getFullYear() + '年' : '未选择'
  );

  // 6. 年份范围（双面板）
  setupRangePicker('yearrange-picker', 'yearrange-output', (val) => {
    if (!val) return '';
    return new Date(val).getFullYear() + '年';
  });

  // 7. 日期时间
  setupPicker('datetime-picker', 'datetime-output', (val) =>
    val ? new Date(val).toLocaleString() : '未选择'
  );

  // 8. 日期时间范围
  setupRangePicker('datetimerange-picker', 'datetimerange-output', (val) => {
    if (!val) return '';
    return new Date(val).toLocaleString();
  });

  // 9. 时间选择（滚轮）
  setupPicker('time-picker', 'time-output', (val) =>
    val ? new Date(val).toLocaleTimeString() : '未选择'
  );

  // 10. 星期选择
  setupPicker('week-picker', 'week-output', (val) => {
    if (!val) return '未选择';
    const date = new Date(val);
    const weekNumber = getWeekNumber(date);
    return `${date.getFullYear()}年 第${weekNumber}周`;
  });

  // 11. 季度选择
  setupPicker('quarter-picker', 'quarter-output', (val) => {
    if (!val) return '未选择';
    const date = new Date(val);
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `${date.getFullYear()}年 Q${quarter}`;
  });

  // 12. 多个日期选择
  setupPicker('dates-picker', 'dates-output', (val) => {
    if (!val || !Array.isArray(val) || val.length === 0) return '未选择';
    if (val.length === 1) return new Date(val[0]).toLocaleDateString();
    return `已选择 ${val.length} 个日期`;
  });

  // 13-16. 高级功能
  setupPicker('disabled-picker', 'disabled-output', (val) =>
    val ? new Date(val).toLocaleDateString() : '未选择'
  );

  setupRangePicker('shortcuts-picker', 'shortcuts-output');

  setupPicker('format-picker', 'format-output', (val) =>
    val ? new Date(val).toLocaleDateString() : '未选择'
  );

  setupPicker('clearable-picker', 'clearable-output', (val) =>
    val ? new Date(val).toLocaleDateString() : '未选择'
  );

  console.log('✅ 所有选择器初始化完成');
}

// 设置单个选择器
function setupPicker(pickerId, outputId, formatter) {
  const picker = document.getElementById(pickerId);
  const output = document.getElementById(outputId);

  if (!picker || !output) {
    console.warn(`⚠️ 选择器未找到: ${pickerId}`);
    return;
  }

  picker.addEventListener('change', (e) => {
    const value = e.detail;
    output.textContent = formatter ? formatter(value) : (value || '未选择');
  });

  picker.addEventListener('clear', () => {
    console.log(`清空: ${pickerId}`);
  });
}

// 设置范围选择器
function setupRangePicker(pickerId, outputId, formatter) {
  const picker = document.getElementById(pickerId);
  const output = document.getElementById(outputId);

  if (!picker || !output) {
    console.warn(`⚠️ 范围选择器未找到: ${pickerId}`);
    return;
  }

  picker.addEventListener('change', (e) => {
    const value = e.detail;
    if (value && Array.isArray(value)) {
      const [start, end] = value;
      const startText = start ? (formatter ? formatter(start) : new Date(start).toLocaleDateString()) : '';
      const endText = end ? (formatter ? formatter(end) : new Date(end).toLocaleDateString()) : '';
      output.textContent = `${startText} 至 ${endText}`;
    } else {
      output.textContent = '未选择';
    }
  });
}

// 获取周数
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// 主题切换
function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);

  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.textContent = currentTheme === 'light' ? '🌙 暗色主题' : '☀️ 亮色主题';
  }

  console.log('主题切换:', currentTheme);
}

// 语言切换
function switchLanguage(lang) {
  const locales = {
    'zh-CN': zhCN,
    'en-US': enUS,
    'ja-JP': jaJP,
  };

  currentLocale = locales[lang] || zhCN;

  // 更新所有选择器的 locale
  const pickers = document.querySelectorAll('ldate-picker');
  pickers.forEach(picker => {
    picker.locale = currentLocale;
  });

  // 更新按钮状态
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  console.log('语言切换:', lang);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎉 页面加载完成，开始初始化...');

  initPickers();

  // 主题切换按钮
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // 语言切换按钮
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchLanguage(e.target.getAttribute('data-lang'));
    });
  });

  console.log('✅ 所有事件监听器已设置');
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + K 切换主题
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    toggleTheme();
  }
});
