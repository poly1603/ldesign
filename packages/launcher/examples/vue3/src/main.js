import { createApp } from 'https://esm.sh/vue@3'

createApp({
  data: () => ({ msg: 'Hello Vue 3 + @ldesign/launcher' }),
  template: '<h1>{{ msg }}</h1>',
}).mount('#app')
