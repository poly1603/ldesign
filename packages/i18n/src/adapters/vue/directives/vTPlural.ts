/**
 * v-t-plural directive for Vue
 * Pluralization directive
 */

import type { Directive, DirectiveBinding } from 'vue';
import type { I18nInstance } from '../../../types';

interface VTPluralBinding {
  key: string;
  count: number;
  params?: Record<string, any>;
  locale?: string;
}

export const vTPlural: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<VTPluralBinding>, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n as I18nInstance;
    
    if (!i18n) {
      return;
    }

    updatePlural(el, binding, i18n);
  },

  updated(el: HTMLElement, binding: DirectiveBinding<VTPluralBinding>, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n as I18nInstance;
    
    if (!i18n) {
      return;
    }

    updatePlural(el, binding, i18n);
  }
};

function updatePlural(
  el: HTMLElement,
  binding: DirectiveBinding<VTPluralBinding>,
  i18n: I18nInstance
) {
  if (!binding.value) {
    return;
  }

  const { key, count, params, locale } = binding.value;

  if (!key) {
    return;
  }

  if (count === undefined) {
    return;
  }

  const translated = i18n.plural(key, count, { params, locale });
  el.textContent = translated;
}

export default vTPlural;