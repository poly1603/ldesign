import './styles/main.scss';
import { CounterManager } from './utils/counter';
import { ThemeManager } from './utils/theme';

// 获取应用配置
const appConfig = (import.meta.env.appConfig as any) || {};

console.log('🚀 LDesign Launcher - Vanilla JavaScript 示例已启动');
console.log('📄 App Config:', appConfig);

// 更新页面标题
const titleElement = document.querySelector('h1');
if (titleElement) {
  titleElement.textContent = appConfig.appName || 'LDesign Launcher';
}

// 显示配置信息
const configDisplay = document.createElement('div');
configDisplay.className = 'config-display';
configDisplay.innerHTML = `
  <h3>📄 应用配置 (import.meta.env.appConfig)</h3>
  <pre>${JSON.stringify(appConfig, null, 2)}</pre>
  <p>修改 .ldesign/app.config.ts 后保存，配置会自动热更新</p>
`;
configDisplay.style.cssText = `
  margin: 2rem auto;
  padding: 1.5rem;
  background: ${appConfig.theme?.primaryColor ? appConfig.theme.primaryColor + '11' : '#f0db4f11'};
  border: 1px solid ${appConfig.theme?.primaryColor || '#f0db4f'};
  border-radius: 8px;
  max-width: 800px;
`;

const mainContent = document.querySelector('.content');
if (mainContent) {
  mainContent.appendChild(configDisplay);
}

// 初始化计数器（使用配置中的步长）
const counter = new CounterManager(appConfig.settings?.counterStep || 1);
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
