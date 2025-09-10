// 最小 Vue2 Composition API stub，用于绕过 vue-demi 的构建时校验
export function getCurrentInstance() { return null }

// 提供一个空插件，满足 Vue.use(plugin) 的调用需求
const VueCompositionAPI = { install() {} }
export default VueCompositionAPI

