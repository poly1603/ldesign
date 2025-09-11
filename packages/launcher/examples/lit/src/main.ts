import './styles/main.css';
import './components/app-shell';
import './components/counter-button';
import './components/theme-toggle';
import './components/feature-card';

console.log('🚀 LDesign Launcher - Lit Web Components 示例已启动');

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  const loadingElement = document.querySelector('.loading');
  const app = document.getElementById('app');
  
  if (app && loadingElement) {
    // 移除加载提示
    loadingElement.remove();
    
    // 创建应用主组件
    const appShell = document.createElement('app-shell');
    app.appendChild(appShell);
  }
});

// 模块热更新支持
if (import.meta.hot) {
  import.meta.hot.accept();
}
