import { computed, inject, type InjectionKey, type Ref } from 'vue';

export interface ThemeConfig {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  custom?: Record<string, string>;
}

export const ThemeConfigKey: InjectionKey<Ref<ThemeConfig>> = Symbol('ThemeConfig');

export function useTheme() {
  const themeConfig = inject(ThemeConfigKey);

  const defaultTheme: ThemeConfig = {
    primary: '#722ED1',
    secondary: '#8C5AD3',
    success: '#42BD42',
    warning: '#F0B80F',
    error: '#DD2222',
    info: '#1890FF',
    custom: {}
  };

  const currentTheme = computed(() => themeConfig?.value || defaultTheme);

  const getThemeColor = (colorName: keyof ThemeConfig | string): string => {
    const theme = currentTheme.value;

    if (colorName in theme) {
      return theme[colorName as keyof ThemeConfig] as string;
    }

    if (theme.custom && colorName in theme.custom) {
      return theme.custom[colorName];
    }

    return colorName; // 返回原始值作为后备
  };

  return {
    currentTheme,
    getThemeColor
  };
}