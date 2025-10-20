# Installation Guide

## NPM/PNPM/Yarn

```bash
# npm
npm install @ldesign/grid gridstack

# pnpm
pnpm add @ldesign/grid gridstack

# yarn
yarn add @ldesign/grid gridstack
```

## CDN

```html
<!-- GridStack CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gridstack@latest/dist/gridstack.min.css" />

<!-- @ldesign/grid -->
<script type="module" src="https://cdn.jsdelivr.net/npm/@ldesign/grid@latest/dist/index.js"></script>
```

## CSS Import

Don't forget to import the GridStack CSS:

```css
@import 'gridstack/dist/gridstack.min.css';
```

Or in your JavaScript/TypeScript:

```javascript
import 'gridstack/dist/gridstack.min.css'
```

## Framework-Specific Installation

### Vue 3

```bash
npm install @ldesign/grid gridstack vue@^3
```

Import in your app:

```javascript
import { createApp } from 'vue'
import { GridPlugin } from '@ldesign/grid/vue'
import '@ldesign/grid/vue/style.css'
import 'gridstack/dist/gridstack.min.css'

const app = createApp(App)
app.use(GridPlugin)
```

### React

```bash
npm install @ldesign/grid gridstack react@^18
```

Import in your app:

```jsx
import '@ldesign/grid/react/style.css'
import 'gridstack/dist/gridstack.min.css'
import { GridStack, GridItem } from '@ldesign/grid/react'
```

### Lit

```bash
npm install @ldesign/grid gridstack lit@^3
```

Import in your app:

```javascript
import '@ldesign/grid/lit'
import '@ldesign/grid/lit/style.css'
import 'gridstack/dist/gridstack.min.css'
```

## TypeScript

TypeScript definitions are included. No need for `@types` packages.

```typescript
import type { GridOptions, GridItemOptions } from '@ldesign/grid'
```

## Next Steps

- [Quick Start Guide](./quick-start.md)
- [Configuration](./configuration.md)
- [Framework-Specific Guides](../frameworks/)













