import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: false,
  ignores: [
    'dist',
    'es',
    'lib',
    'types',
    'node_modules',
    'coverage',
    '*.d.ts',
    // 临时忽略有问题的Vue组件文件
    'src/vue/SizeSwitcher.tsx',
    'src/vue/SizeIndicator.tsx',
    'src/vue/SizeControlPanel.tsx',
  ],
})
