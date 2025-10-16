/**
 * v-t directive for Vue
 * Basic translation directive
 */

import type { Directive, DirectiveBinding } from 'vue';
import type { I18nInstance } from '../../../types';

interface VTBinding {
  key?: string;
  params?: Record<string, any>;
  locale?: string;
  tag?: string;
}

export const vT: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | VTBinding>, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n as I18nInstance;
    
    if (!i18n) {
      console.warn('[v-t] i18n instance not found');
      return;
    }

    updateContent(el, binding, i18n);
  },

  updated(el: HTMLElement, binding: DirectiveBinding<string | VTBinding>, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n as I18nInstance;
    
    if (!i18n) {
      return;
    }

    updateContent(el, binding, i18n);
  }
};

function updateContent(
  el: HTMLElement,
  binding: DirectiveBinding<string | VTBinding>,
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
    console.warn('[v-t] translation key is required');
    return;
  }

  const translated = i18n.t(key, { params, locale });
  el.textContent = translated;
}

export default vT;