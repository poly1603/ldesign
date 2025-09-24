/* Global type declarations for ImportMeta.env used in libraries without Vite's ambient types */

interface ImportMetaEnv {
  readonly DEV?: boolean
  readonly MODE?: string
}

interface ImportMeta {
  readonly env?: ImportMetaEnv
}
