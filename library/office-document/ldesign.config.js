module.exports = {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: ['esm', 'cjs', 'umd'],
    name: 'OfficeDocument'
  },
  external: [],
  plugins: [
    // 如果需要自定义插件可以在这里添加
  ],
  typescript: {
    tsconfig: './tsconfig.json',
    clean: true
  },
  minify: true,
  sourcemap: true
};