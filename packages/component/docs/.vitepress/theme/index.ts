import DefaultTheme from 'vitepress/theme'
import './custom.css'
// 直接导入组件库样式
import '../../../dist/ldesign-component/ldesign-component.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 在客户端动态加载组件库
    if (typeof window !== 'undefined') {
      import('../../../dist/ldesign-component/ldesign-component.esm.js')
        .then(({ defineCustomElements }) => {
          defineCustomElements();
        })
        .catch(err => {
          console.warn('Failed to load LDesign components:', err);
        });
    }
  }
}
