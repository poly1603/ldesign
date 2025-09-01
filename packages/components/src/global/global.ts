// Global initialization and utilities for LDesign Components

export default function() {
  // Initialize global theme system
  initializeTheme();
  
  // Setup global event listeners
  setupGlobalEvents();
}

/**
 * Initialize theme system
 */
function initializeTheme() {
  // Detect system theme preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Apply theme if not already set
  if (!document.documentElement.hasAttribute('data-theme')) {
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('ld-theme-override')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}

/**
 * Setup global event listeners
 */
function setupGlobalEvents() {
  // Handle escape key for modals and overlays
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const event = new CustomEvent('ld-escape', { bubbles: true });
      e.target?.dispatchEvent(event);
    }
  });
}

/**
 * Theme utilities
 */
export const themeUtils = {
  /**
   * Set theme
   */
  setTheme(theme: 'light' | 'dark' | 'auto') {
    if (theme === 'auto') {
      localStorage.removeItem('ld-theme-override');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      localStorage.setItem('ld-theme-override', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  },

  /**
   * Get current theme
   */
  getTheme(): 'light' | 'dark' {
    return document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
  },

  /**
   * Toggle theme
   */
  toggleTheme() {
    const current = this.getTheme();
    this.setTheme(current === 'light' ? 'dark' : 'light');
  }
};

// Make theme utilities globally available
if (typeof window !== 'undefined') {
  (window as any).LDesignTheme = themeUtils;
}