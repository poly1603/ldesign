// Minimal React type shims for local type-checking without installing react in this workspace package.
// These typings are only to satisfy vue-tsc/tsc in this package; real apps should use actual React types.

declare module 'react' {
  export type ReactNode = any
  export interface RefObject<T> { current: T | null }

  export function createContext<T>(defaultValue: T | null): any
  export function useContext<T>(ctx: any): T
  export function useMemo<T>(factory: () => T, deps: any[]): T
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps: any[]): T
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void
  export function useRef<T>(initial?: T | null): { current: T | null }
  export function useState<S>(initial: S | (() => S)): [S, (s: S | ((prev: S) => S)) => void]
}

declare module 'react/jsx-runtime' {
  export const jsx: any
  export const jsxs: any
  export const Fragment: any
}
