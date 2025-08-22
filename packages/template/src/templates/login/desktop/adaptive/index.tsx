import type { VNode } from 'vue'
import { useTNodeJSX } from '@ldesign/shared'
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'

import props from '../../props'
import './index.less'

export default defineComponent({
  name: 'AdaptiveLoginTemplate',
  props: {
    ...props,
  },
  setup(props) {
    const renderTNodeJSX = useTNodeJSX()

    const loginPanelNode = computed(() => renderTNodeJSX('loginPanel'))

    console.log(renderTNodeJSX('loginPanel'))
    return {
      loginPanelNode,
    }
  },
  render(): VNode {
    return (
      <div class="ldesign-login">
        <div class="ldesign-login__panel">
          {
            this.loginPanelNode
          }
        </div>
      </div>
    )
  },
})
