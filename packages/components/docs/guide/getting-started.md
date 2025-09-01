# Getting Started

Welcome to LDesign Components! This guide will help you get up and running with our comprehensive component library.

## What is LDesign Components?

LDesign Components is a modern web component library built with:

- **[Stencil](https://stenciljs.com/)** - For creating standards-compliant web components
- **[TypeScript](https://www.typescriptlang.org/)** - For type safety and better developer experience
- **[Less](https://lesscss.org/)** - For powerful CSS preprocessing
- **CSS Variables** - For dynamic theming and customization
- **Vue 3 Integration** - For seamless Vue.js development

## Philosophy

Our component library is built around these core principles:

### 🎯 **Developer Experience First**
We prioritize ease of use, clear APIs, and comprehensive documentation to make your development process smooth and enjoyable.

### ⚡ **Performance Optimized**
Every component is designed with performance in mind, featuring lazy loading, tree shaking, and minimal runtime overhead.

### ♿ **Accessibility by Default**
All components follow WCAG guidelines and include proper ARIA attributes, keyboard navigation, and screen reader support.

### 🎨 **Design System Ready**
Built-in theming system with CSS variables allows for easy customization and brand alignment.

### 🔧 **Framework Agnostic**
While we provide special Vue 3 integration, our components work with any framework or vanilla JavaScript.

## Key Features

### Modern Web Standards
- Built on web component standards
- Shadow DOM encapsulation
- Custom element definitions
- ES modules support

### Comprehensive Theming
- CSS custom properties for all design tokens
- Built-in light and dark themes
- Easy theme switching
- Responsive design tokens

### Developer Tools
- Full TypeScript definitions
- Auto-completion in IDEs
- Comprehensive testing
- Hot reload during development

### Production Ready
- Tree shakeable imports
- Optimized bundles
- SSR compatible
- Progressive enhancement

## Quick Demo

Here's a quick example of what you can build:

<div class="demo-container">
  <ld-card title="User Profile" subtitle="Manage your account settings">
    <div style="margin-bottom: 16px;">
      <ld-input label="Full Name" value="John Doe" />
    </div>
    <div style="margin-bottom: 16px;">
      <ld-input label="Email" type="email" value="john@example.com" />
    </div>
    <div style="display: flex; gap: 8px;">
      <ld-button variant="primary">Save Changes</ld-button>
      <ld-button variant="outline">Cancel</ld-button>
    </div>
    <template #actions>
      <ld-button variant="ghost" size="small">
        <ld-icon name="settings"></ld-icon>
      </ld-button>
    </template>
  </ld-card>
</div>

```html
<ld-card title="User Profile" subtitle="Manage your account settings">
  <div style="margin-bottom: 16px;">
    <ld-input label="Full Name" value="John Doe" />
  </div>
  <div style="margin-bottom: 16px;">
    <ld-input label="Email" type="email" value="john@example.com" />
  </div>
  <div style="display: flex; gap: 8px;">
    <ld-button variant="primary">Save Changes</ld-button>
    <ld-button variant="outline">Cancel</ld-button>
  </div>
  <template #actions>
    <ld-button variant="ghost" size="small">
      <ld-icon name="settings"></ld-icon>
    </ld-button>
  </template>
</ld-card>
```

## Next Steps

1. **[Install the library](/guide/installation)** - Set up LDesign Components in your project
2. **[Vue 3 Integration](/guide/vue-integration)** - Learn how to use with Vue.js
3. **[Explore Components](/components/button)** - Check out all available components
4. **[Customize Themes](/customization/theming)** - Make it match your brand

## Need Help?

- 📖 Check our [comprehensive documentation](/components/button)
- 🐛 [Report issues](https://github.com/ldesign/components/issues) on GitHub
- 💬 Join our [community discussions](https://github.com/ldesign/components/discussions)
- 📧 Contact us at support@ldesign.dev

<style>
.demo-container {
  margin: 2rem 0;
  padding: 2rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
</style>