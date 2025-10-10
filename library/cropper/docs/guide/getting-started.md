# Getting Started

Welcome to @ldesign/cropper! This guide will help you get started with image cropping in your application.

## What is @ldesign/cropper?

@ldesign/cropper is a powerful, flexible image cropper library that works with any framework. It provides a rich set of features for cropping, rotating, zooming, and transforming images with full support for touch and mouse interactions.

## Key Features

- **Universal Device Support**: Works seamlessly on PC, tablets, and mobile devices
- **Touch & Gestures**: Native support for touch events, pinch-to-zoom, and multi-touch gestures
- **Framework Agnostic**: Official adapters for Vue, React, Angular, and vanilla JavaScript
- **Rich Configuration**: Extensive options for customization
- **High Performance**: Optimized with requestAnimationFrame for smooth interactions
- **Extensible**: Plugin system for custom features
- **TypeScript**: Full TypeScript support with complete type definitions
- **Lightweight**: Tree-shakeable with minimal dependencies

## Installation

Choose your preferred package manager:

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

## Your First Cropper

Let's create a simple image cropper:

### Vanilla JavaScript

```javascript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/style.css'

const cropper = new Cropper('#container', {
  src: 'https://example.com/image.jpg',
  aspectRatio: 16 / 9,
  viewMode: 1,
  autoCrop: true
})

// Get cropped image
const canvas = cropper.getCroppedCanvas()
canvas.toBlob((blob) => {
  // Upload or download the cropped image
  console.log('Cropped image blob:', blob)
})
```

### HTML

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="path/to/@ldesign/cropper/style.css">
</head>
<body>
  <div id="container" style="width: 800px; height: 600px;"></div>

  <script type="module">
    import { Cropper } from '@ldesign/cropper'

    const cropper = new Cropper('#container', {
      src: 'path/to/image.jpg'
    })
  </script>
</body>
</html>
```

## Framework Integration

@ldesign/cropper provides official adapters for popular frameworks:

- [Vue 3](/guide/vue)
- [React](/guide/react)
- [Angular](/guide/angular)

Each adapter provides a native component that integrates seamlessly with your framework.

## Next Steps

- Learn about [Basic Usage](/guide/basic-usage)
- Explore [Configuration Options](/guide/configuration)
- Check out [Live Examples](/examples/)
- Read the [API Reference](/api/cropper)

## Browser Support

@ldesign/cropper supports all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Need Help?

- [GitHub Discussions](https://github.com/ldesign/cropper/discussions) - Ask questions and share ideas
- [Issue Tracker](https://github.com/ldesign/cropper/issues) - Report bugs
- [Examples](/examples/) - See live examples

## License

@ldesign/cropper is open source software licensed under the [MIT License](https://github.com/ldesign/cropper/blob/main/LICENSE).
