// Ambient type shims for third-party packages without bundled types or with incompatible typings

// Inquirer
declare module 'inquirer' {
  const mod: any
  export default mod
}

// Ora spinner (provide both module and namespace to satisfy `ora.Ora` references)
declare module 'ora' {
  export interface Ora {
    start(text?: string): Ora
    stop(): Ora
    succeed(text?: string): Ora
    fail(text?: string): Ora
    info(text?: string): Ora
    warn(text?: string): Ora
    text: string
    color?: string
  }
  export type Options = any
  const ora: (options?: Options) => Ora
  export default ora
}

declare namespace ora {
  interface Ora {
    start(text?: string): Ora
    stop(): Ora
    succeed(text?: string): Ora
    fail(text?: string): Ora
    info(text?: string): Ora
    warn(text?: string): Ora
    text: string
    color?: string
  }
}

// Boxen
declare module 'boxen' {
  const mod: any
  export default mod
}

// Gradient String
declare module 'gradient-string' {
  const mod: any
  export default mod
}

// Figlet
declare module 'figlet' {
  const mod: any
  export default mod
}

// Blessed and blessed-contrib
declare module 'blessed' {
  const mod: any
  export default mod
}

declare module 'blessed-contrib' {
  const mod: any
  export default mod
}

// Fuzzy / Fuzzysort
declare module 'fuzzy' {
  const mod: any
  export default mod
}

declare module 'fuzzysort' {
  const mod: any
  export default mod
}

// Conf
declare module 'conf' {
  const Conf: any
  export default Conf
}

// cli-progress with namespace members used in code
declare module 'cli-progress' {
  namespace cliProgressNS {
    class SingleBar {}
    class MultiBar {
      create(total: number, initial?: number, payload?: any): SingleBar
    }
  }
  const cliProgress: {
    SingleBar: typeof cliProgressNS.SingleBar
    MultiBar: typeof cliProgressNS.MultiBar
  }
  export default cliProgress
}

// node-fetch (v2/v3 default)
declare module 'node-fetch' {
  const mod: any
  export default mod
}

// Workspace package without types
declare module '@ldesign/kit' {
  export const CommandRunner: any
  export const Logger: any
  export const ConsoleLogger: any
  export const ProgressBar: any
  export const LoadingSpinner: any
  export const ConsoleTheme: any
  export const FileSystem: any
  export const PathUtils: any
  export const StringUtils: any
  export const PromptManager: any
  export const Theme: any
  const __default: any
  export default __default
}

