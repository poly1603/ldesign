# LDesign Components

A comprehensive Stencil-based component library with Vue 3 integration, Less styling, and CSS variables.

## 🚀 Features

- **🎯 Modern Technology**: Built with Stencil, TypeScript, and Less
- **🎨 CSS Variables**: Comprehensive theming system with CSS custom properties
- **📱 Responsive**: Mobile-first design with responsive breakpoints
- **♿ Accessible**: WCAG compliant with full keyboard navigation
- **🧪 Tested**: Comprehensive unit and E2E tests
- **📚 TypeScript**: Full type definitions included
- **🔧 Framework Agnostic**: Works with any framework
- **🌙 Dark Mode**: Built-in theme switching support

## 📦 Installation

```bash
# npm
npm install @ldesign/components

# pnpm
pnpm add @ldesign/components

# yarn
yarn add @ldesign/components
```

For Vue 3 projects:

```bash
npm install @ldesign/components @ldesign/components-vue
```

## 🎯 Quick Start

### HTML/JavaScript

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
  <ld-card title="Welcome">
    <p>Hello World!</p>
  </ld-card>
</body>
</html>
```

### Vue 3

```vue
<template>
  <div>
    <ld-button variant="primary" @ld-click="handleClick">
      Click me!
    </ld-button>
    <ld-input v-model:value="inputValue" label="Name" />
    <ld-card title="Welcome">
      <p>Hello World!</p>
    </ld-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const inputValue = ref('');

const handleClick = () => {
  console.log('Button clicked!');
};
</script>
```

## 📚 Components

### Basic Components
- **Button** - Versatile button with variants, sizes, and states
- **Input** - Text input with validation and icons
- **Icon** - SVG icon system with built-in icons

### Layout Components
- **Card** - Container component with header, body, and footer

## 🎨 Theming

Built-in CSS variables for easy customization:

```css
:root {
  --ld-color-primary: #1890ff;
  --ld-color-success: #52c41a;
  --ld-color-warning: #faad14;
  --ld-color-error: #ff4d4f;
  
  --ld-spacing-xs: 4px;
  --ld-spacing-sm: 8px;
  --ld-spacing-md: 16px;
  --ld-spacing-lg: 24px;
  
  --ld-radius-sm: 4px;
  --ld-radius-md: 6px;
  --ld-radius-lg: 8px;
}
```

### Dark Mode

```javascript
import { themeUtils } from '@ldesign/components';

// Set theme
themeUtils.setTheme('dark');   // or 'light' or 'auto'

// Toggle theme
themeUtils.toggleTheme();

// Get current theme
const currentTheme = themeUtils.getTheme();
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start

# Run tests
pnpm test

# Build for production
pnpm build
```

### Testing

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:spec

# Run E2E tests only
pnpm test:e2e

# Run tests with coverage
pnpm test:coverage
```

### Building

```bash
# Build components
pnpm build

# Build documentation
pnpm docs:build

# Clean build files
pnpm clean
```

## 📖 Documentation

Visit our [documentation site](https://ldesign-components.dev) for:

- [Getting Started Guide](./docs/guide/getting-started.md)
- [Installation Instructions](./docs/guide/installation.md)
- [Component API Reference](./docs/components/button.md)
- [Theming Guide](./docs/customization/theming.md)
- [Vue 3 Integration](./docs/guide/vue-integration.md)

Or run the docs locally:

```bash
pnpm docs:dev
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `pnpm test`
5. Build the project: `pnpm build`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Stencil](https://stenciljs.com/) - For the amazing web component compiler
- [Vue.js](https://vuejs.org/) - For inspiration and integration patterns
- [Ionic Framework](https://ionicframework.com/) - For Stencil best practices
- [Ant Design](https://ant.design/) - For design system inspiration

## 📞 Support

- 📖 [Documentation](https://ldesign-components.dev)
- 🐛 [Report Issues](https://github.com/ldesign/components/issues)
- 💬 [Discussions](https://github.com/ldesign/components/discussions)
- 📧 Email: support@ldesign.dev

---

Made with ❤️ by the LDesign Team