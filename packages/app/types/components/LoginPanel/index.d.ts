import * as vue from 'vue'
import { JSX } from '../../node_modules/.pnpm/vue@3.5.18_typescript@5.8.3/node_modules/vue/jsx-runtime/index.d.js'
import {
  LoginMode,
  ThirdPartyLoginConfig,
  ThemeConfig,
  CaptchaConfig,
  SmsCodeConfig,
  LoginPanelEvents,
} from './types.js'
export {
  LoginData,
  LoginPanelProps,
  PhoneLoginData,
  ThemeEffect,
  ThemeMode,
  UsernameLoginData,
} from './types.js'

declare const LoginPanel: vue.DefineComponent<
  {
    loading?: boolean | undefined
    disabled?: boolean | undefined
    className?: string | undefined
    style?: Record<string, any> | undefined
    title?: string | undefined
    subtitle?: string | undefined
    logo?: string | undefined
    defaultMode?: LoginMode | undefined
    showRememberMe?: boolean | undefined
    showForgotPassword?: boolean | undefined
    showRegisterLink?: boolean | undefined
    thirdPartyLogin?: ThirdPartyLoginConfig | undefined
    theme?: Partial<ThemeConfig> | undefined
    captcha?: CaptchaConfig | undefined
    smsCode?: SmsCodeConfig | undefined
  },
  () => JSX.Element,
  {},
  {},
  {},
  vue.ComponentOptionsMixin,
  vue.ComponentOptionsMixin,
  (keyof LoginPanelEvents)[],
  keyof LoginPanelEvents,
  vue.PublicProps,
  Readonly<{
    loading?: boolean | undefined
    disabled?: boolean | undefined
    className?: string | undefined
    style?: Record<string, any> | undefined
    title?: string | undefined
    subtitle?: string | undefined
    logo?: string | undefined
    defaultMode?: LoginMode | undefined
    showRememberMe?: boolean | undefined
    showForgotPassword?: boolean | undefined
    showRegisterLink?: boolean | undefined
    thirdPartyLogin?: ThirdPartyLoginConfig | undefined
    theme?: Partial<ThemeConfig> | undefined
    captcha?: CaptchaConfig | undefined
    smsCode?: SmsCodeConfig | undefined
  }> &
    Readonly<{
      onLogin?: ((...args: any[]) => any) | undefined
      onRegister?: ((...args: any[]) => any) | undefined
      'onForgot-password'?: ((...args: any[]) => any) | undefined
      'onThird-party-login'?: ((...args: any[]) => any) | undefined
      'onMode-change'?: ((...args: any[]) => any) | undefined
      'onTheme-change'?: ((...args: any[]) => any) | undefined
      'onCaptcha-refresh'?: ((...args: any[]) => any) | undefined
      'onSms-send'?: ((...args: any[]) => any) | undefined
    }>,
  {
    title: string
    subtitle: string
    logo: string
    defaultMode: LoginMode
    showRememberMe: boolean
    showForgotPassword: boolean
    showRegisterLink: boolean
    thirdPartyLogin: Record<string, any>
    theme: Record<string, any>
    loading: boolean
    disabled: boolean
    className: string
    style: Record<string, any>
  },
  {},
  {},
  {},
  string,
  vue.ComponentProvideOptions,
  true,
  {},
  any
>

export { LoginMode, LoginPanel, LoginPanelEvents, LoginPanel as default }
