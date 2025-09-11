export class ThemeManager {
  private currentTheme: 'light' | 'dark' = 'light';
  private readonly storageKey = 'vanilla-theme';

  constructor() {
    this.loadFromStorage();
    this.applyTheme();
  }

  public toggle(): 'light' | 'dark' {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.saveToStorage();
    this.applyTheme();
    return this.currentTheme;
  }

  public setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme;
    this.saveToStorage();
    this.applyTheme();
  }

  public getTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  public isDark(): boolean {
    return this.currentTheme === 'dark';
  }

  public isLight(): boolean {
    return this.currentTheme === 'light';
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored && (stored === 'light' || stored === 'dark')) {
        this.currentTheme = stored;
      } else {
        // 检测系统主题偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.currentTheme = prefersDark ? 'dark' : 'light';
      }
    } catch (error) {
      console.warn('无法从本地存储加载主题设置:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, this.currentTheme);
    } catch (error) {
      console.warn('无法保存主题设置到本地存储:', error);
    }
  }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    document.documentElement.classList.toggle('dark-theme', this.currentTheme === 'dark');
  }
}
