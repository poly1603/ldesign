/**
 * 缓动函数模块
 *
 * @description
 * 提供各种缓动函数，用于动画和过渡效果。
 * 这些函数遵循标准的缓动函数接口，可用于自定义动画实现。
 *
 * 参考自: https://github.com/bameyrick/js-easing-functions/blob/master/src/index.ts
 * 更多缓动函数可参考: https://easings.net/
 */
/**
 * 缓动函数接口
 *
 * @param current - 当前时间（0 到 duration 之间）
 * @param start - 起始值
 * @param end - 结束值
 * @param duration - 动画持续时间
 * @returns 当前时间点的插值结果
 */
export interface EasingFunction {
    (current: number, start: number, end: number, duration: number): number;
}
/**
 * 线性缓动函数
 *
 * @description 匀速运动，没有加速或减速
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 *
 * @example
 * ```typescript
 * // 创建一个从 0 到 100 的线性动画，持续 1000ms
 * const value = linear(500, 0, 100, 1000) // 返回 50
 * ```
 */
export declare const linear: EasingFunction;
/**
 * 三次方缓入缓出函数
 *
 * @description 开始和结束时缓慢，中间加速
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 *
 * @example
 * ```typescript
 * // 创建一个平滑的缓入缓出动画
 * const value = easeInOutCubic(500, 0, 100, 1000)
 * ```
 */
export declare const easeInOutCubic: EasingFunction;
/**
 * 二次方缓入函数
 *
 * @description 开始时缓慢，然后加速
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export declare const easeInQuad: EasingFunction;
/**
 * 二次方缓出函数
 *
 * @description 开始时快速，然后减速
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export declare const easeOutQuad: EasingFunction;
/**
 * 二次方缓入缓出函数
 *
 * @description 开始和结束时缓慢，中间加速
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export declare const easeInOutQuad: EasingFunction;
/**
 * 三次方缓入函数
 *
 * @description 开始时非常缓慢，然后快速加速
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export declare const easeInCubic: EasingFunction;
/**
 * 三次方缓出函数
 *
 * @description 开始时快速，然后缓慢减速
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export declare const easeOutCubic: EasingFunction;
/**
 * 弹性缓入函数
 *
 * @description 开始时有弹性效果，然后加速
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export declare const easeInElastic: EasingFunction;
/**
 * 弹性缓出函数
 *
 * @description 快速到达目标，然后有弹性效果
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export declare const easeOutElastic: EasingFunction;
/**
 * 回弹缓出函数
 *
 * @description 超过目标值然后回弹到目标位置
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export declare const easeOutBack: EasingFunction;
/**
 * 回弹缓入函数
 *
 * @description 先向后移动，然后加速向前
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export declare const easeInBack: EasingFunction;
/**
 * 弹跳缓出函数
 *
 * @description 模拟球弹跳的效果
 *
 * @param current - 当前时间
 * @param start - 开始值
 * @param end - 结束值
 * @param duration - 持续时间
 * @returns 插值结果
 */
export declare const easeOutBounce: EasingFunction;
/**
 * 缓动函数集合
 *
 * @description 包含所有可用的缓动函数，便于统一管理和使用
 */
export declare const easingFunctions: {
    readonly linear: EasingFunction;
    readonly easeInQuad: EasingFunction;
    readonly easeOutQuad: EasingFunction;
    readonly easeInOutQuad: EasingFunction;
    readonly easeInCubic: EasingFunction;
    readonly easeOutCubic: EasingFunction;
    readonly easeInOutCubic: EasingFunction;
    readonly easeInElastic: EasingFunction;
    readonly easeOutElastic: EasingFunction;
    readonly easeInBack: EasingFunction;
    readonly easeOutBack: EasingFunction;
    readonly easeOutBounce: EasingFunction;
};
/**
 * 缓动函数名称类型
 */
export type EasingName = keyof typeof easingFunctions;
/**
 * 根据名称获取缓动函数
 *
 * @param name - 缓动函数名称
 * @returns 对应的缓动函数
 *
 * @example
 * ```typescript
 * const easingFn = getEasingFunction('easeInOutCubic')
 * const value = easingFn(500, 0, 100, 1000)
 * ```
 */
export declare function getEasingFunction(name: EasingName): EasingFunction;
/**
 * 创建动画帧函数
 *
 * @param from - 起始值
 * @param to - 结束值
 * @param duration - 持续时间（毫秒）
 * @param easing - 缓动函数名称或函数
 * @param onUpdate - 更新回调函数
 * @param onComplete - 完成回调函数（可选）
 * @returns 取消动画的函数
 *
 * @example
 * ```typescript
 * const cancelAnimation = animate(0, 100, 1000, 'easeInOutCubic', (value) => {
 *   element.style.left = `${value}px`
 * }, () => {
 *   console.log('Animation completed')
 * })
 *
 * // 如需取消动画
 * // cancelAnimation()
 * ```
 */
export declare function animate(from: number, to: number, duration: number, easing: EasingName | EasingFunction, onUpdate: (value: number) => void, onComplete?: () => void): () => void;
//# sourceMappingURL=easing.d.ts.map