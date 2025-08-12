import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
  render() {
    return (
      <div>
        <router-view />
      </div>
    )
  },
})
