declare module '@ldesign/engine/types' {
  /**
   * Minimal Plugin interface declaration to integrate with LDesign Engine
   * This local declaration allows type-checking within the cache package
   * without requiring the engine package at build time.
   */
  export interface Plugin {
    name: string
    version?: string
    dependencies?: string[]
    install: (context: any) => Promise<void> | void
    uninstall?: (context: any) => Promise<void> | void
  }
}

