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

function initTabsDemos() {
  const run = () => {
    // 受控用法
    const box = document.getElementById('tabs-ctrl-container') as HTMLElement | null;
    if (box && !box.dataset.inited) {
      box.dataset.inited = '1';
      const tabs = document.getElementById('tabs-ctrl-live') as any;
      const cur = document.getElementById('tabs-ctrl-current');
      const btn1 = document.getElementById('tabs-ctrl-to-profile');
      const btn2 = document.getElementById('tabs-ctrl-to-settings');
      btn1?.addEventListener('click', () => { if (tabs) tabs.value = 'profile'; if (cur) cur.textContent = 'profile'; });
      btn2?.addEventListener('click', () => { if (tabs) tabs.value = 'settings'; if (cur) cur.textContent = 'settings'; });
      tabs?.addEventListener('ldesignChange', (e: any) => { if (cur) cur.textContent = e.detail; });
    }

    // 横向溢出 live
    const hostHz2 = document.getElementById('tabs-live-hz2') as HTMLElement | null;
    if (hostHz2 && !hostHz2.dataset.inited) {
      hostHz2.dataset.inited = '1';
      const items = Array.from({ length: 12 }).map((_, i) => ({ name: `t${i+1}`, label: `标签 ${i+1}`, content: `内容 ${i+1}` }));
      hostHz2.innerHTML = items.map(it => `<ldesign-tab-panel name="${it.name}" label="${it.label}">${it.content}</ldesign-tab-panel>`).join('');
    }
    const range2 = document.getElementById('tabs-live-range2') as HTMLInputElement | null;
    const widthEl2 = document.getElementById('tabs-live-width2');
    const container2 = document.getElementById('tabs-live-container2') as HTMLElement | null;
    const applyW2 = (w: number) => { if (container2) container2.style.width = `${w}px`; if (widthEl2) widthEl2.textContent = String(w); };
    if (range2 && !range2.dataset.inited) {
      range2.dataset.inited = '1';
      applyW2(Number(range2.value || 560));
      range2.addEventListener('input', () => applyW2(Number(range2.value || 560)));
    }

    // 纵向溢出 live
    const left2 = document.getElementById('tabs-live-left2') as HTMLElement | null;
    const right2 = document.getElementById('tabs-live-right2') as HTMLElement | null;
    const fillV = (el: HTMLElement | null) => {
      if (!el || el.dataset.inited) return;
      el.dataset.inited = '1';
      const vItems = Array.from({ length: 10 }).map((_, i) => ({ name: `v${i+1}`, label: `选项 ${i+1}`, content: `纵向内容 ${i+1}` }));
      el.innerHTML = vItems.map(it => `<ldesign-tab-panel name="${it.name}" label="${it.label}">${it.content}</ldesign-tab-panel>`).join('');
    };
    fillV(left2); fillV(right2);

    // 非受控新增/关闭 live
    const hostEdit = document.getElementById('tabs-edit-live') as HTMLElement | null;
    if (hostEdit && !hostEdit.dataset.inited) {
      hostEdit.dataset.inited = '1';
      const panels = [
        { name: 'a', label: 'A', content: 'A 内容', closable: false },
        { name: 'b', label: 'B', content: 'B 内容', closable: true },
      ] as { name: string; label: string; content: string; closable?: boolean }[];
      const render = () => hostEdit.innerHTML = panels.map(p => `<ldesign-tab-panel name="${p.name}" label="${p.label}" ${p.closable ? 'closable' : ''}>${p.content}</ldesign-tab-panel>`).join('');
      render();
      hostEdit.addEventListener('ldesignAdd', () => {
        const n = String.fromCharCode('A'.charCodeAt(0) + panels.length);
        panels.push({ name: n.toLowerCase(), label: n, content: `${n} 内容`, closable: true });
        render();
      });
      hostEdit.addEventListener('ldesignRemove', (e: any) => {
        const name = e.detail?.name;
        const idx = panels.findIndex(p => p.name === name);
        if (idx >= 0) panels.splice(idx, 1);
        render();
      });
    }

    // 受控新增/关闭 live
    const hostCtl = document.getElementById('tabs-edit-controlled-live') as any;
    const curCtl = document.getElementById('tabs-edit-current-live');
    if (hostCtl && !hostCtl.dataset.inited) {
      hostCtl.dataset.inited = '1';
      let seq = 4;
      let p2 = [
        { name: 'x1', label: '一', closable: true, content: '一 内容' },
        { name: 'x2', label: '二', closable: true, content: '二 内容' },
        { name: 'x3', label: '三', closable: true, content: '三 内容' },
      ];
      const render2 = () => hostCtl.innerHTML = p2.map((p: any) => `<ldesign-tab-panel name="${p.name}" label="${p.label}" closable>${p.content}</ldesign-tab-panel>`).join('');
      render2();
      hostCtl.addEventListener('ldesignChange', (e: any) => { hostCtl.value = e.detail; if (curCtl) curCtl.textContent = e.detail; });
      hostCtl.addEventListener('ldesignAdd', () => {
        const name = `x${seq++}`;
        p2.push({ name, label: `新 ${seq-1}`, closable: true, content: `新内容 ${name}` });
        render2();
        hostCtl.value = name;
        if (curCtl) curCtl.textContent = name;
      });
      hostCtl.addEventListener('ldesignRemove', (e: any) => {
        const name = e.detail?.name;
        const idx = p2.findIndex(p => p.name === name);
        if (idx >= 0) p2.splice(idx, 1);
        if (hostCtl.value === name) {
          const fallback = p2[idx] || p2[idx-1] || p2[0];
          hostCtl.value = fallback ? fallback.name : '';
          if (curCtl) curCtl.textContent = hostCtl.value || '';
        }
        render2();
      });
    }
  };

  // 多次尝试，确保组件定义完成后再初始化
  setTimeout(run, 0);
  setTimeout(run, 50);
  setTimeout(run, 150);
}

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // 注册 Web Components
    if (typeof window !== 'undefined') {
      const loadFromDist = () => import('../../../dist/ldesign-webcomponent/ldesign-webcomponent.esm.js')
      const loadFromDev = async () => {
        // 动态追加 dev server 样式
        const cssHref = 'http://localhost:3333/build/ldesign-webcomponent.css'
        if (!document.querySelector(`link[href="${cssHref}"]`)) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = cssHref
          document.head.appendChild(link)
        }
        // 通过裸 import 加载 ESM
        return import(/* @vite-ignore */ 'http://localhost:3333/build/ldesign-webcomponent.esm.js')
      }

      const loadLibrary = async () => {
        try {
          await loadFromDist()
          console.log('LDesign WebComponent 组件库已从 dist 加载')
        } catch (err) {
          console.warn('从 dist 加载失败，尝试从 Stencil dev server 加载...', err)
          try {
            await loadFromDev()
            console.log('LDesign WebComponent 组件库已从 dev server 加载')
          } catch (err2) {
            console.error('加载 LDesign WebComponent 失败', err2)
          }
        }
      }

      loadLibrary().then(() => {
        // 初次加载后尝试初始化 demo
        initInputDemos()
        initTabsDemos()
      })

      // 监听路由变化，确保切换页面后 demo 仍生效
      router.onAfterRouteChanged = () => {
        initInputDemos()
        initTabsDemos()
      }
    }
  }
} satisfies Theme
