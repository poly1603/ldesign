import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './custom.css'
// 主题内注册自定义 Vue 组件（供 Markdown 使用）
import IconGallery from './components/IconGallery.vue'
// 确保自定义元素被注册

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

function initInputNumberDemos() {
  const apply = () => {
    const el = document.getElementById('wc-in-currency') as any;
    if (el && !el.__inited_currency) {
      el.formatter = (v: number | null) => (v == null ? '' : v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }));
      el.parser = (s: string) => {
        const n = Number(String(s).replace(/[^\d.-]/g, ''));
        return Number.isNaN(n) ? null : n;
      };
      el.__inited_currency = true;
    }
  };
  setTimeout(apply, 0);
  setTimeout(apply, 80);
  setTimeout(apply, 200);
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

function initSwiperDemos() {
  const run = () => {
    const box = document.getElementById('swiper-ctrl-box') as HTMLElement | null;
    if (box && !box.dataset.inited) {
      box.dataset.inited = '1';
      const inst = document.getElementById('swiper-ctrl') as any;
      const cur = document.getElementById('swiper-cur');
      document.getElementById('swiper-prev')?.addEventListener('click', () => inst?.prev?.());
      document.getElementById('swiper-next')?.addEventListener('click', () => inst?.next?.());
      inst?.addEventListener?.('ldesignChange', (e: any) => { if (cur) (cur as any).textContent = String(e.detail); if (inst) inst.value = e.detail; });
    }
  };
  setTimeout(run, 0); setTimeout(run, 60); setTimeout(run, 160);
}

function initTreeDemos() {
  const markInited = (el: HTMLElement | null | undefined) => {
    if (!el) return false;
    const inited = (el as any).dataset?.inited === '1' || (el as any).__inited;
    if (inited) return false;
    if ((el as any).dataset) (el as any).dataset.inited = '1';
    (el as any).__inited = true;
    return true;
  };

  const basic = document.getElementById('tree-basic') as any;
  if (basic && markInited(basic)) {
    basic.items = [
      { key: 'docs', label: '文档', children: [
        { key: 'guide', label: '指南' },
        { key: 'api', label: 'API' },
      ]},
      { key: 'changelog', label: '更新日志' },
    ];
  }

  const def = document.getElementById('tree-default-expand') as any;
  if (def && markInited(def)) {
    def.items = [
      { key: 'docs', label: '文档', children: [ { key: 'guide', label: '指南' } ] },
      { key: 'changelog', label: '更新日志' },
    ];
  }

  const select = document.getElementById('tree-select') as any;
  if (select && markInited(select)) {
    select.items = [
      { key: '1', label: '一级 1', children: [ { key: '1-1', label: '子 1-1' }, { key: '1-2', label: '子 1-2' } ] },
      { key: '2', label: '一级 2' },
    ];
    select.addEventListener('ldesignSelect', (e: any) => console.log('select', e.detail));
  }

  const multiple = document.getElementById('tree-multiple') as any;
  if (multiple && markInited(multiple)) {
    multiple.items = [
      { key: 'a', label: 'A', children: [ { key: 'a-1', label: 'A-1' }, { key: 'a-2', label: 'A-2' } ] },
      { key: 'b', label: 'B' },
    ];
  }

  const check = document.getElementById('tree-check') as any;
  if (check && markInited(check)) {
    check.items = [
      { key: 'root', label: '根', children: [
        { key: 'x', label: 'X' },
        { key: 'y', label: 'Y', children: [ { key: 'y-1', label: 'Y-1' }, { key: 'y-2', label: 'Y-2' } ] },
      ]},
    ];
    check.addEventListener('ldesignCheck', (e: any) => console.log('check', e.detail));
  }

  const ctrl = document.getElementById('tree-ctrl') as any;
  if (ctrl && markInited(ctrl)) {
    ctrl.items = [
      { key: 'docs', label: '文档', children: [ { key: 'guide', label: '指南' }, { key: 'api', label: 'API' } ] },
      { key: 'changelog', label: '更新日志' },
    ];
    const btnExpand = document.getElementById('btn-expand');
    const btnSelect = document.getElementById('btn-select');
    const btnCheck = document.getElementById('btn-check');
    btnExpand?.addEventListener('click', () => {
      const cur = ctrl.expandedKeys || [];
      ctrl.expandedKeys = cur.includes('docs') ? cur.filter((k: string) => k !== 'docs') : [...cur, 'docs'];
    });
    btnSelect?.addEventListener('click', () => { ctrl.value = 'api'; });
    btnCheck?.addEventListener('click', () => {
      const cur = new Set(ctrl.checkedKeys || []);
      if (cur.has('guide')) cur.delete('guide'); else cur.add('guide');
      ctrl.checkedKeys = Array.from(cur);
    });
  }

  const icons = document.getElementById('tree-icons') as any;
  if (icons && markInited(icons)) {
    icons.items = [
      { key: 'root', label: '项目', icon: 'folder', children: [
        { key: 'src', label: 'src', icon: 'folder', children: [ { key: 'index', label: 'index.ts', icon: 'file' } ] },
        { key: 'README', label: 'README.md', icon: 'file' },
      ]},
    ];
  }

  const drag = document.getElementById('tree-drag') as any;
  if (drag && markInited(drag)) {
    drag.items = [
      { key: 'root', label: '根', children: [
        { key: 'a', label: 'A' },
        { key: 'b', label: 'B', children: [ { key: 'b1', label: 'B-1' } ] }
      ] }
    ];
    drag.addEventListener('ldesignDrop', (e: any) => console.log('drop', e.detail));
  }

  const lazy = document.getElementById('tree-lazy') as any;
  if (lazy && markInited(lazy)) {
    lazy.items = [ { key: 'root', label: '根' } ];
    lazy.lazy = true;
    lazy.loadData = async (node: any) => {
      await new Promise(r => setTimeout(r, 200));
      if (!node || node.key === 'root') return [ { key: 'a', label: 'A' }, { key: 'b', label: 'B' } ];
      return [];
    }
  }
}

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // 注册 Markdown 可用的 Vue 组件
    app.component('IconGallery', IconGallery)

    // 注册 Web Components
    if (typeof window !== 'undefined') {
      // 动态按环境加载并注册组件库
      // 优先使用 dist-custom-elements（避免动态 import 兼容问题）
      const loadCustomElements = async () => {
        try {
          // 避免静态字符串触发 Vite import-analysis，使用变量拼接
          const p = '../../../dist/components/' + 'index.js'
          await import(/* @vite-ignore */ (p as any))
          console.log('LDesign WebComponent 已通过 dist-custom-elements 自动注册')
          return true
        } catch (e) {
          return false
        }
      }

      const loadFromDist = async () => {
        // Stencil 输出的 ESM 入口文件名为 ldesign-webcomponent.esm.js（以 package.json 的 unpkg 字段为准）
        const mod: any = await import(/* @vite-ignore */ '../../../dist/ldesign-webcomponent/ldesign-webcomponent.esm.js')
        if (mod?.defineCustomElements) await mod.defineCustomElements(window as any)
        return mod
      }
      const loadFromDev = async () => {
        // 动态追加 dev server 样式
        const cssHref = 'http://localhost:3333/build/ldesign-webcomponent.css'
        if (!document.querySelector(`link[href="${cssHref}"]`)) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = cssHref
          document.head.appendChild(link)
        }
        // 通过裸 import 加载 ESM 并注册自定义元素
        const mod: any = await import(/* @vite-ignore */ 'http://localhost:3333/build/ldesign-webcomponent.esm.js')
        if (mod?.defineCustomElements) await mod.defineCustomElements(window as any)
        return mod
      }

      const tryLoader = async () => {
        try {
          const mod: any = await import(/* @vite-ignore */ '../../../loader/index.js')
          if (mod && typeof mod.defineCustomElements === 'function') {
            await mod.defineCustomElements(window as any)
            console.log('LDesign WebComponent 已通过 loader 定义自定义元素')
            return true
          }
        } catch (e) {
          // 忽略
        }
        return false
      }

      const loadLibrary = async () => {
        // 优先尝试使用 loader（开发模式）
        const loaderOk = await tryLoader()
        if (loaderOk) {
          console.log('LDesign WebComponent 已通过 loader 加载（开发模式）')
          return
        }
        
        // 如果 loader 不可用，尝试 dev server
        try {
          await loadFromDev()
          console.log('LDesign WebComponent 组件库已从 dev server 加载')
          return
        } catch {}
        
        // 最后尝试 dist
        try {
          await loadFromDist()
          console.log('LDesign WebComponent 组件库已从 dist 加载')
          return
        } catch (err) {
          console.error('加载 LDesign WebComponent 失败：loader/dev/dist 均不可用', err)
        }
      }

      loadLibrary().then(() => {
        // 初次加载后尝试初始化 demo
initInputDemos()
        initInputNumberDemos()
        initTabsDemos()
        initSwiperDemos()
        initTreeDemos()
      })

      // 监听路由变化，确保切换页面后 demo 仍生效
router.onAfterRouteChanged = () => {
        initInputDemos()
        initInputNumberDemos()
        initTabsDemos()
        initSwiperDemos()
        initTreeDemos()
      }
    }
  }
} satisfies Theme
