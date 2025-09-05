declare module '@ldesign/engine/types' {
  // Minimal Plugin interface to satisfy type-check in @ldesign/crypto
  export interface Plugin {
    name?: string
    version?: string
    description?: string
    dependencies?: string[]
    // Lifecycle hooks
    install?: (context: any) => Promise<void> | void
    uninstall?: (context: any) => Promise<void> | void
  }
}
