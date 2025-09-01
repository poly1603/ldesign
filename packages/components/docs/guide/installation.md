# Installation

Learn how to install and set up LDesign Components in your project.

## Prerequisites

Before installing LDesign Components, make sure you have:

- **Node.js** 16+ (LTS recommended)
- A modern bundler (Vite, Webpack, Rollup, etc.)
- A browser that supports [Web Components](https://caniuse.com/custom-elementsv1)

## Package Installation

Choose your preferred package manager:

::: code-group

```bash [npm]
npm install @ldesign/components
```

```bash [pnpm]
pnpm add @ldesign/components
```

```bash [yarn]
yarn add @ldesign/components
```

:::

For Vue 3 projects, you might also want to install the Vue integration package:

::: code-group

```bash [npm]
npm install @ldesign/components @ldesign/components-vue
```

```bash [pnpm]
pnpm add @ldesign/components @ldesign/components-vue
```

```bash [yarn]
yarn add @ldesign/components @ldesign/components-vue
```

:::

## Basic Setup

### Method 1: Script Tag (CDN)

For quick prototyping or simple projects:

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/@ldesign/components/dist/ldesign-components/ldesign-components.esm.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/@ldesign/components/dist/ldesign-components/ldesign-components.css">
</head>
<body>
  <ld-button variant="primary">Hello World!</ld-button>
</body>
</html>
```

### Method 2: ES Modules (Recommended)

For modern build tools and bundlers:

```javascript
import { defineCustomElements, applyPolyfills } from '@ldesign/components/loader';

// Apply polyfills and define custom elements
applyPolyfills().then(() => {
  defineCustomElements();
});
```

Include the CSS in your main CSS file or import it:

```css
@import '@ldesign/components/dist/ldesign-components/ldesign-components.css';
```

Or import in JavaScript:

```javascript
import '@ldesign/components/dist/ldesign-components/ldesign-components.css';
```

### Method 3: Individual Components (Tree Shaking)

Import only the components you need:

```javascript
import { defineCustomElement } from '@ldesign/components/dist/components/ld-button';
import { defineCustomElement as defineInput } from '@ldesign/components/dist/components/ld-input';

// Define only the components you need
defineCustomElement();
defineInput();
```

## Framework Integration

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { defineCustomElements } from '@ldesign/components/loader';
    defineCustomElements();
    
    // Theme utilities
    import { themeUtils } from '@ldesign/components';
    
    // Set theme
    themeUtils.setTheme('dark');
  </script>
  <link rel="stylesheet" href="/node_modules/@ldesign/components/dist/ldesign-components/ldesign-components.css">
</head>
<body>
  <ld-button variant="primary" id="my-button">Click me!</ld-button>
  
  <script>
    document.getElementById('my-button').addEventListener('ldClick', (event) => {
      console.log('Button clicked!', event.detail);
    });
  </script>
</body>
</html>
```

### React

```tsx
import React from 'react';
import { defineCustomElements } from '@ldesign/components/loader';
import '@ldesign/components/dist/ldesign-components/ldesign-components.css';

// Define custom elements
defineCustomElements();

// TypeScript users: add type declarations
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ld-button': any;
      'ld-input': any;
      'ld-card': any;
    }
  }
}

function App() {
  const handleClick = (event: any) => {
    console.log('Button clicked!', event.detail);
  };

  return (
    <div>
      <ld-button variant="primary" onLdClick={handleClick}>
        Hello React!
      </ld-button>
    </div>
  );
}

export default App;
```

### Angular

First, add the CUSTOM_ELEMENTS_SCHEMA to your module:

```typescript
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { defineCustomElements } from '@ldesign/components/loader';

defineCustomElements();

@NgModule({
  // ... other config
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
```

Then use in templates:

```html
<ld-button variant="primary" (ldClick)="handleClick($event)">
  Hello Angular!
</ld-button>
```

## Vite Configuration

If you're using Vite, you might need to configure it for optimal performance:

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['@ldesign/components/loader']
  },
  define: {
    // Ensure proper tree shaking
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
  }
});
```

## Webpack Configuration

For Webpack users, you might need to handle CSS imports:

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
};
```

## TypeScript Support

LDesign Components includes full TypeScript definitions. For better development experience, you can import types:

```typescript
import type { 
  ButtonProps, 
  InputProps, 
  CardProps,
  LDesignEvent 
} from '@ldesign/components';

// Event handling with proper types
const handleClick = (event: LDesignEvent) => {
  console.log('Clicked!', event.detail);
};
```

## Troubleshooting

### Components Not Rendering

If components aren't rendering, check:

1. **Custom elements defined**: Ensure `defineCustomElements()` is called
2. **CSS imported**: Make sure the CSS file is imported
3. **Polyfills loaded**: For older browsers, ensure polyfills are applied

### Bundler Issues

For bundler-specific issues:

1. **Module resolution**: Ensure your bundler can resolve ES modules
2. **CSS handling**: Configure your bundler to handle CSS imports
3. **Tree shaking**: Use individual component imports for better tree shaking

### Browser Compatibility

For older browsers:

```javascript
import { applyPolyfills, defineCustomElements } from '@ldesign/components/loader';

applyPolyfills().then(() => {
  defineCustomElements();
});
```

## Next Steps

- **[Vue 3 Integration](/guide/vue-integration)** - Learn about Vue-specific features
- **[Component Overview](/components/button)** - Explore available components
- **[Theming Guide](/customization/theming)** - Customize the look and feel
- **[TypeScript Guide](/guide/typescript)** - Get the most out of TypeScript support