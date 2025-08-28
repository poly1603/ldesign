/**
 * CSS注入器
 */
/**
 * CSS注入选项
 */
export interface CSSInjectionOptions {
    /** 样式标签ID */
    styleId?: string;
    /** 目标选择器 */
    selector?: string;
    /** 是否使用 !important */
    important?: boolean;
    /** 是否启用动画过渡 */
    enableTransition?: boolean;
    /** 过渡持续时间 */
    transitionDuration?: string;
    /** 过渡缓动函数 */
    transitionEasing?: string;
}
/**
 * CSS注入器类
 */
export declare class CSSInjector {
    private options;
    private styleElement;
    constructor(options?: CSSInjectionOptions);
    /**
     * 注入CSS变量
     */
    injectVariables(variables: Record<string, string>): void;
    /**
     * 注入CSS字符串
     */
    injectCSS(cssString: string): void;
    /**
     * 移除CSS
     */
    removeCSS(): void;
    /**
     * 更新CSS变量
     */
    updateVariables(variables: Record<string, string>): void;
    /**
     * 生成CSS字符串
     */
    private generateCSSString;
    /**
     * 检查是否已注入
     */
    isInjected(): boolean;
    /**
     * 获取当前选项
     */
    getOptions(): Required<CSSInjectionOptions>;
    /**
     * 更新选项
     */
    updateOptions(options: Partial<CSSInjectionOptions>): void;
    /**
     * 获取样式元素
     */
    getStyleElement(): HTMLStyleElement | null;
    /**
     * 销毁注入器
     */
    destroy(): void;
}
/**
 * 全局CSS注入器实例
 */
export declare const globalCSSInjector: CSSInjector;
/**
 * 创建CSS注入器实例
 */
export declare function createCSSInjector(options?: CSSInjectionOptions): CSSInjector;
/**
 * 便捷函数：注入CSS变量到全局
 */
export declare function injectGlobalVariables(variables: Record<string, string>, options?: CSSInjectionOptions): void;
/**
 * 便捷函数：移除全局CSS变量
 */
export declare function removeGlobalVariables(styleId?: string): void;
/**
 * 便捷函数：检查CSS变量是否已注入
 */
export declare function isVariablesInjected(styleId?: string): boolean;
/**
 * 便捷函数：获取CSS变量值
 */
export declare function getCSSVariableValue(name: string, element?: Element): string;
/**
 * 便捷函数：设置CSS变量值
 */
export declare function setCSSVariableValue(name: string, value: string, element?: Element): void;
//# sourceMappingURL=css-injector.d.ts.map