/**
 * 样式隔离验证脚本
 * 在开发环境中检查 Stencil 组件是否正确隔离了 VitePress 样式
 */

export function checkStyleIsolation() {
  if (typeof window === 'undefined' || !window.customElements) {
    return;
  }

  // 等待组件注册完成
  setTimeout(() => {
    const components = ['ld-button', 'ld-input', 'ld-card', 'ld-popup', 'ld-popconfirm'];
    
    components.forEach(tagName => {
      const elements = document.querySelectorAll(tagName);
      
      elements.forEach(element => {
        // 检查是否正确应用了样式重置
        const computedStyle = getComputedStyle(element);
        
        // 记录警告如果样式看起来被 VitePress 影响了
        if (computedStyle.fontFamily.includes('Inter') || 
            computedStyle.fontFamily.includes('ui-sans-serif')) {
          console.warn(`🚨 ${tagName} 可能受到 VitePress 字体样式影响:`, computedStyle.fontFamily);
        }
        
        // 检查是否有正确的隔离
        if (computedStyle.isolation !== 'isolate') {
          console.warn(`⚠️ ${tagName} 缺少样式隔离:`, element);
        }
        
        // 检查 Shadow DOM
        if (element.shadowRoot) {
          console.log(`✅ ${tagName} 正确使用 Shadow DOM`);
        } else {
          console.warn(`🚨 ${tagName} 未使用 Shadow DOM，可能存在样式泄露`);
        }
      });
    });
    
    console.log('🔍 样式隔离检查完成');
  }, 1000);
}