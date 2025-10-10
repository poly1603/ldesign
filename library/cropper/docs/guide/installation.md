# Installation

## Package Manager

Install @ldesign/cropper using your preferred package manager:

::: code-group

```bash [npm]
npm install @ldesign/cropper
```

```bash [yarn]
yarn add @ldesign/cropper
```

```bash [pnpm]
pnpm add @ldesign/cropper
```

:::

## CDN

For quick prototyping or simple projects, you can use a CDN:

```html
<!-- CSS -->
<link rel="stylesheet" href="https://unpkg.com/@ldesign/cropper/dist/style.css">

<!-- JavaScript (ES Module) -->
<script type="module">
  import { Cropper } from 'https://unpkg.com/@ldesign/cropper/dist/index.js'

  const cropper = new Cropper('#container', {
    src: 'path/to/image.jpg'
  })
</script>
```

## Import Styles

Don't forget to import the CSS file in your application:

```javascript
import '@ldesign/cropper/style.css'
```

## Framework-Specific Installation

### Vue 3

```bash
npm install @ldesign/cropper vue
```

```javascript
import { VueCropper } from '@ldesign/cropper/vue'
import '@ldesign/cropper/style.css'
```

### React

```bash
npm install @ldesign/cropper react react-dom
```

```javascript
import { ReactCropper } from '@ldesign/cropper/react'
import '@ldesign/cropper/style.css'
```

### Angular

```bash
npm install @ldesign/cropper @angular/core
```

```typescript
import { AngularCropperModule } from '@ldesign/cropper/angular'
import '@ldesign/cropper/style.css'

@NgModule({
  imports: [AngularCropperModule]
})
export class AppModule {}
```

## TypeScript

@ldesign/cropper is written in TypeScript and includes type definitions out of the box. No need to install separate type packages.

```typescript
import { Cropper, CropperOptions } from '@ldesign/cropper'

const options: CropperOptions = {
  src: 'path/to/image.jpg',
  aspectRatio: 16 / 9
}

const cropper = new Cropper('#container', options)
```

## Build Tools

### Vite

@ldesign/cropper works seamlessly with Vite:

```javascript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/style.css'
```

### Webpack

For Webpack, you may need to configure CSS loading:

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}
```

### Rollup

For Rollup, use appropriate plugins:

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'

export default {
  plugins: [
    resolve(),
    postcss()
  ]
}
```

## Verify Installation

Create a simple test to verify the installation:

```javascript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/style.css'

console.log('Cropper version:', Cropper.version)

const cropper = new Cropper('#test-container', {
  src: 'https://via.placeholder.com/800x600'
})

console.log('Cropper initialized successfully!')
```

## Next Steps

Now that you have @ldesign/cropper installed, learn how to use it:

- [Basic Usage](/guide/basic-usage)
- [Configuration](/guide/configuration)
- [Framework Integration](/guide/vue)
