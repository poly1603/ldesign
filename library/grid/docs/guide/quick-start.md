# Quick Start Guide

## Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gridstack@latest/dist/gridstack.min.css" />
</head>
<body>
  <div id="grid"></div>

  <script type="module">
    import { createGrid } from '@ldesign/grid'

    const grid = createGrid('#grid', {
      column: 12,
      cellHeight: 70,
      acceptWidgets: true
    })

    // Add items
    const el1 = document.createElement('div')
    el1.innerHTML = '<div class="grid-stack-item-content">Item 1</div>'
    grid.addItem(el1, { x: 0, y: 0, w: 2, h: 2 })

    const el2 = document.createElement('div')
    el2.innerHTML = '<div class="grid-stack-item-content">Item 2</div>'
    grid.addItem(el2, { x: 2, y: 0, w: 4, h: 3 })
  </script>
</body>
</html>
```

## Vue 3

```vue
<template>
  <div class="app">
    <!-- Toolbar with draggable widgets -->
    <div class="toolbar">
      <GridDragSource 
        v-for="widget in widgets"
        :key="widget.id"
        :data="widget"
        :item-options="{ w: widget.w, h: widget.h }"
      >
        {{ widget.name }}
      </GridDragSource>
    </div>

    <!-- Grid -->
    <GridStack :options="gridOptions" @change="handleChange">
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

<script setup lang="ts">
import { ref } from 'vue'
import { GridStack, GridItem, GridDragSource } from '@ldesign/grid/vue'

const gridOptions = {
  column: 12,
  cellHeight: 70,
  acceptWidgets: true
}

const widgets = [
  { id: 1, name: 'Chart', w: 4, h: 3 },
  { id: 2, name: 'Table', w: 6, h: 4 },
  { id: 3, name: 'Stats', w: 3, h: 2 }
]

const items = ref([
  { id: 'item1', x: 0, y: 0, w: 4, h: 2, content: 'Dashboard Widget' }
])

function handleChange(changedItems) {
  console.log('Grid changed:', changedItems)
}
</script>

<style>
.toolbar {
  display: flex;
  gap: 10px;
  padding: 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}
</style>
```

## React

```tsx
import React, { useState } from 'react'
import { GridStack, GridItem, GridDragSource } from '@ldesign/grid/react'

function App() {
  const widgets = [
    { id: 1, name: 'Chart', w: 4, h: 3 },
    { id: 2, name: 'Table', w: 6, h: 4 },
    { id: 3, name: 'Stats', w: 3, h: 2 }
  ]

  const [items] = useState([
    { id: 'item1', x: 0, y: 0, w: 4, h: 2, content: 'Dashboard Widget' }
  ])

  return (
    <div className="app">
      {/* Toolbar */}
      <div className="toolbar">
        {widgets.map(widget => (
          <GridDragSource
            key={widget.id}
            data={widget}
            itemOptions={{ w: widget.w, h: widget.h }}
          >
            {widget.name}
          </GridDragSource>
        ))}
      </div>

      {/* Grid */}
      <GridStack
        options={{ column: 12, cellHeight: 70, acceptWidgets: true }}
        onChange={(changedItems) => console.log('Changed:', changedItems)}
      >
        {items.map(item => (
          <GridItem key={item.id} {...item}>
            {item.content}
          </GridItem>
        ))}
      </GridStack>
    </div>
  )
}

export default App
```

## Lit

```typescript
import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '@ldesign/grid/lit'

@customElement('my-app')
export class MyApp extends LitElement {
  @state()
  private items = [
    { id: 'item1', x: 0, y: 0, w: 4, h: 2 }
  ]

  render() {
    return html`
      <div class="app">
        <!-- Toolbar -->
        <div class="toolbar">
          <grid-drag-source 
            .data=${{ name: 'Chart' }}
            .itemOptions=${{ w: 4, h: 3 }}
          >
            Chart
          </grid-drag-source>
          <grid-drag-source 
            .data=${{ name: 'Table' }}
            .itemOptions=${{ w: 6, h: 4 }}
          >
            Table
          </grid-drag-source>
        </div>

        <!-- Grid -->
        <grid-stack .options=${{ column: 12, cellHeight: 70 }}>
          ${this.items.map(item => html`
            <grid-item
              id=${item.id}
              .x=${item.x}
              .y=${item.y}
              .w=${item.w}
              .h=${item.h}
            >
              Dashboard Widget
            </grid-item>
          `)}
        </grid-stack>
      </div>
    `
  }
}
```

## Next Steps

- [Configuration Guide](./configuration.md)
- [Drag from Outside](./drag-from-outside.md)
- [Nested Grids](./nested-grids.md)
- [Performance Optimization](./performance.md)













