# @ldesign/grid

A powerful, feature-rich GridStack wrapper for any framework. Build beautiful, responsive grid layouts with drag-and-drop support, nested grids, and high performance.

## Features

✨ **Framework Agnostic** - Works with Vue 3, React, Lit, or vanilla JavaScript  
🎯 **Drag from Outside** - Easily drag elements from toolbars or external sources into grids  
🔄 **Nested Grids** - Support for multi-level nested grid layouts  
⚡ **High Performance** - Optimized for 100+ items with virtual scrolling and batch updates  
🎨 **Rich Configuration** - Extensive options for customization  
📱 **Responsive** - Built-in responsive layout management  
💾 **Serialization** - Save and restore layouts easily  
🎭 **Presets** - Common layout templates included  

## Installation

```bash
npm install @ldesign/grid
# or
pnpm add @ldesign/grid
# or
yarn add @ldesign/grid
```

You'll also need to install the gridstack CSS:

```css
@import 'gridstack/dist/gridstack.min.css';
```

## Quick Start

### Vanilla JavaScript

```javascript
import { GridManager } from '@ldesign/grid'

const manager = GridManager.getInstance()
const grid = manager.create(document.getElementById('grid'), {
  column: 12,
  cellHeight: 70,
  acceptWidgets: true
})

grid.addItem(element, { x: 0, y: 0, w: 2, h: 2 })
```

### Vue 3

```vue
<template>
  <div class="demo">
    <div class="toolbar">
      <GridDragSource 
        v-for="widget in widgets"
        :key="widget.id"
        :data="widget"
      >
        {{ widget.name }}
      </GridDragSource>
    </div>
    
    <GridStack :options="{ column: 12, cellHeight: 70 }">
      <GridItem 
        v-for="item in items"
        :key="item.id"
        v-bind="item"
      >
        {{ item.content }}
      </GridItem>
    </GridStack>
  </div>
</template>

<script setup>
import { GridStack, GridItem, GridDragSource } from '@ldesign/grid/vue'

const widgets = [
  { id: 1, name: 'Chart', w: 4, h: 3 },
  { id: 2, name: 'Table', w: 6, h: 4 }
]
</script>
```

### React

```tsx
import { GridStack, GridItem, GridDragSource } from '@ldesign/grid/react'

function App() {
  const widgets = [
    { id: 1, name: 'Chart', w: 4, h: 3 },
    { id: 2, name: 'Table', w: 6, h: 4 }
  ]
  
  return (
    <div className="demo">
      <div className="toolbar">
        {widgets.map(widget => (
          <GridDragSource key={widget.id} data={widget}>
            {widget.name}
          </GridDragSource>
        ))}
      </div>
      
      <GridStack options={{ column: 12, cellHeight: 70 }}>
        {items.map(item => (
          <GridItem key={item.id} {...item}>
            {item.content}
          </GridItem>
        ))}
      </GridStack>
    </div>
  )
}
```

### Lit

```typescript
import '@ldesign/grid/lit'

html`
  <grid-stack .options=${{ column: 12, cellHeight: 70 }}>
    <grid-item .x=${0} .y=${0} .w=${2} .h=${2}>
      Content here
    </grid-item>
  </grid-stack>
`
```

## Documentation

- [Installation Guide](./docs/guide/installation.md)
- [Quick Start](./docs/guide/quick-start.md)
- [Configuration](./docs/guide/configuration.md)
- [Drag from Outside](./docs/guide/drag-from-outside.md)
- [Nested Grids](./docs/guide/nested-grids.md)
- [Performance Optimization](./docs/guide/performance.md)
- [API Reference](./docs/api/)

## Examples

Check out the [examples](./examples) folder for complete working examples:

- [Vanilla JS Example](./examples/vanilla)
- [Vue 3 Example](./examples/vue)
- [React Example](./examples/react)
- [Lit Example](./examples/lit)

## License

MIT

## Credits

Built on top of [GridStack.js](https://gridstackjs.com/)













