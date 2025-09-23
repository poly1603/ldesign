import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './custom.css'
// 直接导入组件库CSS
import '../../../dist/ldesign-webcomponent/ldesign-webcomponent.css'

function initInputDemos() {
  // 在每次路由切换后尝试初始化当前页的 demo
  // 这些初始化都是幂等的，若元素不存在将直接跳过
  const tryInit = () => {
    const textareaDemo = document.getElementById('textarea-limit-demo') as any;
    if (textareaDemo && !textareaDemo.__inited_autosize) {
      textareaDemo.autosize = { minRows: 2, maxRows: 5 };
      textareaDemo.__inited_autosize = true;
    }

    const textareaLimit = document.getElementById('textarea-with-limit') as any;
    if (textareaLimit && !textareaLimit.__inited_autosize) {
      textareaLimit.autosize = { minRows: 2, maxRows: 5 };
      textareaLimit.__inited_autosize = true;
    }

    const numberOnly = document.getElementById('input-number-only') as any;
    if (numberOnly && !numberOnly.__inited_allow) {
      numberOnly.allowInput = /^\d*$/;
      numberOnly.__inited_allow = true;
    }

    const letterOnly = document.getElementById('input-letter-only') as any;
    if (letterOnly && !letterOnly.__inited_allow) {
      letterOnly.allowInput = /^[a-zA-Z]*$/;
      letterOnly.__inited_allow = true;
    }
  };

  // 多次尝试，确保在组件定义完成后仍能设置到属性
  setTimeout(tryInit, 0);
  setTimeout(tryInit, 100);
  setTimeout(tryInit, 300);
}

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // 注册 Web Components
    if (typeof window !== 'undefined') {
      // 直接导入组件库的ESM版本
      import('../../../dist/ldesign-webcomponent/ldesign-webcomponent.esm.js')
        .then(() => {
          console.log('LDesign WebComponent 组件库已加载')
          // 初次加载后尝试初始化 demo
          initInputDemos()
        })
        .catch(err => {
          console.warn('Failed to load LDesign WebComponent:', err)
        })

      // 监听路由变化，确保切换页面后 demo 仍生效
      router.onAfterRouteChanged = () => {
        initInputDemos()
      }
    }
  }
} satisfies Theme
