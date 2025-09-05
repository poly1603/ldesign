/**
 * 类型定义导出
 * 
 * @description
 * 统一导出所有类型定义，提供完整的 TypeScript 类型支持
 */

// === 核心类型 ===
export * from './core';
export * from './form';
export * from './field';
export * from './validator';

// === Vue 相关类型 ===
export * from './vue';

// === 类型别名和工具类型 ===

/**
 * 表单数据类型
 */
export type FormData = Record<string, any>;

/**
 * 字段值类型
 */
export type FieldValue = any;

/**
 * 验证错误类型
 */
export type ValidationError = {
  field: string;
  message: string;
  code?: string;
};

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 深度必需类型
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * 提取字段名类型
 */
export type FieldNames<T> = keyof T;

/**
 * 提取字段值类型
 */
export type FieldValues<T> = T[keyof T];

/**
 * 表单状态联合类型
 */
export type FormStateUnion = 
  | 'pristine'
  | 'dirty'
  | 'valid'
  | 'invalid'
  | 'pending'
  | 'submitted';

/**
 * 字段状态联合类型
 */
export type FieldStateUnion = 
  | 'pristine'
  | 'dirty'
  | 'touched'
  | 'valid'
  | 'invalid'
  | 'pending';

/**
 * 验证触发时机联合类型
 */
export type ValidationTriggerUnion = 
  | 'change'
  | 'blur'
  | 'submit'
  | 'manual';

/**
 * 内置验证器名称联合类型
 */
export type BuiltinValidatorUnion = 
  | 'required'
  | 'email'
  | 'url'
  | 'pattern'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'range'
  | 'number'
  | 'integer'
  | 'custom';

/**
 * 组件属性提取工具类型
 */
export type ComponentProps<T> = T extends new (...args: any[]) => any
  ? InstanceType<T>['$props']
  : T extends (...args: any[]) => any
  ? Parameters<T>[0]
  : never;

/**
 * 事件处理器类型
 */
export type EventHandler<T = any> = (event: T) => void | Promise<void>;

/**
 * 异步函数类型
 */
export type AsyncFunction<T = any, R = any> = (arg: T) => Promise<R>;

/**
 * 同步函数类型
 */
export type SyncFunction<T = any, R = any> = (arg: T) => R;

/**
 * 函数或异步函数类型
 */
export type MaybeAsyncFunction<T = any, R = any> = SyncFunction<T, R> | AsyncFunction<T, R>;

/**
 * 可选的异步函数类型
 */
export type OptionalAsyncFunction<T = any, R = any> = MaybeAsyncFunction<T, R> | undefined;

/**
 * 条件类型工具
 */
export type If<C extends boolean, T, F> = C extends true ? T : F;

/**
 * 数组项类型提取
 */
export type ArrayItem<T> = T extends (infer U)[] ? U : never;

/**
 * 对象值类型提取
 */
export type ObjectValues<T> = T[keyof T];

/**
 * 对象键类型提取
 */
export type ObjectKeys<T> = keyof T;

/**
 * 非空类型
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * 可空类型
 */
export type Nullable<T> = T | null | undefined;

/**
 * 字符串字面量联合类型
 */
export type StringLiteral<T> = T extends string ? T : never;

/**
 * 数字字面量联合类型
 */
export type NumberLiteral<T> = T extends number ? T : never;

/**
 * 布尔字面量联合类型
 */
export type BooleanLiteral<T> = T extends boolean ? T : never;

/**
 * 函数参数类型提取
 */
export type FunctionArgs<T> = T extends (...args: infer A) => any ? A : never;

/**
 * 函数返回值类型提取
 */
export type FunctionReturn<T> = T extends (...args: any[]) => infer R ? R : never;

/**
 * Promise 值类型提取
 */
export type PromiseValue<T> = T extends Promise<infer V> ? V : T;

/**
 * 递归对象类型
 */
export type RecursiveObject<T> = {
  [K in keyof T]: T[K] extends object ? RecursiveObject<T[K]> : T[K];
};

/**
 * 扁平化对象类型
 */
export type FlattenObject<T> = {
  [K in keyof T]: T[K];
};

/**
 * 合并对象类型
 */
export type MergeObjects<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? U[K]
    : K extends keyof T
    ? T[K]
    : never;
};

/**
 * 排除对象属性类型
 */
export type OmitObject<T, K extends keyof T> = Omit<T, K>;

/**
 * 选择对象属性类型
 */
export type PickObject<T, K extends keyof T> = Pick<T, K>;

/**
 * 部分对象类型
 */
export type PartialObject<T> = Partial<T>;

/**
 * 必需对象类型
 */
export type RequiredObject<T> = Required<T>;

/**
 * 只读对象类型
 */
export type ReadonlyObject<T> = Readonly<T>;

/**
 * 可写对象类型
 */
export type WritableObject<T> = {
  -readonly [K in keyof T]: T[K];
};

/**
 * 类型守卫函数
 */
export type TypeGuard<T> = (value: any) => value is T;

/**
 * 类型断言函数
 */
export type TypeAssertion<T> = (value: any) => T;

/**
 * 类型转换函数
 */
export type TypeConverter<T, U> = (value: T) => U;
