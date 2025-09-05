declare module 'form-data' {
  import { Readable } from 'stream'

  class FormData {
    constructor()
    append(field: string, value: any, options?: any): void
    getBoundary(): string
    getLength(callback: (err: Error | null, length: number) => void): void
    getLengthSync(): number
    hasKnownLength(): boolean
    pipe(destination: any): any
  }

  export = FormData
}
