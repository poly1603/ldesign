import { createEngine } from '@ldesign/engine'

export function bootstrap() {
  const engine = createEngine({})

  engine.mount('#app')
}