/**
 * 类型定义导出
 */

export * from './schema';
export * from './layout';
export * from './material';
export * from './databinding';
export * from './editor';
export * from './datasource';
export * from './code-generator';
export * from './theme';

/**
 * 通用类型
 */

/** ID 类型 */
export type ID = string;

/** 回调函数 */
export type Callback<T = void> = (value: T) => void;

/** 异步回调函数 */
export type AsyncCallback<T = void> = (value: T) => Promise<void>;

/** 可选的 */
export type Optional<T> = T | undefined;

/** 可为空的 */
export type Nullable<T> = T | null;

/** 深度部分 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** 深度只读 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/** 值类型 */
export type ValueOf<T> = T[keyof T];

/** 函数类型 */
export type Fn<T = any, R = any> = (...args: T[]) => R;

/** 异步函数类型 */
export type AsyncFn<T = any, R = any> = (...args: T[]) => Promise<R>;

/** 类构造函数 */
export type Constructor<T = any> = new (...args: any[]) => T;

/**
 * 坐标点
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 尺寸
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * 矩形
 */
export interface Rect extends Point, Size { }

/**
 * 颜色
 */
export type Color = string;

/**
 * 时间戳
 */
export type Timestamp = number;

/**
 * URL
 */
export type URL = string;


