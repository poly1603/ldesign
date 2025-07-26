# 蹇€熷紑濮?

鏈妭灏嗗府鍔╀綘蹇€熶笂鎵?LDesign銆?

## 瀹夎

### 浣跨敤鍖呯鐞嗗櫒

鎴戜滑鎺ㄨ崘浣跨敤 pnpm 浣滀负鍖呯鐞嗗櫒锛?

```bash
# pnpm (鎺ㄨ崘)
pnpm add @ldesign/core

# npm
npm install @ldesign/core

# yarn
yarn add @ldesign/core
```

### CDN 寮曞叆

浣犱篃鍙互閫氳繃 CDN 鐨勬柟寮忓紩鍏?LDesign锛?

```html
<!-- 寮曞叆鏍峰紡 -->
<link rel="stylesheet" href="https://unpkg.com/@ldesign/core/dist/style.css" />

<!-- 寮曞叆缁勪欢搴?-->
<script src="https://unpkg.com/@ldesign/core/dist/ldesign.umd.js"></script>
```

## 瀹屾暣寮曞叆

鍦?main.ts 涓啓鍏ヤ互涓嬪唴瀹癸細

```typescript
import { createApp } from 'vue'
import LDesign from '@ldesign/core'
import '@ldesign/core/dist/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(LDesign)
app.mount('#app')
```

浠ヤ笂浠ｇ爜渚垮畬鎴愪簡 LDesign 鐨勫紩鍏ャ€傞渶瑕佹敞鎰忕殑鏄紝鏍峰紡鏂囦欢闇€瑕佸崟鐙紩鍏ャ€?

## 鎸夐渶寮曞叆

LDesign 鏀寔鍩轰簬 ES modules 鐨?tree shaking锛屽彲浠ュ彧寮曞叆闇€瑕佺殑缁勪欢锛?

```typescript
import { createApp } from 'vue'
import { Button, Input } from '@ldesign/core'
import App from './App.vue'

const app = createApp(App)
app.use(Button).use(Input)
app.mount('#app')
```

### 鑷姩鎸夐渶寮曞叆

鎺ㄨ崘浣跨敤 [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components) 瀹炵幇鑷姩鎸夐渶寮曞叆锛?

```bash
pnpm add -D unplugin-vue-components
```

鐒跺悗鍦?`vite.config.ts` 涓厤缃細

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { LDesignResolver } from '@ldesign/resolver'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [LDesignResolver()],
    }),
  ],
})
```

## 鍏ㄥ眬閰嶇疆

鍦ㄥ紩鍏?LDesign 鏃讹紝鍙互浼犲叆涓€涓叏灞€閰嶇疆瀵硅薄锛?

```typescript
import { createApp } from 'vue'
import LDesign from '@ldesign/core'
import App from './App.vue'

const app = createApp(App)
app.use(LDesign, {
  // 鍏ㄥ眬閰嶇疆
  size: 'large', // 缁勪欢榛樿灏哄
  zIndex: 3000, // 寮瑰嚭灞傜殑鍒濆 z-index
  locale: 'zh-CN', // 璇█璁剧疆
})
app.mount('#app')
```

## 寮€濮嬩娇鐢?

鐜板湪浣犲彲浠ュ湪缁勪欢涓娇鐢?LDesign 浜嗭細

```vue
<template>
  <div>
    <l-button type="primary">涓昏鎸夐挳</l-button>
    <l-button type="success">鎴愬姛鎸夐挳</l-button>
    <l-button type="warning">璀﹀憡鎸夐挳</l-button>
    <l-button type="danger">鍗遍櫓鎸夐挳</l-button>
  </div>
</template>
```

## TypeScript 鏀寔

LDesign 瀹屽叏浣跨敤 TypeScript 缂栧啓锛屾彁渚涗簡瀹屾暣鐨勭被鍨嬪畾涔夈€?

濡傛灉浣犱娇鐢?Volar锛屽彲浠ュ湪 `tsconfig.json` 涓厤缃被鍨嬪０鏄庯細

```json
{
  "compilerOptions": {
    "types": ["@ldesign/core/global"]
  }
}
```

## 寮€鍙戝伐鍏?

### Vetur 鏀寔

濡傛灉浣犱娇鐢?Vetur锛屽彲浠ュ畨瑁?`@ldesign/vetur` 鏉ヨ幏寰楃粍浠剁殑鏅鸿兘鎻愮ず锛?

```bash
pnpm add -D @ldesign/vetur
```

### Volar 鏀寔

濡傛灉浣犱娇鐢?Volar锛屽彲浠ュ畨瑁?`@ldesign/volar` 鏉ヨ幏寰楁洿濂界殑寮€鍙戜綋楠岋細

```bash
pnpm add -D @ldesign/volar
```

## 涓嬩竴姝?

- 鏌ョ湅 [缁勪欢鎬昏](/components/overview) 浜嗚В鎵€鏈夊彲鐢ㄧ粍浠?
- 闃呰 [涓婚瀹氬埗](/guide/theming) 瀛︿範濡備綍鑷畾涔変富棰?
- 鎺㈢储 [宸ュ叿闆哴(/utils/overview) 浜嗚В瀹炵敤宸ュ叿鍑芥暟
