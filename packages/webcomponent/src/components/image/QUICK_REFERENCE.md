# ldesign-image - Quick Reference

## 🎯 Most Common Use Cases

### 1. Simple Image
```html
<ldesign-image src="image.jpg" alt="Description" />
```

### 2. Lazy Loaded with Aspect Ratio
```html
<ldesign-image 
  src="image.jpg" 
  width="100%" 
  ratio="16/9" 
  lazy 
/>
```

### 3. Image with Preview
```html
<ldesign-image 
  src="thumb.jpg" 
  preview-src="full.jpg" 
  preview 
/>
```

### 4. Responsive Image
```html
<ldesign-image 
  srcset="small.jpg 400w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 768px) 400px, 800px"
  src="fallback.jpg"
/>
```

### 5. With Watermark
```html
<ldesign-image 
  src="photo.jpg" 
  watermark="© 2024 Your Brand"
  watermark-position="bottom-right"
/>
```

### 6. Before/After Comparison
```html
<ldesign-image 
  src="before.jpg"
  comparison-src="after.jpg"
  comparison
/>
```

### 7. With Filter Effect
```html
<ldesign-image 
  src="photo.jpg" 
  filter="grayscale"
/>
```

---

## 📝 Essential Props

| Prop | Type | Description |
|------|------|-------------|
| `src` | string | Image source URL (required) |
| `alt` | string | Alternative text |
| `width` | number/string | Image width |
| `height` | number/string | Image height |
| `ratio` | string/number | Aspect ratio (e.g., "16/9") |
| `fit` | string | How image fits container |
| `lazy` | boolean | Enable lazy loading (default: true) |
| `preview` | boolean | Enable click to preview |

---

## 🎨 Style Props

| Prop | Values | Default |
|------|--------|---------|
| `fit` | fill / contain / cover / none / scale-down | cover |
| `shape` | square / rounded / circle | square |
| `radius` | number/string | - |
| `filter` | none / grayscale / sepia / blur / brightness / contrast | none |

---

## 🔧 Advanced Props

| Prop | Description |
|------|-------------|
| `fetchpriority` | high / low / auto - Loading priority |
| `comparison` | Enable image comparison mode |
| `comparison-src` | Second image for comparison |
| `watermark` | Watermark text |
| `watermark-position` | top-left / top-right / bottom-left / bottom-right / center |

---

## ⚡ Performance Tips

### ✅ DO
```html
<!-- Hero image: High priority, no lazy loading -->
<ldesign-image 
  src="hero.jpg" 
  lazy="false" 
  fetchpriority="high"
  ratio="16/9"
/>

<!-- List images: Lazy load with ratio -->
<ldesign-image 
  src="thumb.jpg" 
  lazy
  ratio="4/3"
  intersection-root-margin="300px"
/>

<!-- Modern formats -->
<ldesign-image 
  sources='[
    {"type":"image/avif","srcset":"image.avif"},
    {"type":"image/webp","srcset":"image.webp"}
  ]'
  src="image.jpg"
/>
```

### ❌ DON'T
```html
<!-- Don't lazy load hero images -->
<ldesign-image src="hero.jpg" lazy />

<!-- Don't forget aspect ratio -->
<ldesign-image src="image.jpg" width="100%" />

<!-- Don't use high fetchpriority everywhere -->
<ldesign-image src="image.jpg" fetchpriority="high" />
```

---

## 🎭 Common Patterns

### Product Gallery
```html
<ldesign-image-group columns="4" gap="12">
  <ldesign-image 
    v-for="img in products" 
    :src="img.thumb"
    :preview-src="img.full"
    ratio="1/1"
    preview
    lazy
  />
</ldesign-image-group>
```

### Article Hero
```html
<ldesign-image
  src="hero.jpg"
  width="100%"
  ratio="16/9"
  lazy="false"
  fetchpriority="high"
  placeholder-color="#f0f0f0"
/>
```

### Avatar
```html
<ldesign-image
  src="avatar.jpg"
  width="80"
  height="80"
  shape="circle"
  fit="cover"
  fallback="default-avatar.jpg"
/>
```

### Protected Image
```html
<ldesign-image
  src="artwork.jpg"
  watermark="© 2024 Artist Name"
  watermark-position="bottom-right"
  preview
  :img-draggable="false"
/>
```

---

## 🎯 Events

```javascript
// Listen to events
<ldesign-image
  src="image.jpg"
  onLdesignLoad={(e) => console.log('Loaded:', e.detail)}
  onLdesignError={(e) => console.log('Error:', e.detail)}
  onLdesignPreviewOpen={() => console.log('Preview opened')}
  onLdesignPreviewClose={() => console.log('Preview closed')}
  onLdesignDownload={(e) => console.log('Downloaded:', e.detail)}
/>
```

---

## 🔍 Troubleshooting

### Image not loading?
- Check `src` URL is correct
- Check CORS settings if cross-origin
- Use `fallback` prop for backup image
- Enable `retryable` for automatic retries

### Layout shift issues?
- Always set `ratio` prop
- Or set both `width` and `height`
- Use `placeholder-color` for better UX

### Performance issues?
- Enable `lazy` for below-fold images
- Use `fetchpriority="high"` only for critical images
- Provide `srcset` for responsive images
- Use modern formats (WebP, AVIF)

### Preview not working?
- Ensure `preview` prop is set to `true`
- Check that image is loaded (not in error state)
- Verify `preview-src` URL if provided

---

## 📱 Mobile Considerations

```html
<!-- Touch-friendly preview -->
<ldesign-image
  src="image.jpg"
  preview
  zoomable
  <!-- Pinch to zoom works automatically -->
/>

<!-- Responsive sizing -->
<ldesign-image
  srcset="mobile.jpg 400w, tablet.jpg 800w, desktop.jpg 1200w"
  sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 800px"
  src="desktop.jpg"
/>
```

---

## 🎨 Styling

### CSS Variables
```css
:root {
  --ld-image-fg: rgba(0, 0, 0, 0.65);
  --ld-image-object-fit: cover;
  --ld-image-object-position: center;
  --ld-image-placeholder-bg: #f5f5f5;
  --ld-color-primary: #1890ff;
}
```

### Custom Styling
```css
/* Target the component */
ldesign-image {
  border: 2px solid #ddd;
  border-radius: 8px;
}

/* Target loaded state */
ldesign-image.ldesign-image--loaded {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

---

## 🌟 Best Practices Checklist

- [ ] Use `alt` text for accessibility
- [ ] Set `ratio` to prevent layout shift
- [ ] Enable `lazy` for below-fold images
- [ ] Use `fetchpriority="high"` for hero images
- [ ] Provide `fallback` for critical images
- [ ] Use modern image formats (WebP, AVIF)
- [ ] Optimize image sizes with `srcset`
- [ ] Add `watermark` for protected content
- [ ] Test on mobile devices
- [ ] Check loading performance

---

**Version:** 2.0.0  
**Last Updated:** 2025-10-11
