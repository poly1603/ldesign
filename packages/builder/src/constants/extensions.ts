/**
 * 文件扩展名相关常量
 */

/**
 * 支持的文件扩展名
 */
export const SUPPORTED_EXTENSIONS = {
  // JavaScript 文件
  javascript: ['.js', '.mjs', '.cjs'],
  
  // TypeScript 文件
  typescript: ['.ts', '.tsx', '.d.ts'],
  
  // JSX 文件
  jsx: ['.jsx', '.tsx'],
  
  // Vue 文件
  vue: ['.vue'],
  
  // 样式文件
  styles: ['.css', '.less', '.scss', '.sass', '.styl', '.stylus'],
  
  // 配置文件
  config: ['.json', '.js', '.ts', '.mjs'],
  
  // 资源文件
  assets: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'],
  
  // 字体文件
  fonts: ['.woff', '.woff2', '.eot', '.ttf', '.otf'],
  
  // 文档文件
  docs: ['.md', '.mdx', '.txt'],
  
  // 数据文件
  data: ['.json', '.yaml', '.yml', '.toml', '.xml']
} as const

/**
 * 文件类型映射
 */
export const EXTENSION_TO_TYPE = {
  // JavaScript
  '.js': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  
  // TypeScript
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.d.ts': 'typescript-declaration',
  
  // JSX
  '.jsx': 'jsx',
  
  // Vue
  '.vue': 'vue',
  
  // 样式
  '.css': 'css',
  '.less': 'less',
  '.scss': 'scss',
  '.sass': 'sass',
  '.styl': 'stylus',
  '.stylus': 'stylus',
  
  // 配置
  '.json': 'json',
  
  // 资源
  '.png': 'image',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.gif': 'image',
  '.svg': 'svg',
  '.webp': 'image',
  '.ico': 'icon',
  
  // 字体
  '.woff': 'font',
  '.woff2': 'font',
  '.eot': 'font',
  '.ttf': 'font',
  '.otf': 'font',
  
  // 文档
  '.md': 'markdown',
  '.mdx': 'mdx',
  '.txt': 'text',
  
  // 数据
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',
  '.xml': 'xml'
} as const

/**
 * 加载器映射
 */
export const EXTENSION_TO_LOADER = {
  '.js': 'js',
  '.mjs': 'js',
  '.cjs': 'js',
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.jsx': 'jsx',
  '.vue': 'vue',
  '.css': 'css',
  '.less': 'less',
  '.scss': 'scss',
  '.sass': 'sass',
  '.styl': 'stylus',
  '.stylus': 'stylus',
  '.json': 'json',
  '.png': 'file',
  '.jpg': 'file',
  '.jpeg': 'file',
  '.gif': 'file',
  '.svg': 'svg',
  '.webp': 'file',
  '.ico': 'file',
  '.woff': 'file',
  '.woff2': 'file',
  '.eot': 'file',
  '.ttf': 'file',
  '.otf': 'file',
  '.md': 'text',
  '.txt': 'text'
} as const

/**
 * 入口文件优先级
 */
export const ENTRY_FILE_PRIORITY = [
  'index.ts',
  'index.tsx',
  'index.js',
  'index.jsx',
  'index.vue',
  'main.ts',
  'main.tsx',
  'main.js',
  'main.jsx',
  'src/index.ts',
  'src/index.tsx',
  'src/index.js',
  'src/index.jsx',
  'src/main.ts',
  'src/main.tsx',
  'src/main.js',
  'src/main.jsx',
  'lib/index.ts',
  'lib/index.js'
] as const

/**
 * 配置文件优先级
 */
export const CONFIG_FILE_PRIORITY = [
  'builder.config.ts',
  'builder.config.js',
  'builder.config.mjs',
  'builder.config.json',
  '.builderrc.ts',
  '.builderrc.js',
  '.builderrc.json',
  'package.json'
] as const

/**
 * TypeScript 配置文件
 */
export const TYPESCRIPT_CONFIG_FILES = [
  'tsconfig.json',
  'tsconfig.build.json',
  'tsconfig.lib.json',
  'tsconfig.prod.json'
] as const

/**
 * 样式配置文件
 */
export const STYLE_CONFIG_FILES = [
  'postcss.config.js',
  'postcss.config.ts',
  'postcss.config.json',
  '.postcssrc',
  '.postcssrc.js',
  '.postcssrc.json',
  'tailwind.config.js',
  'tailwind.config.ts',
  '.stylelintrc',
  '.stylelintrc.js',
  '.stylelintrc.json'
] as const

/**
 * Vue 配置文件
 */
export const VUE_CONFIG_FILES = [
  'vue.config.js',
  'vue.config.ts',
  'vite.config.js',
  'vite.config.ts'
] as const

/**
 * 忽略的文件模式
 */
export const IGNORE_PATTERNS = [
  // 依赖目录
  'node_modules/**',
  
  // 构建输出
  'dist/**',
  'build/**',
  'lib/**',
  'es/**',
  'cjs/**',
  'umd/**',
  
  // 缓存目录
  '.cache/**',
  '.temp/**',
  '.tmp/**',
  
  // 测试文件
  '**/*.test.*',
  '**/*.spec.*',
  '**/__tests__/**',
  '**/__mocks__/**',
  'test/**',
  'tests/**',
  
  // 配置文件
  '*.config.*',
  '.*rc.*',
  
  // 文档文件
  '*.md',
  'docs/**',
  
  // 其他
  '.git/**',
  '.svn/**',
  '.hg/**',
  'coverage/**',
  '*.log'
] as const

/**
 * 包含的文件模式
 */
export const INCLUDE_PATTERNS = {
  typescript: [
    'src/**/*.ts',
    'src/**/*.tsx',
    'lib/**/*.ts',
    'lib/**/*.tsx'
  ],
  
  javascript: [
    'src/**/*.js',
    'src/**/*.jsx',
    'src/**/*.mjs',
    'lib/**/*.js',
    'lib/**/*.jsx'
  ],
  
  vue: [
    'src/**/*.vue',
    'components/**/*.vue',
    'lib/**/*.vue'
  ],
  
  styles: [
    'src/**/*.css',
    'src/**/*.less',
    'src/**/*.scss',
    'src/**/*.sass',
    'src/**/*.styl',
    'styles/**/*'
  ],
  
  assets: [
    'src/assets/**/*',
    'assets/**/*',
    'public/**/*'
  ]
} as const

/**
 * 文件大小限制
 */
export const FILE_SIZE_LIMITS = {
  // 源代码文件
  source: 1024 * 1024, // 1MB
  
  // 配置文件
  config: 100 * 1024, // 100KB
  
  // 样式文件
  style: 500 * 1024, // 500KB
  
  // 资源文件
  asset: 10 * 1024 * 1024, // 10MB
  
  // 字体文件
  font: 2 * 1024 * 1024, // 2MB
  
  // 图片文件
  image: 5 * 1024 * 1024 // 5MB
} as const

/**
 * 文件编码检测
 */
export const ENCODING_DETECTION = {
  // 文本文件
  text: ['utf8', 'utf-8', 'ascii'],
  
  // 二进制文件
  binary: ['binary', 'base64'],
  
  // 默认编码
  default: 'utf8'
} as const

/**
 * 文件 MIME 类型
 */
export const MIME_TYPES = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.ts': 'application/typescript',
  '.tsx': 'application/typescript',
  '.jsx': 'application/javascript',
  '.vue': 'text/x-vue',
  '.css': 'text/css',
  '.less': 'text/less',
  '.scss': 'text/scss',
  '.sass': 'text/sass',
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.html': 'text/html',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
} as const
