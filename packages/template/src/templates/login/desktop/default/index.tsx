import type { VNode } from '@vue/runtime-core'
import { useTNodeJSX } from '@ldesign/shared'
import { defineComponent } from '@vue/runtime-core'

import './index.less'

export default defineComponent({
  name: 'DefaultLoginTemplate',
  setup(_props, { emit: _emit }: any) {
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
