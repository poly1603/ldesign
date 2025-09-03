import DefaultTheme from 'vitepress/theme'
import './custom.css'

// 导入文档组件
import Demo from '../components/Demo.vue'
import ComponentPlayground from '../components/ComponentPlayground.vue'
import PropertyControl from '../components/PropertyControl.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册全局组件
    app.component('Demo', Demo)
    app.component('ComponentPlayground', ComponentPlayground)
    app.component('PropertyControl', PropertyControl)
    
    // 在客户端动态加载组件库
    if (typeof window !== 'undefined') {
      // 先尝试加载构建好的组件
      Promise.all([
        import('../../../dist/ldesign-component/ldesign-component.esm.js'),
        import('../../../dist/ldesign-component/ldesign-component.css')
      ])
      .then(([{ defineCustomElements }]) => {
        defineCustomElements();
        console.log('LDesign components loaded successfully');
      })
      .catch(err => {
        console.warn('Failed to load built components, trying to load from loader:', err);
        // 如果构建版本不存在，尝试加载 loader 版本
        import('../../../loader/index.js')
          .then(({ defineCustomElements }) => {
            defineCustomElements();
            console.log('LDesign components loaded from loader');
          })
          .catch(err => {
            console.error('Failed to load LDesign components:', err);
          });
      });
    }
  }
}
