/**
 * 页面标题守卫
 * 动态设置页面标题
 */

import type { RouterEnginePlugin } from '@ldesign/router'
import { APP_NAME } from '../../config/app.config'
import { useI18n } from '../../i18n'

/**
 * 设置页面标题守卫
 */
export function setupTitleGuard(router: RouterEnginePlugin) {
  router.afterEach((to) => {
    const { t } = useI18n()

    // 获取页面标题键
    const titleKey = to.meta?.titleKey as string | undefined

    if (titleKey) {
      // 使用 i18n 翻译标题
      const translatedTitle = t(titleKey)
      document.title = `${translatedTitle} - ${t('app.name')}`
    } else {
      document.title = t('app.name')
    }
  })
}
