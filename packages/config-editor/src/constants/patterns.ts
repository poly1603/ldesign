/**
 * 正则表达式模式常量
 * 
 * 定义项目中使用的正则表达式模式
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

/**
 * 包名验证模式
 * 符合 npm 包名规范
 */
export const PACKAGE_NAME_PATTERN = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/

/**
 * 版本号验证模式
 * 符合 semver 规范
 */
export const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

/**
 * 邮箱验证模式
 */
export const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/**
 * URL 验证模式
 */
export const URL_PATTERN = /^https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$/

/**
 * 端口号验证模式
 */
export const PORT_PATTERN = /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/

/**
 * IP 地址验证模式
 */
export const IP_PATTERN = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

/**
 * 主机名验证模式
 */
export const HOSTNAME_PATTERN = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/

/**
 * 颜色值验证模式（十六进制）
 */
export const HEX_COLOR_PATTERN = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

/**
 * RGB 颜色值验证模式
 */
export const RGB_COLOR_PATTERN = /^rgb\(\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*\)$/

/**
 * RGBA 颜色值验证模式
 */
export const RGBA_COLOR_PATTERN = /^rgba\(\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*((0\.[0-9]+)|[01])\s*\)$/

/**
 * 文件路径验证模式（Unix/Windows）
 */
export const FILE_PATH_PATTERN = /^(?:[a-zA-Z]:)?[\/\\]?(?:[^\/\\:*?"<>|]+[\/\\])*[^\/\\:*?"<>|]*$/

/**
 * 相对路径验证模式
 */
export const RELATIVE_PATH_PATTERN = /^(?!\/|[a-zA-Z]:)(?:\.\.?\/)*(?:[^\/\\:*?"<>|]+\/)*[^\/\\:*?"<>|]*$/

/**
 * 绝对路径验证模式
 */
export const ABSOLUTE_PATH_PATTERN = /^(?:[a-zA-Z]:[\/\\]|\/)/

/**
 * 变量名验证模式（JavaScript 标识符）
 */
export const VARIABLE_NAME_PATTERN = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

/**
 * CSS 类名验证模式
 */
export const CSS_CLASS_PATTERN = /^[a-zA-Z][\w-]*$/

/**
 * HTML ID 验证模式
 */
export const HTML_ID_PATTERN = /^[a-zA-Z][\w-]*$/

/**
 * 数字验证模式（整数）
 */
export const INTEGER_PATTERN = /^-?\d+$/

/**
 * 数字验证模式（浮点数）
 */
export const FLOAT_PATTERN = /^-?\d+(\.\d+)?$/

/**
 * 正整数验证模式
 */
export const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/

/**
 * 非负整数验证模式
 */
export const NON_NEGATIVE_INTEGER_PATTERN = /^(0|[1-9]\d*)$/

/**
 * 百分比验证模式
 */
export const PERCENTAGE_PATTERN = /^(100|[1-9]?\d)%$/

/**
 * 时间验证模式（HH:MM）
 */
export const TIME_PATTERN = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/

/**
 * 日期验证模式（YYYY-MM-DD）
 */
export const DATE_PATTERN = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/

/**
 * 日期时间验证模式（ISO 8601）
 */
export const DATETIME_PATTERN = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/

/**
 * 配置文件名验证模式
 */
export const CONFIG_FILE_PATTERN = /^(launcher|app|vite)\.config\.(ts|js|mjs|cjs)$|^package\.json$/

/**
 * TypeScript 文件验证模式
 */
export const TYPESCRIPT_FILE_PATTERN = /\.tsx?$/

/**
 * JavaScript 文件验证模式
 */
export const JAVASCRIPT_FILE_PATTERN = /\.m?jsx?$/

/**
 * JSON 文件验证模式
 */
export const JSON_FILE_PATTERN = /\.json$/

/**
 * YAML 文件验证模式
 */
export const YAML_FILE_PATTERN = /\.ya?ml$/

/**
 * 注释行验证模式
 */
export const COMMENT_LINE_PATTERN = /^\s*\/\/|^\s*\/\*|^\s*\*/

/**
 * 空行验证模式
 */
export const EMPTY_LINE_PATTERN = /^\s*$/

/**
 * 导入语句验证模式
 */
export const IMPORT_STATEMENT_PATTERN = /^import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"][^'"]+['"];?$/

/**
 * 导出语句验证模式
 */
export const EXPORT_STATEMENT_PATTERN = /^export\s+(?:default\s+|(?:const|let|var|function|class|interface|type)\s+)/
