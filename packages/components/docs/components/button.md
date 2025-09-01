# Button

A versatile button component with multiple variants, sizes, and states.

## Basic Usage

<div class="demo">
  <ld-button>Default Button</ld-button>
</div>

```html
<ld-button>Default Button</ld-button>
```

## Variants

The button component supports different visual styles through the `variant` prop:

<div class="demo">
  <ld-button variant="primary">Primary</ld-button>
  <ld-button variant="secondary">Secondary</ld-button>
  <ld-button variant="success">Success</ld-button>
  <ld-button variant="warning">Warning</ld-button>
  <ld-button variant="error">Error</ld-button>
  <ld-button variant="outline">Outline</ld-button>
  <ld-button variant="ghost">Ghost</ld-button>
  <ld-button variant="link">Link</ld-button>
</div>

```html
<ld-button variant="primary">Primary</ld-button>
<ld-button variant="secondary">Secondary</ld-button>
<ld-button variant="success">Success</ld-button>
<ld-button variant="warning">Warning</ld-button>
<ld-button variant="error">Error</ld-button>
<ld-button variant="outline">Outline</ld-button>
<ld-button variant="ghost">Ghost</ld-button>
<ld-button variant="link">Link</ld-button>
```

## Sizes

Control the button size with the `size` prop:

<div class="demo">
  <ld-button size="small">Small</ld-button>
  <ld-button size="medium">Medium</ld-button>
  <ld-button size="large">Large</ld-button>
</div>

```html
<ld-button size="small">Small</ld-button>
<ld-button size="medium">Medium</ld-button>
<ld-button size="large">Large</ld-button>
```

## States

### Disabled

<div class="demo">
  <ld-button disabled>Disabled Button</ld-button>
  <ld-button variant="primary" disabled>Disabled Primary</ld-button>
</div>

```html
<ld-button disabled>Disabled Button</ld-button>
<ld-button variant="primary" disabled>Disabled Primary</ld-button>
```

### Loading

<div class="demo">
  <ld-button loading>Loading...</ld-button>
  <ld-button variant="primary" loading>Saving...</ld-button>
</div>

```html
<ld-button loading>Loading...</ld-button>
<ld-button variant="primary" loading>Saving...</ld-button>
```

## Icons

Add icons to enhance button meaning and usability:

### Icon Before Text

<div class="demo">
  <ld-button icon="user">Profile</ld-button>
  <ld-button variant="primary" icon="home">Home</ld-button>
  <ld-button variant="success" icon="success">Success</ld-button>
</div>

```html
<ld-button icon="user">Profile</ld-button>
<ld-button variant="primary" icon="home">Home</ld-button>
<ld-button variant="success" icon="success">Success</ld-button>
```

### Icon After Text

<div class="demo">
  <ld-button icon-end="search">Search</ld-button>
  <ld-button variant="outline" icon-end="settings">Settings</ld-button>
</div>

```html
<ld-button icon-end="search">Search</ld-button>
<ld-button variant="outline" icon-end="settings">Settings</ld-button>
```

### Icon Only

<div class="demo">
  <ld-button icon="search" aria-label="Search"></ld-button>
  <ld-button variant="ghost" icon="settings" aria-label="Settings"></ld-button>
  <ld-button variant="outline" icon="close" aria-label="Close"></ld-button>
</div>

```html
<ld-button icon="search" aria-label="Search"></ld-button>
<ld-button variant="ghost" icon="settings" aria-label="Settings"></ld-button>
<ld-button variant="outline" icon="close" aria-label="Close"></ld-button>
```

## Full Width

Make the button take the full width of its container:

<div class="demo">
  <ld-button full-width variant="primary">Full Width Button</ld-button>
</div>

```html
<ld-button full-width variant="primary">Full Width Button</ld-button>
```

## Button Types

For form usage, specify the button type:

<div class="demo">
  <form style="display: flex; gap: 8px;">
    <ld-button type="submit" variant="primary">Submit</ld-button>
    <ld-button type="reset" variant="outline">Reset</ld-button>
    <ld-button type="button">Button</ld-button>
  </form>
</div>

```html
<form>
  <ld-button type="submit" variant="primary">Submit</ld-button>
  <ld-button type="reset" variant="outline">Reset</ld-button>
  <ld-button type="button">Button</ld-button>
</form>
```

## Events

The button component emits several events:

<div class="demo">
  <ld-button id="event-demo" variant="primary">Click Me</ld-button>
  <div id="event-log" style="margin-top: 16px; padding: 12px; background: var(--vp-c-bg-soft); border-radius: 6px; font-family: monospace; font-size: 14px;">
    Click the button to see events...
  </div>
</div>

```html
<ld-button id="my-button">Click Me</ld-button>

<script>
const button = document.getElementById('my-button');

button.addEventListener('ldClick', (event) => {
  console.log('Button clicked!', event);
});

button.addEventListener('ldFocus', (event) => {
  console.log('Button focused!', event);
});

button.addEventListener('ldBlur', (event) => {
  console.log('Button blurred!', event);
});
</script>
```

## Vue 3 Usage

When using with Vue 3, you can use v-model and event handlers:

```vue
<template>
  <div>
    <ld-button 
      variant="primary"
      :loading="isLoading"
      @ld-click="handleClick"
    >
      {{ isLoading ? 'Processing...' : 'Submit' }}
    </ld-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isLoading = ref(false);

const handleClick = async () => {
  isLoading.value = true;
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Form submitted!');
  } finally {
    isLoading.value = false;
  }
};
</script>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error' \| 'outline' \| 'ghost' \| 'link'` | `'primary'` | Button variant/style |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `disabled` | `boolean` | `false` | Whether button is disabled |
| `loading` | `boolean` | `false` | Whether button is in loading state |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type for forms |
| `icon` | `string` | - | Icon name to display before text |
| `icon-end` | `string` | - | Icon name to display after text |
| `full-width` | `boolean` | `false` | Whether button takes full width |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `ldClick` | `MouseEvent` | Fired when button is clicked |
| `ldFocus` | `FocusEvent` | Fired when button receives focus |
| `ldBlur` | `FocusEvent` | Fired when button loses focus |

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--ld-button-border-radius` | `var(--ld-radius-md)` | Button border radius |
| `--ld-button-font-weight` | `var(--ld-font-weight-medium)` | Button font weight |
| `--ld-button-transition` | `var(--ld-transition-normal)` | Button transition duration |

## Accessibility

The button component includes several accessibility features:

- **Keyboard Navigation**: Supports Tab navigation and Enter/Space activation
- **ARIA Attributes**: Proper `aria-busy`, `aria-disabled` states
- **Focus Management**: Clear focus indicators and proper focus handling
- **Screen Reader Support**: Descriptive labels and state announcements

### Best Practices

1. **Use descriptive text**: Button text should clearly describe the action
2. **Provide aria-label for icon-only buttons**: Always include accessible labels
3. **Use appropriate button types**: Use `type="submit"` for form submissions
4. **Don't disable without explanation**: Provide feedback when buttons are disabled
5. **Use loading states**: Show loading feedback for async operations

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // Demo event handling
  const eventButton = document.getElementById('event-demo');
  const eventLog = document.getElementById('event-log');
  
  if (eventButton && eventLog) {
    const logEvent = (eventName, event) => {
      const timestamp = new Date().toLocaleTimeString();
      eventLog.innerHTML = `[${timestamp}] ${eventName} event fired`;
    };
    
    eventButton.addEventListener('ldClick', (e) => logEvent('ldClick', e));
    eventButton.addEventListener('ldFocus', (e) => logEvent('ldFocus', e));
    eventButton.addEventListener('ldBlur', (e) => logEvent('ldBlur', e));
  }
});
</script>

<style>
.demo {
  margin: 2rem 0;
  padding: 2rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.demo > * {
  flex-shrink: 0;
}
</style>