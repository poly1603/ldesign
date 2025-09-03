/**
 * 暗黑模式管理 Hook
 *
 * @description
 * 提供暗黑模式的切换、检测、持久化功能，支持系统主题跟随、
 * 自定义主题切换动画等功能。
 */
/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'auto';
/**
 * 暗黑模式状态
 */
export interface DarkModeState {
    /** 当前是否为暗黑模式 */
    isDark: boolean;
    /** 当前主题模式设置 */
    mode: ThemeMode;
    /** 系统是否偏好暗黑模式 */
    systemPrefersDark: boolean;
    /** 是否支持系统主题检测 */
    isSupported: boolean;
    /** 是否正在切换主题 */
    isToggling: boolean;
}
/**
 * 暗黑模式配置
 */
export interface DarkModeConfig {
    /** 存储键名 */
    storageKey?: string;
    /** 默认主题模式 */
    defaultMode?: ThemeMode;
    /** 暗黑模式类名 */
    darkClass?: string;
    /** 亮色模式类名 */
    lightClass?: string;
    /** 目标元素选择器 */
    target?: string | HTMLElement;
    /** 是否启用过渡动画 */
    enableTransition?: boolean;
    /** 过渡动画持续时间（毫秒） */
    transitionDuration?: number;
    /** 主题切换时的回调 */
    onChange?: (isDark: boolean, mode: ThemeMode) => void;
    /** 系统主题变化时的回调 */
    onSystemChange?: (prefersDark: boolean) => void;
}
/**
 * 暗黑模式 Hook
 *
 * @param config - 配置选项
 * @returns 暗黑模式状态和操作方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const {
 *       state,
 *       toggle,
 *       setMode,
 *       setDark,
 *       setLight,
 *       setAuto
 *     } = useDarkMode({
 *       defaultMode: 'auto',
 *       enableTransition: true,
 *       onChange: (isDark, mode) => {
 *         console.log(`主题切换为: ${isDark ? '暗黑' : '亮色'} (${mode})`)
 *       }
 *     })
 *
 *     const handleToggle = () => {
 *       toggle()
 *     }
 *
 *     return {
 *       state,
 *       handleToggle,
 *       setMode,
 *       setDark,
 *       setLight,
 *       setAuto
 *     }
 *   }
 * })
 * ```
 *
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <button @click="toggle()" :disabled="state.isToggling">
 *       {{ state.isDark ? '🌙' : '☀️' }}
 *       {{ state.isDark ? '暗黑模式' : '亮色模式' }}
 *     </button>
 *
 *     <select @change="setMode($event.target.value)">
 *       <option value="light">亮色模式</option>
 *       <option value="dark">暗黑模式</option>
 *       <option value="auto">跟随系统</option>
 *     </select>
 *
 *     <p v-if="state.mode === 'auto'">
 *       系统偏好: {{ state.systemPrefersDark ? '暗黑' : '亮色' }}
 *     </p>
 *   </div>
 * </template>
 * ```
 */
export declare function useDarkMode(config?: DarkModeConfig): {
    state: import("vue").ComputedRef<DarkModeState>;
    toggle: () => Promise<void>;
    setMode: (newMode: ThemeMode) => Promise<void>;
    setDark: () => Promise<void>;
    setLight: () => Promise<void>;
    setAuto: () => Promise<void>;
    getThemeInfo: () => {
        mode: ThemeMode;
        isDark: boolean;
        systemPrefersDark: boolean;
        isSupported: boolean;
    };
};
/**
 * 简化的暗黑模式切换函数
 *
 * @returns 切换函数和当前状态
 *
 * @example
 * ```typescript
 * const { isDark, toggle } = useSimpleDarkMode()
 *
 * // 切换主题
 * toggle()
 *
 * // 检查当前状态
 * console.log('当前是暗黑模式:', isDark.value)
 * ```
 */
export declare function useSimpleDarkMode(): {
    isDark: import("vue").ComputedRef<boolean>;
    toggle: () => Promise<void>;
};
/**
 * 获取系统主题偏好
 *
 * @returns 系统是否偏好暗黑模式
 *
 * @example
 * ```typescript
 * const prefersDark = getSystemThemePreference()
 * console.log('系统偏好暗黑模式:', prefersDark)
 * ```
 */
export declare function getSystemThemePreference(): boolean;
/**
 * 监听系统主题变化
 *
 * @param callback - 主题变化回调函数
 * @returns 取消监听的函数
 *
 * @example
 * ```typescript
 * const unwatch = watchSystemTheme((prefersDark) => {
 *   console.log('系统主题变化:', prefersDark ? '暗黑' : '亮色')
 * })
 *
 * // 取消监听
 * unwatch()
 * ```
 */
export declare function watchSystemTheme(callback: (prefersDark: boolean) => void): () => void;
//# sourceMappingURL=useDarkMode.d.ts.map