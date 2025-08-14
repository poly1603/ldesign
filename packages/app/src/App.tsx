import { defineComponent } from 'vue'
import './styles/index.less'

export default defineComponent({
  name: 'App',
  render() {
    return <router-view />
  },
})
