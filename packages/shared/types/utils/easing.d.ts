/**
 * @file
 * 缓动函数
 * 参考自: https://github.com/bameyrick/js-easing-functions/blob/master/src/index.ts
 */
interface EasingFunction {
    (current: number, start: number, end: number, duration: number): number;
}
/**
 * @export
 * @param {number} current 当前时间
 * @param {number} start 开始值
 * @param {number} end 结束值
 * @param {number} duration 持续时间
 * @returns
 */
declare const linear: EasingFunction;
/**
 * @export
 * @param {number} current 当前时间
 * @param {number} start 开始值
 * @param {number} end 结束值
 * @param {number} duration 持续时间
 * @returns
 */
declare const easeInOutCubic: EasingFunction;

export { easeInOutCubic, linear };
export type { EasingFunction };
