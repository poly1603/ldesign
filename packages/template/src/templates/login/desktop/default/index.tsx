import type { VNode } from 'vue'
import { useTNodeJSX } from '@ldesign/shared'
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'

import './index.less'

export default defineComponent({
  name: 'DefaultLoginTemplate',
  setup(props, { emit }: any) {
    const renderTNodeJSX = useTNodeJSX()

    return {
      renderTNodeJSX,

    }
  },
  render(): VNode {
    return (
      <div class="ldesign-login">
        <div class="ldesign-login__panel">
          {
            this.renderTNodeJSX('login-panel')
          }
        </div>
      </div>
    )
  },
})
