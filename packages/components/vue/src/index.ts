import { Plugin } from 'vue';
import { applyPolyfills, defineCustomElements } from '@ldesign/components/loader';

// Vue plugin for LDesign Components
export const LDesignComponents: Plugin = {
  async install() {
    // Apply polyfills and define custom elements
    await applyPolyfills();
    defineCustomElements();
  }
};

// Individual component registrations for tree-shaking
export const useLDesignComponents = () => {
  return {
    async register() {
      await applyPolyfills();
      defineCustomElements();
    }
  };
};

// Theme utilities for Vue
export const useLDesignTheme = () => {
  const setTheme = (theme: 'light' | 'dark' | 'auto') => {
    if (typeof window !== 'undefined' && window.LDesignTheme) {
      window.LDesignTheme.setTheme(theme);
    }
  };

  const getTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.LDesignTheme) {
      return window.LDesignTheme.getTheme();
    }
    return 'light';
  };

  const toggleTheme = () => {
    if (typeof window !== 'undefined' && window.LDesignTheme) {
      window.LDesignTheme.toggleTheme();
    }
  };

  return {
    setTheme,
    getTheme,
    toggleTheme
  };
};

// Export all from the main components package
export * from '@ldesign/components';