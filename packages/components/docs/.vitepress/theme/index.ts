import DefaultTheme from 'vitepress/theme';
import './style.css';
import ComponentDemo from './components/ComponentDemo.vue';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('ComponentDemo', ComponentDemo);
    // Load built web components once available
    import('../../../dist/loader/index.js')
      .then((m) => {
        if (m && typeof m.defineCustomElements === 'function') {
          m.defineCustomElements();
        }
      })
      .catch(() => {
        // Fallback to ESM bundle which auto-initializes
        import('../../../dist/ldesign/ldesign.esm.js').catch(() => void 0);
      });
  },
};

import DefaultTheme from 'vitepress/theme';
import ComponentDemo from '../components/ComponentDemo.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册全局组件
    app.component('ComponentDemo', ComponentDemo);
  },
};