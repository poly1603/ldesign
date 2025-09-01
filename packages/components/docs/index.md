---
layout: home

hero:
  name: "LDesign Components"
  text: "Modern Web Components"
  tagline: "A comprehensive Stencil-based component library with Vue 3 integration, Less styling, and CSS variables"
  image:
    src: /logo.svg
    alt: LDesign Components
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View Components
      link: /components/button
    - theme: alt
      text: View on GitHub
      link: https://github.com/ldesign/components

features:
  - title: 🚀 Modern Technology Stack
    details: Built with Stencil, TypeScript, and Less. Fully compatible with Vue 3 and other modern frameworks.
  
  - title: 🎨 CSS Variables & Theming
    details: Comprehensive theming system using CSS custom properties. Dark mode support out of the box.
  
  - title: 📱 Responsive Design
    details: Mobile-first design approach with responsive breakpoints and touch-friendly interactions.
  
  - title: ♿ Accessibility First
    details: Built with accessibility in mind. ARIA labels, keyboard navigation, and screen reader support.
  
  - title: 🧪 Fully Tested
    details: Comprehensive unit tests and E2E tests ensure reliability and quality.
  
  - title: 📚 TypeScript Support
    details: Written in TypeScript with full type definitions for better developer experience.
  
  - title: 🔧 Framework Agnostic
    details: Works with any framework or vanilla JavaScript. Special Vue 3 integration available.
  
  - title: 📦 Tree Shakeable
    details: Import only what you need. Optimized bundle sizes for better performance.
---

## Quick Start

Install the components library:

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

## Usage Examples

### Basic HTML Usage

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { defineCustomElements } from '@ldesign/components/loader';
    defineCustomElements();
  </script>
  <link rel="stylesheet" href="@ldesign/components/dist/ldesign-components/ldesign-components.css">
</head>
<body>
  <ld-button variant="primary">Click me!</ld-button>
  <ld-input placeholder="Enter text" label="Name"></ld-input>
  <ld-card title="Welcome" subtitle="Get started with LDesign Components">
    <p>This is a simple card example.</p>
  </ld-card>
</body>
</html>
```

### Vue 3 Integration

```vue
<template>
  <div>
    <ld-button variant="primary" @ld-click="handleClick">
      Click me!
    </ld-button>
    
    <ld-input 
      v-model:value="inputValue"
      placeholder="Enter text"
      label="Name"
      @ld-input="handleInput"
    />
    
    <ld-card title="Welcome" subtitle="Get started with LDesign Components">
      <p>This is a simple card example.</p>
      <template #actions>
        <ld-button variant="outline" size="small">Action</ld-button>
      </template>
    </ld-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const inputValue = ref('');

const handleClick = (event: CustomEvent) => {
  console.log('Button clicked!', event);
};

const handleInput = (event: CustomEvent<{ value: string }>) => {
  inputValue.value = event.detail.value;
};
</script>
```

## Key Features

- **🎯 Purpose-built**: Designed specifically for modern web applications
- **⚡ Performance**: Optimized for speed and bundle size
- **🔒 Type Safe**: Full TypeScript support with comprehensive type definitions
- **🌙 Dark Mode**: Built-in dark mode with automatic system preference detection
- **📱 Mobile Ready**: Touch-friendly and responsive across all devices
- **🧩 Composable**: Mix and match components to build complex UIs
- **🎨 Customizable**: Extensive theming options and CSS variable support
- **🔧 Developer Friendly**: Great developer experience with hot reload and debugging tools

## Browser Support

LDesign Components supports all modern browsers:

- **Chrome** 61+
- **Firefox** 60+
- **Safari** 11+
- **Edge** 79+

For older browsers, polyfills are automatically applied when needed.

## Community

- 🐛 [Report Issues](https://github.com/ldesign/components/issues)
- 💬 [Discussions](https://github.com/ldesign/components/discussions)
- 📖 [Contributing Guide](https://github.com/ldesign/components/blob/main/CONTRIBUTING.md)

## License

[MIT License](https://github.com/ldesign/components/blob/main/LICENSE) © 2024 LDesign Team