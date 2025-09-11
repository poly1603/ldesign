import { createPackageViteConfig } from '@ldesign/builder'

export default createPackageViteConfig({
  enableCSS: true,
  lessOptions: {
    javascriptEnabled: true,
    additionalData: `@import "@/styles/variables.less";`
  },
  external: [
    'mapbox-gl',
    '@turf/turf',
    'vue',
    'react',
    'react-dom',
    '@vue/composition-api'
  ],
  globals: {
    'mapbox-gl': 'mapboxgl',
    '@turf/turf': 'turf',
    'vue': 'Vue',
    'react': 'React',
    'react-dom': 'ReactDOM'
  }
})
