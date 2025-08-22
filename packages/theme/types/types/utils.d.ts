/**
 * @ldesign/theme - 工具类型定义
 *
 * 提供常用的 TypeScript 工具类型
 */
/**
 * 深度可选类型
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
/**
 * 必需键类型
 */
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]
/**
 * 可选键类型
 */
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]
/**
 * 美化类型显示
 */
type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}
/**
 * 联合类型转交集类型
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never
/**
 * 选择类型
 */
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

export type {
  DeepPartial,
  OptionalKeys,
  Pick,
  Prettify,
  RequiredKeys,
  UnionToIntersection,
}
