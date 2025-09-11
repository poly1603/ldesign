import './styles/main.scss';
import { CounterManager } from './utils/counter';
import { ThemeManager } from './utils/theme';

console.log('🚀 LDesign Launcher - Vanilla JavaScript 示例已启动');

// 初始化计数器
const counter = new CounterManager();
const counterBtn = document.getElementById('counter-btn') as HTMLButtonElement;
const counterSpan = document.getElementById('counter') as HTMLSpanElement;

if (counterBtn && counterSpan) {
  counterBtn.addEventListener('click', () => {
    counter.increment();
    counterSpan.textContent = counter.getCount().toString();
  });
}

// 初始化主题管理
const theme = new ThemeManager();
const themeBtn = document.getElementById('theme-btn') as HTMLButtonElement;

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    theme.toggle();
    themeBtn.textContent = theme.isDark() ? '切换到亮色' : '切换到暗色';
  });
  
  // 初始化按钮文本
  themeBtn.textContent = theme.isDark() ? '切换到亮色' : '切换到暗色';
}

// 添加一些交互效果
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach((card, index) => {
  card.addEventListener('mouseenter', () => {
    card.classList.add('hover-effect');
  });
  
  card.addEventListener('mouseleave', () => {
    card.classList.remove('hover-effect');
  });

  // 添加延迟动画
  setTimeout(() => {
    card.classList.add('fade-in');
  }, index * 100);
});

// 模块热更新支持
if (import.meta.hot) {
  import.meta.hot.accept();
}
