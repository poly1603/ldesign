/**
 * v-t-html directive for Vue
 * HTML content translation directive
 */

import type { Directive, DirectiveBinding } from 'vue';
import type { I18nInstance } from '../../../types';

interface VTHtmlBinding {
  key?: string;
  params?: Record<string, any>;
  locale?: string;
}

export const vTHtml: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | VTHtmlBinding>, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n as I18nInstance;
    
    if (!i18n) {
      console.warn('[v-t-html] i18n instance not found');
      return;
    }

    updateHTML(el, binding, i18n);
  },

  updated(el: HTMLElement, binding: DirectiveBinding<string | VTHtmlBinding>, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n as I18nInstance;
    
    if (!i18n) {
      return;
    }

    updateHTML(el, binding, i18n);
  }
};

function updateHTML(
  el: HTMLElement,
  binding: DirectiveBinding<string | VTHtmlBinding>,
  i18n: I18nInstance
) {
  let key: string;
  let params: Record<string, any> | undefined;
  let locale: string | undefined;

  if (typeof binding.value === 'string') {
    key = binding.value;
  } else if (binding.value && typeof binding.value === 'object') {
    key = binding.value.key || '';
    params = binding.value.params;
    locale = binding.value.locale;
  } else {
    key = '';
  }

  if (!key) {
    console.warn('[v-t-html] translation key is required');
    return;
  }

  const translated = i18n.t(key, { params, locale });
  el.innerHTML = translated;
}

export default vTHtml;