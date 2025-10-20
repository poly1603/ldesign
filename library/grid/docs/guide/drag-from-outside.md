# Drag from Outside

One of the key features of @ldesign/grid is the ability to drag elements from outside the grid into it. This is perfect for dashboard builders, page editors, and similar applications.

## Basic Usage

### Vue 3

```vue
<template>
  <div class="app">
    <!-- Toolbar with draggable items -->
    <div class="toolbar">
      <GridDragSource 
        v-for="widget in widgets"
        :key="widget.id"
        :data="widget"
        :item-options="{ w: widget.w, h: widget.h }"
      >
        <div class="widget-preview">
          {{ widget.icon }} {{ widget.name }}
        </div>
      </GridDragSource>
    </div>

    <!-- Drop zone grid -->
    <GridStack :options="{ column: 12, cellHeight: 70, acceptWidgets: true }">
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
import { ref } from 'vue'
import { GridStack, GridItem, GridDragSource } from '@ldesign/grid/vue'

const widgets = [
  { id: 1, name: 'Line Chart', icon: '📈', w: 6, h: 4 },
  { id: 2, name: 'Bar Chart', icon: '📊', w: 6, h: 4 },
  { id: 3, name: 'Table', icon: '📋', w: 8, h: 5 },
  { id: 4, name: 'Stats Card', icon: '📊', w: 3, h: 2 }
]

const items = ref([])
</script>
```

### React

```tsx
import { GridStack, GridItem, GridDragSource } from '@ldesign/grid/react'

const widgets = [
  { id: 1, name: 'Line Chart', icon: '📈', w: 6, h: 4 },
  { id: 2, name: 'Bar Chart', icon: '📊', w: 6, h: 4 },
  { id: 3, name: 'Table', icon: '📋', w: 8, h: 5 },
  { id: 4, name: 'Stats Card', icon: '📊', w: 3, h: 2 }
]

function Dashboard() {
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
            <div className="widget-preview">
              {widget.icon} {widget.name}
            </div>
          </GridDragSource>
        ))}
      </div>

      {/* Grid */}
      <GridStack options={{ column: 12, cellHeight: 70, acceptWidgets: true }}>
        {/* Items will appear here when dropped */}
      </GridStack>
    </div>
  )
}
```

### Lit

```typescript
import { html } from 'lit'
import '@ldesign/grid/lit'

html`
  <div class="app">
    <!-- Toolbar -->
    <div class="toolbar">
      <grid-drag-source 
        .data=${{ name: 'Chart', type: 'line' }}
        .itemOptions=${{ w: 6, h: 4 }}
      >
        📈 Line Chart
      </grid-drag-source>
      
      <grid-drag-source 
        .data=${{ name: 'Table', type: 'data' }}
        .itemOptions=${{ w: 8, h: 5 }}
      >
        📋 Table
      </grid-drag-source>
    </div>

    <!-- Grid -->
    <grid-stack .options=${{ column: 12, cellHeight: 70 }}>
    </grid-stack>
  </div>
`
```

## Advanced Features

### Custom Drag Preview

You can customize the drag preview:

```vue
<GridDragSource 
  :data="widget"
  :item-options="{ w: 4, h: 3 }"
  :preview="customPreviewHTML"
>
  {{ widget.name }}
</GridDragSource>
```

```typescript
const customPreviewHTML = `
  <div style="padding: 20px; background: white; border: 2px solid blue;">
    Custom Preview
  </div>
`
```

### Handle Drop Events

Listen to drop events to process the dropped data:

```vue
<GridStack 
  :options="gridOptions"
  @dropped="handleDrop"
>
```

```typescript
function handleDrop(data: any) {
  console.log('Dropped:', data)
  
  // Process the dropped widget
  if (data.data.type === 'chart') {
    // Initialize chart component
  }
}
```

### Drag Between Multiple Grids

```vue
<template>
  <div class="multi-grid">
    <GridStack :options="gridOptions">
      <!-- Grid 1 items -->
    </GridStack>
    
    <GridStack :options="gridOptions">
      <!-- Grid 2 items - can drag from Grid 1 -->
    </GridStack>
  </div>
</template>
```

### Using Composables/Hooks

Vue:
```typescript
import { useGridDrag } from '@ldesign/grid/vue'

const { dragSourceRef, isDragging } = useGridDrag({
  data: { type: 'widget', id: 123 },
  itemOptions: { w: 4, h: 3 }
})
```

React:
```typescript
import { useGridDrag } from '@ldesign/grid/react'

const { dragSourceRef, isDragging } = useGridDrag({
  data: { type: 'widget', id: 123 },
  itemOptions: { w: 4, h: 3 }
})
```

## Complete Dashboard Example

See [examples/vue/dashboard-builder.vue](../../examples/vue/dashboard-builder.vue) for a complete working example with:

- Widget toolbar
- Drag and drop
- Dynamic content rendering
- Save/load layouts
- Custom styling













