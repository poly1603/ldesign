/**
 * 主题模块导出
 */

export * from './default';
export * from './dark';
export * from './colorful';

// 重新导出主题相关类型
export type {
  ThemeConfig,
  ThemeVariables,
  ThemeType,
  ThemeMode,
  ThemeState,
  ThemeContext,
  ThemeMetadata,
  ColorVariables,
  FontVariables,
  SizeVariables,
  AnimationVariables
} from '../types/themes';

// 重新导出主题管理器
export { ThemeManager, createThemeManager } from '../core/ThemeManager';

// 主题注册表
export const themes = {
  default: () => import('./default').then(m => m.defaultTheme),
  dark: () => import('./dark').then(m => m.darkTheme),
  colorful: () => import('./colorful').then(m => m.colorfulTheme)
};

// 获取所有可用主题名称
export const getAvailableThemes = () => Object.keys(themes);

// 动态加载主题
export const loadTheme = async (name: string) => {
  const themeLoader = themes[name as keyof typeof themes];
  if (!themeLoader) {
    throw new Error(`Theme "${name}" not found`);
  }
  return await themeLoader();
};
